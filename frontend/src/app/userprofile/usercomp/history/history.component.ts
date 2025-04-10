/**
 * @file history.component.ts
 * @brief Component for displaying the history of searched products.
 *
 * This component retrieves previously searched products from the history service
 * and displays them in either a list or grid view. It allows users to re-search
 * items from their history by clicking on them.
 */

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
// Services
import { HistoryService, SearchHistoryItem } from '../../../../services/history/history.service';
import { ApiService } from '../../../../services/api.service';
import { NotificationService } from '../../../../services/notification/notification.service';
// RxJS
import { finalize } from 'rxjs/operators';

/**
 * @class HistoryComponent
 * @brief Component responsible for displaying the search history of products.
 */
@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './history.component.html',
  styleUrl: './history.component.css'
})
export class HistoryComponent implements OnInit {
  resultsArray: SearchHistoryItem[] = []; ///< Array to store history items.
  viewMode: 'list' | 'grid' = 'list'; ///< Default display mode.
  isLoading: boolean = true; ///< Loading state flag.
  error: string | null = null; ///< Error message if present.
  successMessage: string | null = null; ///< Success message if present.

  /**
   * @brief Constructor initializes dependencies.
   * @param router Router for navigation.
   * @param historyService Service for fetching user's search history.
   * @param apiService Service for executing searches.
   * @param notificationService Service for displaying notifications.
   */
  constructor(
    private router: Router,
    private historyService: HistoryService,
    private apiService: ApiService,
    private notificationService: NotificationService
  ) { }

  /**
   * @brief Lifecycle hook executed when the component is initialized.
   */
  ngOnInit(): void {
    console.log('🔍 history.component - ngOnInit');

    // Vérifier si des données de test sont présentes
    if (this.resultsArray && this.resultsArray.length > 0) {
      console.warn('⚠️ Des données sont déjà présentes dans resultsArray:', this.resultsArray);
    }

    // Vérifier les données dans le localStorage
    try {
      const keys = Object.keys(localStorage);
      console.log('🔍 Clés dans localStorage:', keys);

      for (const key of keys) {
        if (key.includes('history') || key.includes('search')) {
          console.warn(`⚠️ Trouvé dans localStorage: ${key}:`, localStorage.getItem(key));
        }
      }
    } catch (e) {
      console.error('❌ Erreur lors de la lecture du localStorage:', e);
    }

    this.setViewMode('list'); // Set default view mode to list
    this.loadHistory();
  }

  /**
   * @brief Loads the user's search history.
   */
  loadHistory(): void {
    console.log('🔍 Tentative de chargement de l\'historique...');
    this.isLoading = true;
    this.error = null;
    this.successMessage = null;

    this.historyService.getUserHistory().subscribe({
      next: (historyItems) => {
        console.log('✅ Historique récupéré, nombre d\'éléments:', historyItems.length);
        console.log('📋 Détails de l\'historique:', JSON.stringify(historyItems, null, 2));

        if (historyItems.length === 0) {
          console.log('ℹ️ Aucun élément d\'historique trouvé dans la BDD');
        }

        this.resultsArray = historyItems;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('❌ Erreur lors du chargement de l\'historique:', err);
        this.isLoading = false;
        this.error = 'Erreur lors du chargement de l\'historique. Veuillez réessayer.';
        this.notificationService.showError('Erreur lors du chargement de l\'historique. Veuillez réessayer.');
      }
    });
  }

  /**
   * @brief Sets the display mode for the results.
   * @param mode The desired view mode ('list' or 'grid').
   */
  setViewMode(mode: 'list' | 'grid'): void {
    this.viewMode = mode;
  }

