import { Body, Controller, Get, Post } from "@nestjs/common";
import { CurrentUser } from "../auth/auth.decorators";
import type { AuthenticatedUser } from "../auth/auth.types";
import { PrismaService } from "../prisma/prisma.service";
import { CreateVehicleDto } from "./vehicles.dto";

@Controller("vehicles")
export class VehiclesController {
  constructor(private readonly prisma: PrismaService) {}
  @Post() create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateVehicleDto,
  ) {
    return this.prisma.userVehicle.create({
      data: {
        ...dto,
        registrationNumber: dto.registrationNumber?.toUpperCase(),
        userId: user.id,
      },
      include: { evModel: true },
    });
  }
  @Get() list(@CurrentUser() user: AuthenticatedUser) {
    return this.prisma.userVehicle.findMany({
      where: { userId: user.id },
      include: { evModel: true },
      orderBy: { createdAt: "desc" },
    });
  }
}
