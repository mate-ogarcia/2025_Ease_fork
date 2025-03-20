/**
 * @file searchbar.component.ts
 * @brief Implements a search bar with real-time search, result caching, and filtering capabilities.
 * @details This component provides a search bar with real-time search capabilities, efficient caching of results, 
 * and product selection functionalities. It uses RxJS to debounce user input, manages cached search results to improve 
 * performance, and includes filtering options to refine search queries by country, department, category, and price.
 * It has been modified to handle API errors gracefully and prevent UI crashes.
 * 
 * @author Original Author
 * @date Original Date
 * @modified 2023-XX-XX
 */

import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject, of, forkJoin } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, tap, filter, first } from 'rxjs/operators';
import { Router } from '@angular/router';
// API
import { ApiService } from '../../../../../services/api.service';
import { UsersService } from '../../../../../services/users/users.service';
import { ApiOpenFoodFacts } from '../../../../../services/openFoodFacts/openFoodFacts.service';
// Cache API
import { DataCacheService } from '../../../../../services/cache/data-cache.service';

@Component({
  selector: 'app-searchbar',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './searchbar.component.html',
  styleUrls: ['./searchbar.component.css'],
})
export class SearchbarComponent implements OnInit {
  searchQuery: string = '';         // The current search query entered by the user.
  searchResults: any[] = [];          // The list of suggestions to display (limited to 5).
  fullSearchResults: any[] = [];      // The complete list of results from the API.
  noResultsMessage: string = '';      // Message to display if no results are found.
  selectedProduct: string = '';       // The ID of the selected product.
  wholeSelectedProduct: any;          // The whole product object.
  isFilterPanelOpen: boolean = false; // Indicates if the filter panel is open.
  canAddProduct: boolean = false;     // Default: user cannot add product
  
  // Filters
  countries: string[] = [];
  selectedCountry: string = '';
  selectedDepartment: string = '';
  selectedCategory: string = '';
  categories: any[] = [];
  selectedBrand: string = '';
  brands: any[] = [];

  // Price filter
  priceFilter: boolean = false;
  minPrice: number = 0;
  maxPrice: number = 5000;
  appliedFilters: any = {};
  minPriceRange: number = 0;
  maxPriceRange: number = 5000;
  stepPrice: number = 10;

  // Research & cache
  private _searchSubject = new Subject<string>();
  private _cache = new Map<string, { data: any[]; timestamp: number }>();
  private CACHE_DURATION = 5 * 60 * 1000; // 5 minutes.
  
  // Dropdown states
  filterDropdownOpen: boolean = false;
  locationDropdownOpen: boolean = false; // Now used only to control the visibility of the location component.
  
  isLoading: boolean = false; // Display a message while search is in progress.

  @Output() searchExecuted = new EventEmitter<void>();

  constructor(
    private apiService: ApiService,
    private router: Router,
    private usersService: UsersService,
    private apiOFF: ApiOpenFoodFacts,
    private dataCacheService: DataCacheService,
  ) {
    this._searchSubject
      .pipe(
        debounceTime(200),
        distinctUntilChanged(),
        filter((query) => query.trim() !== ''),
        switchMap((query) => {
          const trimmedQuery = query.trim();
          const cachedData = this._cache.get(trimmedQuery);
          if (cachedData && Date.now() - cachedData.timestamp < this.CACHE_DURATION) {
            const fullResults = cachedData.data.map((result: any) => ({
              id: result.id,
              name: result.fields?.name || 'Unknown name',
              description: result.fields?.description || 'No description available',
            }));
            this.fullSearchResults = fullResults;
            this.searchResults = fullResults.slice(0, 5);
            this.noResultsMessage = this.searchResults.length ? '' : 'No product found.';
            return of(null);
          }
          this.isLoading = true;
          return forkJoin({
            internalResults: this.apiService.sendSearchData({ search: trimmedQuery }),
            offResults: this.apiOFF.getProductInfo(trimmedQuery),
          }).pipe(
            tap(({ internalResults, offResults }) => {
              this.isLoading = false;
              const combinedResults = [
                ...(internalResults || []),
                ...(offResults?.products || []),
              ];
              if (combinedResults.length) {
                this._cache.set(trimmedQuery, { data: [...combinedResults], timestamp: Date.now() });
              }
            })
          );
        })
      )
      .subscribe({
        next: (response: any) => {
          this.isLoading = false;
          if (response) {
            const internalResults = response.internalResults || [];
            const offResults = response.offResults?.products || [];
            const combinedResults = [
              ...internalResults.map((result: any) => ({
                id: result.id,
                name: result.fields?.name || 'Unknown name',
                description: result.fields?.description || 'No description available',
                source: 'Internal',
              })),
              ...offResults.map((product: any) => ({
                id: product.code,
                name: product.product_name || 'Unknown product',
                description: product.generic_name || 'No description available',
                source: 'OpenFoodFacts',
              })),
            ];
            this.fullSearchResults = combinedResults;
            this.searchResults = combinedResults.slice(0, 5);
            this.noResultsMessage = this.searchResults.length ? '' : 'No product found.';
          }
        },
        error: (error) => {
          this.isLoading = false;
          console.error('❌ Error during search:', error);
        },
      });
  }

