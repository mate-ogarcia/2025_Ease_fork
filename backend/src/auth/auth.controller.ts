/**
 * @file auth.controller.ts
 * @brief Controller for handling authentication requests.
 *
 * This controller provides endpoints for user authentication,
 * including registration, login, and retrieving the authenticated user's profile.
 * It interacts with the AuthService to perform authentication operations.
 */

import { Controller, Post, Body, UseGuards, Get, Req } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./auth.guard";
import { RegisterDto, LoginDto } from "./dto/auth.dto";
import { Roles } from "./decorators/roles.decorator";
import { UserRole } from "./enums/role.enum";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * @brief Registers a new user.
   *
   * This endpoint allows a user to create an account by providing an email, an username and password.
   * The password is securely hashed before being stored in the database.
   *
   * @param {RegisterDto} body - The request body containing user credentials.
   * @returns {Promise<any>} The created user object.
   * @throws {UnauthorizedException} If the user already exists.
   * @throws {InternalServerErrorException} If an error occurs during registration.
   */
  @Post("register")
  async register(@Body() body: RegisterDto): Promise<any> {
    return this.authService.register(body.username, body.email, body.password);
  }

  /**
   * @brief Logs in a user.
   *
   * This endpoint authenticates a user by verifying their email and password.
   * Upon successful authentication, it generates an access token and a refresh token.
   *
   * @param {LoginDto} body - The request body containing user credentials.
   * @returns {Promise<{ access_token: string, refresh_token: string }>}
   * An object containing an access token and a refresh token.
   * @throws {UnauthorizedException} If the credentials are invalid.
   */
  @Post("login")
  async login(
    @Body() body: LoginDto,
  ): Promise<{ access_token: string; refresh_token: string }> {
    return this.authService.login(body.email, body.password);
  }

  /**
   * @brief Retrieves the authenticated user's profile.
   *
   * This endpoint is protected and requires a valid JWT token.
   * It returns the currently authenticated user's details.
   *
   * @param {Request} req - The request object containing user details.
   * @returns {Promise<any>} The authenticated user's profile information.
   * @throws {UnauthorizedException} If the user is not authenticated.
   */
  @UseGuards(JwtAuthGuard)
  @Get("profile")
  async getProfile(@Req() req): Promise<any> {
    return req.user;
  }

  /**
   * @brief Admin-only endpoint to list all users.
   *
   * This endpoint is protected and requires both JWT authentication and Admin role.
   *
   * @param {Request} req - The request object containing user details.
   * @returns {Promise<any>} List of all users in the system.
   * @throws {UnauthorizedException} If the user is not authenticated or not an admin.
   */
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN)
  @Get("users")
  async getAllUsers(): Promise<any> {
    return this.authService.findAll();
  }
}
