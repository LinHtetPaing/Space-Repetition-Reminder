import { Controller, Get, Param, Req, UseGuards } from "@nestjs/common";
import {
  AccessAuthGuard,
  type AuthenticatedRequest,
} from "../auth/guards/access-auth.guard";
import { ReviewsService } from "./reviews.service";

@Controller("task-cards")
@UseGuards(AccessAuthGuard)
export class ReviewsController {
  constructor(private readonly reviews: ReviewsService) {}

  @Get(":id/reviews")
  async listForCard(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string,
  ) {
    const reviews = await this.reviews.listForTaskCard(req.userId, id);
    return { reviews };
  }
}
