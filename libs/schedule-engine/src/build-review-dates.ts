import { addUtcDays, addUtcMonths } from "./utc-calendar";

export type BuildReviewDatesInput = {
  createdAt: Date;
  intervalsDays: readonly number[];
  horizonMonths: number;
};

/**
 * Pure schedule generator. Returns ascending UTC instants for each interval
 * day that falls on or before createdAt + horizonMonths (month-clamped).
 */
export function buildReviewDates(input: BuildReviewDatesInput): Date[] {
  const horizonEnd = addUtcMonths(input.createdAt, input.horizonMonths);
  const dates: Date[] = [];

  for (const intervalDays of input.intervalsDays) {
    const candidate = addUtcDays(input.createdAt, intervalDays);
    if (candidate.getTime() <= horizonEnd.getTime()) {
      dates.push(candidate);
    }
  }

  dates.sort((a, b) => a.getTime() - b.getTime());
  return dates;
}
