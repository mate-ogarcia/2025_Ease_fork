/**
 * @file roles.guard.ts
 * @brief Guard pour la gestion des rôles utilisateur.
 *
 * Ce guard permet de restreindre l'accès à certaines routes selon le rôle de l'utilisateur.
 * Il vérifie si l'utilisateur authentifié possède un rôle autorisé avant d'accorder l'accès.
 */

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  /**
   * @brief Vérifie si l'utilisateur a le rôle requis pour accéder à la route.
   *
   * @param {ExecutionContext} context - Le contexte de l'exécution de la requête.
   * @returns {boolean} Retourne `true` si l'accès est autorisé, sinon une exception est levée.
   * @throws {UnauthorizedException} Si l'utilisateur n'est pas authentifié.
   * @throws {ForbiddenException} Si l'utilisateur n'a pas le rôle requis.
   */
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>(
      "roles",
      context.getHandler()
    );
    if (!requiredRoles) {
      return true; // ✅ Pas de rôle spécifique requis, accès autorisé
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user; // ✅ L'utilisateur a été ajouté par JwtAuthGuard

    if (!user) {
      throw new UnauthorizedException("Utilisateur non authentifié");
    }

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException("Accès interdit : rôle insuffisant");
    }

    return true; // ✅ L'utilisateur a le rôle requis, accès autorisé
  }
}
