import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
} from "@nestjs/common";
import { Public } from "../auth/auth.decorators";
import { PrismaService } from "../prisma/prisma.service";

@Public()
@Controller("stations")
export class StationsController {
  constructor(private readonly prisma: PrismaService) {}
  @Get() list(@Query("city") city?: string) {
    return this.prisma.chargingStation.findMany({
      where: {
        isActive: true,
        ...(city
          ? { city: { contains: city, mode: "insensitive" as const } }
          : {}),
      },
      include: { chargers: true },
      take: 100,
      orderBy: { name: "asc" },
    });
  }
  @Get(":id") async get(@Param("id") id: string) {
    const station = await this.prisma.chargingStation.findUnique({
      where: { id },
      include: { chargers: true },
    });
    if (!station) throw new NotFoundException("Charging station not found");
    return station;
  }
}
