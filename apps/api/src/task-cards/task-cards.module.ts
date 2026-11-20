import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { ReviewsModule } from "../reviews/reviews.module";
import { TaskCardsController } from "./task-cards.controller";
import { TaskCardsService } from "./task-cards.service";

@Module({
  imports: [AuthModule, ReviewsModule],
  controllers: [TaskCardsController],
  providers: [TaskCardsService],
})
export class TaskCardsModule {}
