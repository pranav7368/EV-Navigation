import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { CurrentUser } from "../auth/auth.decorators";
import type { AuthenticatedUser } from "../auth/auth.types";
import { PlanTripDto } from "./trips.dto";
import { TripsService } from "./trips.service";

@Controller("trips")
export class TripsController {
  constructor(private readonly trips: TripsService) {}
  @Post("plan") plan(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: PlanTripDto,
  ) {
    return this.trips.plan(user, dto);
  }
  @Get() list(@CurrentUser() user: AuthenticatedUser) {
    return this.trips.list(user.id);
  }
  @Get(":id") get(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
  ) {
    return this.trips.get(user.id, id);
  }
}
