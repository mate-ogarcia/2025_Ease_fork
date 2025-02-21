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
// Cookies
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private _authBackendUrl = environment.authBackendUrl;
  private authStatus = new BehaviorSubject<boolean>(this.hasToken());

  constructor(
    private http: HttpClient,
    private router: Router,
    private cookieService: CookieService,
  ) { }


  /**
   * @brief Checks if a token is stored in local storage.
   * 
   * @returns {boolean} `true` if a token is present, otherwise `false`.
   */
  private hasToken(): boolean {
    return !!localStorage.getItem('token');
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
    return this.http.post(`${this._authBackendUrl}/register`, { username, email, password });
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
    return this.http.post(`${this._authBackendUrl}/login`, { email, password }).pipe(
      map((response: any) => {
        // Store the token and some user's informations into the cookies
        // TODO
        this.cookieService.set('auth_token', response.access_token, { expires: 1, secure: true, sameSite: 'Strict' });
        this.cookieService.set('email', JSON.stringify(email), { expires: 1, secure: true, sameSite: 'Strict' });
        // localStorage.setItem('token', response.access_token);
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
}
