import type { Coordinate, StationCandidate } from "./types";

const EARTH_RADIUS_KM = 6371.0088;
const radians = (degrees: number): number => (degrees * Math.PI) / 180;

export function haversineDistanceKm(a: Coordinate, b: Coordinate): number {
  const lat1 = radians(a.latitude);
  const lat2 = radians(b.latitude);
  const deltaLat = radians(b.latitude - a.latitude);
  const deltaLon = radians(b.longitude - a.longitude);
  const h =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

function localXY(
  point: Coordinate,
  origin: Coordinate,
): { x: number; y: number } {
  const meanLat = radians((point.latitude + origin.latitude) / 2);
  return {
    x:
      radians(point.longitude - origin.longitude) *
      EARTH_RADIUS_KM *
      Math.cos(meanLat),
    y: radians(point.latitude - origin.latitude) * EARTH_RADIUS_KM,
  };
}

export function distancePointToSegmentKm(
  point: Coordinate,
  start: Coordinate,
  end: Coordinate,
): number {
  const p = localXY(point, start);
  const e = localXY(end, start);
  const lengthSquared = e.x ** 2 + e.y ** 2;
  if (lengthSquared === 0) return haversineDistanceKm(point, start);
  const t = Math.max(0, Math.min(1, (p.x * e.x + p.y * e.y) / lengthSquared));
  return Math.hypot(p.x - t * e.x, p.y - t * e.y);
}

export function distanceToRouteKm(
  point: Coordinate,
  route: Coordinate[],
): number {
  if (route.length === 0) return Number.POSITIVE_INFINITY;
  if (route.length === 1) return haversineDistanceKm(point, route[0]!);
  let minimum = Number.POSITIVE_INFINITY;
  for (let index = 1; index < route.length; index += 1) {
    minimum = Math.min(
      minimum,
      distancePointToSegmentKm(point, route[index - 1]!, route[index]!),
    );
  }
  return minimum;
}

export function routeLengthKm(route: Coordinate[]): number {
  let length = 0;
  for (let index = 1; index < route.length; index += 1) {
    length += haversineDistanceKm(route[index - 1]!, route[index]!);
  }
  return length;
}

export function distanceAlongRouteKm(
  point: Coordinate,
  route: Coordinate[],
): number {
  if (route.length < 2) return 0;
  let traversed = 0;
  let bestDistance = Number.POSITIVE_INFINITY;
  let bestProgress = 0;
  for (let index = 1; index < route.length; index += 1) {
    const start = route[index - 1]!;
    const end = route[index]!;
    const segmentLength = haversineDistanceKm(start, end);
    const distance = distancePointToSegmentKm(point, start, end);
    if (distance < bestDistance) {
      const fromStart = haversineDistanceKm(start, point);
      bestProgress = traversed + Math.min(segmentLength, fromStart);
      bestDistance = distance;
    }
    traversed += segmentLength;
  }
  return bestProgress;
}

export function withinRouteCorridor<T extends { coordinate: Coordinate }>(
  items: T[],
  route: Coordinate[],
  maximumKm = 10,
): T[] {
  return items.filter(
    (item) => distanceToRouteKm(item.coordinate, route) <= maximumKm,
  );
}

export function nearestReachableBaseline(
  candidates: StationCandidate[],
): StationCandidate | null {
  return (
    [...candidates].sort(
      (a, b) => a.distanceFromStartKm - b.distanceFromStartKm,
    )[0] ?? null
  );
}
