import { Module } from "@nestjs/common";
import {
  CHARGING_STATION_PROVIDER,
  DatabaseChargingStationProvider,
  OpenChargeMapProvider,
  ResilientChargingStationProvider,
} from "./stations.provider";
import { StationsController } from "./stations.controller";
@Module({
  controllers: [StationsController],
  providers: [
    DatabaseChargingStationProvider,
    OpenChargeMapProvider,
    ResilientChargingStationProvider,
    {
      provide: CHARGING_STATION_PROVIDER,
      useExisting: ResilientChargingStationProvider,
    },
  ],
  exports: [CHARGING_STATION_PROVIDER],
})
export class StationsModule {}
