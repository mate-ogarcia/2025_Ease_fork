/**
 * @file prodalternative.component.ts
 * @brief Defines the ProdalternativeComponent responsible for displaying alternative products.
 */

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
// API
import { ApiService } from '../../../../services/api.service';
import { APIUnsplash } from '../../../../services/unsplash/unsplash.service';
import { ApiOpenFoodFacts } from '../../../../services/openFoodFacts/openFoodFacts.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

/**
 * @class ProdalternativeComponent
 * @brief Component responsible for displaying alternative products based on the selected product.
 */
@Component({
  selector: 'app-prodalternative',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
  templateUrl: './prodalternative.component.html',
  styleUrls: ['./prodalternative.component.css']
})
export class ProdalternativeComponent implements OnInit {
  productId: string = '';           // The ID of the selected product.
  productSource: string = '';       // The source of the product (e.g., Internal, OpenFoodFacts).
  productDetails: any[] = [];       // List of alternative products.
  isLoading: boolean = true;        // Loading state flag, initially true to show the spinner.
  errorMessage: string = '';        // Error message in case of failure.

  /**
   * @brief Constructor initializes dependencies.
   * @param route ActivatedRoute to handle route parameters.
   * @param router Router for navigation.
   * @param apiService ApiService to fetch internal alternative products.
   * @param apiUnsplash UnsplashService to fetch product images.
   * @param apiOpenFoodFacts ApiOpenFoodFacts service to fetch external products.
   */
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private apiUnsplash: APIUnsplash,
    private apiOpenFoodFacts: ApiOpenFoodFacts
  ) { }

  /**
   * @brief Lifecycle hook executed when the component is initialized.
   * It retrieves the product ID and source from the route parameters.
   */
  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.productId = params.get('id') || '';
      this.productSource = params.get('source') || 'Internal'; // Default source

      if (this.productId) {
        this.productSource === "Internal"
          ? this.fetchInternalProduct(this.productId)
          : this.fetchExternalProduct(this.productId, this.productSource);
      }
    });
  }

  /**
   * @brief trackBy function to improve *ngFor performance.
   * @param index The index of the product in the list.
   * @param product The product object.
   * @return The unique identifier for tracking.
   */
  trackByProduct(index: number, product: any): any {
    return product.id;
  }

  /**
   * @brief Fetches internal product alternatives.
   * @param productId The ID of the product.
   */
  fetchInternalProduct(productId: string) {
    this.isLoading = true;
    this.errorMessage = '';
    this.productDetails = []; // Réinitialise les produits lors d'une nouvelle recherche
    this.apiService.getAlternativeProducts(productId).subscribe(this.createObserver());
  }

  /**
   * @brief Fetches external product and retrieves alternatives.
   * @param productId The product ID.
   * @param productSource The external API source (e.g., OpenFoodFacts).
   */
  fetchExternalProduct(productId: string, productSource: string) {
    this.isLoading = true;
    this.errorMessage = '';
    this.productDetails = []; // Réinitialise les produits lors d'une nouvelle recherche

    switch (productSource) {
      case "OpenFoodFacts":
        this.apiOpenFoodFacts.getOpenFoodFactsProductById(productId).subscribe({
          next: (data) => {
            if (!data) {
              console.warn(`⚠️ No product data found for ID ${productId}`);
              this.isLoading = false;
              return;
            }
            const formattedProduct = this.apiOpenFoodFacts.formatOpenFoodFactsProduct(data);
            this.apiOpenFoodFacts.postOpenFoodFactsAlternativeProducts(formattedProduct).subscribe({
              next: (alternatives) => {
                const formattedAlternatives = alternatives.map((alt) =>
                  this.apiOpenFoodFacts.formatOpenFoodFactsProduct(alt)
                );
                this.productDetails = [...this.productDetails, ...formattedAlternatives];
              },
              error: (error) => console.error("❌ Error retrieving alternative products:", error),
              complete: () => this.isLoading = false
            });
          },
          error: (error) => {
            console.error("❌ Error retrieving product from OpenFoodFacts:", error);
            this.errorMessage = "Unable to fetch product from OpenFoodFacts.";
            this.isLoading = false;
          }
        });
        break;

      default:
        console.warn(`⚠️ Unknown external API source: ${productSource}`);
        this.isLoading = false;
        break;
    }
  }

  /**
   * @brief Creates an observer for API responses.
   * @return Observer object handling success, error, and completion.
   */
  private createObserver() {
    return {
      next: (data: any) => {
        this.productDetails = data;
        this.productDetails.forEach(product => {
          if (product?.name) {
            this.apiUnsplash.searchPhotos(product.name).subscribe({
              next: (response) => {
                if (response.imageUrl) {
                  product.image = response.imageUrl;
                } else {
                  console.warn(`🚫 No image found for ${product.name}`);
                }
              },
              error: (error) => console.error("❌ Error retrieving image from Unsplash API:", error),
            });
          }
        });
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error("❌ Error retrieving alternative products:", error);
        this.errorMessage = "Unable to fetch alternative products.";
        this.isLoading = false;
      },
      complete: () => this.isLoading = false
    };
  }

  /**
   * @brief Returns a CSS class based on product rating.
   * @param rating The product rating.
   * @return Corresponding CSS class name ('high', 'medium', 'low').
   */
  getRatingClass(rating: number): string {
    return rating >= 4 ? 'high' : rating === 3 ? 'medium' : 'low';
  }

  /**
   * @brief Navigates to the selected product's page.
   * @param product The selected product object.
   */
  goToProduct(product: any) {
    if (product?.id) {
      this.router.navigate([`/product-page/${product.id}/${product.source}`]).catch(error => {
        console.error("❌ Navigation error:", error);
      });
    } else {
      console.warn("⚠️ Invalid product or missing ID");
    }
  }
}
