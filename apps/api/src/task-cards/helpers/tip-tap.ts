import type { TipTapDoc } from "@srr/shared-types";

export type ParseResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

/** Parse unknown JSON into TipTapDoc. Rejects strings and non-doc objects. */
export function parseTipTapDoc(value: unknown): ParseResult<TipTapDoc> {
  if (typeof value === "string") {
    return {
      ok: false,
      error: "description must be a TipTap document object, not a string",
    };
  }
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return {
      ok: false,
      error: "description must be a TipTap document object",
    };
  }

  const record = value as Record<string, unknown>;
  if (record.type !== "doc") {
    return { ok: false, error: 'description.type must be "doc"' };
  }
  if (record.content !== undefined && !Array.isArray(record.content)) {
    return {
      ok: false,
      error: "description.content must be an array when present",
    };
  }

  return { ok: true, value: value as TipTapDoc };
}