  async ngOnInit(): Promise<void> {
    this.dataCacheService.loadData();
    forkJoin({
      countries: this.dataCacheService.getCountries().pipe(first()),
      categories: this.dataCacheService.getCategories().pipe(first()),
      brands: this.dataCacheService.getBrands().pipe(first())
    }).subscribe(({ countries, categories, brands }) => {
      this.countries = countries;
      this.categories = categories.map(category => category.name);
      this.brands = brands;
    });

    setInterval(() => {
      console.log("🔄 Auto-refreshing brands...");
      this.dataCacheService.refreshBrands();
    }, 10 * 60 * 1000);

    const userRole = this.usersService.getUserRole();
    this.canAddProduct = userRole?.toLowerCase() === 'user' || userRole?.toLowerCase() === 'admin';
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
    event as KeyboardEvent;
    if (this.searchQuery.trim() !== '' && event.key === 'Enter') {
      if (this.selectedProduct) {
        this.search(true);
      } else {
        if (this.fullSearchResults.length > 0) {
          this.router.navigate(['/searched-prod'], {
            state: { resultsArray: this.fullSearchResults },
          });
        } else {
          this.search(false);
        }
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
    this.wholeSelectedProduct = product;
    this.noResultsMessage = '';
    this.searchResults = [];
  }

  search(includeSelectedProduct: boolean = false): void {
    this.applyFilters();
    if (!includeSelectedProduct && !Object.keys(this.appliedFilters).length) {
      console.warn('⚠️ No filters applied.');
      return;
    }
    const filtersToSend = {
      ...this.appliedFilters,
      productId: includeSelectedProduct ? this.selectedProduct : null,
      productSource: this.wholeSelectedProduct ? this.wholeSelectedProduct.source : null,
      currentRoute: this.router.url,
    };
    this.isLoading = true;
    this.apiService.postProductsWithFilters(filtersToSend).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (includeSelectedProduct && this.selectedProduct) {
          response = this.reorderResults(response, this.selectedProduct);
        }
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
          this.router.navigate(['/searched-prod'], { state: { resultsArray: response } });
        });
      },
      error: (error) => console.error('❌ Search error:', error),
    });
  }

  private reorderResults(results: any[], searchedProductId: string): any[] {
    if (!results || results.length === 0) return results;
    const index = results.findIndex(product => product.id === searchedProductId);
    if (index > 0) {
      const [searchedProduct] = results.splice(index, 1);
      results.unshift(searchedProduct);
    }
    return results;
  }

  // ======================== FILTER FUNCTIONS
  onCountryChange() {
    // Optionally, fetch departments based on the selected country.
  }

  updateMinPrice() {
    if (this.minPrice < this.minPriceRange) this.minPrice = this.minPriceRange;
    if (this.minPrice > this.maxPrice) this.maxPrice = this.minPrice;
  }

  updateMaxPrice() {
    if (this.maxPrice > this.maxPriceRange) this.maxPrice = this.maxPriceRange;
    if (this.maxPrice < this.minPrice) this.minPrice = this.maxPrice;
  }

  applyFilters() {
    const filters = {
      country: this.selectedCountry || null,
      department: this.selectedDepartment || null,
      category: this.selectedCategory || null,
      brand: this.selectedBrand || null,
      price: { min: this.minPrice, max: this.maxPrice },
    };
    this.appliedFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== null && value !== '')
    );
  }

  // ======================== LOCATION FUNCTIONALITY
  // Seul le mécanisme de basculement et la réception de l'événement sont conservés.
  toggleLocationDropdown() {
    this.locationDropdownOpen = !this.locationDropdownOpen;
  }

  handleLocationSelection(selectedLocation: string): void {
    // Traitement de la localisation sélectionnée par le composant enfant.
    console.log('Location selected:', selectedLocation);
    // Par exemple, vous pouvez déclencher une recherche basée sur la localisation ou mettre à jour l'état de l'application.
    this.locationDropdownOpen = false;
  }
}
