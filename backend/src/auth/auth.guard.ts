/**
 * @file auth.guard.ts
 * @brief Guard for protecting routes using JWT authentication.
 *
 * This guard checks the validity of the JWT token provided in the cookies
 * and verifies the user's existence in the database before granting access.
 */

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "../users/users.service";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  /**
   * @brief Determines whether the request can proceed.
   * @details This method verifies the presence and validity of the JWT token in cookies.
   * If valid, it checks whether the user exists in the database.
   *
   * @param context The execution context of the request.
   * @returns A boolean indicating whether the request is authorized.
   * @throws {UnauthorizedException} If the token is missing, invalid, or the user does not exist.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest();
      const token = request.cookies?.accessToken;

      if (!token) throw new UnauthorizedException("Token is missing");

      const decoded = this.jwtService.verify(token);
      const user = await this.usersService.findByEmail(decoded.email);

      if (!user) throw new UnauthorizedException("Invalid user");

      request.user = user;
      return true;
    } catch (error) {
      throw new UnauthorizedException("Access denied: " + error.message);
    }
  }
}
