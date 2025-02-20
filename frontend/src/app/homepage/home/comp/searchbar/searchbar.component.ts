/**
 * @file searchbar.component.ts
 * @brief Implements a search bar with real-time search, result caching, and filtering capabilities.
 * @details This component provides a search bar with real-time search capabilities, efficient caching of results, 
 * and product selection functionalities. It uses RxJS to debounce user input, manages cached search results to improve 
 * performance, and includes filtering options to refine search queries by country, department, category, and price.
 * 
 * @component SearchbarComponent
 */

import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, tap, filter } from 'rxjs/operators';
import { Router, RouterLink } from '@angular/router';
// API
import { ApiService } from '../../../../../services/api.service';
import { ApiEuropeanCountries } from '../../../../../services/europeanCountries/api.europeanCountries';

@Component({
  selector: 'app-searchbar',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './searchbar.component.html',
  styleUrls: ['./searchbar.component.css']
})
export class SearchbarComponent implements OnInit {
  searchQuery: string = ''; // The current search query entered by the user.
  searchResults: any[] = []; // The list of suggestions to display (limited to 5).
  fullSearchResults: any[] = []; // The complete list of results from the API.
  noResultsMessage: string = ''; // Message to display if no results are found.
  selectedProduct: string = ''; // The ID of the selected product.
  isFilterPanelOpen: boolean = false; ///< Indicates if the filter panel is open.
  // filters
  countries: string[] = [];
  selectedCountry: string = ''; // Store the selected country
  selectedDepartment: string = ''; // Store the department input by the user
  categoryFilter: boolean = false; // State of the category filter.
  selectedCategory: string = '';
  categories: any[] = [];   // Contains all the categories name
  brandFilter: boolean = false // State of the brand filter
  selectedBrand: string = '';
  brands: any[] = [] // Contains all the brands
  // Price filter
  priceFilter: boolean = false; // State of the third filter.
  minPrice: number = 0;          // Min price selected by the user
  maxPrice: number = 5000;       // Max price selected by the user
  // Save the filters
  appliedFilters: any = {};
  // Range boundaries for price filter
  minPriceRange: number = 0;     
  maxPriceRange: number = 5000;  
  stepPrice: number = 10;        
  // Research & cache
  private _searchSubject = new Subject<string>(); // Subject to manage search input and trigger search requests.
  private _cache = new Map<string, { data: any[]; timestamp: number }>(); // Cache to store search results for efficient reuse.
  private CACHE_DURATION = 5 * 60 * 1000; // Cache expiration time (5 minutes).

  @Output() searchExecuted = new EventEmitter<void>(); // Event to notify when a search is completed.

