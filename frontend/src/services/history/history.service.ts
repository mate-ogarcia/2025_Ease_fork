/**
 * @file history.service.ts
 * @brief Service for managing product search history.
 *
 * This service communicates with the backend to store and retrieve
 * the history of searches performed by the user.
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from '../auth/auth.service';

/**
 * @interface SearchHistoryItem
 * @brief Interface representing a search history item
 */
export interface SearchHistoryItem {
  id?: string;
  userId: string;
  productId: string;   // Product ID for navigation to its page
  productName: string; // Product name or search term
  searchDate: string;  // Date of the search
  _default?: {         // Nested structure sometimes present in Couchbase
    id?: string;
    userId?: string;
    productId?: string;
    productName?: string;
    searchDate?: string;
  };
}

/**
 * @class HistoryService
 * @brief Service that manages user search history
 */
@Injectable({
  providedIn: 'root'
})
export class HistoryService {
  private apiUrl = `${environment.globalBackendUrl}/history`;

  /**
   * @brief Constructor for the history service
   * @param http HttpClient service for API requests
   * @param authService Authentication service to get current user ID
   */
  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    console.log('🔍 HistoryService initialized - API URL:', this.apiUrl);
  }

  /**
   * @brief Adds an item to the search history
   * @param productId ID of the searched product
   * @param productName Name of the searched product
   * @returns Observable of the server response
   */
  addToHistory(productId: string, productName: string): Observable<any> {
    console.log('🔍 addToHistory called with:', { productId, productName });

    // Parameter validation
    if (!productId || !productName) {
      console.warn('⚠️ productId or productName missing:', { productId, productName });
      return of(null);
    }

    const userInfo = this.authService.getUserInfo();
    console.log('🔍 User info retrieved:', userInfo);

    const userId = userInfo?.userId || userInfo?.id || userInfo?.email;

    if (!userId) {
      console.warn('⚠️ User not logged in or ID missing:', userInfo);
      return of(null);
    }

    console.log('🔍 userId identified:', userId);

    const historyItem: SearchHistoryItem = {
      userId,
      productId,
      productName,
      searchDate: new Date().toISOString()
    };

    console.log('🔍 Sending POST request to:', `${this.apiUrl}/add`);
    console.log('🔍 Data sent:', historyItem);

    return this.http.post(`${this.apiUrl}/add`, historyItem).pipe(
      tap(response => console.log('✅ History successfully recorded. Response:', response)),
      catchError(error => {
        console.error('❌ Error adding to history:', error);
        console.error('❌ Details:', error.status, error.message, error.error);
        return of(null);
      })
    );
  }

  /**
   * @brief Retrieves the search history of the current user
   * @returns Observable containing history items
   */
  getUserHistory(): Observable<SearchHistoryItem[]> {
    console.log('🔍 getUserHistory called - Debug logs start');

    const userInfo = this.authService.getUserInfo();
    console.log('🔍 User info retrieved:', userInfo);

    const userId = userInfo?.userId || userInfo?.id || userInfo?.email;

    if (!userId) {
      console.warn('⚠️ User not logged in or ID missing:', userInfo);
      return of([]);
    }

    console.log('🔍 userId identified:', userId);
    console.log('🔍 Sending GET request to:', `${this.apiUrl}/user/${userId}`);

    // Check if there's history cached locally
    const cachedHistory = localStorage.getItem('searchHistory');
    if (cachedHistory) {
      console.warn('⚠️ History found in localStorage:', cachedHistory);
      try {
        // Clear to avoid issues
        localStorage.removeItem('searchHistory');
      } catch (e) {
        console.error('❌ Error removing cache:', e);
      }
    }

    // Check sessionStorage as well
    const sessionHistory = sessionStorage.getItem('searchHistory');
    if (sessionHistory) {
      console.warn('⚠️ History found in sessionStorage:', sessionHistory);
      try {
        // Clear to avoid issues
        sessionStorage.removeItem('searchHistory');
      } catch (e) {
        console.error('❌ Error removing session cache:', e);
      }
    }

    return this.http.get<SearchHistoryItem[]>(`${this.apiUrl}/user/${userId}`).pipe(
      tap(items => {
        console.log('✅ API: History successfully retrieved. Number of items:', items.length);
        console.log('✅ API: History content:', JSON.stringify(items, null, 2));
      }),
      catchError(error => {
        console.error('❌ Error retrieving history:', error);
        console.error('❌ Details:', error.status, error.message, error.error);
        return of([]);
      })
    );
  }

  /**
   * @brief Deletes a specific history item
   * @param historyId ID of the history item to delete
   * @returns Observable of the server response
   */
  deleteHistoryItem(historyId: string): Observable<any> {
    console.log('🔍 deleteHistoryItem called for ID:', historyId);
    console.log('🔍 Sending DELETE request to:', `${this.apiUrl}/${historyId}`);

    return this.http.delete(`${this.apiUrl}/${historyId}`).pipe(
      tap(response => console.log('✅ History item successfully deleted. Response:', response)),
      catchError(error => {
        console.error('❌ Error deleting history item:', error);
        console.error('❌ Details:', error.status, error.message, error.error);
        return of(null);
      })
    );
  }

  /**
   * @brief Clears all history of the current user
   * @returns Observable of the server response
   */
  clearUserHistory(): Observable<any> {
    console.log('🔍 clearUserHistory called');

    const userInfo = this.authService.getUserInfo();
    console.log('🔍 User info retrieved:', userInfo);

    const userId = userInfo?.userId || userInfo?.id || userInfo?.email;

    if (!userId) {
      console.warn('⚠️ User not logged in or ID missing:', userInfo);
      return of(null);
    }

    console.log('🔍 userId identified:', userId);
    console.log('🔍 Sending DELETE request to:', `${this.apiUrl}/user/${userId}/clear`);

    return this.http.delete(`${this.apiUrl}/user/${userId}/clear`).pipe(
      tap(response => console.log('✅ History completely deleted successfully. Response:', response)),
      catchError(error => {
        console.error('❌ Error deleting history:', error);
        console.error('❌ Details:', error.status, error.message, error.error);
        return of(null);
      })
    );
  }
}
