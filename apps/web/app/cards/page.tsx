"use client";

import type { TaskCard } from "@srr/shared-types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ApiError } from "../../lib/api";
import { listTaskCards } from "../../lib/task-cards";
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

type ListState =
  | { status: "loading" }
  | { status: "ready"; cards: TaskCard[] }
  | { status: "error"; message: string };

function formatUpdatedAt(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString();
}

export default function CardsListPage() {
  const router = useRouter();
  const auth = useRequireAuth();
  const [list, setList] = useState<ListState>({ status: "loading" });

  useEffect(() => {
    if (auth.status !== "ready") {
      return;
    }

    let cancelled = false;

    listTaskCards()
      .then((response) => {
        if (!cancelled) {
          setList({ status: "ready", cards: response.taskCards });
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
        setList({
          status: "error",
          message:
            err instanceof ApiError ? err.message : "Could not load cards.",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [auth.status, router]);

  if (auth.status === "loading" || list.status === "loading") {
    return (
      <main style={pageShell}>
        <p style={subtitle}>Loading task cards…</p>
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

  if (list.status === "error") {
    return (
      <main style={pageShell}>
        <div style={widePanel}>
          <p style={errorText}>{list.message}</p>
          <Link href="/dashboard">Back to dashboard</Link>
        </div>
      </main>
    );
  }

  return (
    <main style={pageShell}>
      <div style={widePanel}>
        <h1 style={title}>Task Cards</h1>
        <p style={subtitle}>Your notes for spaced review.</p>

        <div style={{ ...linkRow, justifyContent: "flex-start" }}>
          <button
            style={button}
            type="button"
            onClick={() => router.push("/cards/new")}
          >
            New card
          </button>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/calendar">Calendar</Link>
          <Link href="/reminders">Reminders</Link>
        </div>

        {list.cards.length === 0 ? (
          <p style={subtitle}>No cards yet. Create one to get started.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "0.75rem" }}>
            {list.cards.map((card) => (
              <li key={card.id}>
                <Link
                  href={`/cards/${card.id}`}
                  style={{
                    display: "grid",
                    gap: "0.25rem",
                    textDecoration: "none",
                    color: "inherit",
                    borderBottom: "1px solid #c8c4b8",
                    paddingBottom: "0.75rem",
                  }}
                >
                  <span style={{ fontSize: "1.1rem" }}>{card.title}</span>
                  <span style={{ ...subtitle, fontSize: "0.9rem" }}>
                    Updated {formatUpdatedAt(card.updatedAt)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
