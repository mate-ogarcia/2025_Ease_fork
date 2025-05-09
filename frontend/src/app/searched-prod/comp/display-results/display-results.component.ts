/**
 * @file display-results.component.ts
 * @brief Component for displaying product search results with optional images and view modes.
 *
 * This component displays a list or grid of products with support for:
 * - Loading product images from the Unsplash API if not already provided.
 * - Switching between list and grid views.
 * - Navigating to the product details page.
 *
 */

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { APIUnsplash } from '../../../../services/unsplash/unsplash.service';
import { LikeBtnComponent } from '../like-btn/like-btn.component';
import { FavoritesService } from '../../../../services/favorites/favorites.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../../../../services/auth/auth.service';
import { NotificationService } from '../../../../services/notification/notification.service';

import { InfoBtnComponent } from '../info-btn/info-btn.component';

/**
 * @class DisplayResultsComponent
 * @brief Handles displaying search results with dynamic images and view mode toggling.
 *
 * This component:
 * - Loads product search results from the navigation state.
 * - Fetches images from Unsplash for products lacking images.
 * - Provides view toggling between list and grid displays.
 */
@Component({
  selector: 'app-display-results',
  standalone: true,
  imports: [CommonModule, LikeBtnComponent, InfoBtnComponent],
  templateUrl: './display-results.component.html',
  styleUrls: ['./display-results.component.css'],
})
export class DisplayResultsComponent implements OnInit {
  resultsArray: any[] = []; // Array of product results to display.
  viewMode: 'list' | 'grid' = 'list'; // View mode state: 'list' (default) or 'grid'.
  isAuthenticated = false; // User authentication state

  /**
   * @constructor
   * @param router Angular router for navigation.
   * @param unsplashService Service for fetching images from Unsplash.
   * @param favoritesService Service for managing favorites
   * @param authService Service for managing authentication
   * @param notificationService Service for managing notifications
   */
  constructor(
    private router: Router,
    private APIUnsplash: APIUnsplash,
    private favoritesService: FavoritesService,
    private authService: AuthService,
    private notificationService: NotificationService
  ) { }

  /**
   * @brief Initializes the component and loads product results.
   *
   * - Retrieves the product array from the navigation state.
   * - Fetches images from Unsplash for products without an existing image.
   * - Checks if products are in the user's favorites
   *
   * @returns {void}
   */
  ngOnInit(): void {
    this.resultsArray = history.state.resultsArray || [];

    // Check authentication state
    this.authService.isAuthenticated().subscribe((isAuth) => {
      this.isAuthenticated = isAuth;

      // If user is authenticated, load favorite states
      if (isAuth) {
        this.loadFavoriteStates();
      }
    });

    // Load product images
    this.loadProductImages();
  }

  /**
   * @brief Loads images for each product that doesn't have one
   */
  private loadProductImages(): void {
    this.resultsArray.forEach((product) => {
      if (!product?.image && product?.name) {
        this.APIUnsplash.searchPhotos(product.name).subscribe({
          next: (response) => {
            if (response.imageUrl) {
              product.image = response.imageUrl;
            } else {
              // Don't set a default image that doesn't exist
              product.image = null;
            }
          },
          error: (err) => {
            console.error(
              `Erreur de récupération d'image pour ${product.name}:`,
              err
            );
            // Don't set a default image that doesn't exist
            product.image = null;
          },
        });
      }
    });
  }

  /**
   * @brief Loads favorite states for all displayed products
   */
  private loadFavoriteStates(): void {
    // Temporarily disable automatic loading of favorites to avoid 500 error
    // We'll simulate as if no favorites were initially present
    this.resultsArray.forEach((product) => {
      // By default, no product is a favorite
      product.liked = false;
    });

    // This part will remain active to update the UI when favorites change
    this.favoritesService.favoriteProducts$.subscribe(favoriteIds => {
      this.resultsArray.forEach(product => {
        const isLiked = favoriteIds.includes(product.id);
        if (product.liked !== isLiked) {
          console.log(
            `Mise à jour de l'état du produit ${product.id}: ${product.liked} -> ${isLiked}`
          );
          product.liked = isLiked;
        }
      });
    });

    // We're not loading favorites for now because of the 500 error
    // this.favoritesService.initializeFavorites();
  }

  /**
   * @brief Sets the display mode for the results view.
   *
   * @param mode The desired view mode: 'list' or 'grid'.
   */
  setViewMode(mode: 'list' | 'grid'): void {
    this.viewMode = mode;
  }

