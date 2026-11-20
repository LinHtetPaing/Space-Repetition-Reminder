export function browserTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

export function toCivilDate(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function todayCivilDate(timeZone: string): string {
  return toCivilDate(new Date(), timeZone);
}

export type MonthCursor = {
  year: number;
  month: number;
};

export function monthFromCivilDate(civil: string): MonthCursor {
  const [year, month] = civil.split("-").map(Number);
  return { year, month };
}

export function monthLabel(cursor: MonthCursor): string {
  const utc = new Date(Date.UTC(cursor.year, cursor.month - 1, 1));
  return new Intl.DateTimeFormat(undefined, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(utc);
}

export function shiftMonth(cursor: MonthCursor, delta: number): MonthCursor {
  const index = cursor.year * 12 + (cursor.month - 1) + delta;
  const year = Math.floor(index / 12);
  const month = (index % 12) + 1;
  return { year, month };
}

export function monthRange(cursor: MonthCursor): { from: string; to: string } {
  const from = `${cursor.year}-${String(cursor.month).padStart(2, "0")}-01`;
  const lastDay = new Date(Date.UTC(cursor.year, cursor.month, 0)).getUTCDate();
  const to = `${cursor.year}-${String(cursor.month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  return { from, to };
}

export type MonthCell =
  | { kind: "empty"; key: string }
  | { kind: "day"; key: string; date: string; dayOfMonth: number };

export function monthGrid(cursor: MonthCursor): MonthCell[] {
  const firstWeekday = new Date(
    Date.UTC(cursor.year, cursor.month - 1, 1),
  ).getUTCDay();
  const lastDay = new Date(Date.UTC(cursor.year, cursor.month, 0)).getUTCDate();
  const cells: MonthCell[] = [];

  for (let i = 0; i < firstWeekday; i += 1) {
    cells.push({ kind: "empty", key: `pad-${i}` });
  }

  for (let day = 1; day <= lastDay; day += 1) {
    const date = `${cursor.year}-${String(cursor.month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    cells.push({ kind: "day", key: date, date, dayOfMonth: day });
  }

  return cells;
}
