/**
 * @file display-results.component.ts
 * @brief Component responsible for displaying search results with product images.
 *
 * @details
 * This component retrieves search results from the router's navigation state, fetches corresponding product images
 * from the Unsplash API, and displays them in a formatted view. Clicking on a product navigates the user to its detail page.
 *
 * @component DisplayResultsComponent
 */

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UnsplashService } from '../../../../services/unsplash.service'; // Adjust path as needed

@Component({
  selector: 'app-display-results',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './display-results.component.html',
  styleUrls: ['./display-results.component.css'],
})
export class DisplayResultsComponent implements OnInit {
<<<<<<< HEAD
  resultsArray: any[] = []; // Array containing the list of products to display.
=======
  resultsArray: any[] = [];
  viewMode: 'list' | 'grid' = 'list'; // mode par défaut
>>>>>>> f86bb0168aa659aae2760ebd178fc24411901cb1

  /**
   * @constructor
   * @param router Angular router used for navigation between components.
   * @param unsplashService Service for fetching product images from Unsplash API.
   */
  constructor(
    private router: Router,
    private unsplashService: UnsplashService
  ) {}

  /**
   * @brief Lifecycle hook that initializes the component.
   *
   * @details
   * - Retrieves `resultsArray` from the navigation state.
   * - For each product, initiates an image search using the Unsplash API.
   * - Adds a properly formatted image URL to each product for display purposes.
   *
   * @returns {void}
   */
  ngOnInit(): void {
    this.resultsArray = history.state.resultsArray || [];
    console.log('🔹 Results received: (display-results.ts)', this.resultsArray);

    // Fetch an image for each product
    this.resultsArray.forEach(product => {
      if (product && product.name) {
        this.unsplashService.searchPhotos(product.name).subscribe(response => {
          if (response.results && response.results.length > 0) {
            let finalUrl = '';

            // Primary attempt: use high-quality raw URL with cropping parameters
            if (response.results[0].urls.raw) {
              finalUrl = `${response.results[0].urls.raw}?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=300`;
<<<<<<< HEAD
            } 
            // Fallback: use the smaller version if raw is not available
            else if (response.results[0].urls.small) {
=======
            } else if (response.results[0].urls.small) {
>>>>>>> f86bb0168aa659aae2760ebd178fc24411901cb1
              finalUrl = response.results[0].urls.small;
            }

            product.imageUrl = finalUrl;
          } else {
            console.log(`🔎 No image found for ${product.name}`);
          }
        }, error => {
          console.error("❌ Error fetching image from Unsplash:", error);
        });
      }
    });
  }

<<<<<<< HEAD
  /**
   * @brief Navigates to the detailed view of the selected product.
   *
   * @param product The selected product object containing at least an `id` field.
   * @returns {void}
   */
  goToProduct(product: any): void {
=======
  setViewMode(mode: 'list' | 'grid'): void {
    this.viewMode = mode;
  }

  goToProduct(product: any) {
>>>>>>> f86bb0168aa659aae2760ebd178fc24411901cb1
    if (product?.id) {
      console.log("🔹 Redirecting to product:", product);
      this.router.navigate([`/products-alternative/${product.id}`]).then(() => {
        console.log(`✅ Successfully navigated to /products-alternative/${product.id}`);
      }).catch(error => {
        console.error("❌ Navigation error:", error);
      });
    } else {
      console.warn("⚠️ Invalid product or missing ID");
    }
  }

  /**
   * @brief Provides a unique identifier for each product for Angular's trackBy function.
   *
   * @details
   * This method helps Angular optimize DOM rendering by tracking products via their unique IDs.
   *
   * @param index The current index of the product in the results array.
   * @param product The product object.
   * @returns {any} The unique identifier of the product (product ID).
   */
  trackByProduct(index: number, product: any): any {
<<<<<<< HEAD
    return product.id; // Ensure that each product has a unique identifier
=======
    return product.id;
>>>>>>> f86bb0168aa659aae2760ebd178fc24411901cb1
  }
}
