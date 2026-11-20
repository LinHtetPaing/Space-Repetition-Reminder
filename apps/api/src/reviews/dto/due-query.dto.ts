import { IsOptional, IsString, Matches } from "class-validator";

const CIVIL_DATE = /^\d{4}-\d{2}-\d{2}$/;

export class DueQueryDto {
  @IsString()
  timezone!: string;

  @IsOptional()
  @IsString()
  @Matches(CIVIL_DATE, { message: "on must be YYYY-MM-DD" })
  on?: string;
}
