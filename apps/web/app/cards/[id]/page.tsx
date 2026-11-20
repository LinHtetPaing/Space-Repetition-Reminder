"use client";

import type { TaskCard } from "@srr/shared-types";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { TipTapEditor } from "../../../components/tiptap-editor";
import { ApiError } from "../../../lib/api";
import { getTaskCard } from "../../../lib/task-cards";
import { useRequireAuth } from "../../../lib/use-require-auth";
import {
  buttonSecondary,
  errorText,
  linkRow,
  pageShell,
  subtitle,
  title,
  widePanel,
} from "../../styles";

type CardState =
  | { status: "loading" }
  | { status: "ready"; card: TaskCard }
  | { status: "error"; message: string };

export default function CardViewPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const cardId = params.id;
  const auth = useRequireAuth();
  const [state, setState] = useState<CardState>({ status: "loading" });

  useEffect(() => {
    if (auth.status !== "ready" || !cardId) {
      return;
    }

    let cancelled = false;

    getTaskCard(cardId)
      .then((response) => {
        if (!cancelled) {
          setState({ status: "ready", card: response.taskCard });
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
        setState({
          status: "error",
          message:
            err instanceof ApiError ? err.message : "Could not load card.",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [auth.status, cardId, router]);

  if (auth.status === "loading" || state.status === "loading") {
    return (
      <main style={pageShell}>
        <p style={subtitle}>Loading card…</p>
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

  if (state.status === "error") {
    return (
      <main style={pageShell}>
        <div style={widePanel}>
          <p style={errorText}>{state.message}</p>
          <Link href="/cards">Back to cards</Link>
        </div>
      </main>
    );
  }

  const { card } = state;

  return (
    <main style={pageShell}>
      <div style={widePanel}>
        <h1 style={title}>{card.title}</h1>
        <p style={subtitle}>
          Updated {new Date(card.updatedAt).toLocaleString()}
        </p>

        <TipTapEditor content={card.description} editable={false} />

        <p style={{ ...linkRow, margin: 0, justifyContent: "flex-start" }}>
          <Link href={`/cards/${card.id}/edit`}>Edit</Link>
          <Link href="/cards">All cards</Link>
        </p>
      </div>
    </main>
  );
}
