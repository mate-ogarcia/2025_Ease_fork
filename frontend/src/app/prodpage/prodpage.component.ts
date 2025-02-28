import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { NavbarComponent } from '../searched-prod/comp/navbar/navbar.component';
import { UnsplashService } from '../../services/unsplash.service';

@Component({
  selector: 'app-prodpage',
  standalone: true,
  imports: [NavbarComponent, CommonModule],
  templateUrl: './prodpage.component.html',
  styleUrls: ['./prodpage.component.css'], // Correction: "styleUrls" (au pluriel)
})
export class ProdpageComponent implements OnInit {
  productId: string = '';
  product: any = null;
  isLoading: boolean = false;
  errorMessage: string = '';
  selectedTab: string = 'description';

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private unsplashService: UnsplashService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.productId = params.get('id') || '';
      if (this.productId) {
        this.fetchProductDetails();
      } else {
        this.errorMessage = 'Aucun produit trouvé.';
      }
    });
  }

  fetchProductDetails() {
    this.isLoading = true;
    this.apiService.getProductById(this.productId).subscribe({
      next: (data) => {
        if (data) {
          this.product = data;
          // Récupération d'une image depuis Unsplash basée sur le nom du produit
          if (this.product && this.product.name) {
            this.unsplashService.searchPhotos(this.product.name).subscribe({
              next: (response) => {
                if (response.results && response.results.length > 0) {
                  const rawUrl = response.results[0].urls.raw;
                  // Demande une image de 300x300 pixels, recadrée si nécessaire
                  this.product.imageUrl = `${rawUrl}?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=300`;
                } else {
                  console.log(`Aucune image trouvée pour ${this.product.name}`);
                }
              },
              error: (error) => {
                console.error(
                  "Erreur lors de la récupération d'image depuis Unsplash :",
                  error
                );
              },
            });
          }
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

  selectTab(tab: string) {
    this.selectedTab = tab;
  }
  trackByProduct(index: number, product: any): any {
    return product.id; 
  }
}
