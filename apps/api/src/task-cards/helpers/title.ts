import type { ParseResult } from "./tip-tap";

const TITLE_MAX = 200;

/** Trim and validate title length (1..200) at the HTTP boundary. */
export function parseTitle(value: unknown): ParseResult<string> {
  if (typeof value !== "string") {
    return { ok: false, error: "title must be a string" };
  }
  const trimmed = value.trim();
  if (trimmed.length < 1) {
    return { ok: false, error: "title must be non-empty after trim" };
  }
  if (trimmed.length > TITLE_MAX) {
    return {
      ok: false,
      error: `title must be at most ${TITLE_MAX} characters after trim`,
    };
  }
  return { ok: true, value: trimmed };
}
