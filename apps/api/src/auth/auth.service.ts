import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Prisma } from "@prisma/client";
import type { PublicUser } from "@srr/shared-types";
import * as argon2 from "argon2";
import { randomUUID } from "crypto";
import { PrismaService } from "../prisma/prisma.service";
import { RedisService } from "../redis/redis.service";
import {
  ACCESS_TTL,
  type AccessTokenClaims,
  REFRESH_TTL,
  REFRESH_TTL_SECONDS,
  type RefreshSession,
  type RefreshTokenClaims,
  refreshKey,
} from "./auth.constants";
import { normalizeEmail } from "./helpers/email";
import { passwordsMatch } from "./helpers/password";
import { toPublicUser } from "./helpers/public-user";

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly jwt: JwtService,
  ) {}

  private accessSecret(): string {
    return (
      process.env.JWT_ACCESS_SECRET ?? "change-me-access-secret-min-32-chars"
    );
  }

  private refreshSecret(): string {
    return (
      process.env.JWT_REFRESH_SECRET ?? "change-me-refresh-secret-min-32-chars"
    );
  }

  async register(
    email: string,
    password: string,
    confirmPassword: string,
  ): Promise<{ user: PublicUser; tokens: AuthTokens }> {
    if (!passwordsMatch(password, confirmPassword)) {
      throw new BadRequestException("password and confirmPassword must match");
    }

    const normalized = normalizeEmail(email);
    const passwordHash = await argon2.hash(password);

    let user;
    try {
      user = await this.prisma.user.create({
        data: { email: normalized, passwordHash },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new ConflictException("email already registered");
      }
      throw error;
    }

    const tokens = await this.issueTokens(user.id);
    return { user: toPublicUser(user), tokens };
  }

  async login(
    email: string,
    password: string,
  ): Promise<{ user: PublicUser; tokens: AuthTokens }> {
    const normalized = normalizeEmail(email);
    const user = await this.prisma.user.findUnique({
      where: { email: normalized },
    });

    if (!user) {
      throw new UnauthorizedException("invalid credentials");
    }

    const ok = await argon2.verify(user.passwordHash, password);
    if (!ok) {
      throw new UnauthorizedException("invalid credentials");
    }

    const tokens = await this.issueTokens(user.id);
    return { user: toPublicUser(user), tokens };
  }

  async logout(refreshToken: string | undefined): Promise<void> {
    if (!refreshToken) {
      return;
    }

    try {
      const claims = this.jwt.verify<RefreshTokenClaims>(refreshToken, {
        secret: this.refreshSecret(),
      });
      if (claims.typ === "refresh" && claims.jti) {
        await this.redis.del(refreshKey(claims.jti));
      }
    } catch {
      // Clear cookies even if token is already invalid.
    }
  }

  async me(userId: string): Promise<PublicUser> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException();
    }
    return toPublicUser(user);
  }

  verifyAccessToken(token: string): AccessTokenClaims {
    try {
      const claims = this.jwt.verify<AccessTokenClaims>(token, {
        secret: this.accessSecret(),
      });
      if (claims.typ !== "access" || !claims.sub) {
        throw new UnauthorizedException();
      }
      return claims;
    } catch {
      throw new UnauthorizedException();
    }
  }

  private async issueTokens(userId: string): Promise<AuthTokens> {
    const accessToken = this.jwt.sign(
      { sub: userId, typ: "access" } satisfies AccessTokenClaims,
      { secret: this.accessSecret(), expiresIn: ACCESS_TTL },
    );

    const jti = randomUUID();
    const refreshToken = this.jwt.sign(
      { sub: userId, jti, typ: "refresh" } satisfies RefreshTokenClaims,
      { secret: this.refreshSecret(), expiresIn: REFRESH_TTL },
    );

    const expiresAt = new Date(
      Date.now() + REFRESH_TTL_SECONDS * 1000,
    ).toISOString();
    const session: RefreshSession = { userId, expiresAt };
    await this.redis.setJson(refreshKey(jti), session, REFRESH_TTL_SECONDS);

    return { accessToken, refreshToken };
  }
}
