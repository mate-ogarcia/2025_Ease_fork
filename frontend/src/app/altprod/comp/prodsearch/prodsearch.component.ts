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
import { UnsplashService } from '../../../../services/unsplash.service';
import { ApiEuropeanCountries } from '../../../../services/europeanCountries/api.europeanCountries';
import { ApiOpenFoodFacts } from '../../../../services/openFoodFacts/openFoodFacts.service';

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
    private unsplashService: UnsplashService,
    private apiOpenFoodFacts: ApiOpenFoodFacts, 
  ) { }

  /**
   * @brief Lifecycle hook that runs on component initialization.
   * 
   * Retrieves the product ID from the route parameters, fetches product details,
   * loads the list of European countries, and retrieves an image from Unsplash.
   */
  ngOnInit() {
    // Charger la liste des pays européens
    this.apicountries.fetchEuropeanCountries();

    this.route.paramMap.subscribe(params => {
      // 🔹 Correction : Utiliser get() pour extraire les paramètres
      this.productId = params.get('id') || '';
      const productSource = params.get('source') || 'Internal'; // Valeur par défaut

      console.log('prodsearch.ts');
      console.log("🔹 Product ID:", this.productId);
      console.log("🌍 Product Source:", productSource);

      // Vérifier la source du produit et récupérer les données
      if (this.productId) {
        if (productSource === "Internal") {
          this.fetchInternalProduct(this.productId);
        } else {
          this.fetchExternalProduct(this.productId, productSource);
        }
      }
    });
  }

  /**
   * @brief Récupère un produit interne depuis notre API.
   * @param productId L'ID du produit interne.
   */
  fetchInternalProduct(productId: string) {
    this.apiService.getProductById(productId).subscribe({
      next: (data) => {
        this.handleProductData(data);
      },
      error: (error) => console.error("❌ Error retrieving product:", error)
    });
  }

  /**
   * @brief Récupère un produit depuis une API externe en fonction de sa source.
   * @param productId L'ID du produit.
   * @param productSource La source de l'API (ex: OpenFoodFacts, SomeOtherAPI, etc.).
   */
  fetchExternalProduct(productId: string, productSource: string) {
    switch (productSource) {
      case "OpenFoodFacts":
        this.apiOpenFoodFacts.getOpenFoodFactsProductById(productId).subscribe({
          next: (data) => this.handleProductData(data),
          error: (error) => console.error("❌ Error retrieving product from OpenFoodFacts:", error)
        });
        break;

      default:
        console.warn(`⚠️ Unknown external API source: ${productSource}`);
        break;
    }
  }



  /**
 * @brief Gère les données du produit récupéré.
 * @param product Le produit récupéré depuis l'API.
 */
  handleProductData(product: any) {
    this.productDetails = product;
    console.log("✅ Product retrieved:", this.productDetails);

    // Vérifie si l'origine est européenne
    this.isEuropean = this.apicountries.checkIfEuropean(this.productDetails.origin);

    // Charger une image depuis Unsplash
    this.loadProductImage(this.productDetails.name);
  }

  /**
  * @brief Charge une image du produit depuis Unsplash.
  * @param productName Le nom du produit.
  */
  loadProductImage(productName: string) {
    if (!productName) return;

    this.unsplashService.searchPhotos(productName).subscribe({
      next: (response) => {
        if (response.results && response.results.length > 0) {
          const rawUrl = response.results[0].urls.raw;
          this.productDetails.imageUrl = `${rawUrl}?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=300`;
        } else {
          console.log(`Aucune image trouvée pour ${productName}`);
        }
      },
      error: (error) => {
        console.error("❌ Erreur lors de la récupération d'image Unsplash :", error);
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
