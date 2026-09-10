import type { RecommendationWeightConfig } from "@smartev/shared";

const numberFromEnv = (name: string, fallback: number): number => {
  const value = Number(process.env[name]);
  return Number.isFinite(value) ? value : fallback;
};

export default () => ({
  planning: {
    minimumReserveSoc: numberFromEnv("MIN_RESERVE_SOC", 10),
    defaultTargetSoc: numberFromEnv("DEFAULT_TARGET_SOC", 80),
    chargingEfficiency: numberFromEnv("CHARGING_EFFICIENCY", 0.9),
    maximumCorridorKm: numberFromEnv("MAX_STATION_CORRIDOR_KM", 10),
    routeEnergyBuffer: numberFromEnv("ROUTE_ENERGY_BUFFER", 1.05),
    providerTimeoutMs: numberFromEnv("PROVIDER_TIMEOUT_MS", 4500),
    weights: {
      FASTEST: { time: 0.65, cost: 0.1, detour: 0.2, distance: 0.05 },
      CHEAPEST: { time: 0.15, cost: 0.65, detour: 0.15, distance: 0.05 },
      BALANCED: { time: 0.4, cost: 0.3, detour: 0.2, distance: 0.1 },
    } satisfies RecommendationWeightConfig,
  },
});
