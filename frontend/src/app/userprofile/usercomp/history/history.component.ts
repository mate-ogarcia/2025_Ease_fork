/**
 * @file history.component.ts
 * @brief Component for displaying the history of searched products.
 *
 * This component retrieves previously searched products from the navigation state
 * and displays them in either a list or grid view. It also fetches images from Unsplash
 * for products that do not have an image.
 */

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
// API
import { APIUnsplash } from '../../../../services/unsplash/unsplash.service';

/**
 * @class HistoryComponent
 * @brief Component responsible for displaying the search history of products.
 */
@Component({
  selector: 'app-history',
  imports: [CommonModule],
  templateUrl: './history.component.html',
  styleUrl: './history.component.css'
})
export class HistoryComponent implements OnInit {
  resultsArray: any[] = []; ///< Array to store searched products.
  viewMode: 'list' | 'grid' = 'list'; ///< Default display mode.

  /**
   * @brief Constructor initializes dependencies.
   * @param router Router for navigation.
   * @param apiUnsplash APIUnsplash service for fetching images.
   */
  constructor(
    private router: Router,
    private apiUnsplash: APIUnsplash
  ) { }

  /**
   * @brief Lifecycle hook executed when the component is initialized.
   *
   * Retrieves search results from the navigation state and fetches images
   * from Unsplash for products that do not have an image.
   */
  ngOnInit(): void {
    this.resultsArray = history.state.resultsArray || [];

    this.resultsArray.forEach(product => {
      if (product && product.name) {
        this.apiUnsplash.searchPhotos(product.name).subscribe({
          next: (response) => {
            if (response.imageUrl) {
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
    });
  }

  /**
   * @brief Sets the display mode for the results.
   * @param mode The desired view mode ('list' or 'grid').
   */
  setViewMode(mode: 'list' | 'grid'): void {
    this.viewMode = mode;
  }

  /**
   * @brief Navigates to the product details page.
   * @param product The selected product object.
   */
  goToProduct(product: any) {
    if (product?.id) {
      this.router.navigate([`/products-alternative/${product.id}`]).catch(error => {
        console.error("❌ Navigation error:", error);
      });
    } else {
      console.warn("⚠️ Invalid product or missing ID");
    }
  }

  /**
   * @brief Tracks product items for *ngFor to optimize rendering.
   * @param index The index of the product.
   * @param product The product object.
   * @return The unique product ID.
   */
  trackByProduct(index: number, product: any): any {
    return product.id;
  }
}
