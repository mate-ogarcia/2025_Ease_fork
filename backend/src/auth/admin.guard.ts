/**
 * @file admin.guard.ts
 * @brief Guard for protecting admin-only routes.
 *
 * This guard ensures that only users with the 'Admin' role can access protected routes.
 * It works in conjunction with the JwtAuthGuard to provide role-based access control.
 */

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  /**
   * @brief Determines if the request can proceed based on user role.
   * @details Checks if the authenticated user has the 'Admin' role.
   *
   * @param context The execution context of the request.
   * @returns A boolean indicating whether the request is authorized.
   * @throws {UnauthorizedException} If the user is not an admin.
   */
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException("User not authenticated");
    }

    if (user.role !== "Admin") {
      throw new UnauthorizedException("Admin access required");
    }

    return true;
  }
}
