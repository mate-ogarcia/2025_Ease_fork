/**
 * @file roles.decorator.ts
 * @brief Decorator for role management.
 *
 * This decorator allows assigning required roles to routes
 * and endpoints of the application.
 */

import { SetMetadata } from "@nestjs/common";
import { UserRole } from "../enums/roles.enum";

/**
 * @brief Key used to store roles metadata.
 */
export const ROLES_KEY = "roles";

/**
 * @brief Decorator to specify required roles for accessing a route.
 * @param {UserRole[]} roles - List of authorized roles.
 * @returns {MethodDecorator & ClassDecorator} A decorator that can be applied to methods or classes.
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
