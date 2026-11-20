import { IsObject, IsOptional, IsString } from "class-validator";

export class UpdateTaskCardDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsObject()
  description?: Record<string, unknown>;
}