  /**
   * @brief Extracts the search term from a history item.
   * @param item The history item to extract the search term from.
   * @return The search term.
   */
  getSearchTerm(item: any): string {
    console.log('🔍 Analyse de l\'élément d\'historique:', item);

    // Check if this is a filter search (special ID format starting with 'filter-')
    if (item.id && typeof item.id === 'string' && item.id.startsWith('filter-')) {
      console.log('  ✓ Recherche par filtres détectée');
      // For filter searches, productName contains the filter description
      if (item.productName) {
        console.log('  ✓ Description des filtres trouvée:', item.productName);
        return this.cleanHtmlTags(item.productName);
      }
    }

    // Try different properties where the search term might be stored
    if (typeof item === 'object' && item) {
      // Look first in standard properties
      if (item.productName) {
        console.log('  ✓ Trouvé dans productName:', item.productName);
        return this.cleanHtmlTags(item.productName);
      }

      // Check in productData
      if (item.productData && typeof item.productData === 'object') {
        if (item.productData.name) {
          console.log('  ✓ Trouvé dans productData.name:', item.productData.name);
          return this.cleanHtmlTags(item.productData.name);
        }
        if (item.productData.productName) {
          console.log('  ✓ Trouvé dans productData.productName:', item.productData.productName);
          return this.cleanHtmlTags(item.productData.productName);
        }
      }

      // Check in _default (specific to Couchbase's structure)
      if (item._default && typeof item._default === 'object') {
        if (item._default.productName) {
          console.log('  ✓ Trouvé dans _default.productName:', item._default.productName);
          return this.cleanHtmlTags(item._default.productName);
        }
      }

      // Search in direct values at the top level
      for (const key of ['name', 'term', 'query', 'searchText', 'title']) {
        if (item[key] && typeof item[key] === 'string') {
          console.log(`  ✓ Trouvé dans ${key}:`, item[key]);
          return this.cleanHtmlTags(item[key]);
        }
      }

      // Search in second-level values
      for (const prop in item) {
        const value = item[prop];
        if (typeof value === 'object' && value !== null) {
          for (const subProp of ['name', 'productName', 'query', 'searchText', 'term']) {
            if (value[subProp] && typeof value[subProp] === 'string') {
              console.log(`  ✓ Trouvé dans ${prop}.${subProp}:`, value[subProp]);
              return this.cleanHtmlTags(value[subProp]);
            }
          }
        }
      }
    }

    console.log('⚠️ Aucun terme de recherche trouvé, utilisation de la valeur par défaut');
    return "Recherche";
  }

  /**
   * @brief Cleans HTML tags from a string.
   * @param text The text to clean.
   * @return The cleaned text.
   */
  cleanHtmlTags(text: string): string {
    if (!text || typeof text !== 'string') return '';

    // Remove HTML tags
    let cleanText = text.replace(/<\/?[^>]+(>|$)/g, '');

    // Remove HTML special characters
    cleanText = cleanText.replace(/&[^;]+;/g, '');

    // Trim and normalize spaces
    cleanText = cleanText.trim().replace(/\s+/g, ' ');

    console.log('  🧹 Texte nettoyé:', cleanText);
    return cleanText;
  }