  /**
   * @constructor
   * Initializes the search functionality with debounced input handling and caching of results.
   */
  constructor(
    private apiService: ApiService,
    private apiCountries: ApiEuropeanCountries,
    private router: Router
  ) {
    this._searchSubject
      .pipe(
        debounceTime(50),
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
            this.searchResults = fullResults.slice(0, 5);  // Limit to 5 suggestions for display
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
            const fullResults = response.length
              ? response.map((result: any) => ({
                  id: result.id,
                  name: result.fields?.name || 'Unknown name',
                  description: result.fields?.description || 'No description available',
                }))
              : [];
            this.fullSearchResults = fullResults;
            this.searchResults = fullResults.slice(0, 5);
            this.noResultsMessage = this.searchResults.length ? '' : 'No product found.';
          }
        },
        error: (error) => console.error('❌ Error during search:', error),
      });
  }

  /**
   * @brief Lifecycle hook that initializes the component.
   */
  ngOnInit(): void {
    // Get all the european countries
    this.apiCountries.fetchEuropeanCountries().then(() => {
      this.countries = this.apiCountries.europeanCountries.sort();
    }).catch((error) => console.error('❌ Error fetching countries:', error));

    // Get all the category in the DB
    this.apiService.getAllCategories().subscribe({
      next: (categories) => this.categories = categories.sort(),
      error: (error) => console.error('❌ Error fetching categories:', error),
    });

    // Get all the brands on the DB
    this.apiService.getAllBrands().subscribe({
      next: (brands) => this.brands = brands.sort(),
      error: (error) => console.error('❌ Error fetching brands:', error),
    });
  }

  // ======================== RESEARCH FUNCTIONS

  /**
   * @function hasSuggestions
   * @description A getter that returns whether there are any search results to display.
   * @returns {boolean} True if there are search results, false otherwise.
   */
  get hasSuggestions(): boolean {
    return this.searchResults.length > 0;
  }

  /**
   * @function onInputChange
   * @description Handles changes to the search input field.
   * @param event The input change event.
   */
  onInputChange(event: any) {
    if (this.searchQuery.trim() === '') {
      this.clearSearch();
      return;
    }
    this._searchSubject.next(this.searchQuery);
  }

  /**
   * @function onEnter
   * @description Sends a search request when the Enter key is pressed.
   * If a product is selected, it includes that product in the filters; otherwise, it performs a search
   * using all the full search results (even those not displayed).
   * @param event The keyboard event.
   */
  onEnter(event: any) {
    if (this.searchQuery.trim() !== '' && event.key === 'Enter') {
      if (this.selectedProduct) {
        this.searchWithFilters(true); // Use the selected product in search
      } else {
        // If no product selected, navigate using the full search results
        if (this.fullSearchResults.length > 0) {
          this.router.navigate(['/searched-prod'], { state: { resultsArray: this.fullSearchResults } });
        } else {
          // Fallback: if no full results available, perform a search without filters
          this.searchWithoutFilters();
        }
      }
    }
  }

  /**
   * @brief Clears the search query and results.
   */
  clearSearch() {
    this.searchQuery = '';
    this.searchResults = [];
    this.noResultsMessage = '';
  }

  /**
   * @brief Selects a product from the search suggestions.
   * After selection, the suggestions are hidden.
   * @param product The product selected from suggestions.
   */
  selectProduct(product: any) {
    this.searchQuery = product.name;
    this.selectedProduct = product.id;
    this.noResultsMessage = '';
    this.searchResults = []; // Hide suggestions after selection.
  }

  // ======================== FILTER FUNCTIONS

  /**
   * @function toggleFilterPanel
   * @description Toggles the visibility of the filter panel.
   */
  toggleFilterPanel() {
    this.isFilterPanelOpen = !this.isFilterPanelOpen;
  }

  /**
   * @function onCountryChange
   * @description Called when a country is selected.
   */
  onCountryChange() {
    // Optionally, fetch departments based on the selected country.
  }

  /**
   * @brief Updates minimum price based on slider or manual input.
   */
  updateMinPrice() {
    if (this.minPrice < this.minPriceRange) this.minPrice = this.minPriceRange;
    if (this.minPrice > this.maxPrice) this.maxPrice = this.minPrice;
  }

  /**
   * @brief Updates maximum price based on slider or manual input.
   */
  updateMaxPrice() {
    if (this.maxPrice > this.maxPriceRange) this.maxPrice = this.maxPriceRange;
    if (this.maxPrice < this.minPrice) this.minPrice = this.maxPrice;
  }

  /**
   * @brief Applies selected filters without triggering a search.
   */
  applyFilters() {
    const filters = {
      country: this.selectedCountry || null,
      department: this.selectedDepartment || null,
      category: this.categoryFilter && this.selectedCategory ? this.selectedCategory : null,
      brand: this.brandFilter ? this.selectedBrand : null,
      price: this.priceFilter ? { min: this.minPrice, max: this.maxPrice } : null,
    };

    this.appliedFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== null && value !== '')
    );
    // Once filters are applied close the panel
    this.toggleFilterPanel();
  }

  /**
   * @brief Searches with applied filters and navigates to results page.
   * @param includeSelectedProduct Indicates if the selected product should be included.
   */
  searchWithFilters(includeSelectedProduct: boolean = false) {
    this.applyFilters(); // Apply filters before the research

    const filtersToSend = {
      ...this.appliedFilters,
      productId: includeSelectedProduct ? this.selectedProduct : null, // Include the selected product if asked
    };

    this.apiService.postProductsWithFilters(filtersToSend).subscribe({
      next: (response) => this.router.navigate(['/searched-prod'], { state: { resultsArray: response } }),
      error: (error) => console.error('❌ Search error:', error),
    });
  }


  /**
   * @brief Searches without including a selected product.
   */
  searchWithoutFilters() {
    this.applyFilters();

    if (!Object.keys(this.appliedFilters).length) {
      console.warn('⚠️ No filters applied.');
      return;
    }

    this.apiService.postProductsWithFilters(this.appliedFilters).subscribe({
      next: (response) => this.router.navigate(['/searched-prod'], { state: { resultsArray: response } }),
      error: (error) => console.error('❌ Search error:', error),
    });
  }

}