  /**
   * @brief Navigates to the product detail page.
   *
   * @param product The product object containing the product ID.
   * @throws {Error} Logs a warning if the product ID is missing.
   */
  goToProduct(product: any): void {
    if (product?.id) {
      this.router
        .navigate([`/products-alternative/${product.id}/${product.source}`])
        .then(() =>
          console.log(
            `Navigated to /products-alternative/${product.id}/${product.source}`
          )
        )
        .catch((error) => console.error('❌ Navigation error:', error));
    } else {
      console.warn('Invalid product or missing ID');
    }
  }

  /**
   * @brief Navigates to the selected product's page.
   * @param product The selected product object.
   */
  goToInfoProduct(product: any) {
    if (product?.id) {
      this.router
        .navigate([`/product-page/${product.id}/${product.source}`])
        .catch((error) => {
          console.error('Navigation error:', error);
        });
    } else {
      console.warn('Invalid product or missing ID');
    }
  }

  /**
   * @brief Handles the like button toggle event
   * @param product The concerned product
   */
  onLikeToggled(product: any): void {
    console.log('Bouton "J\'aime" cliqué pour:', {
      productId: product.id,
      productName: product.name,
      newState: product.liked ? 'aimé' : 'non aimé',
    });

    // Check if the user is logged in using the current value
    if (!this.isAuthenticated) {
      console.warn(
        'Utilisateur non connecté - Redirection vers la page de connexion'
      );
      this.notificationService.showWarning(
        'Veuillez vous connecter pour ajouter des favoris'
      );
      product.liked = false; // Reset the visual status
      this.router.navigate(['/login']);
      return;
    }

    // Get current state if not defined
    if (product.liked === undefined) {
      this.favoritesService.isProductInFavorites(product.id).subscribe(
        (isLiked) => {
          product.liked = isLiked;
          console.log(
            `Produit ${product.id} - État favori initial: ${isLiked ? 'aimé' : 'non aimé'
            }`
          );
          this.toggleFavoriteState(product);
        },
        (error) => {
          console.error(
            'Erreur lors de la vérification du statut favori:',
            error
          );
          product.liked = false; // By default, consider as not liked in case of error
        }
      );
    } else {
      this.toggleFavoriteState(product);
    }
  }

  private toggleFavoriteState(product: any): void {
    if (product.liked) {
      console.log(
        `Suppression du produit ${product.id} (${product.name}) des favoris`
      );
      this.favoritesService.removeFromFavorites(product.id).subscribe(
        () => {
          console.log(
            `Produit ${product.id} supprimé des favoris avec succès`
          );
          product.liked = false;
        },
        (error) => {
          console.error(
            `Erreur lors de la suppression du produit ${product.id} des favoris:`,
            error
          );
          if (error.status === 401) {
            console.warn('Session expirée ou token invalide');
            this.notificationService.showWarning(
              'Votre session a expiré, veuillez vous reconnecter'
            );
            this.router.navigate(['/login']);
          }
          // Restore visual state in case of error
          product.liked = true;
        }
      );
    } else {
      console.log(
        `Ajout du produit ${product.id} (${product.name}) aux favoris`
      );
      // Product details are automatically saved by the backend
      this.favoritesService.addToFavorites(product.id).subscribe(
        response => {
          console.log(`Produit ${product.id} ajouté aux favoris avec succès`, response);
          product.liked = true;
        },
        error => {
          console.error(`Erreur lors de l'ajout du produit ${product.id} aux favoris:`, error);
          if (error.status === 401) {
            console.warn('Session expirée ou token invalide');
            this.notificationService.showWarning(
              'Votre session a expiré, veuillez vous reconnecter'
            );
            this.router.navigate(['/login']);
          }
          // Restore visual state in case of error
          product.liked = false;
        }
      );
    }
  }

  /**
   * @brief Track function for NgFor to improve performance
   */
  trackByProduct(index: number, product: any): any {
    return product?.id || index;
  }

  /**
   * @brief Handles image loading errors
   * @param event Error event
   */
  handleImageError(event: any): void {
    const img = event.target;
    img.style.display = 'none'; // Hide the failed img element

    // We can also add a background color to the parent element
    const parentDiv = img.parentElement;
    if (parentDiv) {
      parentDiv.style.backgroundColor = '#f0f0f0';

      // Optionally, add text or an icon instead
      const placeholder = document.createElement('div');
      placeholder.style.height = '100%';
      placeholder.style.display = 'flex';
      placeholder.style.alignItems = 'center';
      placeholder.style.justifyContent = 'center';
      placeholder.style.color = '#999';
      placeholder.innerText = '🖼️';
      parentDiv.appendChild(placeholder);
    }

    console.log('Erreur de chargement d\'image:', img.src);
  }
}
