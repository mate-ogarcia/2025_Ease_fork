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
  productId: string = '';
  productDetails: any = null;
  europeanCountries: string[] = []; // Liste des pays européens
  isEuropean: boolean = true; // Indicateur si le produit est européen

  constructor(private route: ActivatedRoute, private apiService: ApiService, private http: HttpClient) {}

  /**
   * Lifecycle method called on component initialization.
   * Retrieves the product ID from the route and fetches product details from the API.
   */
  ngOnInit() {
    this.fetchEuropeanCountries(); // Charger les pays européens

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
   * Fetch the list of European countries from the API.
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
   * Check if the product's origin is in the list of European countries.
   * @param origin - The country of origin of the product.
   */
  checkIfEuropean(origin: string) {
    if (!origin) {
      this.isEuropean = false;
      return;
    }
    this.isEuropean = this.europeanCountries.includes(origin);
  }
}
