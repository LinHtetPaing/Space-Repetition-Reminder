export type Brand<T, B extends string> = T & { readonly __brand: B };

export type UserId = Brand<string, "UserId">;

/** Public user returned by auth endpoints. */
export type PublicUser = {
  id: UserId;
  email: string;
  /** ISO 8601 UTC timestamp. */
  createdAt: string;
};
