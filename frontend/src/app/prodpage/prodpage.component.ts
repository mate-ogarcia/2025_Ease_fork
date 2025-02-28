import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { NavbarComponent } from '../searched-prod/comp/navbar/navbar.component';
import { UnsplashService } from '../../services/unsplash.service';
import { ApiOpenFoodFacts } from '../../services/openFoodFacts/openFoodFacts.service';

@Component({
  selector: 'app-prodpage',
  standalone: true,
  imports: [NavbarComponent, CommonModule],
  templateUrl: './prodpage.component.html',
  styleUrls: ['./prodpage.component.css']
})
export class ProdpageComponent implements OnInit {
  productId: string = '';
  productSource: string = '';
  product: any = null;
  isLoading: boolean = false;
  errorMessage: string = '';
  selectedTab: string = 'description';

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private unsplashService: UnsplashService,
    private openFoodFactsService: ApiOpenFoodFacts  // Ajout du service OpenFoodFacts
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.productId = params.get('id') || '';
      this.productSource = params.get('source') || 'Internal'; // Valeur par défaut

      console.log(`🔹 Product ID: ${this.productId}`);
      console.log(`🌍 Product Source: ${this.productSource}`);

      if (this.productId) {
        this.loadProduct(this.productId, this.productSource);
      }
    });
  }

  /**
   * @brief Charge les informations du produit en fonction de son origine.
   * @param productId L'identifiant du produit.
   * @param productSource La source du produit (Internal ou OpenFoodFacts).
   */
  loadProduct(productId: string, productSource: string) {
    this.isLoading = true;
    this.errorMessage = '';
    this.product = null; // Réinitialisation

    if (productSource === "Internal") {
      this.fetchInternalProduct(productId);
    } else if (productSource === "OpenFoodFacts") {
      this.fetchExternalProduct(productId);
    } else {
      console.warn(`⚠️ Source inconnue: ${productSource}`);
      this.errorMessage = "Source de produit inconnue.";
      this.isLoading = false;
    }
  }

  /**
   * @brief Récupère un produit interne.
   * @param productId L'ID du produit.
   */
  fetchInternalProduct(productId: string) {
    this.apiService.getProductById(productId).subscribe({
      next: (data) => {
        if (data) {
          this.product = data;
          this.loadProductImage(this.product);
        } else {
          this.errorMessage = 'Produit introuvable.';
        }
      },
      error: () => {
        this.errorMessage = 'Erreur lors du chargement des détails du produit.';
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  /**
   * @brief Récupère un produit depuis OpenFoodFacts.
   * @param productId L'ID du produit.
   */
  fetchExternalProduct(productId: string) {
    console.log(`🌍 Fetching external product from OpenFoodFacts...`);

    this.openFoodFactsService.getOpenFoodFactsProductById(productId).subscribe({
      next: (data) => {
        if (data) {
          this.product = this.openFoodFactsService.formatOpenFoodFactsProduct(data);
          this.loadProductImage(this.product);
        } else {
          this.errorMessage = "Produit introuvable sur OpenFoodFacts.";
        }
      },
      error: (error) => {
        console.error("❌ Erreur récupération produit OpenFoodFacts :", error);
        this.errorMessage = "Impossible de récupérer le produit depuis OpenFoodFacts.";
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }


  /**
   * @brief Récupère une image depuis Unsplash si le produit n'a pas d'image.
   * @param product Le produit.
   */
  private loadProductImage(product: any) {
    if (product.imageUrl) {
      console.log(`✅ Image déjà présente pour ${product.name}`);
      return;
    }

    if (product.name) {
      this.unsplashService.searchPhotos(product.name).subscribe({
        next: (response) => {
          if (response.results && response.results.length > 0) {
            const rawUrl = response.results[0].urls.raw;
            product.imageUrl = `${rawUrl}?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=300`;
          } else {
            console.log(`Aucune image trouvée pour ${product.name}`);
          }
        },
        error: (error) => {
          console.error("Erreur récupération image Unsplash :", error);
        }
      });
    }
  }

  selectTab(tab: string) {
    this.selectedTab = tab;
  }

  trackByProduct(index: number, product: any): any {
    return product.id; 
  }
}
