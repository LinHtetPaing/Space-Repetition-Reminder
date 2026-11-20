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
};

export function toPublicReviewSchedule(row: ReviewScheduleRow): ReviewSchedule {
  return {
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
}
