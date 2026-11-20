/** Civil YYYY-MM-DD in an IANA zone; ranges map to [startUtc, endUtcExclusive). */

const CIVIL_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export function isValidTimeZone(timeZone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone });
    return true;
  } catch {
    return false;
  }
}

export function isValidCivilDate(value: string): boolean {
  const match = CIVIL_DATE_PATTERN.exec(value);
  if (!match) {
    return false;
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const probe = new Date(Date.UTC(year, month - 1, day));
  return (
    probe.getUTCFullYear() === year &&
    probe.getUTCMonth() === month - 1 &&
    probe.getUTCDate() === day
  );
}

export function toCivilDate(instant: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(instant);
}

export function todayCivilDate(timeZone: string, now: Date = new Date()): string {
  return toCivilDate(now, timeZone);
}

export function addCivilDays(civilDate: string, days: number): string {
  const match = CIVIL_DATE_PATTERN.exec(civilDate);
  if (!match) {
    throw new Error(`Invalid civil date: ${civilDate}`);
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const next = new Date(Date.UTC(year, month - 1, day + days));
  const y = next.getUTCFullYear();
  const m = String(next.getUTCMonth() + 1).padStart(2, "0");
  const d = String(next.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Milliseconds to add to UTC so Date UTC fields match the zone's wall clock. */
function timeZoneOffsetMs(instant: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(instant);

  const values: Record<string, string> = {};
  for (const part of parts) {
    if (part.type !== "literal") {
      values[part.type] = part.value;
    }
  }

  const asUtc = Date.UTC(
    Number(values.year),
    Number(values.month) - 1,
    Number(values.day),
    Number(values.hour),
    Number(values.minute),
    Number(values.second),
  );
  return asUtc - instant.getTime();
}

/** UTC instant for local midnight of `civilDate` in `timeZone`. */
export function startOfCivilDateUtc(civilDate: string, timeZone: string): Date {
  const match = CIVIL_DATE_PATTERN.exec(civilDate);
  if (!match) {
    throw new Error(`Invalid civil date: ${civilDate}`);
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const localAsUtc = Date.UTC(year, month - 1, day, 0, 0, 0, 0);

  let utcMs = localAsUtc - timeZoneOffsetMs(new Date(localAsUtc), timeZone);
  const offsetAgain = timeZoneOffsetMs(new Date(utcMs), timeZone);
  utcMs = localAsUtc - offsetAgain;
  return new Date(utcMs);
}

/** Inclusive [from, to] → half-open UTC window for Prisma. */
export function civilDateRangeToUtcBounds(
  from: string,
  to: string,
  timeZone: string,
): { startUtc: Date; endUtcExclusive: Date } {
  return {
    startUtc: startOfCivilDateUtc(from, timeZone),
    endUtcExclusive: startOfCivilDateUtc(addCivilDays(to, 1), timeZone),
  };
}

/** Group by civil date; omits empty days; sorted ascending. */
export function groupByCivilDate<T extends { scheduledFor: Date }>(
  items: T[],
  timeZone: string,
): Array<{ date: string; items: T[] }> {
  const buckets = new Map<string, T[]>();
  for (const item of items) {
    const date = toCivilDate(item.scheduledFor, timeZone);
    const bucket = buckets.get(date);
    if (bucket) {
      bucket.push(item);
    } else {
      buckets.set(date, [item]);
    }
  }
  return [...buckets.entries()]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([date, grouped]) => ({ date, items: grouped }));
}
