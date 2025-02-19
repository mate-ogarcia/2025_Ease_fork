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

/**
 * @class SearchbarComponent
 * @description
 * The SearchbarComponent is responsible for managing search input, fetching search results, 
 * and handling the product selection process. It includes search query caching, debouncing, 
 * and the ability to apply filters to refine search results.
 */
@Component({
  selector: 'app-searchbar',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './searchbar.component.html',
  styleUrl: './searchbar.component.css',
})
export class SearchbarComponent implements OnInit {
  searchQuery: string = ''; // The current search query entered by the user.
  searchResults: any[] = []; // The list of search results to display.
  noResultsMessage: string = ''; // Message to display if no results are found.
  selectedProduct: string = ''; // The ID of the selected product.
  isFilterPanelOpen: boolean = false; ///< Indicates if the filter panel is open.
  // filters
  countries: string[] = [] // Initialize with an empty promise
  selectedCountry: string = ''; // Store the selected country
  selectedDepartment: string = ''; // Store the department input by the user
  categoryFilter: boolean = false; // State of the second filter.
  selectedCategory: string = '';
  categories: any[] = [];   // Contains all the categories name
  // Price filter
  priceFilter: boolean = false; // State of the third filter.
  minPrice: number = 0;          // Min price selected by the user
  maxPrice: number = 5000;       // Max price selected by the user
  // Save the filters
  appliedFilters: any = {};
  // Range boundaries for price filter
  minPriceRange: number = 0;     // Min value for the price range
  maxPriceRange: number = 5000;  // Max value for the price range
  stepPrice: number = 10;        // Step for the price increment in the slider
  // Research & cache
  private _searchSubject = new Subject<string>(); // Subject to manage search input and trigger search requests.
  private _cache = new Map<string, { data: any[]; timestamp: number }>(); // Cache to store search results for efficient reuse.
  private CACHE_DURATION = 5 * 60 * 1000; // Cache expiration time (5 minutes).

  @Output() searchExecuted = new EventEmitter<void>(); // Event to notify when a search is completed.

  /**
   * @constructor
   * Initializes the search functionality with debounced input handling and caching of results.
   * Subscribes to the search subject to handle input changes and triggers API calls when necessary.
   */
  constructor(
    private apiService: ApiService,
    private apiCountries: ApiEuropeanCountries,
    private router: Router
  ) {
    this._searchSubject
      .pipe(
        debounceTime(50), // Waits for the user to stop typing for 50ms before triggering the search.
        distinctUntilChanged(), // Prevents unnecessary API calls if the query hasn't changed.
        filter((query) => query.trim() !== ''), // Ignores empty queries.
        switchMap((query) => {
          const trimmedQuery = query.trim();
          const cachedData = this._cache.get(trimmedQuery);

          if (cachedData && Date.now() - cachedData.timestamp < this.CACHE_DURATION) {
            // If results are cached and not expired, use them directly.
            this.searchResults = cachedData.data.map((result: any) => ({
              id: result.id,
              name: result.fields?.name || 'Unknown name',
              description: result.fields?.description || 'No description available',
            }));
            this.noResultsMessage = this.searchResults.length ? '' : 'No product found.';
            return of(null); // Skip API call and return cached data.
          }

          // Otherwise, make the API call to fetch new results.
          return this.apiService.sendSearchData({ search: trimmedQuery }).pipe(
            tap((response) => {
              if (response && Array.isArray(response)) {
                // Cache the new results if the response is valid.
                this._cache.set(trimmedQuery, { data: [...response], timestamp: Date.now() });
              }
            })
          );
        })
      )
      .subscribe({
        next: (response: any) => {
          if (response) {
            // Process the response and update the search results.
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
        error: (error) => console.error('❌ Error during search:', error), // Log error if search fails.
      });
  }

  /**
   * @brief Lifecycle hook that initializes the component.
   * @details Fetches European countries and categories upon initialization.
   */
  ngOnInit(): void {
    this.apiCountries.fetchEuropeanCountries().then(() => {
      this.countries = this.apiCountries.europeanCountries.sort();
    }).catch((error) => console.error('❌ Error fetching countries:', error));

    this.apiService.getAllCategories().subscribe({
      next: (categories) => this.categories = categories.sort(),
      error: (error) => console.error('❌ Error fetching categories:', error),
    });
  }

  // ======================== RESEARCH FUNCTIONS
  /**
   * @function hasSuggestions
   * @description
   * A getter that returns whether there are any search results to display.
   * @returns {boolean} True if there are search results, false otherwise.
   */
  get hasSuggestions(): boolean {
    return this.searchResults.length > 0;
  }

  /**
   * @function onInputChange
   * @description
   * Handles changes to the search input field. If the query is non-empty, it triggers the search logic.
   * @param event The input change event.
   */
  onInputChange(event: any) {
    if (this.searchQuery.trim() === '') {
      this.clearSearch(); // Clears search results and message if the query is empty.
      return;
    }
    this._searchSubject.next(this.searchQuery); // Triggers the search with the current input.
  }

  /**
   * @function onEnter
   * @description
   * Envoie une requête pour rechercher des produits similaires lorsqu'on appuie sur "Entrée".
   * Si un produit est sélectionné, il est inclus dans les filtres.
   * @param event L'événement clavier.
   */
  // TODO
  onEnter(event: any) {
    if (this.searchQuery.trim() !== '' && this.selectedProduct && event.key === 'Enter') {
      this.searchWithFilters(true); // Produit sélectionné inclus
    } else if (!this.selectedProduct) {
      console.warn('⚠️ No products selected for similar search.');
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
    * @param product The product selected from suggestions.
    */
  selectProduct(product: any) {
    this.searchQuery = product.name;
    this.selectedProduct = product.id;
    this.noResultsMessage = '';
  }

  // ======================== FILTER FUNCTIONS
  /**
   * @function toggleFilterPanel
   * @description
   * Toggles the visibility of the filter panel.
   */
  toggleFilterPanel() {
    this.isFilterPanelOpen = !this.isFilterPanelOpen;
  }

  // Function that gets triggered when a country is selected
  //TODO ?
  onCountryChange() {
    // Optionally, fetch departments based on the selected country
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
      category: this.categoryFilter ? this.selectedCategory : null,
      price: this.priceFilter ? { min: this.minPrice, max: this.maxPrice } : null,
    };

    this.appliedFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== null && value !== '')
    );
  }

  /**
   * @brief Searches with applied filters and navigates to results page.
   * @param includeSelectedProduct Indicates if the selected product should be included.
   */
  searchWithFilters(includeSelectedProduct: boolean = false) {
    const filtersToSend = { ...this.appliedFilters, productId: includeSelectedProduct ? this.selectedProduct : null };

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
    if (!Object.keys(this.appliedFilters).length) return;

    this.apiService.postProductsWithFilters(this.appliedFilters).subscribe({
      next: (response) => this.router.navigate(['/searched-prod'], { state: { resultsArray: response } }),
      error: (error) => console.error('❌ Search error:', error),
    });
  }
}
