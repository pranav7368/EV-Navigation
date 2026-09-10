import { Module } from "@nestjs/common";
import { GEOCODING_PROVIDER, ROUTE_PROVIDER } from "./providers";
import { ResilientGeocodingProvider } from "./resilient-geocoding.provider";
import { ResilientRouteProvider } from "./resilient-route.provider";

@Module({
  providers: [
    ResilientRouteProvider,
    ResilientGeocodingProvider,
    { provide: ROUTE_PROVIDER, useExisting: ResilientRouteProvider },
    { provide: GEOCODING_PROVIDER, useExisting: ResilientGeocodingProvider },
  ],
  exports: [ROUTE_PROVIDER, GEOCODING_PROVIDER],
})
export class RoutingModule {}
