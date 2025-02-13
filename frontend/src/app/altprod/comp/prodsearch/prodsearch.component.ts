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
import { firstValueFrom } from 'rxjs';
// API service
import { ApiService } from '../../../../services/api.service';
import { HttpClient } from '@angular/common/http';

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

  /** @brief List of European countries fetched from an external API. */
  europeanCountries: string[] = []; 

  /** @brief Flag indicating if the product is from a European country. */
  isEuropean: boolean = true; 

  /**
   * @brief Constructor initializes route, API service, and HTTP client.
   * @param route ActivatedRoute for retrieving route parameters.
   * @param apiService Service for fetching product details.
   * @param http HttpClient for making API requests.
   */
  constructor(private route: ActivatedRoute, private apiService: ApiService, private http: HttpClient) {}

  /**
   * @brief Lifecycle hook that runs on component initialization.
   * 
   * Retrieves the product ID from the route parameters and fetches product details.
   * Also loads the list of European countries.
   */
  ngOnInit() {
    this.fetchEuropeanCountries(); // Load European countries

    this.route.paramMap.subscribe(params => {
      this.productId = params.get('id') || '';
      console.log("🔹 Product ID received: (prodSearch)", this.productId);

      if (this.productId) {
        this.apiService.getProductById(this.productId).subscribe({
          next: (data) => {
            this.productDetails = data;
            console.log("✅ Product retrieved: (prodSearch)", this.productDetails);
            this.checkIfEuropean(this.productDetails.origin);
          },
          error: (error) => console.error("❌ Error retrieving product:", error)
        });
      }
    });
  }

  /**
   * @brief Fetches the list of European countries from an external API.
   * 
   * Uses the `restcountries.com` API to get a list of European countries.
   * Stores the country names in the `europeanCountries` array.
   */
  async fetchEuropeanCountries() {
    try {
      const response = await firstValueFrom(
        this.http.get<any[]>('https://restcountries.com/v3.1/region/europe')
      );
      this.europeanCountries = response.map(country => country.name.common);
      console.log("🔹 European countries loaded:", this.europeanCountries);
    } catch (error) {
      console.error("❌ Error fetching European countries:", error);
    }
  }

  /**
   * @brief Checks if the product's origin is in the list of European countries.
   * 
   * @param origin The country of origin of the product.
   * @return Updates the `isEuropean` flag.
   */
  checkIfEuropean(origin: string) {
    if (!origin) {
      this.isEuropean = false;
      return;
    }
    this.isEuropean = this.europeanCountries.includes(origin);
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
