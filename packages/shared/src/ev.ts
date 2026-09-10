import type {
  BatteryAnalysis,
  ChargerOption,
  ConnectorType,
  EVSpecification,
} from "./types";

const requireFinite = (value: number, name: string): void => {
  if (!Number.isFinite(value)) throw new RangeError(`${name} must be finite`);
};

const requirePositive = (value: number, name: string): void => {
  requireFinite(value, name);
  if (value <= 0) throw new RangeError(`${name} must be greater than zero`);
};

export function clampSoc(soc: number): number {
  requireFinite(soc, "SOC");
  return Math.min(100, Math.max(0, soc));
}

export function effectiveEfficiency(ev: EVSpecification): number {
  requirePositive(ev.batteryCapacityKwh, "batteryCapacityKwh");
  requirePositive(ev.ratedRangeKm, "ratedRangeKm");
  const efficiency =
    ev.efficiencyKwhPerKm ?? ev.batteryCapacityKwh / ev.ratedRangeKm;
  requirePositive(efficiency, "efficiencyKwhPerKm");
  return efficiency;
}

export function availableEnergyKwh(capacityKwh: number, soc: number): number {
  requirePositive(capacityKwh, "capacityKwh");
  return (capacityKwh * clampSoc(soc)) / 100;
}

export function estimatedRangeKm(ev: EVSpecification, soc: number): number {
  return (
    availableEnergyKwh(ev.batteryCapacityKwh, soc) / effectiveEfficiency(ev)
  );
}

export function energyForDistanceKwh(
  ev: EVSpecification,
  distanceKm: number,
  routeBuffer = 1,
): number {
  requireFinite(distanceKm, "distanceKm");
  requirePositive(routeBuffer, "routeBuffer");
  if (distanceKm < 0) throw new RangeError("distanceKm cannot be negative");
  return distanceKm * effectiveEfficiency(ev) * routeBuffer;
}

export function socAfterDistance(
  ev: EVSpecification,
  startingSoc: number,
  distanceKm: number,
  routeBuffer = 1,
): number {
  const consumedPercent =
    (energyForDistanceKwh(ev, distanceKm, routeBuffer) /
      ev.batteryCapacityKwh) *
    100;
  return clampSoc(startingSoc) - consumedPercent;
}

export function isReachable(
  arrivalSoc: number,
  minimumReserveSoc = 10,
): boolean {
  return arrivalSoc >= clampSoc(minimumReserveSoc);
}

export function analyzeBattery(
  ev: EVSpecification,
  startingSoc: number,
  distanceKm: number,
  minimumReserveSoc = 10,
  routeBuffer = 1,
): BatteryAnalysis {
  const start = clampSoc(startingSoc);
  const reserve = clampSoc(minimumReserveSoc);
  const energyNeededKwh = energyForDistanceKwh(ev, distanceKm, routeBuffer);
  const available = availableEnergyKwh(ev.batteryCapacityKwh, start);
  const usable = Math.max(
    0,
    available - availableEnergyKwh(ev.batteryCapacityKwh, reserve),
  );
  return {
    startingSoc: start,
    minimumReserveSoc: reserve,
    availableEnergyKwh: available,
    usableEnergyKwh: usable,
    estimatedRangeKm: estimatedRangeKm(ev, start),
    energyNeededKwh,
    directArrivalSoc: start - (energyNeededKwh / ev.batteryCapacityKwh) * 100,
  };
}

export function isConnectorCompatible(
  ev: EVSpecification,
  connector: ConnectorType,
): boolean {
  return ev.connectorTypes.includes(connector);
}

export function effectiveChargingPowerKw(
  ev: EVSpecification,
  charger: ChargerOption,
): number {
  const vehicleLimit =
    charger.currentType === "DC" ? ev.maxDcChargingKw : ev.maxAcChargingKw;
  return Math.min(vehicleLimit, charger.powerKw);
}

export function requiredTargetSoc(
  ev: EVSpecification,
  remainingDistanceKm: number,
  minimumReserveSoc = 10,
  defaultTargetSoc = 80,
  routeBuffer = 1,
): number {
  const required =
    minimumReserveSoc +
    (energyForDistanceKwh(ev, remainingDistanceKm, routeBuffer) /
      ev.batteryCapacityKwh) *
      100;
  return Math.min(100, Math.max(clampSoc(defaultTargetSoc), required));
}

export function chargingEnergyKwh(
  capacityKwh: number,
  arrivalSoc: number,
  targetSoc: number,
): number {
  requirePositive(capacityKwh, "capacityKwh");
  const delta = clampSoc(targetSoc) - clampSoc(arrivalSoc);
  return (capacityKwh * Math.max(0, delta)) / 100;
}

export function chargingTimeMinutes(
  energyKwh: number,
  effectivePowerKw: number,
  chargingEfficiency = 0.9,
): number {
  if (energyKwh < 0) throw new RangeError("energyKwh cannot be negative");
  requirePositive(effectivePowerKw, "effectivePowerKw");
  requirePositive(chargingEfficiency, "chargingEfficiency");
  if (chargingEfficiency > 1)
    throw new RangeError("chargingEfficiency cannot exceed 1");
  return (energyKwh / (effectivePowerKw * chargingEfficiency)) * 60;
}

export function chargingCost(energyKwh: number, pricePerKwh: number): number {
  if (energyKwh < 0 || pricePerKwh < 0)
    throw new RangeError("energy and price cannot be negative");
  return energyKwh * pricePerKwh;
}
