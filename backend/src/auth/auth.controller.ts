/**
 * @file auth.controller.ts
 * @brief Controller for handling authentication requests.
 */

import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Req,
  Res,
  HttpStatus,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./auth.guard";
import { RegisterDto, LoginDto } from "./dto/auth.dto";
import { Response } from "express";
import { Roles } from "../roles/roles.decorator";
import { RolesGuard } from "../roles/roles.guard";
import { Role } from "../roles/roles.enum";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("register")
  async register(@Body() body: RegisterDto): Promise<any> {
    return this.authService.register(body.username, body.email, body.password);
  }

  @Post("login")
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) res: Response
  ): Promise<{ message: string }> {
    const { access_token, refresh_token } = await this.authService.login(
      body.email,
      body.password
    );

    res.cookie("accessToken", access_token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 3600_000, // 1h
    });

    res.cookie("refreshToken", refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 604800_000, // 7d
    });

    return { message: "Logged in successfully" };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get("profile")
  async getProfile(@Req() req): Promise<any> {
    return req.user;
  }

  @Get("refresh")
  async refresh(@Res({ passthrough: true }) res: Response) {
    const refreshToken = res.req.cookies?.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedException("No refresh token found");
    }
    const newAccessToken =
      await this.authService.refreshAccessToken(refreshToken);

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 3600_000,
    });

    return { message: "Access token refreshed" };
  }

  @Post("logout")
  async logout(@Res({ passthrough: true }) res: Response): Promise<Response> {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    return res.status(HttpStatus.OK).json({ message: "Logout successful" });
  }

  // Ex. route protégée par un rôle
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get("adminOnly")
  adminOnlyEndpoint() {
    return { secret: "Admin only data" };
  }
}
