/**
 * @file prodpage.component.ts
 * @brief Component for displaying product details.
 *
 * This component retrieves a product ID from the route parameters
 * and fetches the corresponding product details from either an internal API
 * or OpenFoodFacts. If no image is available, it fetches one from Unsplash.
 */

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { catchError, from, of } from 'rxjs';
// Components
import { LikeBtnComponent } from '../searched-prod/comp/like-btn/like-btn.component';
import { CommentsSectionComponent } from '../comments-section/comments-section.component';
import { NavbarComponent } from '../shared/components/navbar/navbar.component';
import { LoadingSpinnerComponent } from '../shared/components/loading-spinner/loading-spinner.component';
// API
import { ApiService } from '../../services/api.service';
import { APIUnsplash } from '../../services/unsplash/unsplash.service';
import { ApiOpenFoodFacts } from '../../services/openFoodFacts/openFoodFacts.service';
import { FavoritesService } from '../../services/favorites/favorites.service';
import { AuthService } from '../../services/auth/auth.service';
import { CommentsService } from '../../services/comments/comments.service';
import { Co2CalculatorService } from '../../services/co2Calculator/co2Calculator.service';
import { ApiAddress } from '../../services/address/address.service';

interface Product {
  id: string;
  name: string;
  imageUrl?: string;
  image?: string;
  [key: string]: any;
}

/**
 * @class ProdpageComponent
 * @brief Component responsible for displaying product details and handling image retrieval.
 */
@Component({
  selector: 'app-prodpage',
  standalone: true,
  imports: [
    NavbarComponent,
    CommonModule,
    LikeBtnComponent,
    CommentsSectionComponent,
    LoadingSpinnerComponent,
  ],
  templateUrl: './prodpage.component.html',
  styleUrls: ['./prodpage.component.css'],
})
export class ProdpageComponent implements OnInit {
  productId: string = ''; // The ID of the selected product.
  productSource: string = ''; // The source of the product (Internal or OpenFoodFacts).
  product: Product | null = null; // The product details.
  isLoading: boolean = false; // Loading state flag.
  isCO2Loading: boolean = false; // Loading state for CO2 calculation
  errorMessage: string = ''; // Error message in case of failure.
  selectedTab: string = 'description'; // Selected tab for displaying product information.
  isAuthenticated: boolean = false; // Is the user authenticated
  isFavorite: boolean = false; // Is the product in favorites
  showCommentForm = false;
  canAddComment: boolean = false; // Determines if the user can add a comment.
  userRole: string | null = null; // Stores the user role.
  commentCount: number = 0; // Number of comments for a product
  avgRate: number = 0; // Average rate for a product
  userLocation: string = '';
  co2Impact: number | null = null;
  locationError: string = '';

