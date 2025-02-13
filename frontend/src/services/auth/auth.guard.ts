/**
 * @file auth.guard.ts
 * @brief Authentication guard for protecting routes.
 * 
 * This guard restricts access to certain routes based on the user's authentication status.
 * If the user is authenticated, access is granted; otherwise, they are redirected to the login page.
 */

import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  /**
   * @brief Determines if a route can be activated based on authentication status.
   * 
   * If the user is authenticated, they are granted access; otherwise, they are redirected to the login page.
   * 
   * @returns {boolean} `true` if the user is authenticated, otherwise `false` with redirection.
   */
  canActivate(): boolean {
    if (this.authService.isAuthenticated()) {
      return true; // ✅ User is authenticated, allow access
    } else {
      this.router.navigate(['/login']); // Redirect to login if not authenticated
      return false;
    }
  }
}
