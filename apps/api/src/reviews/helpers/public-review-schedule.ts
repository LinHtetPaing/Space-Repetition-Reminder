import type {
  ReviewSchedule,
  ReviewScheduleId,
  ReviewStatus,
  TaskCardId,
  UserId,
  UtcInstant,
} from "@srr/shared-types";

type ReviewScheduleRow = {
  id: string;
  taskCardId: string;
  userId: string;
  scheduledFor: Date;
  status: ReviewStatus;
  completedAt: Date | null;
  intervalDays: number;
  taskCard?: { title: string } | null;
};

export function toPublicReviewSchedule(row: ReviewScheduleRow): ReviewSchedule {
  const base: ReviewSchedule = {
    id: row.id as ReviewScheduleId,
    taskCardId: row.taskCardId as TaskCardId,
    userId: row.userId as UserId,
    scheduledFor: row.scheduledFor.toISOString() as UtcInstant,
    status: row.status,
    completedAt: row.completedAt
      ? (row.completedAt.toISOString() as UtcInstant)
      : null,
    intervalDays: row.intervalDays,
  };
  if (row.taskCard?.title !== undefined) {
    base.taskCardTitle = row.taskCard.title;
  }
  return base;
}
