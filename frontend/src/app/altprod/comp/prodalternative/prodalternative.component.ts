import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
  productDetails: any[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private route: ActivatedRoute, 
    private router: Router,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.productId = params.get('id') || '';
      console.log("🔹 Product ID received: (prodAlt)", this.productId);

      if (this.productId) {
        this.fetchAlternativeProducts(this.productId);
      }
    });
  }

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
   * Redirige vers la page du produit sélectionné.
   * @param {any} product - Objet produit sélectionné
   */
  goToProduct(product: any) {
    if (product?.id) {
      console.log("🔹 Redirection vers le produit:", product);
      this.router.navigate([`/product-page/${product.id}`]).then(() => {
        console.log(`✅ Navigation réussie vers /product-page/${product.id}`);
      }).catch(error => {
        console.error("❌ Erreur de navigation :", error);
      });
    } else {
      console.warn("⚠️ Produit non valide ou ID manquant");
    }
  }
}
