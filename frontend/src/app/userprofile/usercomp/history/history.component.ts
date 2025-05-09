/**
 * @file history.component.ts
 * @brief Component for displaying the history of searched products.
 *
 * This component retrieves previously searched products from the history service
 * and displays them in a list view. It allows users to re-search
 * items from their history by clicking on them.
 */

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
// Services
import { HistoryService, SearchHistoryItem } from '../../../../services/history/history.service';
import { ApiService } from '../../../../services/api.service';
import { NotificationService } from '../../../../services/notification/notification.service';
// Shared Components
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
// RxJS
import { finalize } from 'rxjs/operators';

/**
 * @class HistoryComponent
 * @brief Component responsible for displaying the search history of products.
 */
@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent],
  templateUrl: './history.component.html',
  styleUrl: './history.component.css'
})
export class HistoryComponent implements OnInit {
  resultsArray: SearchHistoryItem[] = []; ///< Array to store history items.
  isLoading: boolean = true; ///< Loading state flag.
  error: string | null = null; ///< Error message if present.

  // Pagination
  currentPage: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;
  pageSizes: number[] = [5, 10, 20, 50];
  pages: number[] = [];

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
    this.isLoading = true;
    this.error = null;

    // Load saved page size from localStorage if available
    const savedPageSize = localStorage.getItem('historyPageSize');
    if (savedPageSize) {
      const parsedSize = parseInt(savedPageSize, 10);
      if (!isNaN(parsedSize) && this.pageSizes.includes(parsedSize)) {
        this.pageSize = parsedSize;
        this.historyService.setPageSize(parsedSize);
      }
    }

    // Subscribe to pagination updates
    this.historyService.historyItems$.subscribe(items => {
      this.resultsArray = items || [];
      this.isLoading = false; // End loading when items are received
    });

    this.historyService.totalItems$.subscribe(total => {
      this.totalItems = total || 0;
      this.updatePages();
    });

    this.historyService.currentPage$.subscribe(page => {
      this.currentPage = page || 1;
    });

    this.historyService.pageSize$.subscribe(size => {
      this.pageSize = size || 10;
      this.updatePages();
    });

