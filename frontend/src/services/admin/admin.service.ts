/**
 * @file admin.service.ts
 * @brief Service for administrative operations and user management
 * @details This service provides methods for administrative operations including
 * user management, role updates, and system initialization. It communicates with
 * the backend API to perform these operations securely.
 * 
 * Key features:
 * - User retrieval and management
 * - Role-based access control management
 * - Error handling with detailed logging
 * - Automatic retry for network issues
 * - Initial system setup functionality
 * 
 * @author Original Author
 * @date Original Date
 * @modified 2023-XX-XX
 * @version 1.2.0
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

/**
 * @interface User
 * @description Interface representing a user entity in the system
 * 
 * This interface defines the structure of user objects as they are
 * received from and sent to the backend API.
 */
export interface User {
  /** @property {string} id - Unique identifier for the user */
  id: string;

  /** @property {string} username - User's display name */
  username: string;

  /** @property {string} email - User's email address (used for login) */
  email: string;

  /** @property {string} role - User's role (e.g., 'Admin', 'User') */
  role: string;

  /** @property {Date} createdAt - Timestamp when the user was created */
  createdAt: Date;
}

/**
 * @class AdminService
 * @description Service that handles all administrative operations
 * 
 * This service provides methods to manage users, update roles, and
 * perform other administrative tasks. It communicates with the backend
 * API and includes error handling and logging.
 */
@Injectable({
  providedIn: 'root'
})
export class AdminService {
  /** 
   * @property {string} apiUrl - The base URL for admin API endpoints
   * @private
   */
  private apiUrl = `${environment.globalBackendUrl}/admin`;

  /**
   * @constructor
   * @description Initializes the AdminService with the API URL from environment
   * 
   * @param {HttpClient} http - The Angular HttpClient for making HTTP requests
   */
  constructor(private http: HttpClient) {
    console.log('🔧 AdminService initialized with API URL:', this.apiUrl);
  }

  /**
   * @method handleError
   * @description Handles HTTP errors with detailed logging
   * 
   * This method processes HTTP errors, logs appropriate messages based on
   * the error type, and returns an observable that errors with the provided error.
   * It distinguishes between network errors and server errors for better debugging.
   * 
   * @param {HttpErrorResponse} error - The HTTP error response to handle
   * @returns {Observable<never>} An observable that errors with the provided error
   * @private
   */
  private handleError(error: HttpErrorResponse) {
    console.error('An error occurred:', error);
    if (error.status === 0) {
      console.error('Network error:', error.error);
    } else {
      console.error(
        `Backend returned code ${error.status}, ` +
        `message: ${error.error?.message || error.message}`
      );
    }
    return throwError(() => error);
  }

  /**
   * @method getAllUsers
   * @description Retrieves all users from the backend
   * 
   * This method fetches the complete list of users from the system.
   * It includes automatic retry for network issues and detailed logging.
   * 
   * @returns {Observable<User[]>} An observable containing an array of user objects
   * @public
   */
  getAllUsers(): Observable<User[]> {
    console.log('🔍 Fetching all users from:', `${this.apiUrl}/users`);
    return this.http.get<User[]>(`${this.apiUrl}/users`, {
      withCredentials: true
    }).pipe(
      tap(users => console.log(`✅ Retrieved ${users?.length || 0} users`)),
      retry(3),
      catchError(this.handleError)
    );
  }

  /**
   * @method updateUserRole
   * @description Updates a user's role in the system
   * 
   * This method changes a user's role, which affects their permissions
   * and access rights within the application.
   * 
   * @param {string} userId - The ID of the user to update
   * @param {string} role - The new role to assign to the user
   * @returns {Observable<any>} An observable containing the response from the server
   * @public
   */
  updateUserRole(userId: string, role: string): Observable<any> {
    console.log(`🔄 Updating role for user ${userId} to ${role}`);
    return this.http.put(`${this.apiUrl}/users/${userId}/role`, { role }, {
      withCredentials: true
    }).pipe(
      tap(response => console.log('✅ Role updated successfully:', response)),
      catchError(this.handleError)
    );
  }

  /**
   * @method deleteUser
   * @description Permanently removes a user from the system
   * 
   * This method deletes a user account based on the provided user ID.
   * This operation cannot be undone.
   * 
   * @param {string} userId - The ID of the user to delete
   * @returns {Observable<any>} An observable containing the response from the server
   * @public
   */
  deleteUser(userId: string): Observable<any> {
    console.log(`🗑️ Deleting user ${userId}`);
    return this.http.delete(`${this.apiUrl}/users/${userId}`, {
      withCredentials: true
    }).pipe(
      tap(() => console.log('✅ User deleted successfully')),
      catchError(this.handleError)
    );
  }

  /**
   * @method createInitialAdmin
   * @description Creates the initial administrator account for system setup
   * 
   * This method is typically used during initial system setup to create
   * the first administrator account. It should only be callable when no
   * admin accounts exist in the system.
   * 
   * @param {string} email - The email address for the admin account
   * @param {string} password - The password for the admin account
   * @returns {Observable<any>} An observable containing the response from the server
   * @public
   */
  createInitialAdmin(email: string, password: string): Observable<any> {
    console.log('🔧 Creating initial admin with email:', email);
    return this.http.post(`${this.apiUrl}/initialize`, { email, password }).pipe(
      tap(response => console.log('✅ Initial admin created successfully:', response)),
      catchError(this.handleError)
    );
  }
} 