import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/auth';
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private cookieService: CookieService
  ) {
    // Vérifier si un utilisateur est déjà connecté au démarrage
    const token = this.cookieService.get('accessToken');
    if (token) {
      const user = this.getUserFromToken(token);
      this.currentUserSubject.next(user);
    }
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { email, password }, { withCredentials: true })
      .pipe(
        tap((response: any) => {
          console.log('🔐 Réponse de login:', response);
          if (response.access_token) {
            this.cookieService.set('accessToken', response.access_token, { path: '/' });
            this.currentUserSubject.next(response.user);
          }
        })
      );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true })
      .pipe(
        tap(() => {
          this.cookieService.delete('accessToken');
          this.currentUserSubject.next(null);
        })
      );
  }

  isAuthenticated(): boolean {
    return !!this.cookieService.get('accessToken');
  }

  getCurrentUser(): any {
    return this.currentUserSubject.value;
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    console.log('🔒 Vérification du rôle:', { userRole: user?.role, requiredRole: role });
    return user && user.role === role;
  }

  private getUserFromToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));
      return {
        id: payload.sub,
        email: payload.email,
        role: payload.role
      };
    } catch (error) {
      console.error('❌ Erreur lors du décodage du token:', error);
      return null;
    }
  }
} 