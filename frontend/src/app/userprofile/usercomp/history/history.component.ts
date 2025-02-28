import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UnsplashService } from '../../../../services/unsplash.service'; // ajuste le chemin selon ta structure

@Component({
  selector: 'app-history',
  imports: [CommonModule],
  templateUrl: './history.component.html',
  styleUrl: './history.component.css'
})
export class HistoryComponent implements OnInit {
  resultsArray: any[] = [];
  viewMode: 'list' | 'grid' = 'list'; // mode par défaut

  constructor(
    private router: Router,
    private unsplashService: UnsplashService
  ) { }

  ngOnInit(): void {
    this.resultsArray = history.state.resultsArray || [];

    // Pour chaque produit, lancer une recherche d'image
    this.resultsArray.forEach(product => {
      if (product && product.name) {
        this.unsplashService.searchPhotos(product.name).subscribe({
          next: (response) => {
            if (response.results && response.results.length > 0) {
              let finalUrl = '';
              const urls = response.results[0].urls;

              if (urls.raw) {
                finalUrl = `${urls.raw}?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=300`;
              } else if (urls.small) {
                finalUrl = urls.small;
              }

              product.imageUrl = finalUrl;
            } else {
              console.log(`Aucune image trouvée pour ${product.name}`);
            }
          },
          error: (err) => {
            console.error(`Erreur lors de la recherche d'image pour ${product.name}:`, err);
          },
          complete: () => {
          }
        });

      }
    });
  }

  setViewMode(mode: 'list' | 'grid'): void {
    this.viewMode = mode;
  }

  goToProduct(product: any) {
    if (product?.id) {
      console.log("🔹 Redirecting to product:", product);
      this.router.navigate([`/products-alternative/${product.id}`]).then(() => {
        console.log(`✅ Successfully navigated to /product-page/${product.id}`);
      }).catch(error => {
        console.error("❌ Navigation error:", error);
      });
    } else {
      console.warn("⚠️ Invalid product or missing ID");
    }
  }

  trackByProduct(index: number, product: any): any {
    return product.id;
  }
}
