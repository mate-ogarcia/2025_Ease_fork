import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.productId = params.get('id') || '';
      console.log("🔹 ID du produit reçu:", this.productId);
      if (this.productId) {
        this.fetchProductDetails();
      }
    });
  }

  fetchProductDetails() {
    this.isLoading = true;
    this.apiService.getProductById(this.productId).subscribe({
      next: (data) => {
        this.product = data;
        console.log("✅ Détails du produit chargés:", this.product);
      },
      error: () => {
        this.errorMessage = 'Produit introuvable';
        console.error("❌ Erreur lors du chargement des détails du produit");
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}

