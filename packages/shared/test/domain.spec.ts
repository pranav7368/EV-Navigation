import {
  analyzeBattery,
  availableEnergyKwh,
  chargingCost,
  chargingEnergyKwh,
  chargingTimeMinutes,
  distanceToRouteKm,
  effectiveChargingPowerKw,
  effectiveEfficiency,
  haversineDistanceKm,
  isConnectorCompatible,
  isReachable,
  normalize,
  rankCandidates,
  requiredTargetSoc,
  socAfterDistance,
  withinRouteCorridor,
} from "../src";
import type { EVSpecification, StationCandidate } from "../src";

const ev: EVSpecification = {
  manufacturer: "Tata",
  model: "Nexon EV",
  variant: "Empowered LR",
  batteryCapacityKwh: 40.5,
  ratedRangeKm: 465,
  maxAcChargingKw: 7.2,
  maxDcChargingKw: 50,
  connectorTypes: ["CCS2", "TYPE_2"],
};

const charger = {
  id: "c1",
  connectorType: "CCS2" as const,
  currentType: "DC" as const,
  powerKw: 60,
  pricePerKwh: 20,
  status: "OPERATIONAL" as const,
};

const candidate = (
  id: string,
  time: number,
  cost: number,
  detour: number,
  distance: number,
): StationCandidate => ({
  id,
  name: id,
  operator: "Demo",
  coordinate: { latitude: 28, longitude: 77 },
  distanceFromStartKm: distance,
  corridorDistanceKm: detour / 2,
  detourKm: detour,
  arrivalSoc: 20,
  targetSoc: 80,
  destinationArrivalSoc: 12,
  energyRequiredKwh: 24,
  chargingMinutes: 30,
  chargingCost: cost,
  totalJourneyMinutes: time,
  charger,
});

describe("EV domain", () => {
  test("derives efficiency and energy/range values", () => {
    expect(effectiveEfficiency(ev)).toBeCloseTo(40.5 / 465);
    expect(availableEnergyKwh(60, 50)).toBe(30);
    expect(
      socAfterDistance({ ...ev, efficiencyKwhPerKm: 0.15 }, 80, 100),
    ).toBeCloseTo(42.963, 2);
  });

  test("analyzes reserve-aware direct feasibility", () => {
    const result = analyzeBattery(
      { ...ev, efficiencyKwhPerKm: 0.15 },
      80,
      100,
      10,
    );
    expect(result.energyNeededKwh).toBe(15);
    expect(result.directArrivalSoc).toBeCloseTo(42.963, 2);
    expect(isReachable(result.directArrivalSoc, 10)).toBe(true);
    expect(isReachable(9.99, 10)).toBe(false);
  });

  test("supports explicit efficiency override and connector compatibility", () => {
    expect(effectiveEfficiency({ ...ev, efficiencyKwhPerKm: 0.2 })).toBe(0.2);
    expect(isConnectorCompatible(ev, "CCS2")).toBe(true);
    expect(isConnectorCompatible(ev, "CHADEMO")).toBe(false);
  });

  test("calculates effective power, energy, estimated time and cost", () => {
    expect(effectiveChargingPowerKw(ev, charger)).toBe(50);
    const energy = chargingEnergyKwh(60, 20, 80);
    expect(energy).toBe(36);
    expect(chargingTimeMinutes(36, 50, 0.9)).toBe(48);
    expect(chargingCost(36, 18)).toBe(648);
  });

  test("raises target SOC when the remaining route requires it and caps at 100", () => {
    const overridden = {
      ...ev,
      batteryCapacityKwh: 60,
      efficiencyKwhPerKm: 0.2,
    };
    expect(requiredTargetSoc(overridden, 100, 10, 80)).toBe(80);
    expect(requiredTargetSoc(overridden, 260, 10, 80)).toBeCloseTo(96.667, 2);
    expect(requiredTargetSoc(overridden, 500, 10, 80)).toBe(100);
  });
});

describe("geospatial utilities", () => {
  test("calculates known Delhi to Jaipur great-circle distance", () => {
    expect(
      haversineDistanceKm(
        { latitude: 28.6139, longitude: 77.209 },
        { latitude: 26.9124, longitude: 75.7873 },
      ),
    ).toBeCloseTo(236, -1);
  });

  test("calculates distance to a route and corridor filtering", () => {
    const route = [
      { latitude: 28, longitude: 77 },
      { latitude: 27, longitude: 76 },
    ];
    const near = { coordinate: { latitude: 27.5, longitude: 76.51 } };
    const far = { coordinate: { latitude: 27.5, longitude: 77.5 } };
    expect(distanceToRouteKm(near.coordinate, route)).toBeLessThan(2);
    expect(withinRouteCorridor([near, far], route, 10)).toEqual([near]);
  });
});

describe("recommendation engine", () => {
  test("normalizes values including equal ranges", () => {
    expect(normalize([10, 20, 30])).toEqual([0, 0.5, 1]);
    expect(normalize([4, 4])).toEqual([0, 0]);
  });

  test("FASTEST and CHEAPEST produce different deterministic winners", () => {
    const fast = candidate("fast", 250, 900, 3, 100);
    const cheap = candidate("cheap", 285, 450, 5, 90);
    expect(rankCandidates([fast, cheap], "FASTEST")[0]?.id).toBe("fast");
    expect(rankCandidates([fast, cheap], "CHEAPEST")[0]?.id).toBe("cheap");
    expect(
      rankCandidates([fast, cheap], "BALANCED")[0]?.finalScore,
    ).toBeLessThanOrEqual(1);
  });
});
