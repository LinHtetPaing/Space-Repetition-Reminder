export type Brand<T, B extends string> = T & { readonly __brand: B };

export type UserId = Brand<string, "UserId">;
export type TaskCardId = Brand<string, "TaskCardId">;

/** ISO 8601 UTC timestamp string (e.g. from Date.toISOString()). */
export type UtcInstant = Brand<string, "UtcInstant">;

export type TipTapNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TipTapNode[];
  marks?: unknown[];
  text?: string;
};

export type TipTapDoc = {
  type: "doc";
  content?: TipTapNode[];
};

/** Public user returned by auth endpoints. */
export type PublicUser = {
  id: UserId;
  email: string;
  /** ISO 8601 UTC timestamp. */
  createdAt: string;
};

/** Public task card returned by task-card endpoints. */
export type TaskCard = {
  id: TaskCardId;
  userId: UserId;
  title: string;
  description: TipTapDoc;
  createdAt: UtcInstant;
  updatedAt: UtcInstant;
};
