import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from "class-validator";
import type { Preference } from "@smartev/shared";

export class PlanTripDto {
  @IsString() evModelId!: string;
  @IsOptional() @IsString() vehicleId?: string;
  @IsString() source!: string;
  @IsString() destination!: string;
  @IsNumber() @Min(1) @Max(100) startingSoc!: number;
  @IsEnum(["FASTEST", "CHEAPEST", "BALANCED"]) preference!: Preference;
  @IsOptional() @IsNumber() @Min(0) @Max(40) minimumReserveSoc?: number;
}
