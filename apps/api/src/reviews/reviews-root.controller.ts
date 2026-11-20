import {
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import {
  AccessAuthGuard,
  type AuthenticatedRequest,
} from "../auth/guards/access-auth.guard";
import { CalendarQueryDto } from "./dto/calendar-query.dto";
import { DueQueryDto } from "./dto/due-query.dto";
import { ReviewsService } from "./reviews.service";

/** /reviews routes; separate from task-cards/:id/reviews. */
@Controller("reviews")
@UseGuards(AccessAuthGuard)
export class ReviewsRootController {
  constructor(private readonly reviews: ReviewsService) {}

  /** Inclusive civil range; only days with ≥1 review. */
  @Get("calendar")
  async calendar(
    @Req() req: AuthenticatedRequest,
    @Query() query: CalendarQueryDto,
  ) {
    return this.reviews.calendarForUser(
      req.userId,
      query.from,
      query.to,
      query.timezone,
    );
  }

  @Get("due")
  async due(@Req() req: AuthenticatedRequest, @Query() query: DueQueryDto) {
    return this.reviews.dueForUser(req.userId, query.timezone, query.on);
  }

  @Post(":id/complete")
  @HttpCode(200)
  async complete(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string,
  ) {
    const review = await this.reviews.completeForUser(req.userId, id);
    return { review };
  }
}
