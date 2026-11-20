import type {
  TaskCard,
  TaskCardId,
  TipTapDoc,
  UserId,
  UtcInstant,
} from "@srr/shared-types";

type TaskCardRow = {
  id: string;
  userId: string;
  title: string;
  description: unknown;
  createdAt: Date;
  updatedAt: Date;
};

export function toPublicTaskCard(row: TaskCardRow): TaskCard {
  return {
    id: row.id as TaskCardId,
    userId: row.userId as UserId,
    title: row.title,
    description: row.description as TipTapDoc,
    createdAt: row.createdAt.toISOString() as UtcInstant,
    updatedAt: row.updatedAt.toISOString() as UtcInstant,
  };
}
