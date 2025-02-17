/**
 * @file auth.guard.ts
 * @brief Guard for protecting routes using JWT authentication.
 *
 * This guard ensures that only authenticated users can access protected routes.
 * It retrieves the JWT token from HTTP-only cookies, verifies it, and attaches
 * the authenticated user to the request object.
 */

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "../users/users.service";
import { Request } from "express";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService
  ) {}

  /**
   * @brief Determines whether a request is authorized.
   *
   * This method retrieves the JWT token from cookies, verifies its validity,
   * and checks whether the associated user exists in the database.
   * If authentication is successful, the user object is attached to the request.
   *
   * @param {ExecutionContext} context - The execution context of the request.
   * @returns {Promise<boolean>} Returns `true` if authentication is successful, otherwise throws an exception.
   * @throws {UnauthorizedException} If the token is missing, invalid, or the user does not exist.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest<Request>();

      // Retrieve the token from HTTP-only cookies
      const token = request.cookies["auth_token"];

      if (!token) throw new UnauthorizedException("Token is missing");

      // Verify the JWT token
      const decoded = this.jwtService.verify(token);
      const user = await this.usersService.findByEmail(decoded.email);

      if (!user) throw new UnauthorizedException("Invalid user");

      // Attach the user object to the request for later use
      request.user = user;
      return true;
    } catch (error) {
      throw new UnauthorizedException("Access denied, invalid token");
    }
  }
}
