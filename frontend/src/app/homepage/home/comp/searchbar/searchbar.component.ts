import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, tap, filter } from 'rxjs/operators';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../../../../services/api.service';

@Component({
  selector: 'app-searchbar',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './searchbar.component.html',
  styleUrl: './searchbar.component.css',
})
export class SearchbarComponent {
  searchQuery: string = '';
  searchResults: any[] = [];
  noResultsMessage: string = '';
  selectedProduct: string = '';
  isFilterPanelOpen: boolean = false;
  filter1: boolean = false;
  filter2: boolean = false;
  filter3: boolean = false;

  private _searchSubject = new Subject<string>();
  private _cache = new Map<string, { data: any[]; timestamp: number }>();
  private CACHE_DURATION = 5 * 60 * 1000; // 5 minutes expiration

  @Output() searchExecuted = new EventEmitter<void>();

  constructor(private apiService: ApiService, private router: Router) {
    this._searchSubject
      .pipe(
        debounceTime(50),
        distinctUntilChanged(),
        filter((query) => query.trim() !== ''),
        switchMap((query) => {
          const trimmedQuery = query.trim();
          const cachedData = this._cache.get(trimmedQuery);

          if (cachedData && Date.now() - cachedData.timestamp < this.CACHE_DURATION) {
            this.searchResults = cachedData.data.map((result: any) => ({
              id: result.id,
              name: result.fields?.name || 'Unknown name',
              description: result.fields?.description || 'No description available',
            }));
            this.noResultsMessage = this.searchResults.length ? '' : 'No product found.';
            return of(null);
          }

          return this.apiService.sendSearchData({ search: trimmedQuery }).pipe(
            tap((response) => {
              if (response && Array.isArray(response)) {
                this._cache.set(trimmedQuery, { data: [...response], timestamp: Date.now() });
              }
            })
          );
        })
      )
      .subscribe({
        next: (response: any) => {
          if (response) {
            this.searchResults = response.length
              ? response.map((result: any) => ({
                  id: result.id,
                  name: result.fields?.name || 'Unknown name',
                  description: result.fields?.description || 'No description available',
                }))
              : [];
            this.noResultsMessage = this.searchResults.length ? '' : 'No product found.';
          }
        },
        error: (error) => console.error('❌ Error during search:', error),
      });
  }

  get hasSuggestions(): boolean {
    return this.searchResults.length > 0;
  }

  onInputChange(event: any) {
    if (this.searchQuery.trim() === '') {
      this.clearSearch();
      return;
    }
    this._searchSubject.next(this.searchQuery);
  }

  onEnter(event: any) {
    if (this.searchQuery.trim() !== '' && event.key === 'Enter') {
      const queryLower = this.searchQuery.trim().toLowerCase();
      const product = this.searchResults.find((p) =>
        p.name.toLowerCase().includes(queryLower)
      );

      if (product) {
        this.selectProduct(product);
      } else {
        this.noResultsMessage = 'No product found.';
      }
    }
  }

  clearSearch() {
    this.searchQuery = '';
    this.searchResults = [];
    this.noResultsMessage = '';
  }

  selectProduct(product: any) {
    this.searchQuery = product.name;
    this.selectedProduct = product.id;
    this.noResultsMessage = '';

    if (!this.selectedProduct) {
      return;
    }

    this.apiService.postProductSelection({ productId: this.selectedProduct }).subscribe({
      next: () => {
        this.router.navigate(['/products-alternative', this.selectedProduct]).catch((error) =>
          console.error('❌ Navigation error:', error)
        );
      },
      error: (error) => console.error('❌ Error sending product ID:', error),
    });
  }

  toggleFilterPanel() {
    this.isFilterPanelOpen = !this.isFilterPanelOpen;
  }

  applyFilters() {
    console.log("Applying filters...");
  }
}
