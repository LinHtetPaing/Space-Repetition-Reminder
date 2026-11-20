export type Brand<T, B extends string> = T & { readonly __brand: B };

export type UserId = Brand<string, "UserId">;

/** Foreshadow of the public user shape returned by auth later. */
export type PublicUser = {
  id: UserId;
  email: string;
};
