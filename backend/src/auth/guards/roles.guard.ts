/**
 * @file roles.guard.ts
 * @brief Guard pour la vérification des rôles.
 *
 * Ce guard vérifie si l'utilisateur possède les rôles requis
 * pour accéder à une route protégée.
 */

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { UserRole } from "../enums/role.enum";
import { ROLES_KEY } from "../decorators/roles.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    console.log("🔒 Rôles requis:", requiredRoles);

    if (!requiredRoles || requiredRoles.length === 0) {
      console.log("✅ Aucun rôle requis");
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    console.log("👤 Utilisateur de la requête:", {
      id: user?.id,
      email: user?.email,
      role: user?.role,
    });

    if (!user) {
      console.error("❌ Aucun utilisateur trouvé dans la requête");
      throw new UnauthorizedException("Utilisateur non authentifié");
    }

    if (!user.role) {
      console.error("❌ Utilisateur sans rôle défini");
      throw new UnauthorizedException("Rôle utilisateur non défini");
    }

    const hasRequiredRole = requiredRoles.includes(user.role);
    console.log(`${hasRequiredRole ? "✅" : "❌"} Vérification du rôle:`, {
      userRole: user.role,
      requiredRoles,
      hasAccess: hasRequiredRole,
    });

    if (!hasRequiredRole) {
      throw new UnauthorizedException(
        `Accès refusé. Rôle requis: ${requiredRoles.join(", ")}`,
      );
    }

    return true;
  }
}
