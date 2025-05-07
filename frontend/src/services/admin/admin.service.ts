/**
 * @file admin.service.ts
 * @brief Service for managing admin operations.
 * 
 * This service provides methods for admin-related operations including:
 * - User management (CRUD operations)
 * - System statistics retrieval
 * - Role management
 * - Request handling
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from '../../models/user.model';
import { tap, map } from 'rxjs/operators';

export type { User } from '../../models/user.model';

/**
 * @brief Interface for system statistics
 */
export interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  lastUpdateTime: Date;
}

/**
 * @brief Interface for admin statistics, extends SystemStats with additional metrics
 */
export interface AdminStats extends SystemStats {
  totalSearches: number;
  averageSearchesPerUser: number;
  topSearchTerms: { term: string, count: number }[];
  usersByRole: { role: string, count: number }[];
  newUsersLastMonth: number;
}

/**
 * @brief Interface for role update response
 */
export interface RoleUpdateResponse {
  success: boolean;
  message: string;
  updatedUser: User;
}

/**
 * @brief Interface for admin request
 */
export interface AdminRequest {
  id: string;
  type: string;
  status: string;
  data: any;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * @brief Interface for entity update response
 */
export interface EntityUpdateResponse {
  success: boolean;
  message: string;
  updatedEntity: any;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly adminURL = `${environment.globalBackendUrl}/admin`;

  constructor(private http: HttpClient) {
  }

  /**
   * @brief Retrieves all users from the system.
   * @returns {Observable<User[]>} An observable of user array.
   */
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.adminURL}/users`, { withCredentials: true });
  }

  /**
   * @brief Updates a user's role.
   * @param {string} userId The ID of the user to update.
   * @param {string} newRole The new role to assign.
   * @returns {Observable<RoleUpdateResponse>} An observable of the update result.
   */
  updateUserRole(userId: string, newRole: string): Observable<RoleUpdateResponse> {
    return this.http.put<RoleUpdateResponse>(`${this.adminURL}/users/${userId}/role`, { role: newRole }, { withCredentials: true });
  }

  /**
   * @brief Deletes a user from the system.
   * @param {string} userId The ID of the user to delete.
   * @returns {Observable<{success: boolean, message: string}>} An observable of the deletion result.
   */
  deleteUser(userId: string): Observable<{ success: boolean, message: string }> {
    return this.http.delete<{ success: boolean, message: string }>(`${this.adminURL}/users/${userId}`, { withCredentials: true });
  }

  /**
   * @brief Retrieves system statistics.
   * @returns {Observable<SystemStats>} An observable of system statistics.
   */
  getStatistics(): Observable<SystemStats> {
    return this.http.get<SystemStats>(`${this.adminURL}/statistics`, { withCredentials: true });
  }

  /**
   * @brief Retrieves all admin requests.
   * @returns {Observable<AdminRequest[]>} An observable of admin requests.
   */
  getAllRequests(): Observable<AdminRequest[]> {
    return this.http.get<AdminRequest[]>(`${this.adminURL}/getRequests`, { withCredentials: true });
  }

  /**
   * @brief Updates an entity based on its type and ID.
   * @param {string} type The type of entity to update.
   * @param {string} id The ID of the entity.
   * @param {any} data The update data.
   * @returns {Observable<EntityUpdateResponse>} An observable of the update result.
   */
  updateEntity(type: string, id: string, data: any): Observable<EntityUpdateResponse> {
    return this.http.patch<EntityUpdateResponse>(`${this.adminURL}/updateEntity/${type}/${id}`, data, { withCredentials: true });
  }

  /**
   * @brief Retrieves all available roles.
   * @returns {Observable<string[]>} An observable of role names.
   */
  getAllRoles(): Observable<string[]> {
    return this.http.get<string[]>(`${this.adminURL}/roles`, { withCredentials: true });
  }

  /**
   * @brief Retrieves the current user's role.
   * @returns {Observable<string>} An observable of the current user's role.
   */
  getCurrentUserRole(): Observable<string> {
    return this.http.get<{ role: string }>(`${this.adminURL}/currentUserRole`, { withCredentials: true }).pipe(
      map(response => response.role)
    );
  }

  /**
   * Get extended admin statistics
   * @returns Observable<AdminStats> - The detailed admin statistics
   */
  getAdminStats(): Observable<AdminStats> {
    return this.http.get<AdminStats>(`${this.adminURL}/stats/detailed`, { withCredentials: true });
  }
}