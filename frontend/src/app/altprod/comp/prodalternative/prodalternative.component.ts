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

@Component({
  selector: 'app-prodalternative',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './prodalternative.component.html',
  styleUrls: ['./prodalternative.component.css']
})


export class ProdalternativeComponent implements OnInit {
  productId: string = '';
  productSource: string = '';
  productDetails: any[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private unsplashService: UnsplashService,
    private apiOpenFoodFacts: ApiOpenFoodFacts
  ) { }

  // Fonction trackBy pour améliorer les performances du *ngFor
  trackByProduct(index: number, product: any): any {
    return product.id;
  }

  /**
   * @brief Lifecycle hook executed when the component is initialized.
   */
  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.productId = params.get('id') || '';
      this.productSource = params.get('source') || 'Internal'; // Default source

      console.log(`🔹 Product ID: ${this.productId}`);
      console.log(`🌍 Product Source: ${this.productSource}`);

      if (this.productId) {
        this.productSource === "Internal"
          ? this.fetchInternalProduct(this.productId)
          : this.fetchExternalProduct(this.productId, this.productSource);
      }
    });
  }

  /**
   * @brief Fetches an internal product and its alternatives.
   * @param productId The ID of the product to fetch alternatives for.
   */
  fetchInternalProduct(productId: string) {
    console.log("🏠 Fetching internal product alternatives...");

    this.isLoading = true;
    this.errorMessage = '';

    this.apiService.getAlternativeProducts(productId).subscribe(this.createObserver());
  }

  /**
   * @brief Fetches an external product and retrieves its alternatives.
   * @param productId The ID of the product.
   * @param productSource The external API source (e.g., OpenFoodFacts).
   */
  fetchExternalProduct(productId: string, productSource: string) {
    console.log(`🌍 Fetching external product from ${productSource}...`);

    this.isLoading = true;
    this.errorMessage = '';

    switch (productSource) {
      case "OpenFoodFacts":
        // Step 1: Get the searched product
        this.apiOpenFoodFacts.getOpenFoodFactsProductById(productId).subscribe({
          next: (data) => {
            console.log('data:', data);
            if (!data) {
              console.warn(`⚠️ No product data found for ID ${productId} from OpenFoodFacts`);
              this.isLoading = false;
              return;
            }

            // Format the product
            const formattedProduct = this.apiOpenFoodFacts.formatOpenFoodFactsProduct(data);
            console.log('formattedProduct:', formattedProduct);

            // Search the alternative products
            this.apiOpenFoodFacts.postOpenFoodFactsAlternativeProducts(formattedProduct).subscribe({
              next: (alternatives) => {
                

                // Formatter chaque alternative avant de l'ajouter
                const formattedAlternatives = alternatives.map((alt) =>
                  this.apiOpenFoodFacts.formatOpenFoodFactsProduct(alt)
                );
                console.log("✅ OpenFoodFacts alternatives retrieved:", formattedAlternatives);

                this.productDetails = [...this.productDetails, ...formattedAlternatives]; // Ajouter les alternatives formatées
              },
              error: (error) => {
                console.error("❌ Error retrieving alternative products from OpenFoodFacts:", error);
              },
              complete: () => {
                this.isLoading = false;
              }
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
   * @brief Creates an observer to handle API responses.
   * @returns An observer object.
   */
  private createObserver() {
    return {
      next: (data: any) => {
        this.productDetails = data;
        console.log("✅ Alternative products received:", this.productDetails);

        // Fetch images for each product
        this.productDetails.forEach(product => {
          if (product && product.name) {
            this.unsplashService.searchPhotos(product.name).subscribe({
              next: (response) => {
                if (response.results && response.results.length > 0) {
                  // Use the raw URL with formatting parameters for consistency
                  const rawUrl = response.results[0].urls.raw;
                  product.imageUrl = `${rawUrl}?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=300`;
                } else {
                  console.log(`No image found for ${product.name}`);
                }
              },
              error: (error) => {
                console.error("Error retrieving image from Unsplash:", error);
              }
            });
          }
        });
      },
      error: (error: any) => {
        console.error("❌ Error retrieving alternative products:", error);
        this.errorMessage = "Unable to fetch alternative products.";
      },
      complete: () => {
        this.isLoading = false;
      }
    };
  }

  /**
   * @brief Returns a CSS class based on the product rating.
   * @param rating The rating value of the product.
   * @return The corresponding CSS class name ('high', 'medium', or 'low').
   */
  getRatingClass(rating: number): string {
    if (rating >= 4) {
      return 'high';
    } else if (rating === 3) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  /**
   * @brief Redirects the user to the selected product's page.
   * @param product The selected product object.
   */
  goToProduct(product: any) {
    if (product?.id) {
      console.log("🔹 Redirecting to product:", product);
      this.router.navigate([`/product-page/${product.id}`, { source: product.source }]).then(() => {
        console.log(`✅ Successfully navigated to /product-page/${product.id}`);
      }).catch(error => {
        console.error("❌ Navigation error:", error);
      });
    } else {
      console.warn("⚠️ Invalid product or missing ID");
    }
  }
}
