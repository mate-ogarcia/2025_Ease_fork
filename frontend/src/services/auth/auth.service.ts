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
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private _authBackendUrl = environment.authBackendUrl;
  private authStatus = new BehaviorSubject<boolean>(this.hasToken());
  private userRole = new BehaviorSubject<string | null>(
    this.getUserRoleFromToken()
  );
  private jwtHelper = new JwtHelperService();

  constructor(private http: HttpClient, private router: Router) {}

  /**
   * @brief Checks if a token is stored in local storage.
   *
   * @returns {boolean} `true` if a token is present, otherwise `false`.
   */
  private hasToken(): boolean {
    return !!localStorage.getItem('token');
  }

  private getUserRoleFromToken(): string | null {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = this.jwtHelper.decodeToken(token);
        return decodedToken.role;
      } catch {
        return null;
      }
    }
    return null;
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
      .post(`${this._authBackendUrl}/login`, { email, password })
      .pipe(
        map((response: any) => {
          localStorage.setItem('token', response.access_token);
          const decodedToken = this.jwtHelper.decodeToken(
            response.access_token
          );
          this.userRole.next(decodedToken.role);
          this.authStatus.next(true);
          return response;
        })
      );
  }

  /**
   * @brief Logs out the current user.
   *
   * This method removes the authentication token from local storage, updates
   * the authentication status, and redirects the user to the login page.
   */
  logout(): void {
    localStorage.removeItem('token');
    this.authStatus.next(false);
    this.userRole.next(null);
    this.router.navigate(['/login']);
  }

  /**
   * @brief Checks if the user is authenticated.
   *
   * Returns an observable that emits the current authentication status.
   *
   * @returns {Observable<boolean>} An observable emitting `true` if authenticated, otherwise `false`.
   */
  isAuthenticated(): Observable<boolean> {
    return this.authStatus.asObservable();
  }

  /**
   * @brief Gets the current user's role
   * @returns {Observable<string | null>} The user's role or null if not authenticated
   */
  getUserRole(): Observable<string | null> {
    return this.userRole.asObservable();
  }

  /**
   * @brief Checks if the current user has a specific role
   * @param {string[]} roles - The roles to check
   * @returns {boolean} True if the user has any of the specified roles
   */
  hasRole(roles: string[]): boolean {
    const currentRole = this.userRole.value;
    return currentRole !== null && roles.includes(currentRole);
  }
}
