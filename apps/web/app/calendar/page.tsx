"use client";

import type { ReviewSchedulePublic } from "@srr/shared-types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ApiError } from "../../lib/api";
import {
  browserTimeZone,
  monthFromCivilDate,
  monthGrid,
  monthLabel,
  monthRange,
  shiftMonth,
  todayCivilDate,
  type MonthCursor,
} from "../../lib/civil-date";
import { fetchCalendar, reviewsByDate } from "../../lib/reviews";
import { useRequireAuth } from "../../lib/use-require-auth";
import {
  button,
  buttonSecondary,
  errorText,
  linkRow,
  pageShell,
  subtitle,
  title,
  widePanel,
} from "../styles";

type CalendarState =
  | { status: "loading" }
  | { status: "ready"; days: Map<string, ReviewSchedulePublic[]> }
  | { status: "error"; message: string };

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarPage() {
  const router = useRouter();
  const auth = useRequireAuth();
  const timeZone = useMemo(() => browserTimeZone(), []);
  const [cursor, setCursor] = useState<MonthCursor>(() =>
    monthFromCivilDate(todayCivilDate(browserTimeZone())),
  );
  const [selected, setSelected] = useState(() =>
    todayCivilDate(browserTimeZone()),
  );
  const [calendar, setCalendar] = useState<CalendarState>({ status: "loading" });

  useEffect(() => {
    if (auth.status !== "ready") {
      return;
    }

    let cancelled = false;
    const { from, to } = monthRange(cursor);
    setCalendar({ status: "loading" });

    fetchCalendar(from, to, timeZone)
      .then((response) => {
        if (!cancelled) {
          setCalendar({
            status: "ready",
            days: reviewsByDate(response.days),
          });
        }
      })
      .catch((err: unknown) => {
        if (cancelled) {
          return;
        }
        if (err instanceof ApiError && err.status === 401) {
          router.replace("/login");
          return;
        }
        setCalendar({
          status: "error",
          message:
            err instanceof ApiError ? err.message : "Could not load calendar.",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [auth.status, cursor, router, timeZone]);

  function goMonth(delta: number) {
    const next = shiftMonth(cursor, delta);
    setCursor(next);
    const { from } = monthRange(next);
    setSelected(from);
  }

  if (auth.status === "loading") {
    return (
      <main style={pageShell}>
        <p style={subtitle}>Loading calendar…</p>
      </main>
    );
  }

  if (auth.status === "error") {
    return (
      <main style={pageShell}>
        <div style={widePanel}>
          <p style={errorText}>{auth.message}</p>
          <button
            style={buttonSecondary}
            type="button"
            onClick={() => router.replace("/login")}
          >
            Go to login
          </button>
        </div>
      </main>
    );
  }

  const selectedReviews =
    calendar.status === "ready" ? (calendar.days.get(selected) ?? []) : [];

  return (
    <main style={pageShell}>
      <div style={widePanel}>
        <h1 style={title}>Calendar</h1>
        <p style={subtitle}>Reviews by day · {timeZone}</p>

        <div style={{ ...linkRow, justifyContent: "flex-start" }}>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/reminders">Reminders</Link>
          <Link href="/cards">Task Cards</Link>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "0.75rem",
          }}
        >
          <button
            style={buttonSecondary}
            type="button"
            onClick={() => goMonth(-1)}
            aria-label="Previous month"
          >
            Previous
          </button>
          <p style={{ ...subtitle, margin: 0, fontWeight: 600, opacity: 1 }}>
            {monthLabel(cursor)}
          </p>
          <button
            style={buttonSecondary}
            type="button"
            onClick={() => goMonth(1)}
            aria-label="Next month"
          >
            Next
          </button>
        </div>

        {calendar.status === "loading" ? (
          <p style={subtitle}>Loading month…</p>
        ) : null}

        {calendar.status === "error" ? (
          <p style={errorText}>{calendar.message}</p>
        ) : null}

        {calendar.status === "ready" ? (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
                gap: "0.35rem",
              }}
            >
              {WEEKDAYS.map((label) => (
                <span
                  key={label}
                  style={{
                    ...subtitle,
                    fontSize: "0.8rem",
                    textAlign: "center",
                  }}
                >
                  {label}
                </span>
              ))}
              {monthGrid(cursor).map((cell) => {
                if (cell.kind === "empty") {
                  return <span key={cell.key} aria-hidden="true" />;
                }
                const count = calendar.days.get(cell.date)?.length ?? 0;
                const isSelected = cell.date === selected;
                return (
                  <button
                    key={cell.key}
                    type="button"
                    onClick={() => setSelected(cell.date)}
                    aria-pressed={isSelected}
                    aria-label={`${cell.date}${count > 0 ? `, ${count} reviews` : ""}`}
                    style={{
                      ...buttonSecondary,
                      padding: "0.5rem 0.25rem",
                      minHeight: "3rem",
                      display: "grid",
                      gap: "0.15rem",
                      placeItems: "center",
                      background: isSelected ? "#1a1a1a" : "transparent",
                      color: isSelected ? "#f7f7f2" : "#1a1a1a",
                      fontWeight: count > 0 ? 600 : 400,
                    }}
                  >
                    <span>{cell.dayOfMonth}</span>
                    {count > 0 ? (
                      <span style={{ fontSize: "0.7rem", opacity: 0.85 }}>
                        {count}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>

            <section style={{ display: "grid", gap: "0.75rem" }}>
              <h2 style={{ ...title, fontSize: "1.25rem" }}>{selected}</h2>
              {selectedReviews.length === 0 ? (
                <p style={subtitle}>No reviews on this day.</p>
              ) : (
                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: 0,
                    display: "grid",
                    gap: "0.5rem",
                  }}
                >
                  {selectedReviews.map((review) => (
                    <li
                      key={review.id}
                      style={{
                        borderBottom: "1px solid #c8c4b8",
                        paddingBottom: "0.5rem",
                        display: "grid",
                        gap: "0.15rem",
                      }}
                    >
                      <span>{review.taskCardTitle ?? "Untitled card"}</span>
                      <span style={{ ...subtitle, fontSize: "0.9rem" }}>
                        {review.status}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        ) : null}

        {calendar.status === "error" ? (
          <button style={button} type="button" onClick={() => goMonth(0)}>
            Retry
          </button>
        ) : null}
      </div>
    </main>
  );
}
