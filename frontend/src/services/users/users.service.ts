/**
 * @file users.service.ts
 * @brief Service for managing user-related operations in Angular.
 *
 * @details
 * The `UsersService` provides methods for retrieving user information from JWT tokens stored in cookies.  
 * It primarily focuses on extracting the user's role for authorization and role-based access control.
 */

import { Injectable } from '@angular/core';
// Handles cookie operations
import { CookieService } from 'ngx-cookie-service';
// Decodes JWT tokens
import { jwtDecode } from 'jwt-decode';

/**
 * @class UsersService
 * @brief Handles user-related operations such as retrieving roles from JWT tokens.
 *
 * @details
 * This service extracts the user role from the JWT stored in the `access_token` cookie.  
 * It is useful for implementing role-based access control (RBAC) within the application.
 */
@Injectable({
  providedIn: 'root',
})
export class UsersService {

  /**
   * @brief Constructor injecting required services.
   * @param cookieService Service used to read cookies (specifically the `access_token` cookie).
   */
  constructor(private cookieService: CookieService) { }

  /**
   * @brief Retrieves the user's role from the JWT stored in cookies.
   * 
   * @details
   * - Retrieves the JWT from the `access_token` cookie.
   * - Decodes the token using `jwtDecode`.
   * - Extracts the `role` field from the decoded payload.
   *
   * @returns {string | null} The user's role (`"admin"`, `"user"`), or `null` if:
   * - The token is not found.
   * - The token is invalid or does not contain a role.
   *
   * @throws {Error} Potentially throws if the token is malformed or the `jwtDecode` function fails.
   */
  getUserRole(): string | null {
    const token = this.cookieService.get('access_token');
    if (!token) return null; // Return null if token is missing

    try {
      const decoded: any = jwtDecode(token); // Decode the JWT token
      return decoded.role ?? null; // Return the role or null if undefined
    } catch (error) {
      console.error("❌ Error decoding JWT:", error);
      return null;
    }
  }
}
