import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from "class-validator";
import { ChargerCurrent, ChargerStatus, ConnectorType } from "@prisma/client";

export class CreateEvModelDto {
  @IsString() manufacturer!: string;
  @IsString() model!: string;
  @IsString() variant!: string;
  @Type(() => Number) @IsNumber() @Min(1) batteryCapacityKwh!: number;
  @Type(() => Number) @IsNumber() @Min(1) ratedRangeKm!: number;
  @Type(() => Number) @IsNumber() @Min(0) maxAcChargingKw!: number;
  @Type(() => Number) @IsNumber() @Min(0) maxDcChargingKw!: number;
  @IsArray()
  @IsEnum(ConnectorType, { each: true })
  connectorTypes!: ConnectorType[];
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  efficiencyKwhPerKm?: number;
}
export class CreateStationDto {
  @IsString() name!: string;
  @IsString() operator!: string;
  @IsString() address!: string;
  @IsString() city!: string;
  @Type(() => Number) @IsNumber() latitude!: number;
  @Type(() => Number) @IsNumber() longitude!: number;
}
export class CreateChargerDto {
  @IsString() stationId!: string;
  @IsEnum(ConnectorType) connectorType!: ConnectorType;
  @IsEnum(ChargerCurrent) currentType!: ChargerCurrent;
  @Type(() => Number) @IsNumber() @Min(0.1) powerKw!: number;
  @Type(() => Number) @IsNumber() @Min(0) pricePerKwh!: number;
  @IsOptional() @IsEnum(ChargerStatus) status?: ChargerStatus;
}
export class UpdateChargerDto {
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) pricePerKwh?: number;
  @IsOptional() @IsEnum(ChargerStatus) status?: ChargerStatus;
  @IsOptional() @IsBoolean() isDemoStatus?: boolean;
}
