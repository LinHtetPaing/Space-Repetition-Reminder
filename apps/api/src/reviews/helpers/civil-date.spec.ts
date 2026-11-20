import {
  addCivilDays,
  civilDateRangeToUtcBounds,
  groupByCivilDate,
  isValidCivilDate,
  isValidTimeZone,
  startOfCivilDateUtc,
  toCivilDate,
  todayCivilDate,
} from "./civil-date";

describe("civil-date helpers", () => {
  describe("isValidTimeZone", () => {
    it("accepts known IANA zones", () => {
      expect(isValidTimeZone("UTC")).toBe(true);
      expect(isValidTimeZone("Asia/Bangkok")).toBe(true);
      expect(isValidTimeZone("America/New_York")).toBe(true);
    });

    it("rejects nonsense", () => {
      expect(isValidTimeZone("Not/AZone")).toBe(false);
      expect(isValidTimeZone("")).toBe(false);
    });
  });

  describe("isValidCivilDate", () => {
    it("accepts real calendar dates", () => {
      expect(isValidCivilDate("2026-03-01")).toBe(true);
      expect(isValidCivilDate("2024-02-29")).toBe(true);
    });

    it("rejects malformed or impossible dates", () => {
      expect(isValidCivilDate("2026-3-1")).toBe(false);
      expect(isValidCivilDate("2026-02-30")).toBe(false);
      expect(isValidCivilDate("not-a-date")).toBe(false);
    });
  });

  describe("toCivilDate", () => {
    it("maps the same UTC instant to different civil days across zones near midnight", () => {
      // 2026-03-15T17:00:00.000Z = 2026-03-15 17:00 UTC
      //                         = 2026-03-16 00:00 Asia/Bangkok (UTC+7)
      const instant = new Date("2026-03-15T17:00:00.000Z");
      expect(toCivilDate(instant, "UTC")).toBe("2026-03-15");
      expect(toCivilDate(instant, "Asia/Bangkok")).toBe("2026-03-16");
    });

    it("keeps late evening Bangkok on the same civil day as UTC morning", () => {
      // 2026-03-15T16:59:59.000Z = still 2026-03-15 23:59 Bangkok
      const instant = new Date("2026-03-15T16:59:59.000Z");
      expect(toCivilDate(instant, "Asia/Bangkok")).toBe("2026-03-15");
      expect(toCivilDate(instant, "UTC")).toBe("2026-03-15");
    });
  });

  describe("civilDateRangeToUtcBounds", () => {
    it("builds a half-open UTC window for a single Bangkok day", () => {
      const { startUtc, endUtcExclusive } = civilDateRangeToUtcBounds(
        "2026-03-16",
        "2026-03-16",
        "Asia/Bangkok",
      );
      // Bangkok midnight 16 Mar = 15 Mar 17:00 UTC
      expect(startUtc.toISOString()).toBe("2026-03-15T17:00:00.000Z");
      expect(endUtcExclusive.toISOString()).toBe("2026-03-16T17:00:00.000Z");
    });

    it("builds a UTC window for a UTC civil day", () => {
      const { startUtc, endUtcExclusive } = civilDateRangeToUtcBounds(
        "2026-03-16",
        "2026-03-16",
        "UTC",
      );
      expect(startUtc.toISOString()).toBe("2026-03-16T00:00:00.000Z");
      expect(endUtcExclusive.toISOString()).toBe("2026-03-17T00:00:00.000Z");
    });

    it("covers an inclusive multi-day Bangkok range", () => {
      const { startUtc, endUtcExclusive } = civilDateRangeToUtcBounds(
        "2026-03-15",
        "2026-03-17",
        "Asia/Bangkok",
      );
      expect(startUtc.toISOString()).toBe("2026-03-14T17:00:00.000Z");
      expect(endUtcExclusive.toISOString()).toBe("2026-03-17T17:00:00.000Z");
    });

    it("includes boundary instants that fall on the civil day", () => {
      const { startUtc, endUtcExclusive } = civilDateRangeToUtcBounds(
        "2026-03-16",
        "2026-03-16",
        "Asia/Bangkok",
      );
      const justInside = new Date("2026-03-15T17:00:00.000Z");
      const justOutside = new Date("2026-03-16T17:00:00.000Z");
      expect(justInside.getTime()).toBeGreaterThanOrEqual(startUtc.getTime());
      expect(justInside.getTime()).toBeLessThan(endUtcExclusive.getTime());
      expect(justOutside.getTime()).toBeGreaterThanOrEqual(
        endUtcExclusive.getTime(),
      );
      expect(toCivilDate(justInside, "Asia/Bangkok")).toBe("2026-03-16");
      expect(toCivilDate(justOutside, "Asia/Bangkok")).toBe("2026-03-17");
    });
  });

  describe("startOfCivilDateUtc", () => {
    it("handles US Eastern spring-forward day (gap at local 02:00)", () => {
      // 2026-03-08 is DST start in America/New_York; local midnight still exists.
      const start = startOfCivilDateUtc("2026-03-08", "America/New_York");
      expect(toCivilDate(start, "America/New_York")).toBe("2026-03-08");
      expect(start.toISOString()).toBe("2026-03-08T05:00:00.000Z");
    });
  });

  describe("groupByCivilDate", () => {
    it("returns only days that have reviews, sorted", () => {
      const rows = [
        { id: "b", scheduledFor: new Date("2026-03-15T17:00:00.000Z") },
        { id: "a", scheduledFor: new Date("2026-03-14T17:00:00.000Z") },
        { id: "c", scheduledFor: new Date("2026-03-15T20:00:00.000Z") },
      ];
      const grouped = groupByCivilDate(rows, "Asia/Bangkok");
      expect(grouped.map((day) => day.date)).toEqual([
        "2026-03-15",
        "2026-03-16",
      ]);
      expect(grouped[0].items.map((r) => r.id)).toEqual(["a"]);
      expect(grouped[1].items.map((r) => r.id)).toEqual(["b", "c"]);
    });
  });

  describe("todayCivilDate / addCivilDays", () => {
    it("derives today from a fixed now", () => {
      const now = new Date("2026-03-15T17:00:00.000Z");
      expect(todayCivilDate("UTC", now)).toBe("2026-03-15");
      expect(todayCivilDate("Asia/Bangkok", now)).toBe("2026-03-16");
    });

    it("adds civil days across month boundaries", () => {
      expect(addCivilDays("2026-01-31", 1)).toBe("2026-02-01");
      expect(addCivilDays("2026-02-28", 1)).toBe("2026-03-01");
    });
  });
});
