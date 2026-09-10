import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  haversineDistanceKm,
  type NamedCoordinate,
  type RouteGeometry,
} from "@smartev/shared";
import type { RouteProvider } from "./providers";

@Injectable()
export class ResilientRouteProvider implements RouteProvider {
  constructor(private readonly config: ConfigService) {}
  async route(
    source: NamedCoordinate,
    destination: NamedCoordinate,
  ): Promise<RouteGeometry> {
    const base = this.config.get(
      "OSRM_BASE_URL",
      "https://router.project-osrm.org",
    );
    const timeout = this.config.get<number>("planning.providerTimeoutMs", 4500);
    try {
      const coordinates = `${source.longitude},${source.latitude};${destination.longitude},${destination.latitude}`;
      const response = await fetch(
        `${base}/route/v1/driving/${coordinates}?overview=full&geometries=geojson&steps=false`,
        { signal: AbortSignal.timeout(timeout) },
      );
      if (!response.ok) throw new Error("Routing provider unavailable");
      const body = (await response.json()) as {
        routes?: Array<{
          distance: number;
          duration: number;
          geometry: { coordinates: [number, number][] };
        }>;
      };
      const route = body.routes?.[0];
      if (!route) throw new Error("No route returned");
      return {
        distanceKm: route.distance / 1000,
        durationMinutes: route.duration / 60,
        coordinates: route.geometry.coordinates.map(
          ([longitude, latitude]) => ({ latitude, longitude }),
        ),
        provider: "OSRM",
        isFallback: false,
      };
    } catch {
      return this.fallback(source, destination);
    }
  }
  private fallback(
    source: NamedCoordinate,
    destination: NamedCoordinate,
  ): RouteGeometry {
    const points = Array.from({ length: 13 }, (_, index) => {
      const progress = index / 12;
      return {
        latitude:
          source.latitude + (destination.latitude - source.latitude) * progress,
        longitude:
          source.longitude +
          (destination.longitude - source.longitude) * progress,
      };
    });
    const distanceKm = haversineDistanceKm(source, destination) * 1.16;
    return {
      distanceKm,
      durationMinutes: (distanceKm / 62) * 60,
      coordinates: points,
      provider: "Demo route fallback",
      isFallback: true,
    };
  }
}
