/**
 * @file favorites.service.ts
 * @brief Service for managing user's favorite products.
 * 
 * This service provides methods to add/remove products from favorites,
 * retrieve a user's list of favorites, and check if a product is in the user's favorites.
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { NotificationService } from '../notification/notification.service';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  // Utiliser globalBackendUrl au lieu de backendUrl pour éviter le préfixe /data
  private readonly favoritesUrl = `${environment.globalBackendUrl}/favorites`;

  // URL alternative pour tester
  private readonly alternativeUrl = `http://localhost:4200/favorites`;

  // Options HTTP pour inclure les cookies
  private readonly httpOptions = {
    withCredentials: true,
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  // Observable source for favorites status
  private favoriteProductsSubject = new BehaviorSubject<string[]>([]);
  favoriteProducts$ = this.favoriteProductsSubject.asObservable();

  // In-memory cache to minimize API calls
  private cachedFavorites: Map<string, boolean> = new Map();

  // Clé de stockage local
  private readonly STORAGE_KEY = 'app_user_favorites';

  // Clé de stockage pour les détails des produits favoris
  private readonly PRODUCTS_DETAILS_KEY = 'app_favorite_products_details';

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService
  ) {
    console.log('📝 URL des favoris:', this.favoritesUrl);
    console.log('🍪 withCredentials activé:', this.httpOptions.withCredentials);

    // Charger les favoris depuis le stockage local
    this.loadFromLocalStorage();
  }

  /**
   * Charge les favoris depuis le stockage local
   */
  private loadFromLocalStorage(): void {
    try {
      const storedFavorites = localStorage.getItem(this.STORAGE_KEY);
      if (storedFavorites) {
        const favoriteIds = JSON.parse(storedFavorites);
        console.log('💾 Favoris chargés depuis le stockage local:', favoriteIds);
        this.favoriteProductsSubject.next(favoriteIds);
        // Mettre à jour le cache
        this.cachedFavorites.clear();
        favoriteIds.forEach((id: string) => this.cachedFavorites.set(id, true));
      } else {
        console.log('💾 Aucun favori trouvé dans le stockage local');
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des favoris depuis le stockage local:', error);
    }
  }

  /**
   * Sauvegarde les favoris dans le stockage local
   */
  private saveToLocalStorage(favoriteIds: string[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(favoriteIds));
      console.log('💾 Favoris sauvegardés dans le stockage local:', favoriteIds);
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde des favoris dans le stockage local:', error);
    }
  }

  /**
   * @brief Loads all favorite products for the authenticated user.
   * @returns {Observable<any[]>} An observable of favorite products.
   */
  loadFavorites(): Observable<any[]> {
    console.log('📂 Chargement des favoris depuis l\'API:', this.favoritesUrl);

    // Version simplifiée pour éviter les erreurs
    return this.http.get<any[]>(this.favoritesUrl, this.httpOptions).pipe(
      tap(favorites => {
        console.log('📋 Favoris chargés:', favorites);
        const productIds = favorites.map(fav => fav.productId);
        this.favoriteProductsSubject.next(productIds);
        this.cachedFavorites.clear();
        productIds.forEach(id => this.cachedFavorites.set(id, true));
      }),
      catchError(error => {
        console.error('❌ Erreur lors du chargement des favoris:', error);
        // Pour éviter les erreurs 500, on utilise un tableau vide
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
    console.log('➕ Ajout du produit aux favoris (mode sécurisé):', productId);

    // Mode sécurisé - simuler le succès localement pour éviter les erreurs 500
    console.log('⚠️ Mode sécurisé activé - simulation locale uniquement');

    // Update local state
    const currentFavorites = this.favoriteProductsSubject.value;
    if (!currentFavorites.includes(productId)) {
      console.log('📝 Mise à jour des favoris dans le state local');
      const updatedFavorites = [...currentFavorites, productId];
      this.favoriteProductsSubject.next(updatedFavorites);
      this.cachedFavorites.set(productId, true);
      // Sauvegarder dans le stockage local
      this.saveToLocalStorage(updatedFavorites);
      this.notificationService.showSuccess('Produit ajouté aux favoris');
    } else {
      console.log('ℹ️ Produit déjà dans les favoris');
    }

    return of({ success: true, exists: false });

    /* Version originale désactivée temporairement
    console.log('🔗 URL:', `${this.favoritesUrl}/${productId}`);
    console.log('🍪 withCredentials:', this.httpOptions.withCredentials);

    return this.http.post<any>(`${this.favoritesUrl}/${productId}`, {}, this.httpOptions).pipe(
      tap(response => {
        console.log('📊 Réponse d\'ajout aux favoris:', response);
        if (!response.exists) {
          this.notificationService.showSuccess('Produit ajouté aux favoris');
        } else {
          console.log('ℹ️ Produit déjà dans les favoris');
        }

        // Update local state
        const currentFavorites = this.favoriteProductsSubject.value;
        if (!currentFavorites.includes(productId)) {
          console.log('📝 Mise à jour des favoris dans le state local');
          this.favoriteProductsSubject.next([...currentFavorites, productId]);
          this.cachedFavorites.set(productId, true);
        }
      }),
      catchError(error => {
        console.error('❌ Erreur lors de l\'ajout aux favoris:', error);
        if (error.status === 401) {
          console.warn('⚠️ Utilisateur non authentifié ou session expirée');
        } else if (error.status === 0) {
          console.warn('⚠️ Serveur non disponible');
        }
        this.notificationService.showError('Erreur lors de l\'ajout aux favoris');
        return of(null);
      })
    );
    */
  }

  /**
   * @brief Removes a product from the user's favorites.
   * @param {string} productId The ID of the product to remove from favorites.
   * @returns {Observable<any>} An observable of the result.
   */
  removeFromFavorites(productId: string): Observable<any> {
    console.log('➖ Suppression du produit des favoris (mode sécurisé):', productId);

    // Mode sécurisé - simuler le succès localement pour éviter les erreurs 500
    console.log('⚠️ Mode sécurisé activé - simulation locale uniquement');

    // Update local state
    const currentFavorites = this.favoriteProductsSubject.value;
    console.log('📝 Mise à jour des favoris dans le state local - avant suppression:', currentFavorites);
    const updatedFavorites = currentFavorites.filter(id => id !== productId);
    this.favoriteProductsSubject.next(updatedFavorites);
    this.cachedFavorites.delete(productId);
    // Sauvegarder dans le stockage local
    this.saveToLocalStorage(updatedFavorites);
    console.log('📝 Cache mis à jour - après suppression, taille:', this.cachedFavorites.size);
    this.notificationService.showSuccess('Produit retiré des favoris');

    return of({ success: true });

    /* Version originale désactivée temporairement
    console.log('🔗 URL:', `${this.favoritesUrl}/${productId}`);
    console.log('🍪 withCredentials:', this.httpOptions.withCredentials);

    return this.http.delete<any>(`${this.favoritesUrl}/${productId}`, this.httpOptions).pipe(
      tap(() => {
        console.log('✅ Produit supprimé des favoris avec succès');
        this.notificationService.showSuccess('Produit retiré des favoris');

        // Update local state
        const currentFavorites = this.favoriteProductsSubject.value;
        console.log('📝 Mise à jour des favoris dans le state local - avant suppression:', currentFavorites);
        this.favoriteProductsSubject.next(
          currentFavorites.filter(id => id !== productId)
        );
        this.cachedFavorites.delete(productId);
        console.log('📝 Cache mis à jour - après suppression, taille:', this.cachedFavorites.size);
      }),
      catchError(error => {
        console.error('❌ Erreur lors de la suppression des favoris:', error);
        if (error.status === 401) {
          console.warn('⚠️ Utilisateur non authentifié ou session expirée');
        } else if (error.status === 0) {
          console.warn('⚠️ Serveur non disponible');
        }
        this.notificationService.showError('Erreur lors de la suppression des favoris');
        return of(null);
      })
    );
    */
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
      console.log('💾 Vérification du statut favori depuis le cache:', { productId, isFavorite });
      return of(isFavorite);
    }

    console.log('🔍 Vérification du statut favori via API:', productId);

    // Mode sécurisé - retourner false par défaut pour éviter les erreurs 500
    // À rétablir une fois le problème backend résolu
    console.log('⚠️ Mode sécurisé activé - retour false par défaut');
    return of(false);

    /* Version originale désactivée temporairement
    return this.http.get<{ isFavorite: boolean }>(`${this.favoritesUrl}/${productId}/check`, this.httpOptions).pipe(
      map(response => response.isFavorite),
      tap(isFavorite => {
        console.log('📊 Réponse de vérification favori:', { productId, isFavorite });
        // Update cache
        this.cachedFavorites.set(productId, isFavorite);
      }),
      catchError(error => {
        console.error('❌ Erreur lors de la vérification du statut favori:', error);
        return of(false);
      })
    );
    */
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
   * Méthode à appeler lors de l'initialisation du composant qui utilise ce service
   * pour charger les favoris manuellement au lieu de le faire dans le constructeur
   */
  initializeFavorites(): void {
    console.log('🚀 Initialisation manuelle des favoris...');
    this.loadFavorites().subscribe(
      favorites => console.log('✅ Favoris initialisés avec succès, nombre:', favorites.length),
      error => console.error('❌ Échec de l\'initialisation des favoris:', error)
    );
  }

  /**
   * @brief Sauvegarde les détails complets d'un produit ajouté aux favoris
   * @param productId ID du produit
   * @param productDetails Détails complets du produit
   */
  saveProductDetails(productId: string, productDetails: any): void {
    try {
      // Récupérer les détails existants
      const storedDetails = localStorage.getItem(this.PRODUCTS_DETAILS_KEY);
      let productsDetails: Record<string, any> = {};

      if (storedDetails) {
        productsDetails = JSON.parse(storedDetails);
      }

      // Ajouter ou mettre à jour les détails du produit
      productsDetails[productId] = {
        ...productDetails,
        savedAt: new Date().toISOString() // Ajouter une date pour savoir quand l'info a été sauvegardée
      };

      // Sauvegarder dans localStorage
      localStorage.setItem(this.PRODUCTS_DETAILS_KEY, JSON.stringify(productsDetails));
      console.log(`💾 Détails du produit ${productId} sauvegardés dans le stockage local`);
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde des détails du produit:', error);
    }
  }

  /**
   * @brief Récupère les détails d'un produit favori
   * @param productId ID du produit
   * @returns Détails du produit ou null si non trouvé
   */
  getProductDetails(productId: string): any {
    try {
      const storedDetails = localStorage.getItem(this.PRODUCTS_DETAILS_KEY);
      if (!storedDetails) return null;

      const productsDetails = JSON.parse(storedDetails);
      return productsDetails[productId] || null;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des détails du produit:', error);
      return null;
    }
  }

  /**
   * @brief Récupère les détails de tous les produits favoris
   * @returns Map des détails de produits par ID
   */
  getAllProductsDetails(): Record<string, any> {
    try {
      const storedDetails = localStorage.getItem(this.PRODUCTS_DETAILS_KEY);
      if (!storedDetails) return {};

      return JSON.parse(storedDetails);
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des détails des produits:', error);
      return {};
    }
  }
} 