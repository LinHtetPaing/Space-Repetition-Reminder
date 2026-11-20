import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { ReviewsRootController } from "./reviews-root.controller";
import { ReviewsController } from "./reviews.controller";
import { ReviewsService } from "./reviews.service";

@Module({
  imports: [AuthModule],
  controllers: [ReviewsController, ReviewsRootController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
