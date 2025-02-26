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
import { Observable, map, tap } from 'rxjs';

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
    return this.authService.getUserRole().pipe(
      tap(role => console.log('🔒 Rôle actuel:', role)),
      map(role => {
        if (!role) {
          console.log('❌ Pas de rôle, redirection vers login');
          this.router.navigate(['/login']);
          return false;
        }

        const requiredRoles = route.data['roles'] as Array<string>;
        console.log('🎯 Rôles requis:', requiredRoles);
        
        if (requiredRoles && !requiredRoles.includes(role)) {
          console.log('❌ Rôle insuffisant, redirection vers accueil');
          this.router.navigate(['/']);
          return false;
        }

        console.log('✅ Accès autorisé');
        return true;
      })
    );
  }
}
