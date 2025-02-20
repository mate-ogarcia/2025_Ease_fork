/**
 * @file roles.guard.ts
 * @brief Guard used to check if the user has the required roles.
 */

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "./roles.decorator";
import { Role } from "./roles.enum";
import { JwtService } from "@nestjs/jwt";

/**
 * @class RolesGuard
 * @brief Guard that verifies if the user has at least one of the required roles.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  /**
   * @constructor
   * @brief Inject the Reflector and JwtService to retrieve metadata and decode tokens.
   * @param {Reflector} reflector - NestJS Reflector for metadata.
   * @param {JwtService} jwtService - NestJS JwtService for token decoding.
   */
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService
  ) {}

  /**
   * @function canActivate
   * @brief Main guard function to determine if the request can proceed.
   * @param {ExecutionContext} context - The execution context.
   * @returns {boolean} True if user has the required roles, otherwise false.
   */
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      // No roles required, allow access
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const accessToken = request.cookies?.accessToken;

    if (!accessToken) {
      throw new ForbiddenException("Access token not found in cookies");
    }

    try {
      const payload = this.jwtService.verify(accessToken, {
        secret: process.env.ACCESS_TOKEN_SECRET,
      });
      const userRoles = payload.roles || [];
      // Check if the user has at least one of the required roles
      const hasRole = requiredRoles.some((role) => userRoles.includes(role));
      if (!hasRole) {
        throw new ForbiddenException("Insufficient role");
      }
      // Optionally attach user info to request
      request.user = payload;
      return true;
    } catch (err) {
      throw new ForbiddenException("Invalid or expired access token");
    }
  }
}
