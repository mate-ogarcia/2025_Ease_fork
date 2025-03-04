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

    console.log("👤 Request user:", user ? {
      id: user?.id,
      email: user?.email,
      role: user?.role,
    } : "No user found");

    if (!user) {
      console.error("❌ No user found in request");
      console.error("❌ This may indicate that the JWT strategy did not attach the user to the request");
      console.error("❌ Make sure the JWT guard is applied before the roles guard");
      throw new UnauthorizedException("User not authenticated");
    }

    if (!user.role) {
      console.error("❌ User without defined role");
      throw new UnauthorizedException("User role not defined");
    }

    const hasRequiredRole = requiredRoles.includes(user.role);
    console.log(`${hasRequiredRole ? "✅" : "❌"} Role verification:`, {
      userRole: user.role,
      requiredRoles,
      hasAccess: hasRequiredRole,
    });

    if (!hasRequiredRole) {
      throw new UnauthorizedException(
        `Access denied. Required role: ${requiredRoles.join(", ")}`,
      );
    }

    return true;
  }
}
