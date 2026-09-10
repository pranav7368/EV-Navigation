import { Module } from "@nestjs/common";
import { RecommendationsModule } from "../recommendations/recommendations.module";
import { RoutingModule } from "../routing/routing.module";
import { StationsModule } from "../stations/stations.module";
import { TripsController } from "./trips.controller";
import { TripsService } from "./trips.service";
@Module({
  imports: [RoutingModule, StationsModule, RecommendationsModule],
  controllers: [TripsController],
  providers: [TripsService],
  exports: [TripsService],
})
export class TripsModule {}
