/**
 * @file prodsearch.component.ts
 * @brief Component for searching and displaying product details.
 * 
 * This component retrieves a product ID from the route parameters
 * and fetches the corresponding product details from the API.
 * It also fetches an image from Unsplash based on the product name.
 */

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
// API services
import { ApiService } from '../../../../services/api.service';
import { UnsplashService } from '../../../../services/unsplash.service';
import { ApiOpenFoodFacts } from '../../../../services/openFoodFacts/openFoodFacts.service';
import { DataCacheService } from '../../../../services/cache/data-cache.service';

/** 
 * @struct Product
 * @brief Interface representing product details.
 */
interface Product {
  id: string;                     // Unique identifier of the product.
  name: string;                   // Name of the product.
  brand: string;                  // Brand of the product.
  description: string;             // Description of the product.
  category: string;                // Category of the product.
  tags: string[];                  // Associated tags for the product.
  ecoscore: string;                // Ecoscore rating of the product.
  origin: string;                  // Country of origin of the product.
  manufacturing_places: string;    // Manufacturing locations of the product.
  image: string;                   // Image URL of the product.
  source: 'Internal' | 'OpenFoodFacts'; // Data source of the product.
}

@Component({
  selector: 'app-prodsearch',
  imports: [CommonModule],
  templateUrl: './prodsearch.component.html',
  styleUrls: ['./prodsearch.component.css'],
})
export class ProdsearchComponent implements OnInit {
  productId: string = '';                 // Product ID retrieved from the route parameters. 
  productDetails: Product | null = null;  // Stores the product details fetched from the API. 
  isEuropean: boolean = false;            // Indicates whether the product originates from a European country.
  countries: string[] = [];               // List of European countries fetched from the backend.

  /**
   * @brief Constructor to initialize services and route parameters.
   * @param route ActivatedRoute for retrieving route parameters.
   * @param apiService Service for fetching product details.
   * @param unsplashService Service for fetching images from Unsplash.
   * @param apiOpenFoodFacts Service for fetching external product details.
   * @param dataCacheService Service for retrieving cached data (e.g., European countries).
   */
  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private unsplashService: UnsplashService,
    private apiOpenFoodFacts: ApiOpenFoodFacts,
    private dataCacheService: DataCacheService
  ) { }

  /**
   * @brief Lifecycle hook that runs on component initialization.
   * 
   * Fetches the list of European countries from the cache and retrieves product details 
   * based on the route parameters.
   */
  ngOnInit() {
    // Load European countries from cache
    this.dataCacheService.getCountries().subscribe(countries => {
      this.countries = countries;
    });

    this.route.paramMap.subscribe(params => {
      this.productId = params.get('id') || '';
      const productSource = params.get('source') || 'Internal'; // Default source

      if (this.productId) {
        productSource === "Internal"
          ? this.fetchInternalProduct(this.productId)
          : this.fetchExternalProduct(this.productId, productSource);
      }
    });
  }

  /**
   * @brief Fetches an internal product from the API.
   * @param productId The unique identifier of the internal product.
   */
  fetchInternalProduct(productId: string) {
    this.apiService.getProductById(productId).subscribe({
      next: (data) => this.handleProductData(data),
      error: (error) => console.error("❌ Error retrieving internal product:", error)
    });
  }

  /**
   * @brief Fetches an external product based on its source.
   * @param productId The unique identifier of the external product.
   * @param productSource The API source (e.g., OpenFoodFacts).
   */
  fetchExternalProduct(productId: string, productSource: string) {
    switch (productSource) {
      case "OpenFoodFacts":
        this.apiOpenFoodFacts.getOpenFoodFactsProductById(productId).subscribe({
          next: (data) => this.handleProductData(this.apiOpenFoodFacts.formatOpenFoodFactsProduct(data)),
          error: (error) => console.error(`❌ Error retrieving product from ${productSource}:`, error),
        });
        break;

      default:
        console.warn(`⚠️ Unknown external API source: ${productSource}`);
        break;
    }
  }

  /**
   * @brief Handles product data received from the API.
   * @param product The fetched product details.
   * 
   * Checks if the product originates from a European country and retrieves an image.
   */
  handleProductData(product: Product) {
    this.productDetails = product;
    // Check if the product originates from a European country using the cached data
    this.dataCacheService.checkIfEuropean(this.productDetails.origin).subscribe(isEuropean => {
      this.isEuropean = isEuropean;
      console.log(`🌍 The product is ${this.isEuropean ? 'European' : 'non-European'}.`);
    });

    // Load product image from Unsplash
    this.loadProductImage(this.productDetails.name);
  }

  /**
   * @brief Fetches a product image from Unsplash.
   * @param productName The name of the product.
   */
  loadProductImage(productName: string) {
    if (!productName) return;

    this.unsplashService.searchPhotos(productName).subscribe({
      next: (response) => {
        if (response.results?.length) {
          const rawUrl = response.results[0].urls.raw;
          if (this.productDetails!.image === null) {
            this.productDetails!.image = `${rawUrl}?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=300`;
          }
        } else {
          console.log(`🚫 No image found for ${productName}`);
        }
      },
      error: (error) => console.error("❌ Error retrieving image from Unsplash:", error),
    });
  }

  /**
   * @brief Returns the CSS class based on the product rating.
   * @param rating The rating of the product (from 1 to 5).
   * @return The corresponding CSS class name ('high', 'medium', or 'low').
   */
  getRatingClass(rating: number): string {
    return rating >= 4 ? 'high' : rating === 3 ? 'medium' : 'low';
  }
}
