import type { ReviewSchedulePublic } from "@srr/shared-types";
import { apiFetch } from "./api";

export type CalendarDay = {
  date: string;
  reviews: ReviewSchedulePublic[];
};

export type CalendarResponse = {
  timezone: string;
  days: CalendarDay[];
};

export type DueResponse = {
  timezone: string;
  on: string;
  reviews: ReviewSchedulePublic[];
};

export type CompleteResponse = {
  review: ReviewSchedulePublic;
};

export function fetchCalendar(
  from: string,
  to: string,
  timezone: string,
): Promise<CalendarResponse> {
  const params = new URLSearchParams({ from, to, timezone });
  return apiFetch<CalendarResponse>(`/reviews/calendar?${params}`);
}

export function fetchDue(
  timezone: string,
  on?: string,
): Promise<DueResponse> {
  const params = new URLSearchParams({ timezone });
  if (on) {
    params.set("on", on);
  }
  return apiFetch<DueResponse>(`/reviews/due?${params}`);
}

export function completeReview(id: string): Promise<CompleteResponse> {
  return apiFetch<CompleteResponse>(`/reviews/${id}/complete`, {
    method: "POST",
  });
}

export function reviewsByDate(
  days: CalendarDay[],
): Map<string, ReviewSchedulePublic[]> {
  const map = new Map<string, ReviewSchedulePublic[]>();
  for (const day of days) {
    map.set(day.date, day.reviews);
  }
  return map;
}
