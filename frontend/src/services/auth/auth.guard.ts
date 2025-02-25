/**
 * @file auth.guard.ts
 * @brief Authentication and role guard for protecting routes.
 * 
 * This guard restricts access to certain routes based on the user's authentication status and role.
 * If the user is authenticated and has the required role, access is granted; otherwise, they are redirected to the login page.
 */

import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from './auth.service';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  /**
   * @brief Determines if a route can be activated based on authentication status and role.
   * 
   * If the user is authenticated and has the required role, they are granted access; otherwise, they are redirected to the login page.
   * 
   * @returns {Observable<boolean>} An observable that emits `true` if the user is authenticated and has the required role, otherwise `false` with redirection.
   */
  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    return this.authService.isAuthenticated().pipe(
      map(authenticated => {
        if (!authenticated) {
          this.router.navigate(['/login'], {
            queryParams: { returnUrl: route.url.join('/') }
          });
          return false;
        }

        // Vérification des rôles si spécifiés dans les données de route
        const requiredRoles = route.data['roles'] as Array<string>;
        if (requiredRoles && !this.authService.hasRole(requiredRoles)) {
          this.router.navigate(['/']); // Redirection vers la page d'accueil si pas le bon rôle
          return false;
        }

        return true;
      })
    );
  }
}
