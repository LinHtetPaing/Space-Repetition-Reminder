import type { PublicUser } from "@srr/shared-types";
import { apiFetch } from "./api";

type UserResponse = { user: PublicUser };

export function register(
  email: string,
  password: string,
  confirmPassword: string,
): Promise<UserResponse> {
  return apiFetch<UserResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, confirmPassword }),
  });
}

export function login(email: string, password: string): Promise<UserResponse> {
  return apiFetch<UserResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function logout(): Promise<void> {
  return apiFetch<void>("/auth/logout", { method: "POST" });
}

export function me(): Promise<UserResponse> {
  return apiFetch<UserResponse>("/auth/me");
}
