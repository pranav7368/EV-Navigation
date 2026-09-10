import type {
  EVSpecification,
  Preference,
  RankedCandidate,
  RouteGeometry,
} from "@smartev/shared";

export const demoEvs: Array<EVSpecification & { id: string }> = [
  {
    id: "demo-nexon",
    manufacturer: "Tata",
    model: "Nexon EV",
    variant: "Empowered LR",
    batteryCapacityKwh: 40.5,
    ratedRangeKm: 465,
    maxAcChargingKw: 7.2,
    maxDcChargingKw: 50,
    connectorTypes: ["CCS2", "TYPE_2"],
  },
  {
    id: "demo-be6",
    manufacturer: "Mahindra",
    model: "BE 6",
    variant: "Pack Three",
    batteryCapacityKwh: 79,
    ratedRangeKm: 682,
    maxAcChargingKw: 11,
    maxDcChargingKw: 175,
    connectorTypes: ["CCS2", "TYPE_2"],
  },
  {
    id: "demo-ioniq",
    manufacturer: "Hyundai",
    model: "IONIQ 5",
    variant: "RWD",
    batteryCapacityKwh: 72.6,
    ratedRangeKm: 631,
    maxAcChargingKw: 11,
    maxDcChargingKw: 220,
    connectorTypes: ["CCS2", "TYPE_2"],
  },
  {
    id: "demo-atto",
    manufacturer: "BYD",
    model: "Atto 3",
    variant: "Superior",
    batteryCapacityKwh: 60.48,
    ratedRangeKm: 521,
    maxAcChargingKw: 7,
    maxDcChargingKw: 80,
    connectorTypes: ["CCS2", "TYPE_2"],
  },
];

const routeCoordinates = [
  { latitude: 28.6429, longitude: 77.2197 },
  { latitude: 28.45, longitude: 77.02 },
  { latitude: 28.12, longitude: 76.52 },
  { latitude: 27.75, longitude: 76.25 },
  { latitude: 27.25, longitude: 75.98 },
  { latitude: 26.9124, longitude: 75.7873 },
];

const route: RouteGeometry = {
  distanceKm: 278.4,
  durationMinutes: 264,
  coordinates: routeCoordinates,
  provider: "Demo route (OSRM fallback)",
  isFallback: true,
};
const charger = (id: string, powerKw: number, pricePerKwh: number) => ({
  id,
  connectorType: "CCS2" as const,
  currentType: "DC" as const,
  powerKw,
  pricePerKwh,
  status: "OPERATIONAL" as const,
});
const option = (
  id: string,
  name: string,
  latitude: number,
  longitude: number,
  distance: number,
  detour: number,
  power: number,
  price: number,
  time: number,
  cost: number,
  score: number,
): RankedCandidate => ({
  id,
  name,
  operator:
    id === "fast"
      ? "ChargeZone"
      : id === "cheap"
        ? "Demo Highway Energy"
        : "Tata Power EZ Charge",
  coordinate: { latitude, longitude },
  distanceFromStartKm: distance,
  corridorDistanceKm: detour / 2,
  detourKm: detour,
  arrivalSoc: id === "fast" ? 14.8 : id === "cheap" ? 12.6 : 11.9,
  targetSoc: 80,
  destinationArrivalSoc: 15.4,
  energyRequiredKwh: id === "fast" ? 26.4 : 27.3,
  chargingMinutes: time,
  chargingCost: cost,
  totalJourneyMinutes: 264 + time + (detour / 45) * 60,
  charger: charger(`${id}-charger`, power, price),
  finalScore: score,
  scoreBreakdown: {
    time: id === "fast" ? 0 : 0.65,
    cost: id === "cheap" ? 0 : id === "fast" ? 1 : 0.4,
    detour: detour / 8,
    distance: distance / 180,
    weightedTime: 0,
    weightedCost: 0,
    weightedDetour: 0,
    weightedDistance: 0,
  },
  recommendationReason: "",
  demoAvailability: "Simulated operational status",
});

export interface DemoPlan {
  id: string;
  route: RouteGeometry;
  vehicle: EVSpecification;
  batteryAnalysis: {
    startingSoc: number;
    minimumReserveSoc: number;
    availableEnergyKwh: number;
    usableEnergyKwh: number;
    estimatedRangeKm: number;
    energyNeededKwh: number;
    directArrivalSoc: number;
  };
  directJourneyPossible: boolean;
  candidateStations: RankedCandidate[];
  recommendedStation: RankedCandidate | null;
  recommendationExplanation: string;
  estimatedCost: number;
  estimatedChargingTime: number;
  estimatedFinalSoc: number;
  tripSummary: {
    source: string;
    destination: string;
    preference: Preference;
    estimatedTotalMinutes: number;
    minimumReserveSoc: number;
  };
  baselineComparison: {
    smartRecommendation: {
      stationName: string;
      detourKm: number;
      chargingMinutes: number;
      chargingCost: number;
      totalJourneyMinutes: number;
    };
    nearestReachableBaseline: {
      stationName: string;
      detourKm: number;
      chargingMinutes: number;
      chargingCost: number;
      totalJourneyMinutes: number;
    };
    improvement: {
      detourKm: number;
      chargingMinutes: number;
      chargingCost: number;
      totalJourneyMinutes: number;
    };
  } | null;
  assumptions: {
    chargingTimeIsEstimate: boolean;
    availability: string;
    routeProvider: string;
  };
}

