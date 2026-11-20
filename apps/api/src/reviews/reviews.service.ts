import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { addUtcDays, buildReviewDates } from "@srr/schedule-engine";
import type { ReviewSchedule } from "@srr/shared-types";
import { PrismaService } from "../prisma/prisma.service";
import {
  DEFAULT_HORIZON_MONTHS,
  DEFAULT_INTERVALS_DAYS,
} from "./defaults";
import {
  civilDateRangeToUtcBounds,
  groupByCivilDate,
  isValidCivilDate,
  isValidTimeZone,
  todayCivilDate,
} from "./helpers/civil-date";
import { parseIntervalsDays } from "./helpers/intervals";
import { toPublicReviewSchedule } from "./helpers/public-review-schedule";

type DbClient = Prisma.TransactionClient | PrismaService;

type NewTaskCard = {
  id: string;
  userId: string;
  createdAt: Date;
};

export type CalendarDay = {
  date: string;
  reviews: ReviewSchedule[];
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

  /** Days without reviews are omitted. */
  async calendarForUser(
    userId: string,
    from: string,
    to: string,
    timeZone: string,
  ): Promise<{ timezone: string; days: CalendarDay[] }> {
    this.assertTimeZone(timeZone);
    this.assertCivilDate(from, "from");
    this.assertCivilDate(to, "to");
    if (from > to) {
      throw new BadRequestException("from must be on or before to");
    }

    const { startUtc, endUtcExclusive } = civilDateRangeToUtcBounds(
      from,
      to,
      timeZone,
    );

    const rows = await this.prisma.reviewSchedule.findMany({
      where: {
        userId,
        scheduledFor: { gte: startUtc, lt: endUtcExclusive },
      },
      include: { taskCard: { select: { title: true } } },
      orderBy: { scheduledFor: "asc" },
    });

    const days = groupByCivilDate(rows, timeZone).map(({ date, items }) => ({
      date,
      reviews: items.map(toPublicReviewSchedule),
    }));

    return { timezone: timeZone, days };
  }

  async dueForUser(
    userId: string,
    timeZone: string,
    on?: string,
  ): Promise<{ timezone: string; on: string; reviews: ReviewSchedule[] }> {
    this.assertTimeZone(timeZone);
    const civilOn = on ?? todayCivilDate(timeZone);
    this.assertCivilDate(civilOn, "on");

    const { startUtc, endUtcExclusive } = civilDateRangeToUtcBounds(
      civilOn,
      civilOn,
      timeZone,
    );

    const rows = await this.prisma.reviewSchedule.findMany({
      where: {
        userId,
        status: "Pending",
        scheduledFor: { gte: startUtc, lt: endUtcExclusive },
      },
      include: { taskCard: { select: { title: true } } },
      orderBy: { scheduledFor: "asc" },
    });

    return {
      timezone: timeZone,
      on: civilOn,
      reviews: rows.map(toPublicReviewSchedule),
    };
  }

  async completeForUser(
    userId: string,
    reviewId: string,
  ): Promise<ReviewSchedule> {
    const existing = await this.prisma.reviewSchedule.findFirst({
      where: { id: reviewId, userId },
    });
    if (!existing) {
      throw new NotFoundException();
    }
    if (existing.status === "Completed") {
      throw new ConflictException("review already completed");
    }

    const updated = await this.prisma.reviewSchedule.update({
      where: { id: existing.id },
      data: {
        status: "Completed",
        completedAt: new Date(),
      },
    });
    return toPublicReviewSchedule(updated);
  }

  private assertTimeZone(timeZone: string): void {
    if (!isValidTimeZone(timeZone)) {
      throw new BadRequestException(`Invalid timezone: ${timeZone}`);
    }
  }

  private assertCivilDate(value: string, field: string): void {
    if (!isValidCivilDate(value)) {
      throw new BadRequestException(`${field} must be a valid YYYY-MM-DD date`);
    }
  }
}
