"use client";

import type { ReviewSchedulePublic } from "@srr/shared-types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ApiError } from "../../lib/api";
import { browserTimeZone } from "../../lib/civil-date";
import { completeReview, fetchDue } from "../../lib/reviews";
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

type DueState =
  | { status: "loading" }
  | { status: "ready"; on: string; reviews: ReviewSchedulePublic[] }
  | { status: "error"; message: string };

export default function RemindersPage() {
  const router = useRouter();
  const auth = useRequireAuth();
  const timeZone = useMemo(() => browserTimeZone(), []);
  const [due, setDue] = useState<DueState>({ status: "loading" });
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadDue = useCallback(() => {
    let cancelled = false;
    setDue({ status: "loading" });
    setActionError(null);

    fetchDue(timeZone)
      .then((response) => {
        if (!cancelled) {
          setDue({
            status: "ready",
            on: response.on,
            reviews: response.reviews,
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
        setDue({
          status: "error",
          message:
            err instanceof ApiError ? err.message : "Could not load reminders.",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [router, timeZone]);

  useEffect(() => {
    if (auth.status !== "ready") {
      return;
    }
    return loadDue();
  }, [auth.status, loadDue]);

  async function onComplete(id: string) {
    setCompletingId(id);
    setActionError(null);
    try {
      await completeReview(id);
      const response = await fetchDue(timeZone);
      setDue({
        status: "ready",
        on: response.on,
        reviews: response.reviews,
      });
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 401) {
        router.replace("/login");
        return;
      }
      setActionError(
        err instanceof ApiError ? err.message : "Could not complete review.",
      );
    } finally {
      setCompletingId(null);
    }
  }

  if (auth.status === "loading" || due.status === "loading") {
    return (
      <main style={pageShell}>
        <p style={subtitle}>Loading reminders…</p>
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

  if (due.status === "error") {
    return (
      <main style={pageShell}>
        <div style={widePanel}>
          <p style={errorText}>{due.message}</p>
          <button style={button} type="button" onClick={() => loadDue()}>
            Retry
          </button>
          <Link href="/dashboard">Dashboard</Link>
        </div>
      </main>
    );
  }

  return (
    <main style={pageShell}>
      <div style={widePanel}>
        <h1 style={title}>Reminders</h1>
        <p style={subtitle}>
          Due on {due.on} · {timeZone}
        </p>

        <div style={{ ...linkRow, justifyContent: "flex-start" }}>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/calendar">Calendar</Link>
          <Link href="/cards">Task Cards</Link>
        </div>

        {actionError ? <p style={errorText}>{actionError}</p> : null}

        {due.reviews.length === 0 ? (
          <p style={subtitle}>Nothing due today.</p>
        ) : (
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "grid",
              gap: "0.75rem",
            }}
          >
            {due.reviews.map((review) => (
              <li
                key={review.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "0.75rem",
                  borderBottom: "1px solid #c8c4b8",
                  paddingBottom: "0.75rem",
                }}
              >
                <div style={{ display: "grid", gap: "0.15rem" }}>
                  <span>{review.taskCardTitle ?? "Untitled card"}</span>
                  <span style={{ ...subtitle, fontSize: "0.9rem" }}>
                    {review.status} · interval {review.intervalDays}d
                  </span>
                </div>
                <button
                  style={button}
                  type="button"
                  disabled={completingId === review.id}
                  onClick={() => onComplete(review.id)}
                >
                  {completingId === review.id ? "Saving…" : "Complete"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
