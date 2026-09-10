import { IsOptional, IsString, Length } from "class-validator";
export class CreateVehicleDto {
  @IsString() evModelId!: string;
  @IsOptional() @IsString() @Length(1, 60) nickname?: string;
  @IsOptional() @IsString() @Length(3, 20) registrationNumber?: string;
}
