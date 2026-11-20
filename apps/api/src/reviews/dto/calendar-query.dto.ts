import { IsString, Matches } from "class-validator";

const CIVIL_DATE = /^\d{4}-\d{2}-\d{2}$/;

export class CalendarQueryDto {
  @IsString()
  @Matches(CIVIL_DATE, { message: "from must be YYYY-MM-DD" })
  from!: string;

  @IsString()
  @Matches(CIVIL_DATE, { message: "to must be YYYY-MM-DD" })
  to!: string;

  @IsString()
  timezone!: string;
}