  /**
   * @brief Searches again for the product when a history item is clicked.
   * @param historyItem The selected history item.
   */
  searchAgain(historyItem: any): void {
    console.log('🔍 Recherche à partir de l\'historique:', historyItem);

    // Show loading indicator
    this.isLoading = true;

    // Extract search term
    const searchTerm = this.getSearchTerm(historyItem);

    if (!searchTerm || searchTerm === "Recherche") {
      console.error('❌ Terme de recherche non valide trouvé');
      this.isLoading = false;
      this.error = 'Impossible de relancer cette recherche. Terme non valide.';
      return;
    }

    console.log('🔍 Terme de recherche extrait:', searchTerm);

    // Check if this is a filter search
    if (historyItem.id && typeof historyItem.id === 'string' && historyItem.id.startsWith('filter-')) {
      this.handleFilterSearch(historyItem, searchTerm);
      return;
    }

    // Extract product ID (accounting for nested structure)
    let productId = historyItem.productId;

    // Check for ID in _default structure (standard for Couchbase)
    if (!productId && historyItem._default) {
      productId = historyItem._default.productId;
    }

    console.log('🔍 ID du produit extrait:', productId);

    // Build search request
    const searchRequest = {
      productId: productId || "",
      productName: searchTerm,
      currentRoute: '/home'
    };

    console.log('🔍 Envoi de la requête de recherche:', searchRequest);

    // Send request to API service
    this.apiService.postProductsWithFilters(searchRequest).subscribe({
      next: (results) => {
        console.log('✅ Résultats de recherche reçus:', results.length || 0, 'produits');
        this.isLoading = false;

        // If we have a valid product ID and only one result, we can navigate directly to the product page
        if (productId && results.length === 1) {
          console.log('✅ Navigation directe vers la page du produit:', productId);
          this.router.navigate(['/prodpage', productId]);
          return;
        }

        // Otherwise, navigate to the search results page
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
          this.router.navigate(['/searched-prod'], {
            state: { resultsArray: results }
          });
        });
      },
      error: (err) => {
        console.error('❌ Erreur lors de la recherche:', err);
        this.isLoading = false;
        this.error = 'Erreur lors de la recherche. Veuillez réessayer.';
      }
    });
  }

  /**
   * @brief Handles a search using filters from the history.
   * @param historyItem The history item containing filter information.
   * @param filterDescription The human-readable description of the filters.
   */
  private handleFilterSearch(historyItem: any, filterDescription: string): void {
    console.log('🔍 Recherche par filtres depuis l\'historique:', filterDescription);

    // Try to extract filter information from the description
    const filters: any = {};

    // Parse the filter description to reconstruct filter values
    if (filterDescription.includes('Pays:')) {
      const match = filterDescription.match(/Pays: ([^,]+)/);
      if (match && match[1]) filters.country = match[1].trim();
    }

    if (filterDescription.includes('Département:')) {
      const match = filterDescription.match(/Département: ([^,]+)/);
      if (match && match[1]) filters.department = match[1].trim();
    }

    if (filterDescription.includes('Catégorie:')) {
      const match = filterDescription.match(/Catégorie: ([^,]+)/);
      if (match && match[1]) filters.category = match[1].trim();
    }

    if (filterDescription.includes('Marque:')) {
      const match = filterDescription.match(/Marque: ([^,]+)/);
      if (match && match[1]) filters.brand = match[1].trim();
    }

    if (filterDescription.includes('Prix:')) {
      const match = filterDescription.match(/Prix: (\d+)€-(\d+)€/);
      if (match && match[1] && match[2]) {
        filters.price = {
          min: parseInt(match[1]),
          max: parseInt(match[2])
        };
      }
    }

    console.log('🔍 Filtres extraits:', filters);

    // Build search request with extracted filters
    const searchRequest = {
      ...filters,
      currentRoute: '/home'
    };

    console.log('🔍 Envoi de la requête de recherche avec filtres:', searchRequest);

    this.apiService.postProductsWithFilters(searchRequest).subscribe({
      next: (results) => {
        console.log('✅ Résultats de recherche par filtres reçus:', results.length || 0, 'produits');
        this.isLoading = false;

        // Navigate to the search results page
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
          this.router.navigate(['/searched-prod'], {
            state: { resultsArray: results }
          });
        });
      },
      error: (err) => {
        console.error('❌ Erreur lors de la recherche par filtres:', err);
        this.isLoading = false;
        this.error = 'Erreur lors de la recherche. Veuillez réessayer.';
      }
    });
  }

  /**
   * @brief Tracks history items for *ngFor to optimize rendering.
   * @param index The index of the history item.
   * @param item The history item.
   * @return The unique history ID or product ID.
   */
  trackByProduct(index: number, item: any): any {
    // Use the history ID, which is unique even for duplicate entries
    const defaultId = item._default ? item._default.id : undefined;
    return item.id || defaultId || `${item.productId}-${index}`;
  }

  /**
   * @brief Method to clear the entire history
   */
  clearHistory(): void {
    console.log('🧹 Tentative de suppression de l\'historique complet');

    // Ask for confirmation before deleting the entire history
    if (!confirm('Êtes-vous sûr de vouloir supprimer tout votre historique de recherche ?')) {
      console.log('❌ Suppression de l\'historique annulée par l\'utilisateur');
      return;
    }

    this.isLoading = true;
    this.error = null;
    this.successMessage = null;

    // Detailed log to understand what's happening
    console.log('🧹 Appel de clearUserHistory...');

    this.historyService.clearUserHistory()
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (response) => {
          console.log('✅ Historique effacé avec succès:', response);

          // Analyze the response
          if (response.deleted === 0 && response.failed === 0) {
            console.log('ℹ️ Aucun élément n\'était présent dans l\'historique');
          } else if (response.failed && response.failed > 0) {
            console.warn(`⚠️ ${response.failed} éléments n'ont pas pu être supprimés`);
          }

          this.isLoading = false;

          // Empty the local array immediately for instant visual update
          this.resultsArray = [];

          // Reload empty history for verification
          setTimeout(() => this.loadHistory(), 500);

          // Also try to remove local cache
          try {
            localStorage.removeItem('searchHistory');
            sessionStorage.removeItem('searchHistory');
          } catch (e) {
            console.error('❌ Erreur lors de la suppression du cache:', e);
          }

          // Appropriate message according to the result
          if (response.deleted > 0) {
            this.notificationService.showSuccess(`Votre historique a été effacé avec succès (${response.deleted} élément${response.deleted > 1 ? 's' : ''})`);
          } else {
            this.notificationService.showInfo('Aucun élément à supprimer dans l\'historique');
          }
        },
        error: (err) => {
          console.error('❌ Erreur lors de la suppression de l\'historique:', err);
          this.isLoading = false;

          // Extract detailed error message if available
          let errorMessage = 'Erreur lors de la suppression de l\'historique.';

          if (err.error && err.error.message) {
            errorMessage += ` ${err.error.message}`;
          } else if (err.message) {
            errorMessage += ` ${err.message}`;
          }

          console.error('Message d\'erreur détaillé:', errorMessage);

          // Display error notification with details
          this.notificationService.showError(errorMessage);
        }
      });
  }

  /**
   * @brief Deletes a specific item from the history.
   * @param historyItem The history item to delete.
   * @param event The click event to prevent propagation.
   */
  deleteHistoryItem(historyItem: any, event: Event): void {
    // Prevent propagation to avoid triggering searchAgain()
    event.stopPropagation();

    console.log('🗑️ Suppression de l\'élément d\'historique complet:', historyItem);
    console.log('🗑️ Type de l\'élément:', typeof historyItem);
    console.log('🗑️ Clés disponibles:', Object.keys(historyItem));
    console.log('🗑️ ID de l\'élément:', historyItem.id);
    console.log('🗑️ ID brut:', JSON.stringify(historyItem.id));

    // Try to find an ID from available properties
    let historyId = historyItem.id || historyItem._id;

    // Check for ID in _default structure (Couchbase standard)
    if (!historyId && historyItem._default && typeof historyItem._default === 'object') {
      historyId = historyItem._default.id || historyItem._default._id;
      console.log('🗑️ ID extrait de _default:', historyId);
    }

    if (!historyId) {
      console.error('❌ Impossible de supprimer un élément sans ID:', historyItem);
      this.notificationService.showError('Impossible de supprimer cet élément. ID manquant.');
      return;
    }

    // Show loading indicator
    this.isLoading = true;
    this.error = null;
    this.successMessage = null;

    console.log('🗑️ Tentative de suppression avec l\'ID:', historyId);

    this.historyService.deleteHistoryItem(historyId)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (response) => {
          console.log('✅ Élément supprimé avec succès:', response);

          // Update display by removing the deleted item
          this.resultsArray = this.resultsArray.filter(item => {
            const defaultId = item._default ? item._default.id : undefined;
            const itemId = item.id || defaultId;
            return itemId !== historyId;
          });

          // Display success notification
          this.notificationService.showSuccess('Élément supprimé avec succès');
        },
        error: (err) => {
          console.error('❌ Erreur lors de la suppression de l\'élément:', err);
          this.notificationService.showError('Erreur lors de la suppression. Veuillez réessayer.');
        }
      });
  }
}
