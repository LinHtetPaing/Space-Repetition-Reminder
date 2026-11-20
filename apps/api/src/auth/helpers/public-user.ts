import type { PublicUser, UserId } from "@srr/shared-types";

type UserRow = {
  id: string;
  email: string;
  createdAt: Date;
};

export function toPublicUser(user: UserRow): PublicUser {
  return {
    id: user.id as UserId,
    email: user.email,
    createdAt: user.createdAt.toISOString(),
  };
}
