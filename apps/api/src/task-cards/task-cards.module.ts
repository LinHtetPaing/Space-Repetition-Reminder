import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { TaskCardsController } from "./task-cards.controller";
import { TaskCardsService } from "./task-cards.service";

@Module({
  imports: [AuthModule],
  controllers: [TaskCardsController],
  providers: [TaskCardsService],
})
export class TaskCardsModule {}
