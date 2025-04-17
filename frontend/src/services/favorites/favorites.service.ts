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
  // Utiliser globalBackendUrl au lieu de backendUrl pour éviter le préfixe /data
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
    // Charger les favoris depuis l'API lorsque l'utilisateur est authentifié
    this.authService.isAuthenticated().subscribe(isAuthenticated => {
      if (isAuthenticated) {
        this.loadFavorites().subscribe();
      } else {
        // Réinitialiser les favoris si l'utilisateur n'est pas authentifié
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
    return this.http.get<any[]>(this.favoritesUrl).pipe(
      tap(favorites => {
        const productIds = favorites.map(fav => fav.productId);
        this.favoriteProductsSubject.next(productIds);
        this.cachedFavorites.clear();
        productIds.forEach(id => this.cachedFavorites.set(id, true));
      }),
      catchError(error => {
        // En cas d'erreur, on utilise un tableau vide
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
    return this.http.post<any>(`${this.favoritesUrl}/${productId}`, {}).pipe(
      tap(response => {
        if (!response.exists) {
          this.notificationService.showSuccess('Produit ajouté aux favoris');
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
          this.notificationService.showWarning('Veuillez vous connecter pour ajouter des favoris');
        }
        this.notificationService.showError('Erreur lors de l\'ajout aux favoris');
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
    return this.http.delete<any>(`${this.favoritesUrl}/${productId}`).pipe(
      tap(() => {
        this.notificationService.showSuccess('Produit retiré des favoris');

        // Update local state
        const currentFavorites = this.favoriteProductsSubject.value;
        this.favoriteProductsSubject.next(
          currentFavorites.filter(id => id !== productId)
        );
        this.cachedFavorites.delete(productId);
      }),
      catchError(error => {
        if (error.status === 401) {
          this.notificationService.showWarning('Veuillez vous connecter pour gérer vos favoris');
        }
        this.notificationService.showError('Erreur lors de la suppression des favoris');
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
    // Check cache first to avoid unnecessary API calls
    if (this.cachedFavorites.has(productId)) {
      const isFavorite = this.cachedFavorites.get(productId) as boolean;
      return of(isFavorite);
    }

    return this.http.get<{ isFavorite: boolean }>(`${this.favoritesUrl}/${productId}/check`).pipe(
      map(response => response.isFavorite),
      tap(isFavorite => {
        // Update cache
        this.cachedFavorites.set(productId, isFavorite);
      }),
      catchError(error => {
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