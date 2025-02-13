/**
 * @file prodalternative.component.ts
 * @brief Defines the ProdalternativeComponent responsible for displaying alternative products.
 */

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../../services/api.service';

/**
 * @class ProdalternativeComponent
 * @brief Component for fetching and displaying alternative products based on a given product ID.
 */
@Component({
  selector: 'app-prodalternative', ///< The HTML tag used to include this component.
  standalone: true, ///< Indicates that this component can work independently.
  imports: [CommonModule], ///< Imports required modules for common functionalities.
  templateUrl: './prodalternative.component.html', ///< Path to the component's template.
  styleUrl: './prodalternative.component.css' ///< Path to the component's stylesheet.
})
export class ProdalternativeComponent implements OnInit {
  productId: string = ''; ///< Stores the product ID retrieved from the route parameters.
  productDetails: any[] = []; ///< Holds the list of alternative products.
  isLoading: boolean = false; ///< Indicates whether the API request is in progress.
  errorMessage: string = ''; ///< Stores any error messages encountered during data fetching.

  /**
   * @brief Constructor for ProdalternativeComponent.
   * @param route ActivatedRoute service for accessing route parameters.
   * @param router Router service for navigation.
   * @param apiService ApiService for fetching alternative products.
   */
  constructor(
    private route: ActivatedRoute, 
    private router: Router,
    private apiService: ApiService
  ) {}

  /**
   * @brief Lifecycle hook executed when the component is initialized.
   * Retrieves the product ID from route parameters and fetches alternative products.
   */
  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.productId = params.get('id') || '';
      console.log("🔹 Product ID received: (prodAlt)", this.productId);

      if (this.productId) {
        this.fetchAlternativeProducts(this.productId);
      }
    });
  }

  /**
   * @brief Fetches alternative products based on the provided product ID.
   * @param productId The ID of the product for which alternatives are being fetched.
   */
  fetchAlternativeProducts(productId: string) {
    this.isLoading = true;
    this.errorMessage = '';

    this.apiService.getAlternativeProducts(productId).subscribe({
      next: (data) => {
        this.productDetails = data;
        console.log("✅ Alternative products received: (prodAlt)", this.productDetails);
      },
      error: (error) => {
        console.error("❌ Error retrieving alternative products:", error);
        this.errorMessage = "Impossible de récupérer les produits alternatifs.";
      },
      complete: () => {
        this.isLoading = false;
      }
    });
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
      this.router.navigate([`/product-page/${product.id}`]).then(() => {
        console.log(`✅ Successfully navigated to /product-page/${product.id}`);
      }).catch(error => {
        console.error("❌ Navigation error:", error);
      });
    } else {
      console.warn("⚠️ Invalid product or missing ID");
    }
  }
}
