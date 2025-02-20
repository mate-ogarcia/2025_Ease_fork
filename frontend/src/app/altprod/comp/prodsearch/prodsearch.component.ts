/**
 * @file prodsearch.component.ts
 * @brief Component for searching and displaying product details.
 * 
 * This component retrieves a product ID from the route parameters
 * and fetches the corresponding product details from the API.
 * It also fetches an image from Unsplash based on the product name.
 */

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
// API service
import { ApiService } from '../../../../services/api.service';
import { UnsplashService } from '../../../../services/unsplash.service'; // ajuste le chemin selon ta structure
import { ApiEuropeanCountries } from '../../../../services/europeanCountries/api.europeanCountries';

@Component({
  selector: 'app-prodsearch',
  imports: [CommonModule],
  templateUrl: './prodsearch.component.html',
  styleUrls: ['./prodsearch.component.css']  // Correction: "styleUrls" (au pluriel)
})
export class ProdsearchComponent implements OnInit {
  /** @brief Product ID retrieved from the route parameters. */
  productId: string = '';

  /** @brief Stores the product details fetched from the API. */
  productDetails: any = null;
  isEuropean: boolean = false;

  /**
   * @brief Constructor initializes route, API service, and HTTP client.
   * @param route ActivatedRoute for retrieving route parameters.
   * @param apiService Service for fetching product details.
   * @param apicountries Service for fetching product origin.
   * @param http HttpClient for making API requests.
   * @param unsplashService Service for fetching images from Unsplash.
   */
  constructor(
    private route: ActivatedRoute, 
    private apiService: ApiService, 
    private apicountries: ApiEuropeanCountries, 
    private http: HttpClient,
    private unsplashService: UnsplashService
  ) {}

  /**
   * @brief Lifecycle hook that runs on component initialization.
   * 
   * Retrieves the product ID from the route parameters, fetches product details,
   * loads the list of European countries, and retrieves an image from Unsplash.
   */
  ngOnInit() {
    // Appel de la méthode pour charger les pays européens
    this.apicountries.fetchEuropeanCountries();

    this.route.paramMap.subscribe(params => {
      this.productId = params.get('id') || '';
      console.log("🔹 Product ID received: (prodSearch)", this.productId);

      if (this.productId) {
        this.apiService.getProductById(this.productId).subscribe({
          next: (data) => {
            this.productDetails = data;
            console.log("✅ Product retrieved: (prodSearch)", this.productDetails);
            // Vérifie si l'origine est européenne afin d'appliquer le style correspondant
            this.isEuropean = this.apicountries.checkIfEuropean(this.productDetails.origin);

            // Récupération d'une image depuis Unsplash basée sur le nom du produit
            if (this.productDetails && this.productDetails.name) {
              this.unsplashService.searchPhotos(this.productDetails.name).subscribe({
                next: (response) => {
                  if (response.results && response.results.length > 0) {
                    // Utilisation de l'URL raw pour forcer une taille uniforme via les paramètres
                    // Ici, on demande une image de 300x300 pixels, recadrée si nécessaire
                    const rawUrl = response.results[0].urls.raw;
                    this.productDetails.imageUrl = `${rawUrl}?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=300`;
                  } else {
                    console.log(`Aucune image trouvée pour ${this.productDetails.name}`);
                  }
                },
                error: (error) => {
                  console.error("❌ Erreur lors de la récupération d'image depuis Unsplash :", error);
                }
              });
            }
          },
          error: (error) => console.error("❌ Error retrieving product:", error)
        });
      }
    });
  }

  /**
   * @brief Returns the CSS class based on the product rating.
   * @param rating Product rating (from 1 to 5).
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
}
