import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UnsplashService } from '../../../../services/unsplash.service'; // ajuste le chemin selon ta structure

@Component({
  selector: 'app-display-results',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './display-results.component.html',
  styleUrls: ['./display-results.component.css'],
})
export class DisplayResultsComponent implements OnInit {
  resultsArray: any[] = [];

  constructor(
    private router: Router, 
    private unsplashService: UnsplashService
  ) {}

  ngOnInit(): void {
    this.resultsArray = history.state.resultsArray || [];
    console.log('🔹 Results received: (display-results.ts)', this.resultsArray);
    
    // Pour chaque produit, lancer une recherche d'image
    this.resultsArray.forEach(product => {
      if (product && product.name) {
        this.unsplashService.searchPhotos(product.name).subscribe(response => {
          console.log('Unsplash response for', product.name, response);
          if (response.results && response.results.length > 0) {
            // Tente d'utiliser l'URL raw avec des paramètres
            let finalUrl = '';
            if (response.results[0].urls.raw) {
              finalUrl = `${response.results[0].urls.raw}?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=300`;
            } else if (response.results[0].urls.small) {
              // Utilise l'URL small en fallback
              finalUrl = response.results[0].urls.small;
            }
            product.imageUrl = finalUrl;
          } else {
            console.log(`Aucune image trouvée pour ${product.name}`);
          }
        }, error => {
          console.error("Erreur lors de la récupération d'image depuis Unsplash :", error);
        });
      }
    });
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
    return product.id; // Assurez-vous que chaque produit possède un identifiant unique
  }
}
