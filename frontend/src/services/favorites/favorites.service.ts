/**
 * @file favorites.service.ts
 * @brief Service for managing user's favorite products.
 * 
 * This service provides methods to add/remove products from favorites,
 * retrieve a user's list of favorites, and check if a product is in the user's favorites.
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { NotificationService } from '../notification/notification.service';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  // Use globalBackendUrl instead of backendUrl to avoid the /data prefix
  private readonly favoritesUrl = `${environment.globalBackendUrl}/favorites`;

  // Observable source for favorites status
  private favoriteProductsSubject = new BehaviorSubject<string[]>([]);
  favoriteProducts$ = this.favoriteProductsSubject.asObservable();

  // In-memory cache to minimize API calls
  private cachedFavorites: Map<string, boolean> = new Map();

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService,
    private authService: AuthService
  ) {
    // Load favorites from API when user is authenticated
    this.authService.isAuthenticated().subscribe(isAuthenticated => {
      if (isAuthenticated) {
        this.loadFavorites().subscribe();
      } else {
        // Reset favorites if user is not authenticated
        this.favoriteProductsSubject.next([]);
        this.cachedFavorites.clear();
      }
    });
  }

  /**
   * @brief Loads all favorite products for the authenticated user.
   * @returns {Observable<any[]>} An observable of favorite products.
   */
  loadFavorites(): Observable<any[]> {
    return this.http.get<any[]>(this.favoritesUrl, { withCredentials: true }).pipe(
      tap(favorites => {
        const productIds = favorites.map(fav => fav.productId);
        this.favoriteProductsSubject.next(productIds);
        this.cachedFavorites.clear();
        productIds.forEach(id => this.cachedFavorites.set(id, true));
      }),
      catchError(error => {
        // In case of error, use an empty array
        this.favoriteProductsSubject.next([]);
        return of([]);
      })
    );
  }

  /**
   * @brief Adds a product to the user's favorites.
   * @param {string} productId The ID of the product to add to favorites.
   * @returns {Observable<any>} An observable of the result.
   */
  addToFavorites(productId: string): Observable<any> {
    return this.http.post<any>(`${this.favoritesUrl}/${productId}`, {}, { withCredentials: true }).pipe(
      tap(response => {
        if (!response.exists) {
          this.notificationService.showSuccess('Product added to favorites');
        }

        // Update local state
        const currentFavorites = this.favoriteProductsSubject.value;
        if (!currentFavorites.includes(productId)) {
          this.favoriteProductsSubject.next([...currentFavorites, productId]);
          this.cachedFavorites.set(productId, true);
        }
      }),
      catchError(error => {
        if (error.status === 401) {
          this.notificationService.showWarning('Please login to add favorites');
        }
        this.notificationService.showError('Error adding to favorites');
        return of(null);
      })
    );
  }

  /**
   * @brief Removes a product from the user's favorites.
   * @param {string} productId The ID of the product to remove from favorites.
   * @returns {Observable<any>} An observable of the result.
   */
  removeFromFavorites(productId: string): Observable<any> {
    return this.http.delete<any>(`${this.favoritesUrl}/${productId}`, { withCredentials: true }).pipe(
      tap(() => {
        this.notificationService.showSuccess('Product removed from favorites');

        // Update local state
        const currentFavorites = this.favoriteProductsSubject.value;
        this.favoriteProductsSubject.next(
          currentFavorites.filter(id => id !== productId)
        );
        this.cachedFavorites.delete(productId);
      }),
      catchError(error => {
        if (error.status === 401) {
          this.notificationService.showWarning('Please login to manage your favorites');
        }
        this.notificationService.showError('Error removing from favorites');
        return of(null);
      })
    );
  }

  /**
   * @brief Checks if a product is in the user's favorites.
   * @param {string} productId The ID of the product to check.
   * @returns {Observable<boolean>} An observable that emits true if the product is in favorites.
   */
  isProductInFavorites(productId: string): Observable<boolean> {
    // Check if user is authenticated first
    if (!this.authService.getUserInfo()) {
      return of(false);
    }

    // Check cache first to avoid unnecessary API calls
    if (this.cachedFavorites.has(productId)) {
      const isFavorite = this.cachedFavorites.get(productId) as boolean;
      return of(isFavorite);
    }

    return this.http.get<{ isFavorite: boolean }>(`${this.favoritesUrl}/${productId}/check`, { withCredentials: true }).pipe(
      map(response => response.isFavorite),
      tap(isFavorite => {
        // Update cache
        this.cachedFavorites.set(productId, isFavorite);
      }),
      catchError(error => {
        // In case of error, assume it's not a favorite
        this.cachedFavorites.set(productId, false);
        return of(false);
      })
    );
  }

  /**
   * @brief Toggles a product's favorite status.
   * @param {string} productId The ID of the product to toggle.
   * @returns {Observable<any>} An observable of the result.
   */
  toggleFavorite(productId: string): Observable<any> {
    // Check if product is already in favorites using cached state
    const isCurrentlyFavorite = this.favoriteProductsSubject.value.includes(productId);

    if (isCurrentlyFavorite) {
      return this.removeFromFavorites(productId);
    } else {
      return this.addToFavorites(productId);
    }
  }

  /**
   * @brief Force refresh of favorites from the backend
   */
  refreshFavorites(): void {
    this.loadFavorites().subscribe();
  }

  /**
   * @brief Get product details - now using backend API
   * @param productId The product ID
   * @returns Observable with product details
   */
  getProductDetails(productId: string): Observable<any> {
    return this.http.get<any>(`${environment.globalBackendUrl}/products/${productId}`).pipe(
      catchError(error => {
        return of(null);
      })
    );
  }
} 