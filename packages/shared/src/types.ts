export type Preference = "FASTEST" | "CHEAPEST" | "BALANCED";
export type ConnectorType =
  "CCS2" | "CHADEMO" | "TYPE_2" | "GB_T" | "BHARAT_DC001";
export type ChargerCurrent = "AC" | "DC";

export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface NamedCoordinate extends Coordinate {
  label: string;
}

export interface RouteGeometry {
  distanceKm: number;
  durationMinutes: number;
  coordinates: Coordinate[];
  provider: string;
  isFallback: boolean;
}

export interface EVSpecification {
  id?: string;
  manufacturer: string;
  model: string;
  variant: string;
  batteryCapacityKwh: number;
  ratedRangeKm: number;
  maxAcChargingKw: number;
  maxDcChargingKw: number;
  connectorTypes: ConnectorType[];
  efficiencyKwhPerKm?: number | null;
}

export interface ChargerOption {
  id: string;
  connectorType: ConnectorType;
  currentType: ChargerCurrent;
  powerKw: number;
  pricePerKwh: number;
  status: "OPERATIONAL" | "OUT_OF_SERVICE" | "UNKNOWN";
}

export interface StationCandidate {
  id: string;
  name: string;
  operator: string;
  coordinate: Coordinate;
  distanceFromStartKm: number;
  corridorDistanceKm: number;
  detourKm: number;
  arrivalSoc: number;
  targetSoc: number;
  destinationArrivalSoc: number;
  energyRequiredKwh: number;
  chargingMinutes: number;
  chargingCost: number;
  totalJourneyMinutes: number;
  charger: ChargerOption;
  demoAvailability?: string;
}

export interface ScoreBreakdown {
  time: number;
  cost: number;
  detour: number;
  distance: number;
  weightedTime: number;
  weightedCost: number;
  weightedDetour: number;
  weightedDistance: number;
}

export interface RankedCandidate extends StationCandidate {
  finalScore: number;
  scoreBreakdown: ScoreBreakdown;
  recommendationReason: string;
}

export interface RecommendationWeights {
  time: number;
  cost: number;
  detour: number;
  distance: number;
}

export type RecommendationWeightConfig = Record<
  Preference,
  RecommendationWeights
>;

export interface BatteryAnalysis {
  startingSoc: number;
  minimumReserveSoc: number;
  availableEnergyKwh: number;
  usableEnergyKwh: number;
  estimatedRangeKm: number;
  energyNeededKwh: number;
  directArrivalSoc: number;
}
