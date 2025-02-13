import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { NavbarComponent } from '../homepage/home/comp/navbar/navbar.component';

@Component({
  selector: 'app-prodpage',
  imports: [NavbarComponent, CommonModule],
  standalone: true,
  templateUrl: './prodpage.component.html',
  styleUrl: './prodpage.component.css'
})
export class ProdpageComponent implements OnInit {
  productId: string = '';
  product: any = null;
  isLoading: boolean = false;
  errorMessage: string = '';
  selectedTab: string = 'description'; // ✅ Ajout du state pour les onglets

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.productId = params.get('id') || '';
      if (this.productId) {
        this.fetchProductDetails();
      } else {
        this.errorMessage = "Aucun produit trouvé.";
      }
    });
  }

  fetchProductDetails() {
    this.isLoading = true;
    this.apiService.getProductById(this.productId).subscribe({
      next: (data) => {
        if (data) {
          this.product = data;
        } else {
          this.errorMessage = "Produit introuvable.";
        }
      },
      error: () => {
        this.errorMessage = 'Erreur lors du chargement des détails du produit.';
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  // ✅ Méthode pour changer d'onglet
  selectTab(tab: string) {
    this.selectedTab = tab;
  }
}
