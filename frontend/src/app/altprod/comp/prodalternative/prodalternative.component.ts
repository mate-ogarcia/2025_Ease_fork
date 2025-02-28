/**
 * @file prodalternative.component.ts
 * @brief Defines the ProdalternativeComponent responsible for displaying alternative products.
 */

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../../services/api.service';
import { UnsplashService } from '../../../../services/unsplash.service';
import { ApiOpenFoodFacts } from '../../../../services/openFoodFacts/openFoodFacts.service';

/**
 * @class ProdalternativeComponent
 * @brief Component responsible for displaying alternative products based on the selected product.
 */
@Component({
  selector: 'app-prodalternative',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './prodalternative.component.html',
  styleUrls: ['./prodalternative.component.css']
})
export class ProdalternativeComponent implements OnInit {
  productId: string = '';           // The ID of the selected product.
  productSource: string = '';       // The source of the product (e.g., Internal, OpenFoodFacts).
  productDetails: any[] = [];       // List of alternative products.
  isLoading: boolean = false;       // Loading state flag.
  errorMessage: string = '';        // Error message in case of failure.

  /**
   * @brief Constructor initializes dependencies.
   * @param route ActivatedRoute to handle route parameters.
   * @param router Router for navigation.
   * @param apiService ApiService to fetch internal alternative products.
   * @param unsplashService UnsplashService to fetch product images.
   * @param apiOpenFoodFacts ApiOpenFoodFacts service to fetch external products.
   */
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private unsplashService: UnsplashService,
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
            this.unsplashService.searchPhotos(product.name).subscribe({
              next: (response) => {
                if (response.results?.length > 0) {
                  product.imageUrl = `${response.results[0].urls.raw}?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=300`;
                }
              },
              error: (error) => console.error("Error retrieving image from Unsplash:", error)
            });
          }
        });
      },
      error: (error: any) => {
        console.error("❌ Error retrieving alternative products:", error);
        this.errorMessage = "Unable to fetch alternative products.";
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
