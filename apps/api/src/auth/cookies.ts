import type { Response } from "express";
import {
  ACCESS_COOKIE,
  ACCESS_TTL_SECONDS,
  COOKIE_OPTIONS,
  REFRESH_COOKIE,
  REFRESH_TTL_SECONDS,
} from "./auth.constants";

export function setAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken: string,
): void {
  res.cookie(ACCESS_COOKIE, accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: ACCESS_TTL_SECONDS * 1000,
  });
  res.cookie(REFRESH_COOKIE, refreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: REFRESH_TTL_SECONDS * 1000,
  });
}

export function clearAuthCookies(res: Response): void {
  res.clearCookie(ACCESS_COOKIE, COOKIE_OPTIONS);
  res.clearCookie(REFRESH_COOKIE, COOKIE_OPTIONS);
}
