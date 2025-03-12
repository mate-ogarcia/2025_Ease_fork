/**
 * @file admin.service.ts
 * @brief Service for administrative operations and user management.
 * @details This service provides methods for performing administrative operations,
 * including user management, role updates, system initialization, and retrieving
 * product requests. It securely communicates with the backend API and includes
 * robust error handling.
 *
 * Key features:
 * - User retrieval and management
 * - Role-based access control management
 * - Error handling with detailed logging
 * - Automatic retry for network issues
 * - Initial system setup functionality
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { lastValueFrom, Observable, throwError } from 'rxjs';
import { catchError, retry, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

/**
 * @interface User
 * @description Interface representing a user entity in the system.
 * 
 * This interface defines the structure of user objects received from 
 * and sent to the backend API.
 */
export interface User {
  email: string;    // as the email is unique, the email will act as the id
  username: string;
  role: string;
  createdAt: Date;
}

/**
 * @class AdminService
 * @description Service that handles all administrative operations.
 * 
 * This service provides methods to manage users, update roles, retrieve
 * product requests, and perform other administrative tasks. It includes
 * error handling and secure API communication.
 */
@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private adminURL = `${environment.globalBackendUrl}/admin`; // adminURL - The base URL for admin API endpoints.

  constructor(private http: HttpClient) { }

  /**
   * @method handleError
   * @description Handles HTTP errors with detailed logging.
   * 
   * Processes HTTP errors, logs appropriate messages based on error type, 
   * and returns an observable that throws the error.
   * 
   * @param {HttpErrorResponse} error - The HTTP error response to handle.
   * @returns {Observable<never>} An observable that throws the error.
   * @private
   */
  private handleError(error: HttpErrorResponse) {
    console.error('❌ HTTP Error:', error);
    if (error.status === 0) {
      console.error('❌ Network error:', error.error);
    } else {
      console.error(
        `❌ Backend returned code ${error.status}, message: ${error.error?.message || error.message}`
      );
    }
    return throwError(() => new Error(`Failed request: ${error.message}`));
  }

  /**
   * @method getAllUsers
   * @description Retrieves all users from the backend.
   * 
   * Fetches a complete list of users in the system.
   * Includes automatic retry for network issues.
   * 
   * @returns {Observable<User[]>} An observable containing an array of user objects.
   * @public
   */
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.adminURL}/users`, {
      withCredentials: true
    }).pipe(
      retry({ count: 2, delay: 1000 }), // Retry twice with a 1-second delay
      catchError(this.handleError)
    );
  }

  /**
   * @method updateUserRole
   * @description Updates a user's role in the system.
   * 
   * Changes a user's role, which affects their permissions and access rights.
   * 
   * @param {string} email - The email of the user to update.
   * @param {string} role - The new role to assign.
   * @returns {Observable<any>} An observable containing the server response.
   * @public
   */
  updateUserRole(email: string, role: string): Observable<any> {
    console.log(`🔄 Envoi de la requête pour mettre à jour le rôle de ${email} à ${role}`);

    // Encoder l'email pour éviter les problèmes avec les caractères spéciaux
    const encodedEmail = encodeURIComponent(email);

    return this.http.put(`${this.adminURL}/users/${encodedEmail}/role`, { role }, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    }).pipe(
      catchError(error => {
        console.error(`❌ Erreur lors de la mise à jour du rôle pour ${email}:`, error);
        return this.handleError(error);
      })
    );
  }

  /**
   * @method deleteUser
   * @description Permanently removes a user from the system.
   * 
   * Deletes a user account based on the provided user email.
   * This operation cannot be undone.
   * 
   * @param {string} email - The email of the user to delete.
   * @returns {Observable<any>} An observable containing the server response.
   * @public
   */
  deleteUser(email: string): Observable<any> {
    return this.http.delete(`${this.adminURL}/users/${email}`, {
      withCredentials: true
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * @method createInitialAdmin
   * @description Creates the initial administrator account for system setup.
   * 
   * Used during initial system setup to create the first administrator account.
   * 
   * @param {string} email - The email address for the admin account.
   * @param {string} password - The password for the admin account.
   * @returns {Observable<any>} An observable containing the server response.
   * @public
   */
  createInitialAdmin(email: string, password: string): Observable<any> {
    return this.http.post(`${this.adminURL}/initialize`, { email, password }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * @method getAllRequests
   * @description Retrieves all requests from the backend.
   * 
   * Fetches product-related and brands-related requests that require administrative action 
   * (e.g., new product additions, edits, or deletions).
   * 
   * @returns {Observable<any[]>} An observable containing an array of product requests.
   * @public
   */
  getAllRequests(): Observable<any[]> {
    return this.http.get<any[]>(`${this.adminURL}/getRequests`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * @brief Sends a request to update an entity (product or brand) via the API.
   * 
   * @details This method makes a PATCH request to update an entity in the database. 
   * It dynamically constructs the API endpoint based on the entity type (`product` or `brand`).
   * 
   * @param {'product' | 'brand'} type - The type of entity to update.
   * @param {string} id - The unique identifier of the entity.
   * @param {Record<string, any>} valueToUpdate - The fields to update.
   * 
   * @returns {Promise<any>} - A promise resolving to the updated entity.
   */
  updateEntity(type: 'product' | 'brand', id: string, valueToUpdate: Record<string, any>): Promise<any> {
    return lastValueFrom(
      this.http.patch<any>(`${this.adminURL}/updateEntity/${type}/${id}`, valueToUpdate)
    );
  }

  /**
   * @method getAllRoles
   * @description Retrieves all available user roles from the system.
   * 
   * Fetches a list of all possible roles that can be assigned to users.
   * 
   * @returns {Observable<string[]>} An observable containing an array of role names.
   * @public
   */
  getAllRoles(): Observable<string[]> {
    return this.http.get<string[]>(`${this.adminURL}/roles`, {
      withCredentials: true
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Récupère le rôle de l'utilisateur actuel
  getCurrentUserRole(): Observable<string> {
    console.log('🔄 Récupération du rôle utilisateur...');
    return this.http.get<{ role: string }>(`${this.adminURL}/currentUserRole`, {
      withCredentials: true
    }).pipe(
      map(response => {
        console.log('✅ Rôle reçu:', response);
        return response.role;
      }),
      retry(3),
      catchError((error) => {
        console.error('❌ Erreur lors de la récupération du rôle:', error);
        return this.handleError(error);
      })
    );
  }
}
