import { Module } from "@nestjs/common";
import { EvModelsController } from "./ev-models.controller";
@Module({ controllers: [EvModelsController] })
export class EvModelsModule {}
