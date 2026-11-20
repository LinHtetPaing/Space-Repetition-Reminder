"use client";

import type { PublicUser } from "@srr/shared-types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ApiError } from "../../lib/api";
import { logout, me } from "../../lib/auth";
import {
  button,
  buttonSecondary,
  errorText,
  pageShell,
  panel,
  subtitle,
  title,
} from "../styles";

type LoadState =
  | { status: "loading" }
  | { status: "ready"; user: PublicUser }
  | { status: "error"; message: string };

export default function DashboardPage() {
  const router = useRouter();
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let cancelled = false;

    me()
      .then((response) => {
        if (!cancelled) {
          setState({ status: "ready", user: response.user });
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
          message: err instanceof ApiError ? err.message : "Could not load session.",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [router]);

  async function onLogout() {
    setLoggingOut(true);
    try {
      await logout();
    } catch {
      // Clear local session view even if the network call fails.
    }
    router.replace("/login");
  }

  if (state.status === "loading") {
    return (
      <main style={pageShell}>
        <p style={subtitle}>Checking session…</p>
      </main>
    );
  }

  if (state.status === "error") {
    return (
      <main style={pageShell}>
        <div style={panel}>
          <p style={errorText}>{state.message}</p>
          <button style={buttonSecondary} type="button" onClick={() => router.replace("/login")}>
            Go to login
          </button>
        </div>
      </main>
    );
  }

  return (
    <main style={pageShell}>
      <div style={panel}>
        <h1 style={title}>Dashboard</h1>
        <p style={subtitle}>Signed in as {state.user.email}</p>
        <Link href="/cards" style={{ ...button, textAlign: "center" }}>
          Task Cards
        </Link>
        <button
          style={buttonSecondary}
          type="button"
          onClick={onLogout}
          disabled={loggingOut}
        >
          {loggingOut ? "Signing out…" : "Log out"}
        </button>
      </div>
    </main>
  );
}
