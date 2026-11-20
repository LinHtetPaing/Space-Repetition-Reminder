"use client";

import type { PublicUser } from "@srr/shared-types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ApiError } from "./api";
import { me } from "./auth";

export type AuthGate =
  | { status: "loading" }
  | { status: "ready"; user: PublicUser }
  | { status: "error"; message: string };

/** Redirects to /login on 401. Shared by dashboard and task-card pages. */
export function useRequireAuth(): AuthGate {
  const router = useRouter();
  const [gate, setGate] = useState<AuthGate>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    me()
      .then((response) => {
        if (!cancelled) {
          setGate({ status: "ready", user: response.user });
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
        setGate({
          status: "error",
          message:
            err instanceof ApiError ? err.message : "Could not load session.",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [router]);

  return gate;
}
