/**
 * @file role.enum.ts
 * @brief Enumeration of available user roles.
 *
 * This enumeration defines the different possible roles in the application.
 * It ensures consistency of roles throughout the application.
 */

/**
 * @brief Enum representing the possible user roles in the application.
 */
export enum UserRole {
  /**
   * @brief Administrator role with full access to all features.
   */
  ADMIN = "Admin",

  /**
   * @brief Standard user role with limited access to features.
   */
  USER = "User",
}