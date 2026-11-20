"use client";

import type { TipTapDoc } from "@srr/shared-types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { TipTapEditor } from "../../../components/tiptap-editor";
import { ApiError } from "../../../lib/api";
import { createTaskCard, EMPTY_DOC } from "../../../lib/task-cards";
import { useRequireAuth } from "../../../lib/use-require-auth";
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
} from "../../styles";

export default function NewCardPage() {
  const router = useRouter();
  const auth = useRequireAuth();
  const [titleValue, setTitleValue] = useState("");
  const [description, setDescription] = useState<TipTapDoc>(EMPTY_DOC);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);
    try {
      const response = await createTaskCard(titleValue.trim(), description);
      router.replace(`/cards/${response.taskCard.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not create card.");
    } finally {
      setPending(false);
    }
  }

  if (auth.status === "loading") {
    return (
      <main style={pageShell}>
        <p style={subtitle}>Checking session…</p>
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

  return (
    <main style={pageShell}>
      <form style={widePanel} onSubmit={onSubmit}>
        <h1 style={title}>New task card</h1>
        <p style={subtitle}>Title and a short note with formatting.</p>

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
          <TipTapEditor content={EMPTY_DOC} onChange={setDescription} />
        </div>

        {error ? <p style={errorText}>{error}</p> : null}

        <button style={button} type="submit" disabled={pending}>
          {pending ? "Creating…" : "Create card"}
        </button>

        <Link href="/cards">Cancel</Link>
      </form>
    </main>
  );
}
