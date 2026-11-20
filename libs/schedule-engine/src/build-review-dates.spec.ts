import { buildReviewDates } from "./build-review-dates";
import { addUtcDays, addUtcMonths } from "./utc-calendar";

describe("addUtcMonths", () => {
  it("clamps Jan 31 + 1 month to Feb 28 in a non-leap year", () => {
    const start = new Date(Date.UTC(2025, 0, 31, 15, 30, 0));
    expect(addUtcMonths(start, 1).toISOString()).toBe(
      "2025-02-28T15:30:00.000Z",
    );
  });

  it("clamps Jan 31 + 1 month to Feb 29 in a leap year", () => {
    const start = new Date(Date.UTC(2024, 0, 31, 12, 0, 0));
    expect(addUtcMonths(start, 1).toISOString()).toBe(
      "2024-02-29T12:00:00.000Z",
    );
  });
});

describe("buildReviewDates", () => {
  it("returns ascending candidates for simple intervals", () => {
    const createdAt = new Date(Date.UTC(2025, 0, 1, 10, 0, 0));
    const dates = buildReviewDates({
      createdAt,
      intervalsDays: [7, 1, 3],
      horizonMonths: 6,
    });

    expect(dates.map((d) => d.toISOString())).toEqual([
      addUtcDays(createdAt, 1).toISOString(),
      addUtcDays(createdAt, 3).toISOString(),
      addUtcDays(createdAt, 7).toISOString(),
    ]);
  });

  it("filters out intervals past the month-aware horizon", () => {
    const createdAt = new Date(Date.UTC(2025, 0, 1, 10, 0, 0));
    const dates = buildReviewDates({
      createdAt,
      intervalsDays: [1, 30, 200],
      horizonMonths: 1,
    });

    expect(dates.map((d) => d.toISOString())).toEqual([
      addUtcDays(createdAt, 1).toISOString(),
      addUtcDays(createdAt, 30).toISOString(),
    ]);
  });

  it("includes a candidate exactly on the horizon end", () => {
    const createdAt = new Date(Date.UTC(2025, 0, 15, 8, 0, 0));
    const horizonEnd = addUtcMonths(createdAt, 1);
    const daysUntilHorizon = Math.round(
      (horizonEnd.getTime() - createdAt.getTime()) / (24 * 60 * 60 * 1000),
    );

    const dates = buildReviewDates({
      createdAt,
      intervalsDays: [daysUntilHorizon],
      horizonMonths: 1,
    });

    expect(dates).toHaveLength(1);
    expect(dates[0]!.toISOString()).toBe(horizonEnd.toISOString());
  });

  it("uses clamped month horizon so late-January create does not drop early Feb reviews under a 1-month horizon", () => {
    const createdAt = new Date(Date.UTC(2025, 0, 31, 9, 0, 0));
    const dates = buildReviewDates({
      createdAt,
      intervalsDays: [28, 60],
      horizonMonths: 1,
    });

    expect(dates.map((d) => d.toISOString())).toEqual([
      addUtcDays(createdAt, 28).toISOString(),
    ]);
    expect(addUtcMonths(createdAt, 1).toISOString()).toBe(
      "2025-02-28T09:00:00.000Z",
    );
  });

  it("keeps default intervals within a 6-month horizon from Jan 1", () => {
    const createdAt = new Date(Date.UTC(2025, 0, 1, 0, 0, 0));
    const intervalsDays = [1, 3, 7, 14, 30, 60, 90, 180];
    const dates = buildReviewDates({
      createdAt,
      intervalsDays,
      horizonMonths: 6,
    });

    expect(dates).toHaveLength(8);
    expect(dates.map((d) => d.toISOString())).toEqual(
      intervalsDays.map((d) => addUtcDays(createdAt, d).toISOString()),
    );
  });
});
