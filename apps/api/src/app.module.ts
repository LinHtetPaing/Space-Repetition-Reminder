import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { HealthController } from "./health/health.controller";
import { PrismaModule } from "./prisma/prisma.module";
import { RedisModule } from "./redis/redis.module";
import { TaskCardsModule } from "./task-cards/task-cards.module";

@Module({
  imports: [PrismaModule, RedisModule, AuthModule, TaskCardsModule],
  controllers: [HealthController],
})
export class AppModule {}
