import { SetMetadata } from "@nestjs/common";

/**
 * @brief Décorateur pour définir les rôles requis sur une route.
 *
 * @param {...string[]} roles - Liste des rôles autorisés.
 * @returns Un décorateur `SetMetadata` qui stocke les rôles dans les métadonnées de la route.
 */
export const Roles = (...roles: string[]) => SetMetadata("roles", roles);
