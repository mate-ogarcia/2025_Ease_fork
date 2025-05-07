/**
 * @file history.service.ts
 * @brief Service for managing product search history.
 *
 * This service communicates with the backend to store and retrieve
 * the history of searches performed by the user.
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, of, tap, BehaviorSubject, map } from 'rxjs';
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
 * @interface PaginatedHistory
 * @brief Interface for paginated history response
 */
export interface PaginatedHistory {
  items: SearchHistoryItem[];
  total: number;
  page: number;
  pageSize: number;
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

  // Complete data and pagination
  private allHistoryItems: SearchHistoryItem[] = [];
  private historyItemsSubject = new BehaviorSubject<SearchHistoryItem[]>([]);
  private totalItemsSubject = new BehaviorSubject<number>(0);
  private currentPageSubject = new BehaviorSubject<number>(1);
  private pageSizeSubject = new BehaviorSubject<number>(10);

  historyItems$ = this.historyItemsSubject.asObservable();
  totalItems$ = this.totalItemsSubject.asObservable();
  currentPage$ = this.currentPageSubject.asObservable();
  pageSize$ = this.pageSizeSubject.asObservable();

  /**
   * @brief Constructor for the history service
   * @param http HttpClient service for API requests
   * @param authService Authentication service to get current user ID
   */
  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    // Load saved page size from localStorage if available
    try {
      const savedPageSize = localStorage.getItem('historyPageSize');
      if (savedPageSize) {
        const parsedSize = parseInt(savedPageSize, 10);
        if (!isNaN(parsedSize) && parsedSize > 0) {
          this.pageSizeSubject.next(parsedSize);
        }
      }
    } catch (error) {
      // Error handling silently fails, but service continues
    }
  }

  /**
   * @brief Adds an item to the search history
   * @param productId ID of the searched product
   * @param productName Name of the searched product
   * @returns Observable of the server response
   */
  addToHistory(productId: string, productName: string): Observable<any> {
    // Parameter validation
    if (!productId || !productName) {
      return of(null);
    }

    const userInfo = this.authService.getUserInfo();
    const userId = userInfo?.userId || userInfo?.id || userInfo?.email;

    if (!userId) {
      return of(null);
    }

    const historyItem: SearchHistoryItem = {
      userId,
      productId,
      productName,
      searchDate: new Date().toISOString()
    };

    return this.http.post(`${this.apiUrl}/add`, historyItem, { withCredentials: true }).pipe(
      tap(() => {
        // Refresh after adding
        this.loadUserHistory();
      }),
      catchError(() => {
        return of(null);
      })
    );
  }

  /**
   * @brief Loads all user history and applies client-side pagination
   * @returns Observable containing the paginated items
   */
  loadUserHistory(): Observable<PaginatedHistory> {
    const userInfo = this.authService.getUserInfo();
    const userId = userInfo?.userId || userInfo?.id || userInfo?.email;

    if (!userId) {
      this.allHistoryItems = [];
      this.updatePaginatedData();
      return of({ items: [], total: 0, page: 1, pageSize: 10 });
    }

    return this.http.get<SearchHistoryItem[]>(`${this.apiUrl}/user/${userId}`, { withCredentials: true }).pipe(
      tap(results => {
        this.allHistoryItems = results || [];
        this.totalItemsSubject.next(this.allHistoryItems.length);
        this.updatePaginatedData();
      }),
      map(results => {
        const page = this.currentPageSubject.value;
        const pageSize = this.pageSizeSubject.value;
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;

        return {
          items: this.allHistoryItems.slice(startIndex, endIndex),
          total: this.allHistoryItems.length,
          page,
          pageSize
        };
      }),
      catchError(() => {
        this.allHistoryItems = [];
        this.updatePaginatedData();
        return of({ items: [], total: 0, page: 1, pageSize: 10 });
      })
    );
  }

  /**
   * @brief Updates the paginated data based on current page and size
   * @private
   */
  private updatePaginatedData(): void {
    const page = this.currentPageSubject.value;
    const pageSize = this.pageSizeSubject.value;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    // Slice the array to get only the items for current page
    const paginatedItems = this.allHistoryItems.slice(startIndex, endIndex);
    this.historyItemsSubject.next(paginatedItems);
  }

  /**
   * @brief Updates the current page without making an API call
   * @param page The page number (starts at 1)
   */
  setPage(page: number): void {
    if (page < 1) {
      return;
    }

    const maxPage = Math.ceil(this.allHistoryItems.length / this.pageSizeSubject.value) || 1;
    if (page > maxPage) {
      page = maxPage;
    }

    this.currentPageSubject.next(page);
    this.updatePaginatedData();
  }

  /**
   * @brief Updates the page size without making an API call
   * @param pageSize The new page size
   */
  setPageSize(pageSize: number): void {
    if (pageSize <= 0) {
      return;
    }

    // Update the page size subject
    this.pageSizeSubject.next(pageSize);

    // Update pagination data with new page size
    this.updatePaginatedData();
  }

  /**
   * @brief For compatibility with existing code
   * @deprecated Use loadUserHistory instead
   */
  getUserHistoryPaginated(page: number = 1, pageSize: number = 10): Observable<PaginatedHistory> {
    this.currentPageSubject.next(page);
    this.pageSizeSubject.next(pageSize);

    // If we already have loaded data, just update the pagination
    if (this.allHistoryItems.length > 0) {
      this.updatePaginatedData();
      return of({
        items: this.historyItemsSubject.value,
        total: this.allHistoryItems.length,
        page,
        pageSize
      });
    }

    // Otherwise load all the data
    return this.loadUserHistory();
  }

  /**
   * @brief Deletes a specific history item
   * @param historyId ID of the history item to delete
   * @returns Observable of the server response
   */
  deleteHistoryItem(historyId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${historyId}`, { withCredentials: true }).pipe(
      tap(() => {
        // Refresh data after deletion
        this.loadUserHistory().subscribe();
      }),
      catchError(() => {
        return of({ success: false });
      })
    );
  }

  /**
   * @brief Clears all history items for the current user
   * @returns Observable of the server response
   */
  clearUserHistory(): Observable<any> {
    const userInfo = this.authService.getUserInfo();
    const userId = userInfo?.userId || userInfo?.id || userInfo?.email;

    if (!userId) {
      this.clearLocalCache();
      return of({ success: false, message: 'No user ID available' });
    }

    return this.http.delete(`${this.apiUrl}/user/${userId}/all`, { withCredentials: true }).pipe(
      tap(() => {
        this.clearLocalCache();
      }),
      catchError(() => {
        return of({ success: false });
      })
    );
  }

  /**
   * @brief Clears the local history cache
   * @private
   */
  private clearLocalCache(): void {
    this.allHistoryItems = [];
    this.historyItemsSubject.next([]);
    this.totalItemsSubject.next(0);
    this.currentPageSubject.next(1);
  }
}