    // Initial history loading
    this.loadHistory();
  }

  private updatePages(): void {
    if (this.totalItems && this.pageSize) {
      const pageCount = Math.ceil(this.totalItems / this.pageSize);
      this.pages = Array.from({ length: pageCount }, (_, i) => i + 1);
    } else {
      this.pages = [];
    }
  }

  /**
   * @brief Loads the user's search history.
   */
  loadHistory(): void {
    this.isLoading = true;
    this.error = null;

    // Use the new method that loads everything and paginates client-side
    this.historyService.loadUserHistory().subscribe({
      next: () => {
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.error = 'Erreur lors du chargement de l\'historique. Veuillez réessayer.';
        this.notificationService.showError('Erreur lors du chargement de l\'historique. Veuillez réessayer.');
      }
    });
  }

  /**
   * @brief Extracts the search term from a history item.
   * @param item The history item to extract the search term from.
   * @return The search term.
   */
  getSearchTerm(item: any): string {
    // Check if this is a filter search (special ID format starting with 'filter-')
    if (item.id && typeof item.id === 'string' && item.id.startsWith('filter-')) {
      // For filter searches, productName contains the filter description
      if (item.productName) {
        return this.cleanHtmlTags(item.productName);
      }
    }

    // Try different properties where the search term might be stored
    if (typeof item === 'object' && item) {
      // Look first in standard properties
      if (item.productName) {
        return this.cleanHtmlTags(item.productName);
      }

      // Check in productData
      if (item.productData && typeof item.productData === 'object') {
        if (item.productData.name) {
          return this.cleanHtmlTags(item.productData.name);
        }
        if (item.productData.productName) {
          return this.cleanHtmlTags(item.productData.productName);
        }
      }

      // Check in _default (specific to Couchbase's structure)
      if (item._default && typeof item._default === 'object') {
        if (item._default.productName) {
          return this.cleanHtmlTags(item._default.productName);
        }
      }

      // Search in direct values at the top level
      for (const key of ['name', 'term', 'query', 'searchText', 'title']) {
        if (item[key] && typeof item[key] === 'string') {
          return this.cleanHtmlTags(item[key]);
        }
      }

      // Search in second-level values
      for (const prop in item) {
        const value = item[prop];
        if (typeof value === 'object' && value !== null) {
          for (const subProp of ['name', 'productName', 'query', 'searchText', 'term']) {
            if (value[subProp] && typeof value[subProp] === 'string') {
              return this.cleanHtmlTags(value[subProp]);
            }
          }
        }
      }
    }

    return "Search";
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

    return cleanText;
  }

  /**
   * @brief Searches again for the product when a history item is clicked.
   * @param historyItem The selected history item.
   */
  searchAgain(historyItem: any): void {
    // Show loading indicator
    this.isLoading = true;

    // Extract search term
    const searchTerm = this.getSearchTerm(historyItem);

    if (!searchTerm || searchTerm === "Search") {
      this.isLoading = false;
      this.error = 'Unable to repeat this search. Invalid term.';
      return;
    }

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

    // Build search request
    const searchRequest = {
      productId: productId || "",
      productName: searchTerm,
      currentRoute: '/home'
    };

    // Send request to API service
    this.apiService.postProductsWithFilters(searchRequest).subscribe({
      next: (results) => {
        this.isLoading = false;

        // If we have a valid product ID and only one result, we can navigate directly to the product page
        if (productId && results.length === 1) {
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
        this.isLoading = false;
        this.error = 'Erreur lors de la recherche. Cette fonctionnalité n\'est pas encore complètement implémentée.';
      }
    });
  }

  /**
   * @brief Handles a search using filters from the history.
   * @param historyItem The history item containing filter information.
   * @param filterDescription The human-readable description of the filters.
   */
  private handleFilterSearch(historyItem: any, filterDescription: string): void {
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

    // Build search request with extracted filters
    const searchRequest = {
      ...filters,
      currentRoute: '/home'
    };

    this.apiService.postProductsWithFilters(searchRequest).subscribe({
      next: (results) => {
        this.isLoading = false;

        // Navigate to the search results page
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
          this.router.navigate(['/searched-prod'], {
            state: { resultsArray: results }
          });
        });
      },
      error: (err) => {
        this.isLoading = false;
        this.error = 'Erreur lors de la recherche. Cette fonctionnalité n\'est pas encore complètement implémentée.';
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
    // Ask for confirmation before deleting the entire history
    if (!confirm('Êtes-vous sûr de vouloir supprimer tout votre historique de recherche ?')) {
      return;
    }

    this.isLoading = true;
    this.error = null;

    this.historyService.clearUserHistory()
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (response) => {
          // Update local data
          this.resultsArray = [];
          this.totalItems = 0;
          this.updatePages();

          // Also try to remove local cache
          try {
            localStorage.removeItem('searchHistory');
            sessionStorage.removeItem('searchHistory');
          } catch (e) {
            // Silent error
          }

          // Appropriate message according to the result
          if (response && response.deleted > 0) {
            this.notificationService.showSuccess(`Votre historique a été effacé avec succès (${response.deleted} élément${response.deleted > 1 ? 's' : ''})`);
          } else {
            this.notificationService.showInfo('Aucun élément à supprimer dans l\'historique');
          }
        },
        error: (err) => {
          // Extract detailed error message if available
          let errorMessage = 'Erreur lors de la suppression de l\'historique.';

          if (err.error && err.error.message) {
            errorMessage += ` ${err.error.message}`;
          } else if (err.message) {
            errorMessage += ` ${err.message}`;
          }

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

    // Try to find an ID from available properties
    let historyId = historyItem.id || historyItem._id;

    // Check for ID in _default structure (Couchbase standard)
    if (!historyId && historyItem._default && typeof historyItem._default === 'object') {
      historyId = historyItem._default.id || historyItem._default._id;
    }

    if (!historyId) {
      this.notificationService.showError('Impossible de supprimer cet élément. ID manquant.');
      return;
    }

    // Show loading state only for this item
    historyItem.isDeleting = true;

    this.historyService.deleteHistoryItem(historyId)
      .pipe(finalize(() => historyItem.isDeleting = false))
      .subscribe({
        next: (response) => {
          // Update display by removing the deleted item
          this.resultsArray = this.resultsArray.filter(item => {
            const defaultId = item._default ? item._default.id : undefined;
            const itemId = item.id || defaultId;
            return itemId !== historyId;
          });

          // Update total items count
          this.totalItems--;
          this.updatePages();

          // Display success notification
          this.notificationService.showSuccess('Élément supprimé avec succès');
        },
        error: (err) => {
          this.notificationService.showError('Erreur lors de la suppression. Veuillez réessayer.');
        }
      });
  }

  /**
   * @brief Changes the current page.
   * @param page The page to navigate to.
   */
  onPageChange(page: number): void {
    if (page >= 1 && page <= this.pages.length) {
      this.historyService.setPage(page);
    }
  }

  /**
   * @brief Handler for page size change event.
   * @param size The new page size.
   */
  onPageSizeChange(size: number): void {
    // Save page size to localStorage for persistence between sessions
    localStorage.setItem('historyPageSize', size.toString());

    // Update service
    this.historyService.setPageSize(size);

    // Reset to first page when changing page size
    this.historyService.setPage(1);
  }
}
