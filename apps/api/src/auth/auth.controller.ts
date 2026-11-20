import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import type { Request, Response } from "express";
import { REFRESH_COOKIE } from "./auth.constants";
import { AuthService } from "./auth.service";
import { clearAuthCookies, setAuthCookies } from "./cookies";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import {
  AccessAuthGuard,
  type AuthenticatedRequest,
} from "./guards/access-auth.guard";

@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post("register")
  @HttpCode(201)
  async register(
    @Body() body: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, tokens } = await this.auth.register(
      body.email,
      body.password,
      body.confirmPassword,
    );
    setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
    return { user };
  }

  @Post("login")
  @HttpCode(200)
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, tokens } = await this.auth.login(body.email, body.password);
    setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
    return { user };
  }

  @Post("logout")
  @HttpCode(204)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refresh = req.cookies?.[REFRESH_COOKIE] as string | undefined;
    await this.auth.logout(refresh);
    clearAuthCookies(res);
  }

  @Get("me")
  @UseGuards(AccessAuthGuard)
  async me(@Req() req: AuthenticatedRequest) {
    const user = await this.auth.me(req.userId);
    return { user };
  }
}
