import type {
  Preference,
  RankedCandidate,
  RecommendationWeightConfig,
  ScoreBreakdown,
  StationCandidate,
} from "./types";

export const DEFAULT_RECOMMENDATION_WEIGHTS: RecommendationWeightConfig = {
  FASTEST: { time: 0.65, cost: 0.1, detour: 0.2, distance: 0.05 },
  CHEAPEST: { time: 0.15, cost: 0.65, detour: 0.15, distance: 0.05 },
  BALANCED: { time: 0.4, cost: 0.3, detour: 0.2, distance: 0.1 },
};

export function normalize(values: number[]): number[] {
  if (values.length === 0) return [];
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  if (minimum === maximum) return values.map(() => 0);
  return values.map((value) => (value - minimum) / (maximum - minimum));
}

function reasonFor(
  candidate: StationCandidate,
  alternatives: StationCandidate[],
  preference: Preference,
): string {
  const next = alternatives.find((item) => item.id !== candidate.id);
  const charger = `${candidate.charger.powerKw} kW ${candidate.charger.currentType}`;
  if (!next)
    return `Recommended as the only reachable compatible option, with a ${charger} charger.`;
  if (preference === "CHEAPEST") {
    const saving = Math.max(0, next.chargingCost - candidate.chargingCost);
    return `Recommended for the lowest estimated charging cost, saving ₹${saving.toFixed(0)} versus the next-ranked compatible option.`;
  }
  if (preference === "FASTEST") {
    const minutes = Math.max(
      0,
      next.totalJourneyMinutes - candidate.totalJourneyMinutes,
    );
    return `Recommended because its ${charger} charger reduces estimated total journey time by ${minutes.toFixed(0)} minutes versus the next-ranked compatible option.`;
  }
  return `Recommended for the best balance of estimated journey time, charging cost, and ${candidate.detourKm.toFixed(1)} km detour among reachable compatible options.`;
}

export function rankCandidates(
  candidates: StationCandidate[],
  preference: Preference,
  config: RecommendationWeightConfig = DEFAULT_RECOMMENDATION_WEIGHTS,
): RankedCandidate[] {
  if (candidates.length === 0) return [];
  const weights = config[preference];
  const time = normalize(
    candidates.map((candidate) => candidate.totalJourneyMinutes),
  );
  const cost = normalize(candidates.map((candidate) => candidate.chargingCost));
  const detour = normalize(candidates.map((candidate) => candidate.detourKm));
  const distance = normalize(
    candidates.map((candidate) => candidate.distanceFromStartKm),
  );
  const scored = candidates
    .map((candidate, index) => {
      const scoreBreakdown: ScoreBreakdown = {
        time: time[index]!,
        cost: cost[index]!,
        detour: detour[index]!,
        distance: distance[index]!,
        weightedTime: time[index]! * weights.time,
        weightedCost: cost[index]! * weights.cost,
        weightedDetour: detour[index]! * weights.detour,
        weightedDistance: distance[index]! * weights.distance,
      };
      const finalScore =
        scoreBreakdown.weightedTime +
        scoreBreakdown.weightedCost +
        scoreBreakdown.weightedDetour +
        scoreBreakdown.weightedDistance;
      return {
        ...candidate,
        finalScore,
        scoreBreakdown,
        recommendationReason: "",
      };
    })
    .sort(
      (a, b) =>
        a.finalScore - b.finalScore ||
        a.totalJourneyMinutes - b.totalJourneyMinutes,
    );
  return scored.map((candidate) => ({
    ...candidate,
    recommendationReason: reasonFor(candidate, scored, preference),
  }));
}
