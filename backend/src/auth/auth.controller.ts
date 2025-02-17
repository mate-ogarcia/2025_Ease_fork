/**
 * @file auth.controller.ts
 * @brief Controller for handling authentication requests.
 *
 * This controller provides endpoints for user authentication,
 * including registration, login, retrieving the authenticated user's profile, and logout.
 * It interacts with the AuthService to perform authentication operations.
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
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./auth.guard";
import { RegisterDto, LoginDto } from "./dto/auth.dto";
import { Response } from "express";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * @brief Registers a new user.
   *
   * This endpoint allows a user to create an account by providing an email and password.
   * The password is securely hashed before being stored in the database.
   *
   * @param {RegisterDto} body - The request body containing user credentials.
   * @returns {Promise<any>} - The created user object.
   * @throws {UnauthorizedException} If the user already exists.
   * @throws {InternalServerErrorException} If an error occurs during registration.
   */
  @Post("register")
  async register(@Body() body: RegisterDto) {
    return this.authService.register(body.email, body.password);
  }

  /**
   * @brief Logs in a user.
   *
   * This endpoint authenticates a user by verifying their email and password.
   * If authentication is successful, access and refresh tokens are stored in secure HTTP-only cookies.
   *
   * @param {LoginDto} body - The request body containing user credentials.
   * @param {Response} res - The response object used to set HTTP-only cookies.
   * @returns {Promise<Response>} A success message if authentication is successful.
   * @throws {UnauthorizedException} If credentials are invalid.
   */
  @Post("login")
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) res: Response
  ): Promise<Response> {
    try {
      const tokens = await this.authService.login(body.email, body.password);

      // Store the access token in a secure HTTP-only cookie
      res.cookie("auth_token", tokens.access_token, {
        httpOnly: true, // Prevent JavaScript access (protection against XSS)
        secure: process.env.NODE_ENV === "production", // Enable HTTPS in production
        sameSite: "strict", // Prevent CSRF attacks
        maxAge: 24 * 60 * 60 * 1000, // Expires in 24 hours
      });

      return res.status(HttpStatus.OK).json({ message: "Login successful" });
    } catch (error) {
      console.error("❌ Login error:", error);
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ message: "Invalid credentials" });
    }
  }

  /**
   * @brief Retrieves the authenticated user's profile.
   *
   * This endpoint is protected and requires a valid JWT token stored in an HTTP-only cookie.
   * It returns the currently authenticated user's details.
   *
   * @param {Request} req - The request object containing the authenticated user details.
   * @returns {Promise<any>} - The authenticated user's profile information.
   * @throws {UnauthorizedException} If the user is not authenticated.
   */
  @UseGuards(JwtAuthGuard)
  @Get("profile")
  async getProfile(@Req() req) {
    return req.user;
  }

  /**
   * @brief Logs out the user by clearing authentication cookies.
   *
   * This endpoint removes the authentication cookies, effectively logging out the user.
   *
   * @param {Response} res - The response object used to clear authentication cookies.
   * @returns {Promise<Response>} A success message indicating logout completion.
   */
  @Post("logout")
  async logout(@Res({ passthrough: true }) res: Response): Promise<Response> {
    res.clearCookie("auth_token");
    res.clearCookie("refresh_token");
    return res.status(HttpStatus.OK).json({ message: "Logout successful" });
  }
}
