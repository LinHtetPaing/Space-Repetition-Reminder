export const ACCESS_COOKIE = "access_token";
export const REFRESH_COOKIE = "refresh_token";

export const ACCESS_TTL = "15m";
export const REFRESH_TTL = "7d";
export const ACCESS_TTL_SECONDS = 15 * 60;
export const REFRESH_TTL_SECONDS = 7 * 24 * 60 * 60;

export const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: false,
  path: "/",
};

export type AccessTokenClaims = {
  sub: string;
  typ: "access";
};

export type RefreshTokenClaims = {
  sub: string;
  jti: string;
  typ: "refresh";
};

export type RefreshSession = {
  userId: string;
  expiresAt: string;
};

export function refreshKey(jti: string): string {
  return `refresh:${jti}`;
}
