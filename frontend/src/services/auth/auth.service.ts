/**
 * @file auth.service.ts
 * @brief Service for handling user authentication.
 *
 * This service manages user authentication, including login, registration,
 * logout, and authentication status tracking. It interacts with the backend API
 * and manages authentication tokens in local storage.
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { map, tap, catchError, finalize, distinctUntilChanged } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { JwtHelperService } from '@auth0/angular-jwt';
// Cookies
import { CookieService } from 'ngx-cookie-service';

interface AuthState {
  isAuthenticated: boolean;
  role: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private _authBackendUrl = environment.authBackendUrl;
  private authState = new BehaviorSubject<AuthState>({
    isAuthenticated: false,
    role: null
  });
  private jwtHelper = new JwtHelperService();

  constructor(
    private http: HttpClient,
    private router: Router,
    private cookieService: CookieService
  ) {
    // Vérifier l'état initial
    this.checkAuthState();
  }

  private checkAuthState(): void {
    const hasAccessToken = this.cookieService.check('accessToken');
    if (hasAccessToken) {
      // Si on a un token, on essaie de récupérer le profil
      this.refreshAuthState().subscribe({
        error: (error) => {
          console.error('Error checking auth state:', error);
          // En cas d'erreur, on ne réinitialise PAS l'état
          // On laisse l'utilisateur connecté et on réessaiera plus tard
        }
      });
    } else {
      this.updateAuthState(false, null);
    }
  }

  private refreshAuthState(): Observable<any> {
    return this.http.get<any>(`${this._authBackendUrl}/profile`, { withCredentials: true })
      .pipe(
        tap(response => {
          console.log('Profile response:', response);
          if (response && response.role) {
            this.updateAuthState(true, response.role);
          }
        }),
        catchError(error => {
          console.error('Error refreshing auth state:', error);
          // Ne pas mettre à jour l'état en cas d'erreur
          return throwError(() => error);
        })
      );
  }

  private updateAuthState(isAuthenticated: boolean, role: string | null): void {
    console.log('Updating auth state:', { isAuthenticated, role });
    // Ne mettre à jour l'état que si les valeurs changent réellement
    if (this.authState.value.isAuthenticated !== isAuthenticated || 
        this.authState.value.role !== role) {
      this.authState.next({
        isAuthenticated,
        role
      });
    }
  }

  /**
   * @brief Registers a new user.
   *
   * Sends a registration request to the backend with the user's email and password.
   *
   * @param {string} username - The username.
   * @param {string} email - The email address of the user.
   * @param {string} password - The user's password.
   * @returns {Observable<any>} The API response.
   */
  register(username: string, email: string, password: string): Observable<any> {
    return this.http.post(`${this._authBackendUrl}/register`, {
      username,
      email,
      password,
    });
  }

  /**
   * @brief Logs in a user and stores the authentication token.
   *
   * This method sends login credentials to the backend, retrieves a JWT token upon
   * successful authentication, stores it in local storage, and updates the authentication status.
   *
   * @param {string} email - The email address of the user.
   * @param {string} password - The user's password.
   * @returns {Observable<any>} An observable containing the API response with the access token.
   */
  login(email: string, password: string): Observable<any> {
    return this.http
      .post(`${this._authBackendUrl}/login`, { email, password }, { withCredentials: true })
      .pipe(
        tap((response: any) => {
          const decodedToken = this.jwtHelper.decodeToken(response.access_token);
          this.updateAuthState(true, decodedToken.role);
        })
      );
  }

  logout(): Observable<any> {
    // Mettre à jour l'état immédiatement
    this.updateAuthState(false, null);

    // Supprimer les cookies
    this.cookieService.delete('accessToken', '/');
    this.cookieService.delete('refreshToken', '/');

    return this.http
      .post(`${this._authBackendUrl}/logout`, {}, { withCredentials: true })
      .pipe(
        finalize(() => {
          this.router.navigate(['/login']);
        })
      );
  }

  /**
   * @brief Checks if the user is authenticated.
   *
   * Returns an observable that emits the current authentication status.
   *
   * @returns {Observable<boolean>} An observable emitting `true` if authenticated, otherwise `false`.
   */
  isAuthenticated(): Observable<boolean> {
    return this.authState.pipe(
      map(state => state.isAuthenticated),
      distinctUntilChanged()
    );
  }

  getAuthStatus(): Observable<boolean> {
    return this.isAuthenticated();
  }

  /**
   * @brief Gets the current user's role
   * @returns {Observable<string | null>} The user's role or null if not authenticated
   */
  getUserRole(): Observable<string | null> {
    return this.authState.pipe(
      map(state => state.role),
      distinctUntilChanged()
    );
  }

  /**
   * @brief Checks if the current user has a specific role
   * @param {string[]} roles - The roles to check
   * @returns {boolean} True if the user has any of the specified roles
   */
  hasRole(roles: string[]): boolean {
    const currentRole = this.authState.value.role;
    return currentRole !== null && roles.includes(currentRole);
  }
}
