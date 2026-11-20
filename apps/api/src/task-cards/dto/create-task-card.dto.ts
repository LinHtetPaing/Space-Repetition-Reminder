import { IsObject, IsString } from "class-validator";

export class CreateTaskCardDto {
  @IsString()
  title!: string;

  @IsObject()
  description!: Record<string, unknown>;
}
