import type { NamedCoordinate, RouteGeometry } from "@smartev/shared";

export const ROUTE_PROVIDER = Symbol("ROUTE_PROVIDER");
export const GEOCODING_PROVIDER = Symbol("GEOCODING_PROVIDER");

export interface RouteProvider {
  route(
    source: NamedCoordinate,
    destination: NamedCoordinate,
  ): Promise<RouteGeometry>;
}
export interface GeocodingProvider {
  geocode(query: string): Promise<NamedCoordinate>;
}
