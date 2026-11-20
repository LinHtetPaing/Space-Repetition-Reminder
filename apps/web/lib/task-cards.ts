import type { TaskCard, TipTapDoc } from "@srr/shared-types";
import { apiFetch } from "./api";

export const EMPTY_DOC: TipTapDoc = {
  type: "doc",
  content: [{ type: "paragraph" }],
};

type TaskCardResponse = { taskCard: TaskCard };
type TaskCardListResponse = { taskCards: TaskCard[] };

export function listTaskCards(): Promise<TaskCardListResponse> {
  return apiFetch<TaskCardListResponse>("/task-cards");
}

export function getTaskCard(id: string): Promise<TaskCardResponse> {
  return apiFetch<TaskCardResponse>(`/task-cards/${id}`);
}

export function createTaskCard(
  title: string,
  description: TipTapDoc,
): Promise<TaskCardResponse> {
  return apiFetch<TaskCardResponse>("/task-cards", {
    method: "POST",
    body: JSON.stringify({ title, description }),
  });
}

export function updateTaskCard(
  id: string,
  patch: { title?: string; description?: TipTapDoc },
): Promise<TaskCardResponse> {
  return apiFetch<TaskCardResponse>(`/task-cards/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}
