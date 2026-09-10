import { BadRequestException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { NamedCoordinate } from "@smartev/shared";
import { findDemoLocation } from "./demo-locations";
import type { GeocodingProvider } from "./providers";

@Injectable()
export class ResilientGeocodingProvider implements GeocodingProvider {
  constructor(private readonly config: ConfigService) {}
  async geocode(query: string): Promise<NamedCoordinate> {
    const demo = findDemoLocation(query);
    if (demo) return demo;
    const base = this.config.get(
      "NOMINATIM_BASE_URL",
      "https://nominatim.openstreetmap.org",
    );
    const timeout = this.config.get<number>("planning.providerTimeoutMs", 4500);
    try {
      const response = await fetch(
        `${base}/search?format=jsonv2&limit=1&q=${encodeURIComponent(query)}`,
        {
          headers: { "User-Agent": "SmartEV-Navigator-Academic/1.0" },
          signal: AbortSignal.timeout(timeout),
        },
      );
      if (!response.ok) throw new Error("Geocoder unavailable");
      const results = (await response.json()) as Array<{
        display_name: string;
        lat: string;
        lon: string;
      }>;
      const first = results[0];
      if (!first) throw new Error("Location not found");
      return {
        label: first.display_name,
        latitude: Number(first.lat),
        longitude: Number(first.lon),
      };
    } catch {
      throw new BadRequestException(
        `Could not resolve location "${query}". Try a predefined demo location.`,
      );
    }
  }
}
