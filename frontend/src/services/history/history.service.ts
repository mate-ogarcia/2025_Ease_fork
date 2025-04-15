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

  // Données complètes et pagination
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
    console.log('[HistoryService] Initialized - API URL:', this.apiUrl);

    // Load saved page size from localStorage if available
    try {
      const savedPageSize = localStorage.getItem('historyPageSize');
      if (savedPageSize) {
        const parsedSize = parseInt(savedPageSize, 10);
        if (!isNaN(parsedSize) && parsedSize > 0) {
          console.log('[HistoryService] Loading saved page size from localStorage:', parsedSize);
          this.pageSizeSubject.next(parsedSize);
        }
      }
    } catch (error) {
      console.error('[HistoryService] Error loading saved page size from localStorage:', error);
    }
  }

  /**
   * @brief Adds an item to the search history
   * @param productId ID of the searched product
   * @param productName Name of the searched product
   * @returns Observable of the server response
   */
  addToHistory(productId: string, productName: string): Observable<any> {
    console.log('[HistoryService] addToHistory called with:', { productId, productName });

    // Parameter validation
    if (!productId || !productName) {
      console.warn('[HistoryService] productId or productName missing:', { productId, productName });
      return of(null);
    }

    const userInfo = this.authService.getUserInfo();
    console.log('[HistoryService] User info retrieved:', userInfo);

    const userId = userInfo?.userId || userInfo?.id || userInfo?.email;

    if (!userId) {
      console.warn('[HistoryService] User not logged in or ID missing:', userInfo);
      return of(null);
    }

    console.log('[HistoryService] userId identified:', userId);

    const historyItem: SearchHistoryItem = {
      userId,
      productId,
      productName,
      searchDate: new Date().toISOString()
    };

    console.log('[HistoryService] Sending POST request to:', `${this.apiUrl}/add`);
    console.log('[HistoryService] Data sent:', historyItem);

    return this.http.post(`${this.apiUrl}/add`, historyItem).pipe(
      tap(response => {
        console.log('[HistoryService] History successfully recorded. Response:', response);
        // Refresh after adding
        this.loadUserHistory();
      }),
      catchError(error => {
        console.error('[HistoryService] Error adding to history:', error);
        console.error('[HistoryService] Details:', error.status, error.message, error.error);
        return of(null);
      })
    );
  }

  /**
   * @brief Loads all user history and applies client-side pagination
   * @returns Observable containing the paginated items
   */
  loadUserHistory(): Observable<PaginatedHistory> {
    console.log('[HistoryService] loadUserHistory called');

    const userInfo = this.authService.getUserInfo();
    console.log('[HistoryService] User info retrieved:', userInfo);

    const userId = userInfo?.userId || userInfo?.id || userInfo?.email;

    if (!userId) {
      console.warn('[HistoryService] User not logged in or ID missing:', userInfo);
      this.allHistoryItems = [];
      this.updatePaginatedData();
      return of({ items: [], total: 0, page: 1, pageSize: 10 });
    }

    return this.http.get<SearchHistoryItem[]>(`${this.apiUrl}/user/${userId}`).pipe(
      tap(results => {
        console.log('[HistoryService] All history retrieved:', results.length, 'items');
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
      catchError(error => {
        console.error('[HistoryService] Error retrieving history:', error);
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

    console.log(`[HistoryService] Pagination: page=${page}, pageSize=${pageSize}, items=${paginatedItems.length}/${this.allHistoryItems.length}`);

    this.historyItemsSubject.next(paginatedItems);
  }

  /**
   * @brief Updates the current page without making an API call
   * @param page The page number (starts at 1)
   */
  setPage(page: number): void {
    if (page < 1) {
      console.warn('[HistoryService] Invalid page number:', page);
      return;
    }

    const maxPage = Math.ceil(this.allHistoryItems.length / this.pageSizeSubject.value) || 1;
    if (page > maxPage) {
      console.warn(`[HistoryService] Page ${page} exceeds max page ${maxPage}`);
      page = maxPage;
    }

    console.log('[HistoryService] Changing to page:', page);
    this.currentPageSubject.next(page);
    this.updatePaginatedData();
  }

  /**
   * @brief Updates the page size without making an API call
   * @param pageSize The new page size
   */
  setPageSize(pageSize: number): void {
    if (pageSize <= 0) {
      console.error('[HistoryService] Invalid page size:', pageSize);
      return;
    }

    const currentSize = this.pageSizeSubject.value;
    console.log('[HistoryService] Changing page size from', currentSize, 'to', pageSize);

    // Update the page size subject
    this.pageSizeSubject.next(pageSize);

    // Update pagination data with new page size
    this.updatePaginatedData();
  }

  /**
   * @brief Pour compatibilité avec le code existant
   * @deprecated Use loadUserHistory instead
   */
  getUserHistoryPaginated(page: number = 1, pageSize: number = 10): Observable<PaginatedHistory> {
    console.log('[HistoryService] getUserHistoryPaginated called - redirecting to loadUserHistory');
    this.currentPageSubject.next(page);
    this.pageSizeSubject.next(pageSize);

    // Si on a déjà chargé les données, juste mettre à jour la pagination
    if (this.allHistoryItems.length > 0) {
      this.updatePaginatedData();
      return of({
        items: this.historyItemsSubject.value,
        total: this.allHistoryItems.length,
        page,
        pageSize
      });
    }

    // Sinon charger toutes les données
    return this.loadUserHistory();
  }

  /**
   * @brief Deletes a specific history item
   * @param historyId ID of the history item to delete
   * @returns Observable of the server response
   */
  deleteHistoryItem(historyId: string): Observable<any> {
    console.log('[HistoryService] deleteHistoryItem called for ID:', historyId);

    return this.http.delete(`${this.apiUrl}/${historyId}`).pipe(
      tap(response => {
        console.log('[HistoryService] History item successfully deleted. Response:', response);
        // Refresh data after deletion
        this.loadUserHistory().subscribe();
      }),
      catchError(error => {
        console.error('[HistoryService] Error deleting history item:', error);
        return of(null);
      })
    );
  }

  /**
   * @brief Clears all history of the current user
   * @returns Observable of the server response
   */
  clearUserHistory(): Observable<any> {
    console.log('[HistoryService] clearUserHistory called');

    const userInfo = this.authService.getUserInfo();
    const userId = userInfo?.userId || userInfo?.id || userInfo?.email;

    if (!userId) {
      console.warn('[HistoryService] User not logged in or ID missing:', userInfo);
      return of(null);
    }

    return this.http.delete(`${this.apiUrl}/user/${userId}/clear`).pipe(
      tap(response => {
        console.log('[HistoryService] History completely deleted successfully. Response:', response);
        // Reset local data
        this.allHistoryItems = [];
        this.historyItemsSubject.next([]);
        this.totalItemsSubject.next(0);
        this.currentPageSubject.next(1);
      }),
      catchError(error => {
        console.error('[HistoryService] Error deleting history:', error);
        return of(null);
      })
    );
  }

  /**
   * @brief Clears any locally cached history data
   * @private
   */
  private clearLocalCache(): void {
    try {
      localStorage.removeItem('searchHistory');
      sessionStorage.removeItem('searchHistory');
    } catch (e) {
      console.error('[HistoryService] Error clearing local cache:', e);
    }
  }
}