  /**
   * @brief Constructor initializes dependencies.
   * @param route ActivatedRoute to handle route parameters.
   * @param apiService ApiService to fetch internal product details.
   * @param apiUnsplash UnsplashService to fetch product images.
   * @param openFoodFactsService ApiOpenFoodFacts service to fetch external products.
   * @param favoritesService Service for managing favorites
   * @param authService Service for authentication state
   * @param router Angular router for navigation
   */
  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private apiUnsplash: APIUnsplash,
    private openFoodFactsService: ApiOpenFoodFacts,
    private favoritesService: FavoritesService,
    private authService: AuthService,
    private router: Router,
    private commentsService: CommentsService,
    private co2Service: Co2CalculatorService,
    private addressService: ApiAddress
  ) { }

  /**
   * @brief Lifecycle hook executed when the component is initialized.
   * It retrieves the product ID and source from the route parameters.
   */
  ngOnInit(): void {
    this.isCO2Loading = true; // Loading state for CO2 calculation
    // Check if the user is logged in
    this.authService.isAuthenticated().subscribe((isAuth) => {
      this.isAuthenticated = isAuth;
    });

    this.route.paramMap.subscribe((params) => {
      this.productId = params.get('id') || '';
      this.productSource = params.get('source') || 'Internal';

      if (this.productId) {
        this.loadProduct(this.productId, this.productSource);

        // If the user is authenticated, check if the product is in favorites
        if (this.isAuthenticated) {
          this.checkFavoriteStatus();
        }
      }
    });

    // Subscribe to authentication state changes
    this.authService.isAuthenticated().subscribe((isAuth) => {
      if (isAuth && this.productId) {
        this.checkFavoriteStatus();
      }
    });

    // Get the number of comments
    from(this.commentsService.getCommentCountForProduct(this.productId))
      .pipe(
        catchError((error) => {
          console.error('❌ Error fetching comment count', error);
          return []; // Returns an empty array or another default value in case of error
        })
      )
      .subscribe((count) => {
        this.commentCount = count; // Stores the number of comments
      });

    // Get the average rating for the product
    from(this.commentsService.getAverageRateForProduct(this.productId))
      .pipe(
        catchError((error) => {
          console.error('❌ Error fetching comment avg rate', error);
          return []; // Returns an empty array or another default value in case of error
        })
      )
      .subscribe((count) => {
        this.avgRate = count;
      });

    // Get user location and calculate CO2 impact
    this.getUserLocationAndCalculateCO2();
  }

  /**
   * @brief Checks if the current product is in the user's favorites
   */
  private checkFavoriteStatus(): void {
    if (!this.productId || !this.isAuthenticated) {
      this.isFavorite = false;
      return;
    }

    this.favoritesService.isProductInFavorites(this.productId)
      .pipe(
        catchError((error) => {
          console.error('Error checking favorites status:', error);
          return of(false);
        })
      )
      .subscribe({
        next: (isFavorite) => {
          this.isFavorite = isFavorite;
        },
        error: (error) => {
          console.error('Error in favorites subscription:', error);
          this.isFavorite = false;
        }
      });
  }

  /**
   * @brief Handles the like button state change
   * @param liked New button state (true = liked, false = not liked)
   */
  onLikeToggled(liked: boolean): void {
    if (!this.isAuthenticated) {
      // If the user is not authenticated, redirect to the login page
      this.router.navigate(['/auth']);
      return;
    }

    if (liked) {
      // Product details saving is automatically handled by the backend
      this.favoritesService.addToFavorites(this.productId).subscribe({
        next: () => {
          this.isFavorite = true;
        },
        error: (err) => {
          this.isFavorite = false; // Reset visual state in case of error
          console.error('Error adding to favorites:', err);
        },
      });
    } else {
      this.favoritesService.removeFromFavorites(this.productId).subscribe({
        next: () => {
          this.isFavorite = false;
        },
        error: (err) => {
          this.isFavorite = true; // Reset visual state in case of error
          console.error('Error removing from favorites:', err);
        },
      });
    }
  }

  /**
   * @brief Loads product details based on its source.
   * @param productId The unique identifier of the product.
   * @param productSource The source of the product (Internal or OpenFoodFacts).
   */
  loadProduct(productId: string, productSource: string): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.product = null;

    if (productSource === 'Internal') {
      this.fetchInternalProduct(productId);
    } else if (productSource === 'OpenFoodFacts') {
      this.fetchExternalProduct(productId);
    } else {
      console.warn(`⚠️ Unknown product source: ${productSource}`);
      this.errorMessage = 'Unknown product source.';
      this.isLoading = false;
    }
  }

  /**
   * @brief Fetches an internal product.
   * @param productId The ID of the product.
   */
  fetchInternalProduct(productId: string): void {
    this.apiService.getProductById(productId).subscribe({
      next: (data) => {
        if (data) {
          this.product = data;
          if (this.product) {
            this.loadProductImage(this.product);
          }
        } else {
          this.errorMessage = 'Product not found.';
        }
      },
      error: () => {
        this.errorMessage = 'Error loading product details.';
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  /**
   * @brief Fetches an external product from OpenFoodFacts.
   * @param productId The ID of the product in OpenFoodFacts.
   */
  fetchExternalProduct(productId: string): void {
    this.openFoodFactsService.getOpenFoodFactsProductById(productId).subscribe({
      next: (data) => {
        if (data) {
          this.product =
            this.openFoodFactsService.formatOpenFoodFactsProduct(data);
          if (this.product) {
            this.loadProductImage(this.product);
          }
        } else {
          this.errorMessage = 'Product not found on OpenFoodFacts.';
        }
      },
      error: (error) => {
        console.error('❌ Error fetching product from OpenFoodFacts:', error);
        this.errorMessage = 'Unable to fetch product from OpenFoodFacts.';
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  /**
   * @brief Loads an image for the product if one is not available.
   * @param product The product for which to retrieve an image.
   */
  private loadProductImage(product: Product): void {
    if (product.imageUrl) {
      return;
    }

    this.isCO2Loading = true; // Loading state for CO2 calculation

    if (product.name) {
      this.apiUnsplash.searchPhotos(product.name).subscribe({
        next: (response) => {
          if (response && response.imageUrl) {
            product.image = response.imageUrl;
          } else {
            console.warn(`🚫 No image found for ${product.name}`);
          }
        },
        error: (err) => {
          console.error(`❌ Error retrieving image for ${product.name}:`, err);
        }
      });
    }
  }

  /**
   * @brief Gets the user's location and calculates CO2 impact
   */
  private getUserLocationAndCalculateCO2(): void {
    this.addressService.getCurrentLocation().subscribe({
      next: (location) => {
        this.userLocation = location;
        this.calculateCo2Impact();
      },
      error: (error) => {
        console.error('Error getting location:', error);
        this.locationError = 'Unable to get your location. CO2 impact will use a default location.';
        // Use a default location
        this.userLocation = 'Paris';
        this.calculateCo2Impact();
      }
    });
  }

  /**
   * @brief Calculates CO2 impact based on product and user location
   */
  calculateCo2Impact(): void {
    if (!this.productId) return;

    this.isCO2Loading = true;

    if (this.productSource !== 'Internal' && this.product) {
      // For external products (OpenFoodFacts)
      this.co2Service.getCo2ImpactForProduct(
        this.userLocation,
        this.productId,
        this.product['category'],
        this.product['origin']
      ).subscribe({
        next: (data) => {
          console.log('🌿 CO2 calculation results:', data);
          this.co2Impact = data;
          this.isCO2Loading = false;
        },
        error: (error) => {
          console.error('❌ Error calculating CO2 impact:', error);
          this.co2Impact = null;
          this.isCO2Loading = false;
        }
      });
    } else {
      // For internal products
      this.co2Service.getCo2ImpactForProduct(this.userLocation, this.productId).subscribe({
        next: (data) => {
          console.log('🌿 CO2 calculation results:', data);
          this.co2Impact = data;
          this.isCO2Loading = false;
        },
        error: (error) => {
          console.error('❌ Error calculating CO2 impact:', error);
          this.co2Impact = null;
          this.isCO2Loading = false;
        }
      });
    }
  }

  /**
   * @brief Selects a tab to display different product information.
   * @param tab The tab to select.
   */
  selectTab(tab: string): void {
    this.selectedTab = tab;
  }

  /**
   * Provides an identifier for the ngFor directive to track products.
   * This helps Angular optimize DOM updates by reusing elements.
   */
  trackByProduct(index: number, product: Product): string {
    return product.id;
  }
}
