import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Prisma, type EVModel } from "@prisma/client";
import {
  analyzeBattery,
  chargingCost,
  chargingEnergyKwh,
  chargingTimeMinutes,
  distanceAlongRouteKm,
  distanceToRouteKm,
  effectiveChargingPowerKw,
  isConnectorCompatible,
  isReachable,
  nearestReachableBaseline,
  requiredTargetSoc,
  socAfterDistance,
  type EVSpecification,
  type NamedCoordinate,
  type RankedCandidate,
  type RouteGeometry,
  type StationCandidate,
} from "@smartev/shared";
import type { AuthenticatedUser } from "../auth/auth.types";
import { PrismaService } from "../prisma/prisma.service";
import { RecommendationsService } from "../recommendations/recommendations.service";
import {
  GEOCODING_PROVIDER,
  ROUTE_PROVIDER,
  type GeocodingProvider,
  type RouteProvider,
} from "../routing/providers";
import {
  CHARGING_STATION_PROVIDER,
  type ChargingStationProvider,
  type ProviderStation,
} from "../stations/stations.provider";
import type { PlanTripDto } from "./trips.dto";

interface PlanningConfiguration {
  minimumReserveSoc: number;
  defaultTargetSoc: number;
  chargingEfficiency: number;
  maximumCorridorKm: number;
  routeEnergyBuffer: number;
}

