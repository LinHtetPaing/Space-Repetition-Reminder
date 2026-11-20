export function parseIntervalsDays(value: unknown): number[] {
  if (!Array.isArray(value)) {
    throw new Error("intervalsDays must be a number array");
  }
  const intervals: number[] = [];
  for (const item of value) {
    if (typeof item !== "number" || !Number.isFinite(item)) {
      throw new Error("intervalsDays must be a number array");
    }
    intervals.push(item);
  }
  return intervals;
}
