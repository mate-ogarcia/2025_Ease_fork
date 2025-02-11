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
// API service
import { ApiService } from '../../../../services/api.service';

@Component({
  selector: 'app-prodsearch',
  imports: [CommonModule],
  templateUrl: './prodsearch.component.html',
  styleUrl: './prodsearch.component.css'
})
export class ProdsearchComponent implements OnInit {
  productId: string = '';
  productDetails: any = null;

  /**
   * Constructor to initialize dependencies.
   * @param route The ActivatedRoute service to retrieve route parameters.
   * @param apiService The ApiService to fetch product details.
   */
  constructor(private route: ActivatedRoute, private apiService: ApiService) {}

  /**
   * Lifecycle method called on component initialization.
   * Retrieves the product ID from the route and fetches product details from the API.
   */
  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.productId = params.get('id') || '';
      console.log("🔹 Product ID received:", this.productId);

      if (this.productId) {
        this.apiService.getProductById(this.productId).subscribe({
          next: (data) => {
            this.productDetails = data;
            console.log("✅ Product retrieved:", this.productDetails);
          },
          error: (error) => console.error("❌ Error retrieving product:", error)
        });
      }
    });
  }
}
