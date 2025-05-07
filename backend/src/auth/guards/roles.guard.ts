/**
 * @file roles.guard.ts
 * @brief Main guard for role verification.
 *
 * This guard checks if the user has the required roles
 * to access a protected route. It is more flexible than AdminGuard
 * as it can verify any role defined in UserRole.
 * 
 * NOTE: This guard is the main guard for role verification and should be used
 * instead of admin.guard.ts located in the parent directory. To restrict access
 * to administrators, use @Roles(UserRole.ADMIN) with this guard.
 */

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { UserRole } from "../enums/roles.enum";
import { ROLES_KEY } from "../decorators/roles.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
  /**
   * @brief Constructor for RolesGuard.
   * @param {Reflector} reflector - NestJS Reflector for retrieving metadata.
   */
  constructor(private reflector: Reflector) { }

  /**
   * @brief Determines if the request can proceed based on user roles.
   * @details Checks if the authenticated user has at least one of the required roles.
   *          SUPERADMIN role has access to all protected routes regardless of the required roles.
   *
   * @param {ExecutionContext} context - The execution context of the request.
   * @returns {boolean} Whether the user has the required role.
   * @throws {UnauthorizedException} If the user is not authenticated or lacks the required role.
   */
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    const user = request.user;

    if (!user) {

      const hasAuthHeader = !!request.headers.authorization;
      const hasCookieToken = request.cookies && request.cookies.accessToken;

      if (hasAuthHeader || hasCookieToken) {
        console.error("❌ RolesGuard - Token is present but user is not attached to request");
      }

      throw new UnauthorizedException("User not authenticated");
    }


    const hasRequiredRole = requiredRoles.some((role) => user.role === role);

    if (!hasRequiredRole) {
      console.error(`❌ RolesGuard - User ${user.email} with role ${user.role} does not have required roles: ${requiredRoles.join(", ")}`);
      throw new ForbiddenException("Insufficient permissions");
    }

    return true;
  }
}