@Injectable()
export class TripsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    @Inject(CHARGING_STATION_PROVIDER)
    private readonly stations: ChargingStationProvider,
    private readonly recommendations: RecommendationsService,
    @Inject(ROUTE_PROVIDER) private readonly routeProvider: RouteProvider,
    @Inject(GEOCODING_PROVIDER) private readonly geocoder: GeocodingProvider,
  ) {}

  async plan(user: AuthenticatedUser, dto: PlanTripDto) {
    const evRecord = await this.prisma.eVModel.findUnique({
      where: { id: dto.evModelId },
    });
    if (!evRecord?.isActive) throw new NotFoundException("EV model not found");
    if (dto.vehicleId) {
      const vehicle = await this.prisma.userVehicle.findFirst({
        where: { id: dto.vehicleId, userId: user.id, evModelId: dto.evModelId },
      });
      if (!vehicle)
        throw new BadRequestException(
          "Selected vehicle does not belong to this account or EV model",
        );
    }
    const [source, destination] = await Promise.all([
      this.geocoder.geocode(dto.source),
      this.geocoder.geocode(dto.destination),
    ]);
    const route = await this.routeProvider.route(source, destination);
    const settings = this.settings(dto.minimumReserveSoc);
    const ev = this.toSpecification(evRecord);
    const battery = analyzeBattery(
      ev,
      dto.startingSoc,
      route.distanceKm,
      settings.minimumReserveSoc,
      settings.routeEnergyBuffer,
    );
    const directJourneyPossible = isReachable(
      battery.directArrivalSoc,
      settings.minimumReserveSoc,
    );
    let ranked: RankedCandidate[] = [];
    if (!directJourneyPossible) {
      const providerStations = await this.loadStations(route);
      const feasible = this.createCandidates(
        providerStations,
        route,
        ev,
        dto.startingSoc,
        settings,
      );
      ranked = this.recommendations.rank(feasible, dto.preference);
      if (ranked.length === 0)
        throw new BadRequestException(
          "No reachable compatible charging station can complete this journey with the configured reserve",
        );
    }
    const selected = ranked[0] ?? null;
    const baseline = nearestReachableBaseline(ranked);
    const totalMinutes =
      route.durationMinutes +
      (selected?.chargingMinutes ?? 0) +
      (selected ? (selected.detourKm / 45) * 60 : 0);
    const finalSoc =
      selected?.destinationArrivalSoc ?? battery.directArrivalSoc;
    const trip = await this.persist(
      user.id,
      dto,
      source,
      destination,
      route,
      battery,
      directJourneyPossible,
      ranked,
      finalSoc,
      totalMinutes,
    );
    return {
      id: trip.id,
      route,
      vehicle: {
        ...ev,
        efficiencyKwhPerKm:
          ev.efficiencyKwhPerKm ?? ev.batteryCapacityKwh / ev.ratedRangeKm,
      },
      batteryAnalysis: battery,
      directJourneyPossible,
      candidateStations: ranked,
      recommendedStation: selected,
      recommendationExplanation:
        selected?.recommendationReason ??
        "No charging stop is required; the destination is reachable with the configured reserve.",
      estimatedCost: selected?.chargingCost ?? 0,
      estimatedChargingTime: selected?.chargingMinutes ?? 0,
      estimatedFinalSoc: finalSoc,
      tripSummary: {
        source: source.label,
        destination: destination.label,
        preference: dto.preference,
        estimatedTotalMinutes: totalMinutes,
        minimumReserveSoc: settings.minimumReserveSoc,
      },
      baselineComparison: baseline
        ? this.compareBaseline(selected!, baseline)
        : null,
      assumptions: {
        chargingTimeIsEstimate: true,
        availability:
          "Seeded station status is demonstration data, not real-time availability.",
        routeProvider: route.provider,
      },
    };
  }

  list(userId: string) {
    return this.prisma.trip.findMany({
      where: { userId },
      include: {
        evModel: true,
        stops: { include: { station: true, charger: true } },
        recommendations: {
          where: { isSelected: true },
          include: { station: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async get(userId: string, id: string) {
    const trip = await this.prisma.trip.findFirst({
      where: { id, userId },
      include: {
        evModel: true,
        stops: { include: { station: true, charger: true } },
        recommendations: {
          include: { station: true },
          orderBy: { rank: "asc" },
        },
      },
    });
    if (!trip) throw new NotFoundException("Trip not found");
    return trip;
  }

  private settings(minimumReserveSoc?: number): PlanningConfiguration {
    return {
      minimumReserveSoc:
        minimumReserveSoc ?? this.config.get("planning.minimumReserveSoc", 10),
      defaultTargetSoc: this.config.get("planning.defaultTargetSoc", 80),
      chargingEfficiency: this.config.get("planning.chargingEfficiency", 0.9),
      maximumCorridorKm: this.config.get("planning.maximumCorridorKm", 10),
      routeEnergyBuffer: this.config.get("planning.routeEnergyBuffer", 1.05),
    };
  }

  private toSpecification(ev: EVModel): EVSpecification {
    return {
      id: ev.id,
      manufacturer: ev.manufacturer,
      model: ev.model,
      variant: ev.variant,
      batteryCapacityKwh: ev.batteryCapacityKwh,
      ratedRangeKm: ev.ratedRangeKm,
      maxAcChargingKw: ev.maxAcChargingKw,
      maxDcChargingKw: ev.maxDcChargingKw,
      connectorTypes: ev.connectorTypes,
      efficiencyKwhPerKm: ev.efficiencyKwhPerKm,
    };
  }

  private async loadStations(route: RouteGeometry): Promise<ProviderStation[]> {
    const center = route.coordinates[Math.floor(route.coordinates.length / 2)]!;
    try {
      return await this.stations.findNearRoute(
        center,
        route.distanceKm / 2 + 35,
      );
    } catch {
      return [];
    }
  }

  private createCandidates(
    stations: ProviderStation[],
    route: RouteGeometry,
    ev: EVSpecification,
    startingSoc: number,
    settings: PlanningConfiguration,
  ): StationCandidate[] {
    const results: StationCandidate[] = [];
    for (const station of stations) {
      const corridorDistanceKm = distanceToRouteKm(
        station.coordinate,
        route.coordinates,
      );
      if (corridorDistanceKm > settings.maximumCorridorKm) continue;
      const distanceFromStartKm = Math.min(
        route.distanceKm,
        distanceAlongRouteKm(station.coordinate, route.coordinates),
      );
      const detourKm = corridorDistanceKm * 2;
      const arrivalSoc = socAfterDistance(
        ev,
        startingSoc,
        distanceFromStartKm + corridorDistanceKm,
        settings.routeEnergyBuffer,
      );
      if (!isReachable(arrivalSoc, settings.minimumReserveSoc)) continue;
      const remainingDistanceKm = Math.max(
        0,
        route.distanceKm - distanceFromStartKm + corridorDistanceKm,
      );
      const targetSoc = requiredTargetSoc(
        ev,
        remainingDistanceKm,
        settings.minimumReserveSoc,
        settings.defaultTargetSoc,
        settings.routeEnergyBuffer,
      );
      const destinationArrivalSoc = socAfterDistance(
        ev,
        targetSoc,
        remainingDistanceKm,
        settings.routeEnergyBuffer,
      );
      if (!isReachable(destinationArrivalSoc, settings.minimumReserveSoc))
        continue;
      for (const charger of station.chargers) {
        if (
          charger.status !== "OPERATIONAL" ||
          !isConnectorCompatible(ev, charger.connectorType)
        )
          continue;
        const power = effectiveChargingPowerKw(ev, charger);
        const energy = chargingEnergyKwh(
          ev.batteryCapacityKwh,
          arrivalSoc,
          targetSoc,
        );
        const minutes = chargingTimeMinutes(
          energy,
          power,
          settings.chargingEfficiency,
        );
        results.push({
          id: station.id,
          name: station.name,
          operator: station.operator,
          coordinate: station.coordinate,
          distanceFromStartKm,
          corridorDistanceKm,
          detourKm,
          arrivalSoc,
          targetSoc,
          destinationArrivalSoc,
          energyRequiredKwh: energy,
          chargingMinutes: minutes,
          chargingCost: chargingCost(energy, charger.pricePerKwh),
          totalJourneyMinutes:
            route.durationMinutes + minutes + (detourKm / 45) * 60 + 8,
          charger,
          demoAvailability: station.isDemo
            ? "Simulated operational status"
            : undefined,
        });
      }
    }
    const bestPerStation = new Map<string, StationCandidate>();
    for (const candidate of results) {
      const existing = bestPerStation.get(candidate.id);
      if (
        !existing ||
        candidate.totalJourneyMinutes < existing.totalJourneyMinutes
      )
        bestPerStation.set(candidate.id, candidate);
    }
    return [...bestPerStation.values()];
  }

  private compareBaseline(smart: StationCandidate, baseline: StationCandidate) {
    return {
      smartRecommendation: this.metrics(smart),
      nearestReachableBaseline: this.metrics(baseline),
      improvement: {
        detourKm: baseline.detourKm - smart.detourKm,
        chargingMinutes: baseline.chargingMinutes - smart.chargingMinutes,
        chargingCost: baseline.chargingCost - smart.chargingCost,
        totalJourneyMinutes:
          baseline.totalJourneyMinutes - smart.totalJourneyMinutes,
      },
    };
  }
  private metrics(candidate: StationCandidate) {
    return {
      stationId: candidate.id,
      stationName: candidate.name,
      detourKm: candidate.detourKm,
      chargingMinutes: candidate.chargingMinutes,
      chargingCost: candidate.chargingCost,
      totalJourneyMinutes: candidate.totalJourneyMinutes,
    };
  }

  private async persist(
    userId: string,
    dto: PlanTripDto,
    source: NamedCoordinate,
    destination: NamedCoordinate,
    route: RouteGeometry,
    battery: ReturnType<typeof analyzeBattery>,
    direct: boolean,
    ranked: RankedCandidate[],
    finalSoc: number,
    totalMinutes: number,
  ) {
    const selected = ranked[0];
    return this.prisma.trip.create({
      data: {
        userId,
        evModelId: dto.evModelId,
        userVehicleId: dto.vehicleId,
        sourceLabel: source.label,
        sourceLatitude: source.latitude,
        sourceLongitude: source.longitude,
        destinationLabel: destination.label,
        destinationLatitude: destination.latitude,
        destinationLongitude: destination.longitude,
        startingSoc: dto.startingSoc,
        minimumReserveSoc:
          dto.minimumReserveSoc ??
          this.config.get("planning.minimumReserveSoc", 10),
        preference: dto.preference,
        status: "COMPLETED",
        routeDistanceKm: route.distanceKm,
        routeDurationMinutes: route.durationMinutes,
        directJourneyPossible: direct,
        estimatedFinalSoc: finalSoc,
        estimatedTotalMinutes: totalMinutes,
        estimatedChargingCost: selected?.chargingCost ?? 0,
        routeGeometry: route as unknown as Prisma.InputJsonValue,
        batteryAnalysis: battery as unknown as Prisma.InputJsonValue,
        ...(selected
          ? {
              stops: {
                create: {
                  stationId: selected.id,
                  chargerId: selected.charger.id,
                  sequence: 1,
                  arrivalSoc: selected.arrivalSoc,
                  targetSoc: selected.targetSoc,
                  energyRequiredKwh: selected.energyRequiredKwh,
                  estimatedMinutes: selected.chargingMinutes,
                  estimatedCost: selected.chargingCost,
                  detourKm: selected.detourKm,
                },
              },
            }
          : {}),
        ...(ranked.length
          ? {
              recommendations: {
                create: ranked.map((candidate, index) => ({
                  stationId: candidate.id,
                  finalScore: candidate.finalScore,
                  rank: index + 1,
                  scoreBreakdown:
                    candidate.scoreBreakdown as unknown as Prisma.InputJsonValue,
                  reason: candidate.recommendationReason,
                  isSelected: index === 0,
                })),
              },
            }
          : {}),
      },
    });
  }
}
