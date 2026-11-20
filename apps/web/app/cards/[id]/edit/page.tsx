"use client";

import type { TaskCard, TipTapDoc } from "@srr/shared-types";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { TipTapEditor } from "../../../../components/tiptap-editor";
import { ApiError } from "../../../../lib/api";
import { getTaskCard, updateTaskCard } from "../../../../lib/task-cards";
import { useRequireAuth } from "../../../../lib/use-require-auth";
import {
  button,
  buttonSecondary,
  errorText,
  input,
  label,
  pageShell,
  subtitle,
  title,
  widePanel,
} from "../../../styles";

type LoadState =
  | { status: "loading" }
  | { status: "ready"; card: TaskCard }
  | { status: "error"; message: string };

export default function EditCardPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const cardId = params.id;
  const auth = useRequireAuth();
  const [load, setLoad] = useState<LoadState>({ status: "loading" });
  const [titleValue, setTitleValue] = useState("");
  const [description, setDescription] = useState<TipTapDoc | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (auth.status !== "ready" || !cardId) {
      return;
    }

    let cancelled = false;

    getTaskCard(cardId)
      .then((response) => {
        if (cancelled) {
          return;
        }
        setLoad({ status: "ready", card: response.taskCard });
        setTitleValue(response.taskCard.title);
        setDescription(response.taskCard.description);
      })
      .catch((err: unknown) => {
        if (cancelled) {
          return;
        }
        if (err instanceof ApiError && err.status === 401) {
          router.replace("/login");
          return;
        }
        setLoad({
          status: "error",
          message:
            err instanceof ApiError ? err.message : "Could not load card.",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [auth.status, cardId, router]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!cardId || !description) {
      return;
    }
    setError(null);
    setPending(true);
    try {
      await updateTaskCard(cardId, {
        title: titleValue.trim(),
        description,
      });
      router.replace(`/cards/${cardId}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save card.");
    } finally {
      setPending(false);
    }
  }

  if (auth.status === "loading" || load.status === "loading") {
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

  if (load.status === "error") {
    return (
      <main style={pageShell}>
        <div style={widePanel}>
          <p style={errorText}>{load.message}</p>
          <Link href="/cards">Back to cards</Link>
        </div>
      </main>
    );
  }

  if (!description) {
    return (
      <main style={pageShell}>
        <p style={subtitle}>Loading editor…</p>
      </main>
    );
  }

  return (
    <main style={pageShell}>
      <form style={widePanel} onSubmit={onSubmit}>
        <h1 style={title}>Edit task card</h1>
        <p style={subtitle}>Update the title or note, then save.</p>

        <label style={label}>
          Title
          <input
            style={input}
            name="title"
            required
            maxLength={200}
            value={titleValue}
            onChange={(event) => setTitleValue(event.target.value)}
          />
        </label>

        <div style={{ display: "grid", gap: "0.35rem" }}>
          <span style={{ fontSize: "0.95rem" }}>Description</span>
          <TipTapEditor
            content={description}
            onChange={setDescription}
            editable
          />
        </div>

        {error ? <p style={errorText}>{error}</p> : null}

        <button style={button} type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save"}
        </button>

        <Link href={`/cards/${cardId}`}>Cancel</Link>
      </form>
    </main>
  );
}