export function makeDemoPlan(
  preference: Preference,
  startingSoc: number,
  source: string,
  destination: string,
  ev = demoEvs[0]!,
): DemoPlan {
  const direct =
    destination.toLowerCase().includes("gurugram") ||
    destination.toLowerCase().includes("cyber");
  if (direct) {
    const directRoute = {
      ...route,
      distanceKm: 31.8,
      durationMinutes: 48,
      coordinates: routeCoordinates.slice(0, 2),
    };
    return {
      id: `demo-${Date.now()}`,
      route: directRoute,
      vehicle: ev,
      batteryAnalysis: {
        startingSoc,
        minimumReserveSoc: 10,
        availableEnergyKwh: (ev.batteryCapacityKwh * startingSoc) / 100,
        usableEnergyKwh:
          (ev.batteryCapacityKwh * Math.max(0, startingSoc - 10)) / 100,
        estimatedRangeKm: (ev.ratedRangeKm * startingSoc) / 100,
        energyNeededKwh: 3.1,
        directArrivalSoc: startingSoc - 7.7,
      },
      directJourneyPossible: true,
      candidateStations: [],
      recommendedStation: null,
      recommendationExplanation:
        "No charging stop is required. The destination is reachable with an estimated 10% reserve protected.",
      estimatedCost: 0,
      estimatedChargingTime: 0,
      estimatedFinalSoc: startingSoc - 7.7,
      tripSummary: {
        source,
        destination,
        preference,
        estimatedTotalMinutes: 48,
        minimumReserveSoc: 10,
      },
      baselineComparison: null,
      assumptions: {
        chargingTimeIsEstimate: true,
        availability: "Demo data",
        routeProvider: directRoute.provider,
      },
    };
  }
  const fast = option(
    "fast",
    "Manesar HyperCharge Hub",
    28.3543,
    76.9398,
    58,
    3.2,
    120,
    24,
    35,
    634,
    0.18,
  );
  const cheap = option(
    "cheap",
    "Neemrana ValueCharge Plaza",
    27.9889,
    76.3846,
    121,
    5.8,
    30,
    11,
    61,
    300,
    0.24,
  );
  const balanced = option(
    "balanced",
    "Kotputli EZ Charge",
    27.72,
    76.19,
    151,
    2.4,
    60,
    18,
    46,
    485,
    0.21,
  );
  const ordered =
    preference === "FASTEST"
      ? [fast, balanced, cheap]
      : preference === "CHEAPEST"
        ? [cheap, balanced, fast]
        : [balanced, fast, cheap];
  const recommended = ordered[0]!;
  recommended.recommendationReason =
    preference === "FASTEST"
      ? "Recommended because its 120 kW compatible DC charger reduces estimated total journey time by 24 minutes versus the nearest compatible alternative."
      : preference === "CHEAPEST"
        ? "Recommended for the lowest estimated charging cost, saving ₹185 versus the next-ranked compatible option."
        : "Recommended for the best balance of estimated journey time, charging cost, and a 2.4 km detour among reachable compatible options.";
  return {
    id: `demo-${Date.now()}`,
    route,
    vehicle: ev,
    batteryAnalysis: {
      startingSoc,
      minimumReserveSoc: 10,
      availableEnergyKwh: (ev.batteryCapacityKwh * startingSoc) / 100,
      usableEnergyKwh:
        (ev.batteryCapacityKwh * Math.max(0, startingSoc - 10)) / 100,
      estimatedRangeKm: (ev.ratedRangeKm * startingSoc) / 100,
      energyNeededKwh: 25.5,
      directArrivalSoc: startingSoc - 63,
    },
    directJourneyPossible: false,
    candidateStations: ordered,
    recommendedStation: recommended,
    recommendationExplanation: recommended.recommendationReason,
    estimatedCost: recommended.chargingCost,
    estimatedChargingTime: recommended.chargingMinutes,
    estimatedFinalSoc: recommended.destinationArrivalSoc,
    tripSummary: {
      source,
      destination,
      preference,
      estimatedTotalMinutes: recommended.totalJourneyMinutes,
      minimumReserveSoc: 10,
    },
    baselineComparison: {
      smartRecommendation: {
        stationName: recommended.name,
        detourKm: recommended.detourKm,
        chargingMinutes: recommended.chargingMinutes,
        chargingCost: recommended.chargingCost,
        totalJourneyMinutes: recommended.totalJourneyMinutes,
      },
      nearestReachableBaseline: {
        stationName: fast.name,
        detourKm: fast.detourKm,
        chargingMinutes: fast.chargingMinutes,
        chargingCost: fast.chargingCost,
        totalJourneyMinutes: fast.totalJourneyMinutes,
      },
      improvement: {
        detourKm: fast.detourKm - recommended.detourKm,
        chargingMinutes: fast.chargingMinutes - recommended.chargingMinutes,
        chargingCost: fast.chargingCost - recommended.chargingCost,
        totalJourneyMinutes:
          fast.totalJourneyMinutes - recommended.totalJourneyMinutes,
      },
    },
    assumptions: {
      chargingTimeIsEstimate: true,
      availability:
        "Station status is simulated demonstration data, not real-time availability.",
      routeProvider: route.provider,
    },
  };
}
