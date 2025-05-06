import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

// Services
import { FavoritesService } from '../../../../services/favorites/favorites.service';
import { NotificationService } from '../../../../services/notification/notification.service';
import { APIUnsplash } from '../../../../services/unsplash/unsplash.service';

// Shared Components
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.css']
})
export class FavoritesComponent implements OnInit {
  favorites: any[] = [];
  isLoading = false;
  errorMessage = '';

  // Pagination
  currentPage = 1;
  itemsPerPage = 6;
  totalPages = 1;

  constructor(
    private favoritesService: FavoritesService,
    private apiUnsplash: APIUnsplash,
    private router: Router,
    private notificationService: NotificationService
  ) { }

  // Getter pour obtenir les favoris de la page courante
  get paginatedFavorites(): any[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.favorites.slice(startIndex, endIndex);
  }

  // Méthodes de navigation
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  // Méthode pour générer le tableau des pages
  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  // Mise à jour du nombre total de pages
  private updateTotalPages(): void {
    this.totalPages = Math.max(1, Math.ceil(this.favorites.length / this.itemsPerPage));
    // Si la page courante est supérieure au nombre total de pages, on revient à la dernière page
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
  }

  ngOnInit(): void {
    this.loadFavorites();
  }

  /**
   * @brief Charge les produits favoris de l'utilisateur
   */
  loadFavorites(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.favoritesService.loadFavorites().subscribe({
      next: (favorites) => {
        this.favorites = favorites;
        this.loadProductImages();
        this.updateTotalPages();
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Impossible de charger vos favoris. Veuillez réessayer plus tard.';
        this.isLoading = false;
      }
    });
  }

  /**
   * @brief Charge les images pour chaque produit favori
   */
  private loadProductImages(): void {
    this.favorites.forEach(product => {
      // Si le produit a un nom mais pas d'image
      if (!product?.image && !product?.imageUrl && product?.name) {
        this.apiUnsplash.searchPhotos(product.name).subscribe({
          next: (response) => {
            if (response.imageUrl) {
              product.image = response.imageUrl;
            } else {
              // Ne pas définir d'image par défaut qui n'existe pas
              product.image = null;
            }
          },
          error: (err) => {
            product.image = null;
          }
        });
      } else if (product?.imageUrl && !product?.image) {
        product.image = product.imageUrl;
      }
    });
  }

  /**
   * @brief Supprime un produit des favoris
   * @param productId ID du produit à supprimer
   * @param event Événement DOM pour éviter la propagation
   */
  removeFromFavorites(productId: string, event: Event): void {
    event.stopPropagation();

    this.favoritesService.removeFromFavorites(productId).subscribe({
      next: () => {
        // Mise à jour de la liste locale des favoris
        this.favorites = this.favorites.filter(fav => fav.productId !== productId);
        // Mise à jour de la pagination
        this.updateTotalPages();
        // Si la page courante est vide et qu'il y a des pages précédentes, on revient à la page précédente
        if (this.paginatedFavorites.length === 0 && this.currentPage > 1) {
          this.currentPage--;
        }
      },
      error: (error) => {
        this.notificationService.showError('Erreur lors de la suppression du favori');
      }
    });
  }

  /**
   * @brief Navigue vers la page détaillée du produit
   * @param productId ID du produit à consulter
   */
  viewProductDetails(productId: string): void {
    this.router.navigate(['/prodpage', productId]);
  }

  /**
   * @brief Gère les erreurs de chargement d'image
   * @param event Événement d'erreur
   */
  handleImageError(event: any): void {
    const img = event.target;
    const product = this.favorites.find(p => p.image === img.src);
    if (product) {
      product.image = null;
    }
  }
} 