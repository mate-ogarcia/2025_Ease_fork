import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../../services/api.service';

@Component({
  selector: 'app-prodalternative',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './prodalternative.component.html',
  styleUrl: './prodalternative.component.css'
})
export class ProdalternativeComponent implements OnInit {
  productId: string = '';
  productDetails: any = null;
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(private route: ActivatedRoute, private apiService: ApiService) {}

  /**
   * Lifecycle method called on component initialization.
   * Retrieves the product ID from the route and fetches product details from the API.
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
   * Fetches alternative European products from the API.
   * @param {string} productId - ID of the selected product
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
}
