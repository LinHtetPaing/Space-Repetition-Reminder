import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import type { Request } from "express";
import { ACCESS_COOKIE } from "../auth.constants";
import { AuthService } from "../auth.service";

export type AuthenticatedRequest = Request & {
  userId: string;
};

@Injectable()
export class AccessAuthGuard implements CanActivate {
  constructor(private readonly auth: AuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = req.cookies?.[ACCESS_COOKIE];
    if (!token || typeof token !== "string") {
      throw new UnauthorizedException();
    }

    const claims = this.auth.verifyAccessToken(token);
    req.userId = claims.sub;
    return true;
  }
}
