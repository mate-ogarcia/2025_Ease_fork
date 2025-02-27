/**
 * @file prodalternative.component.ts
 * @brief Defines the ProdalternativeComponent responsible for displaying alternative products.
 */

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../../services/api.service';
import { UnsplashService } from '../../../../services/unsplash.service'; 

@Component({
  selector: 'app-prodalternative',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './prodalternative.component.html',
  styleUrls: ['./prodalternative.component.css']
})

// TODO : Add api alternatives
export class ProdalternativeComponent implements OnInit {
  productId: string = '';
  productDetails: any[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private route: ActivatedRoute, 
    private router: Router,
    private apiService: ApiService,
    private unsplashService: UnsplashService
  ) {}

  // Fonction trackBy pour améliorer les performances du *ngFor
  trackByProduct(index: number, product: any): any {
    return product.id;
  }

  /**
   * @brief Lifecycle hook executed when the component is initialized.
   */
  ngOnInit() {
    this.route.params.subscribe(params => {
      const productId = params['id'];
      const productSource = params['source'];
      console.log('prodalternative.component.ts');
      console.log("🔹 Product ID:", productId);
      console.log("🌍 Product Source:", productSource);
    });
    // if (this.productId) {
    //   this.fetchAlternativeProducts(this.productId);
    // }
  }

  /**
   * @brief Fetches alternative products based on the provided product ID.
   * @param productId The ID of the product for which alternatives are being fetched.
   */
  fetchAlternativeProducts(productId: string) {
    this.isLoading = true;
    this.errorMessage = '';
  
    const observer = {
      next: (data: any) => {
        this.productDetails = data;
        console.log("Alternative products received: (prodAlt)", this.productDetails);
  
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
  
    // Use observer object in subscribe()
    this.apiService.getAlternativeProducts(productId).subscribe(observer);
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
