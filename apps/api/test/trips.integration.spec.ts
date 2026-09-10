import { Test } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import type { EVModel } from "@prisma/client";
import { TripsService } from "../src/trips/trips.service";
import { PrismaService } from "../src/prisma/prisma.service";
import { RecommendationsService } from "../src/recommendations/recommendations.service";
import { GEOCODING_PROVIDER, ROUTE_PROVIDER } from "../src/routing/providers";
import { CHARGING_STATION_PROVIDER } from "../src/stations/stations.provider";

const ev: EVModel = {
  id: "ev1",
  manufacturer: "Test",
  model: "E1",
  variant: "LR",
  batteryCapacityKwh: 50,
  ratedRangeKm: 300,
  maxAcChargingKw: 11,
  maxDcChargingKw: 100,
  connectorTypes: ["CCS2"],
  efficiencyKwhPerKm: 0.2,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("TripsService integration", () => {
  test("plans, ranks, explains, and persists a charging journey", async () => {
    const prisma = {
      eVModel: { findUnique: jest.fn().mockResolvedValue(ev) },
      userVehicle: { findFirst: jest.fn() },
      trip: { create: jest.fn().mockResolvedValue({ id: "trip1" }) },
    };
    const config = {
      get: jest.fn(
        (key: string, fallback: unknown) =>
          ({
            "planning.minimumReserveSoc": 10,
            "planning.defaultTargetSoc": 80,
            "planning.chargingEfficiency": 0.9,
            "planning.maximumCorridorKm": 10,
            "planning.routeEnergyBuffer": 1,
          })[key] ?? fallback,
      ),
      getOrThrow: jest.fn(() => ({
        FASTEST: { time: 0.65, cost: 0.1, detour: 0.2, distance: 0.05 },
        CHEAPEST: { time: 0.15, cost: 0.65, detour: 0.15, distance: 0.05 },
        BALANCED: { time: 0.4, cost: 0.3, detour: 0.2, distance: 0.1 },
      })),
    };
    const route = {
      route: jest.fn().mockResolvedValue({
        distanceKm: 260,
        durationMinutes: 240,
        coordinates: [
          { latitude: 28.6, longitude: 77.2 },
          { latitude: 27.8, longitude: 76.5 },
          { latitude: 26.9, longitude: 75.8 },
        ],
        provider: "test",
        isFallback: false,
      }),
    };
    const geocoder = {
      geocode: jest.fn((label: string) =>
        Promise.resolve(
          label === "Delhi"
            ? { label, latitude: 28.6, longitude: 77.2 }
            : { label, latitude: 26.9, longitude: 75.8 },
        ),
      ),
    };
    const stationProvider = {
      findNearRoute: jest.fn().mockResolvedValue([
        {
          id: "s1",
          name: "Fast Hub",
          operator: "Test",
          address: "",
          coordinate: { latitude: 28.25, longitude: 76.9 },
          isDemo: true,
          chargers: [
            {
              id: "c1",
              connectorType: "CCS2",
              currentType: "DC",
              powerKw: 100,
              pricePerKwh: 20,
              status: "OPERATIONAL",
            },
          ],
        },
      ]),
    };
    const module = await Test.createTestingModule({
      providers: [
        TripsService,
        RecommendationsService,
        { provide: PrismaService, useValue: prisma },
        { provide: ConfigService, useValue: config },
        { provide: CHARGING_STATION_PROVIDER, useValue: stationProvider },
        { provide: ROUTE_PROVIDER, useValue: route },
        { provide: GEOCODING_PROVIDER, useValue: geocoder },
      ],
    }).compile();
    const result = await module.get(TripsService).plan(
      { id: "u1", email: "test@test.dev", role: "USER" },
      {
        evModelId: "ev1",
        source: "Delhi",
        destination: "Jaipur",
        startingSoc: 35,
        preference: "FASTEST",
      },
    );
    expect(result.directJourneyPossible).toBe(false);
    expect(result.recommendedStation?.name).toBe("Fast Hub");
    expect(result.recommendationExplanation).toContain("Recommended");
    expect(prisma.trip.create).toHaveBeenCalled();
  });
});
