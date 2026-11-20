import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { HealthController } from "./health/health.controller";
import { PrismaModule } from "./prisma/prisma.module";
import { RedisModule } from "./redis/redis.module";
import { ReviewsModule } from "./reviews/reviews.module";
import { TaskCardsModule } from "./task-cards/task-cards.module";

@Module({
  imports: [
    PrismaModule,
    RedisModule,
    AuthModule,
    ReviewsModule,
    TaskCardsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}

