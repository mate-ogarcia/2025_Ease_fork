/**
 * @file roles.decorator.ts
 * @brief Décorateur pour la gestion des rôles.
 *
 * Ce décorateur permet d'attribuer des rôles requis aux routes
 * et endpoints de l'application.
 */

import { SetMetadata } from "@nestjs/common";
import { UserRole } from "../enums/role.enum";

export const ROLES_KEY = "roles";

/**
 * Décorateur pour spécifier les rôles requis pour accéder à une route.
 * @param roles Liste des rôles autorisés
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
