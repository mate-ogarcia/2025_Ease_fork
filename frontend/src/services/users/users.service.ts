/**
 * @file users.service.ts
 * @brief Service for managing user-related operations in Angular.
 *
 * @details
 * The `UsersService` provides methods for retrieving user information from JWT tokens stored in cookies.  
 * It primarily focuses on extracting the user's role for authorization and role-based access control.
 */

import { Injectable } from '@angular/core';
import { AuthService } from '../auth/auth.service';

/**
 * @class UsersService
 * @brief Handles user-related operations such as retrieving roles from JWT tokens.
 *
 * @details
 * This service uses AuthService to get user information and role.
 * It is useful for implementing role-based access control (RBAC) within the application.
 */
@Injectable({
  providedIn: 'root',
})
export class UsersService {
  /**
   * @brief Constructor injecting required services.
   * @param authService Service used to get authentication information.
   */
  constructor(private authService: AuthService) { }

  /**
   * @brief Retrieves the user's role from the authentication state.
   * 
   * @returns {string | null} The user's role (`"admin"`, `"user"`), or `null` if not authenticated.
   */
  getUserRole(): string | null {
    return this.authService.getUserInfo()?.role || null;
  }

  /**
   * @brief Checks if the current user is authenticated.
   * 
   * @returns {boolean} True if the user is authenticated, false otherwise.
   */
  isAuthenticated(): boolean {
    return this.authService.hasRole(['admin', 'user']);
  }

  /**
   * @brief Determines if the user should be redirected to the login page.
   * 
   * @returns {boolean} True if the user should be redirected to login, false otherwise.
   */
  shouldRedirectToLogin(): boolean {
    // Ne pas rediriger si on est déjà sur la page de login ou auth
    if (window.location.pathname.includes('/login') ||
      window.location.pathname.includes('/auth') ||
      window.location.pathname.includes('/register')) {
      return false;
    }

    // Ne pas rediriger lors d'un rechargement si on a un token
    const isPageReload = document.readyState === 'complete';
    if (isPageReload && this.isAuthenticated()) {
      console.log('🔄 Page reload with valid token - staying on current page');
      return false;
    }

    return !this.isAuthenticated();
  }
}