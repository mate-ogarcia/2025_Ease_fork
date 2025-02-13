/**
 * @file auth.controller.ts
 * @brief Controller for handling authentication requests.
 *
 * This controller provides endpoints for user authentication,
 * including registration, login, and retrieving the authenticated user's profile.
 */

import { Controller, Post, Body, UseGuards, Get, Req } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./auth.guard";
import { RegisterDto, LoginDto } from "./dto/auth.dto";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * @brief Registers a new user.
   * @param body The request body containing user credentials.
   * @returns The created user.
   */
  @Post("register")
  async register(@Body() body: RegisterDto) {
    return this.authService.register(body.email, body.password);
  }

  /**
   * @brief Logs in a user.
   * @param body The request body containing user credentials.
   * @returns An object containing an access token and a refresh token.
   */
  @Post("login")
  async login(@Body() body: LoginDto) {
    return this.authService.login(body.email, body.password);
  }

  /**
   * @brief Retrieves the authenticated user's profile.
   * @details This endpoint is protected and requires a valid JWT token.
   * @param req The request object containing user details.
   * @returns The authenticated user's details.
   */
  @UseGuards(JwtAuthGuard)
  @Get("profile")
  async getProfile(@Req() req) {
    return req.user;
  }
}
