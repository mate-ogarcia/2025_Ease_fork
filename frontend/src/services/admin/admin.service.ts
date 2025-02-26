/**
 * @file admin.service.ts
 * @brief Service for administrative operations
 * @details This service provides methods for administrative operations such as
 * user management. It has been modified to use the correct API URL and to include
 * better logging for debugging purposes.
 * 
 * @author Original Author
 * @date Original Date
 * @modified 2023-XX-XX
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

/**
 * @interface User
 * @description Interface representing a user in the system
 */
export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = `${environment.globalBackendUrl}/admin`;

  /**
   * @constructor
   * @description Initializes the AdminService with the API URL
   * @param {HttpClient} http - The Angular HttpClient for making HTTP requests
   */
  constructor(private http: HttpClient) {
    console.log('🔧 AdminService initialized with API URL:', this.apiUrl);
  }

  /**
   * @function handleError
   * @description Handles HTTP errors and logs them
   * @param {HttpErrorResponse} error - The HTTP error response
   * @returns {Observable<never>} An observable that errors with the provided error
   * @private
   */
  private handleError(error: HttpErrorResponse) {
    console.error('Une erreur est survenue:', error);
    if (error.status === 0) {
      console.error('Erreur réseau:', error.error);
    } else {
      console.error(
        `Le backend a retourné le code ${error.status}, ` +
        `message: ${error.error?.message || error.message}`
      );
    }
    return throwError(() => error);
  }

  /**
   * @function getAllUsers
   * @description Retrieves all users from the backend
   * @returns {Observable<any[]>} An observable containing an array of users
   */
  getAllUsers(): Observable<any[]> {
    console.log('🔍 Fetching all users from:', `${this.apiUrl}/users`);
    return this.http.get<any[]>(`${this.apiUrl}/users`, {
      withCredentials: true
    }).pipe(
      tap(users => console.log(`✅ Retrieved ${users?.length || 0} users`)),
      retry(3),
      catchError(this.handleError)
    );
  }

  /**
   * @function updateUserRole
   * @description Updates a user's role
   * @param {string} userId - The ID of the user to update
   * @param {string} role - The new role to assign
   * @returns {Observable<any>} An observable containing the response
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
   * @function deleteUser
   * @description Deletes a user
   * @param {string} userId - The ID of the user to delete
   * @returns {Observable<any>} An observable containing the response
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
   * @function createInitialAdmin
   * @description Creates the initial admin user
   * @param {string} email - The email of the admin
   * @param {string} password - The password of the admin
   * @returns {Observable<any>} An observable containing the response
   */
  createInitialAdmin(email: string, password: string): Observable<any> {
    console.log('🔧 Creating initial admin with email:', email);
    return this.http.post(`${this.apiUrl}/initialize`, { email, password }).pipe(
      tap(response => console.log('✅ Initial admin created successfully:', response)),
      catchError(this.handleError)
    );
  }
} 