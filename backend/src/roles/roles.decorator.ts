/**
 * @file roles.decorator.ts
 * @brief Custom decorator to define roles required by a specific route.
 */

import { SetMetadata } from "@nestjs/common";
import { Role } from "./roles.enum";

/**
 * @const ROLES_KEY
 * @brief Key used by the Roles decorator to store metadata.
 */
export const ROLES_KEY = "roles";

/**
 * @function Roles
 * @brief Custom decorator to specify the roles allowed to access a route.
 * @param {...Role[]} roles - The roles required.
 * @returns {CustomDecorator} The roles metadata.
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
