import { Controller, Get, NotFoundException, Param } from "@nestjs/common";
import { Public } from "../auth/auth.decorators";
import { PrismaService } from "../prisma/prisma.service";

@Public()
@Controller("ev-models")
export class EvModelsController {
  constructor(private readonly prisma: PrismaService) {}
  @Get() list() {
    return this.prisma.eVModel.findMany({
      where: { isActive: true },
      orderBy: [{ manufacturer: "asc" }, { model: "asc" }],
    });
  }
  @Get(":id") async get(@Param("id") id: string) {
    const model = await this.prisma.eVModel.findUnique({ where: { id } });
    if (!model) throw new NotFoundException("EV model not found");
    return model;
  }
}
