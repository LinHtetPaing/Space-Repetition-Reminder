import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { addUtcDays, buildReviewDates } from "@srr/schedule-engine";
import type { ReviewSchedule } from "@srr/shared-types";
import { PrismaService } from "../prisma/prisma.service";
import {
  DEFAULT_HORIZON_MONTHS,
  DEFAULT_INTERVALS_DAYS,
} from "./defaults";
import { parseIntervalsDays } from "./helpers/intervals";
import { toPublicReviewSchedule } from "./helpers/public-review-schedule";

type DbClient = Prisma.TransactionClient | PrismaService;

type NewTaskCard = {
  id: string;
  userId: string;
  createdAt: Date;
};

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async ensureRetentionPolicy(tx: DbClient, userId: string) {
    const existing = await tx.retentionPolicy.findUnique({
      where: { userId },
    });
    if (existing) {
      return existing;
    }

    return tx.retentionPolicy.create({
      data: {
        userId,
        horizonMonths: DEFAULT_HORIZON_MONTHS,
        intervalsDays: [...DEFAULT_INTERVALS_DAYS],
      },
    });
  }

  async generateForNewCard(tx: DbClient, card: NewTaskCard): Promise<void> {
    const policy = await this.ensureRetentionPolicy(tx, card.userId);
    const intervalsDays = parseIntervalsDays(policy.intervalsDays);
    const scheduledDates = buildReviewDates({
      createdAt: card.createdAt,
      intervalsDays,
      horizonMonths: policy.horizonMonths,
    });

    if (scheduledDates.length === 0) {
      return;
    }

    const intervalByInstant = new Map(
      intervalsDays.map((intervalDays) => {
        const instant = addUtcDays(card.createdAt, intervalDays);
        return [instant.getTime(), intervalDays] as const;
      }),
    );

    await tx.reviewSchedule.createMany({
      data: scheduledDates.map((scheduledFor) => ({
        taskCardId: card.id,
        userId: card.userId,
        scheduledFor,
        status: "Pending" as const,
        completedAt: null,
        intervalDays: intervalByInstant.get(scheduledFor.getTime())!,
      })),
    });
  }

  async listForTaskCard(
    userId: string,
    taskCardId: string,
  ): Promise<ReviewSchedule[]> {
    const card = await this.prisma.taskCard.findFirst({
      where: { id: taskCardId, userId },
      select: { id: true },
    });
    if (!card) {
      throw new NotFoundException();
    }

    const rows = await this.prisma.reviewSchedule.findMany({
      where: { taskCardId, userId },
      orderBy: { scheduledFor: "asc" },
    });
    return rows.map(toPublicReviewSchedule);
  }
}
