import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (this.authService.isAuthenticated()) {
      return true; // L'utilisateur est connecté, il peut accéder
    } else {
      this.router.navigate(['/login']); // 🔴 Redirige vers login s'il n'est pas connecté
      return false;
    }
  }
}
