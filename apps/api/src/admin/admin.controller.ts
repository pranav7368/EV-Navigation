import { Body, Controller, Param, Patch, Post } from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { Roles } from "../auth/auth.decorators";
import { PrismaService } from "../prisma/prisma.service";
import {
  CreateChargerDto,
  CreateEvModelDto,
  CreateStationDto,
  UpdateChargerDto,
} from "./admin.dto";

@Roles(UserRole.ADMIN)
@Controller("admin")
export class AdminController {
  constructor(private readonly prisma: PrismaService) {}
  @Post("ev-models") createEv(@Body() dto: CreateEvModelDto) {
    return this.prisma.eVModel.create({ data: dto });
  }
  @Post("stations") createStation(@Body() dto: CreateStationDto) {
    return this.prisma.chargingStation.create({ data: dto });
  }
  @Post("chargers") createCharger(@Body() dto: CreateChargerDto) {
    return this.prisma.charger.create({ data: dto });
  }
  @Patch("chargers/:id") updateCharger(
    @Param("id") id: string,
    @Body() dto: UpdateChargerDto,
  ) {
    return this.prisma.charger.update({ where: { id }, data: dto });
  }
}
