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
import { ApiEuropeanCountries } from '../../../../services/europeanCountries/api.europeanCountries';
import { ApiOpenFoodFacts } from '../../../../services/openFoodFacts/openFoodFacts.service';

/** Interface for product details */
interface Product {
  id: string;
  name: string;
  brand: string;
  description: string;
  category: string;
  tags: string[];
  ecoscore: string;
  origin: string;
  manufacturing_places: string;
  image?: string;
  imageUrl?: string;
  source: 'Internal' | 'OpenFoodFacts';
}

@Component({
  selector: 'app-prodsearch',
  imports: [CommonModule],
  templateUrl: './prodsearch.component.html',
  styleUrls: ['./prodsearch.component.css'],
})
export class ProdsearchComponent implements OnInit {
  /** @brief Product ID retrieved from the route parameters. */
  productId: string = '';

  /** @brief Stores the product details fetched from the API. */
  productDetails: Product | null = null;
  isEuropean: boolean = false;

  /**
   * @brief Constructor initializes route, API service, and HTTP client.
   * @param route ActivatedRoute for retrieving route parameters.
   * @param apiService Service for fetching product details.
   * @param apicountries Service for fetching product origin.
   * @param unsplashService Service for fetching images from Unsplash.
   */
  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private apicountries: ApiEuropeanCountries,
    private unsplashService: UnsplashService,
    private apiOpenFoodFacts: ApiOpenFoodFacts,
  ) { }

  /**
   * @brief Lifecycle hook that runs on component initialization.
   * 
   * Retrieves the product ID from the route parameters, fetches product details,
   * loads the list of European countries, and retrieves an image from Unsplash.
   */
  ngOnInit() {
    this.apicountries.fetchEuropeanCountries(); // Load the European countries list

    this.route.paramMap.subscribe(params => {
      this.productId = params.get('id') || '';
      const productSource = params.get('source') || 'Internal'; // Default source

      console.log(`🔹 Product ID: ${this.productId}`);
      console.log(`🌍 Product Source: ${productSource}`);

      if (this.productId) {
        productSource === "Internal"
          ? this.fetchInternalProduct(this.productId)
          : this.fetchExternalProduct(this.productId, productSource);
      }
    });
  }

  /**
   * @brief Fetches an internal product from our API.
   * @param productId The ID of the internal product.
   */
  fetchInternalProduct(productId: string) {
    this.apiService.getProductById(productId).subscribe({
      next: (data) => this.handleProductData(data),
      error: (error) => console.error("❌ Error retrieving internal product:", error)
    });
  }

  /**
   * @brief Fetches an external product based on its source.
   * @param productId The product ID.
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
   */
  handleProductData(product: Product) {
    this.productDetails = product;
    console.log("✅ Product retrieved:", this.productDetails);

    // Check if the origin is European
    this.isEuropean = this.apicountries.checkIfEuropean(this.productDetails.origin);

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
          this.productDetails!.imageUrl = `${rawUrl}?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=300`;
        } else {
          console.log(`🚫 No image found for ${productName}`);
        }
      },
      error: (error) => console.error("❌ Error retrieving image from Unsplash:", error),
    });
  }

  /**
   * @brief Returns the CSS class based on the product rating.
   * @param rating Product rating (from 1 to 5).
   * @return The corresponding CSS class name ('high', 'medium', or 'low').
   */
  getRatingClass(rating: number): string {
    return rating >= 4 ? 'high' : rating === 3 ? 'medium' : 'low';
  }
}
