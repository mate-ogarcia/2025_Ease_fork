/**
 * @file prodsearch.component.ts
 * @brief Component for searching and displaying product details.
 * 
 * This component retrieves a product ID from the route parameters
 * and fetches the corresponding product details from the API.
 */

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
// API service
import { ApiService } from '../../../../services/api.service';
import { ApiEuropeanCountries } from '../../../../services/europeanCountries/api.europeanCountries';

@Component({
  selector: 'app-prodsearch',
  imports: [CommonModule],
  templateUrl: './prodsearch.component.html',
  styleUrl: './prodsearch.component.css'
})
export class ProdsearchComponent implements OnInit {
  /** @brief Product ID retrieved from the route parameters. */
  productId: string = '';

  /** @brief Stores the product details fetched from the API. */
  productDetails: any = null;
  isEuropean: boolean = false;

  /**
   * @brief Constructor initializes route, API service, and HTTP client.
   * @param route ActivatedRoute for retrieving route parameters.
   * @param apiService Service for fetching product details.
   * @param apicountries Service for fetching products origin
   * @param http HttpClient for making API requests.
   */
  constructor(private route: ActivatedRoute, private apiService: ApiService, private apicountries: ApiEuropeanCountries , private http: HttpClient) {}

  /**
   * @brief Lifecycle hook that runs on component initialization.
   * 
   * Retrieves the product ID from the route parameters and fetches product details.
   * Also loads the list of European countries.
   */
  ngOnInit() {
    this.apicountries.fetchEuropeanCountries // Load European countries

    this.route.paramMap.subscribe(params => {
      this.productId = params.get('id') || '';
      console.log("🔹 Product ID received: (prodSearch)", this.productId);

      if (this.productId) {
        this.apiService.getProductById(this.productId).subscribe({
          next: (data) => {
            this.productDetails = data;
            console.log("✅ Product retrieved: (prodSearch)", this.productDetails);
            this.isEuropean = this.apicountries.checkIfEuropean(this.productDetails.origin);  // Check if the country is european to put the color (green is european, red if not)
          },
          error: (error) => console.error("❌ Error retrieving product:", error)
        });
      }
    });
  }

  /**
   * @brief Returns the CSS class based on the product rating.
   * 
   * @param rating Product rating (from 1 to 5).
   * @return CSS class name: "high", "medium", or "low".
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
}
