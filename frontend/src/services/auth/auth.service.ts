import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
// Cookies
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private _authBackendUrl = environment.authBackendUrl;

  // On conserve un BehaviorSubject pour savoir si l'utilisateur est connecté
  private authStatus = new BehaviorSubject<boolean>(false);
  // BehaviorSubject pour stocker le rôle
  private roleSubject = new BehaviorSubject<string | null>(null);
  public role$ = this.roleSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private cookieService: CookieService
  ) {}

  register(username: string, email: string, password: string): Observable<any> {
    return this.http.post(`${this._authBackendUrl}/register`, {
      username,
      email,
      password,
    });
  }

  login(email: string, password: string): Observable<any> {
    return this.http
      .post(`${this._authBackendUrl}/login`, { email, password })
      .pipe(
        map((response: any) => {
          // Store the token and some user's informations into the cookies
          // TODO
          this.cookieService.set('auth_token', response.access_token, {
            expires: 1,
            secure: true,
            sameSite: 'Strict',
          });
          this.cookieService.set('email', JSON.stringify(email), {
            expires: 1,
            secure: true,
            sameSite: 'Strict',
          });
          // localStorage.setItem('token', response.access_token);
          this.authStatus.next(true);
          return response;
        })
      );
  }

  logout(): Observable<any> {
    return this.http
      .post(`${this._authBackendUrl}/logout`, {}, { withCredentials: true })
      .pipe(
        tap(() => {
          this.authStatus.next(false);
          this.roleSubject.next(null);
          this.router.navigate(['/login']);
        })
      );
  }

  isAuthenticated(): Observable<boolean> {
    return this.authStatus.asObservable();
  }

  // Méthode pour récupérer le profil (et le rôle) de l'utilisateur
  loadProfile(): Observable<any> {
    return this.http
      .get(`${this._authBackendUrl}/profile`, { withCredentials: true })
      .pipe(
        tap((profile: any) => {
          // On met à jour le rôle et le statut d'authentification
          if (profile && profile.role) {
            this.roleSubject.next(profile.role);
            this.authStatus.next(true);
          } else {
            this.authStatus.next(false);
          }
        })
      );
  }

  getRole(): string | null {
    return this.roleSubject.value;
  }

  hasRole(role: string): boolean {
    return this.roleSubject.value === role;
  }

  getCurrentAuthStatus(): boolean {
    return this.authStatus.value;
  }
}
