/**
 * @file prodalternative.component.ts
 * @brief Defines the ProdalternativeComponent responsible for displaying alternative products.
 */

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../../services/api.service';
import { UnsplashService } from '../../../../services/unsplash.service'; // ajuste le chemin selon ta structure

@Component({
  selector: 'app-prodalternative',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './prodalternative.component.html',
  styleUrls: ['./prodalternative.component.css']
})
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
    this.route.paramMap.subscribe(params => {
      this.productId = params.get('id') || '';
      console.log("🔹 Product ID received: (prodAlt)", this.productId);

      if (this.productId) {
        this.fetchAlternativeProducts(this.productId);
      }
    });
  }

  /**
   * @brief Fetches alternative products based on the provided product ID.
   * @param productId The ID of the product for which alternatives are being fetched.
   */
  fetchAlternativeProducts(productId: string) {
    this.isLoading = true;
    this.errorMessage = '';

    this.apiService.getAlternativeProducts(productId).subscribe({
      next: (data) => {
        this.productDetails = data;
        console.log("Alternative products received: (prodAlt)", this.productDetails);

        // Pour chaque produit, lancer la recherche d'image depuis Unsplash
        this.productDetails.forEach(product => {
          if (product && product.name) {
            this.unsplashService.searchPhotos(product.name).subscribe(response => {
              if (response.results && response.results.length > 0) {
                // Utilisation de l'URL raw pour forcer une taille uniforme via les paramètres
                // Ici, on demande une image de 300x300 pixels, recadrée si nécessaire
                const rawUrl = response.results[0].urls.raw;
                product.imageUrl = `${rawUrl}?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=300`;
              } else {
                console.log(`Aucune image trouvée pour ${product.name}`);
              }
            }, error => {
              console.error("Erreur lors de la récupération d'image depuis Unsplash :", error);
            });
          }
        });
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
