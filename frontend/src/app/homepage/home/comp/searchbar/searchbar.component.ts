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
import { debounceTime, distinctUntilChanged, switchMap, tap, filter } from 'rxjs/operators';
import { Router, RouterLink } from '@angular/router';
// API
import { ApiService } from '../../../../../services/api.service';
import { UsersService } from '../../../../../services/users/users.service';
import { ApiOpenFoodFacts } from '../../../../../services/openFoodFacts/openFoodFacts.service';
// Cache API
import { DataCacheService } from '../../../../../services/cache/data-cache.service';

@Component({
  selector: 'app-searchbar',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './searchbar.component.html',
  styleUrls: ['./searchbar.component.css'],
})
export class SearchbarComponent implements OnInit {
  searchQuery: string = '';         // The current search query entered by the user.
  searchResults: any[] = [];        // The list of suggestions to display (limited to 5).
  fullSearchResults: any[] = [];    // The complete list of results from the API.
  noResultsMessage: string = '';    // Message to display if no results are found.
  selectedProduct: string = '';     // The ID of the selected product.
  wholeSelectedProduct: any; // The whole product
  isFilterPanelOpen: boolean = false; // Indicates if the filter panel is open.
  // Display the add-product button or not
  canAddProduct: boolean = false;   // Default: user cannot add product
  // filters
  countries: string[] = [];
  selectedCountry: string = '';     // Store the selected country
  selectedDepartment: string = '';  // Store the department input by the user
  selectedCategory: string = '';
  categories: any[] = [];           // Contains all the categories name
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
  // Dropdown for filters (renamed for cohérence with the new design)
  filterDropdownOpen: boolean = false; // Indicates if the filter dropdown is open.
  // Wait time
  isLoading: boolean = false; // Display a message while search is in progress


  @Output() searchExecuted = new EventEmitter<void>(); // Event to notify when a search is completed.

  /**
   * @constructor
   * @brief Initializes the search functionality with debounced input handling, caching, and multi-source integration.
   *
   * @details
   * This constructor sets up the search logic using RxJS observables to:
   * - Handle debounced user input (200ms delay for better performance).
   * - Cache search results to avoid unnecessary API calls.
   * - Fetch data from two different sources simultaneously:
   *    1. Internal API (`apiService`)
   *    2. External Open Food Facts API (`apiOFF`)
   * - Merge and display a combination of results from both sources.
   * - Cache results with a validity duration defined by `CACHE_DURATION`.
   *
   * **Search Flow:**  
   * 1. User enters a query → Debounced and filtered.  
   * 2. If results are cached and valid → Use cached data.  
   * 3. Otherwise, make parallel requests to both APIs using `forkJoin`.  
   * 4. Merge the results and cache them.  
   * 5. Display the first 5 suggestions in the UI.  
   *
   * **Performance Optimizations:**  
   * - Debounce time increased to 200ms for improved responsiveness.  
   * - Cache usage reduces unnecessary API calls.  
   * - Requests are handled in parallel for faster response times.
   *
   * @param apiService Internal API service for product data retrieval.
   * @param apiCountries API for retrieving European countries.
   * @param router Angular router for navigation.
   * @param usersService Service for handling user information.
   * @param apiOFF Service to interact with the Open Food Facts API.
   */
  constructor(
    private apiService: ApiService,
    private router: Router,
    private usersService: UsersService,
    private apiOFF: ApiOpenFoodFacts,
    private dataCacheService: DataCacheService,
  ) {
    this._searchSubject
      .pipe(
        debounceTime(200),        // Debounces input to reduce API calls.
        distinctUntilChanged(),   // Prevents repeated queries with the same value.
        filter((query) => query.trim() !== ''), // Ignores empty queries.
        switchMap((query) => {
          const trimmedQuery = query.trim();
          const cachedData = this._cache.get(trimmedQuery);

          // Use cached data if valid
          if (cachedData && Date.now() - cachedData.timestamp < this.CACHE_DURATION) {
            const fullResults = cachedData.data.map((result: any) => ({
              id: result.id,
              name: result.fields?.name || 'Unknown name',
              description: result.fields?.description || 'No description available',
            }));
            this.fullSearchResults = fullResults;
            this.searchResults = fullResults.slice(0, 5); // Show top 5 suggestions.
            this.noResultsMessage = this.searchResults.length ? '' : 'No product found.';
            return of(null); // Skip API calls.
          }

          this.isLoading = true;

          // Launch parallel requests: Internal API + Open Food Facts
          return forkJoin({
            internalResults: this.apiService.sendSearchData({ search: trimmedQuery }),
            offResults: this.apiOFF.getProductInfo(trimmedQuery),
          }).pipe(
            tap(({ internalResults, offResults }) => {
              this.isLoading = false;
              const combinedResults = [
                ...(internalResults || []),
                ...(offResults?.products || []), // Include Open Food Facts products.
              ];

              if (combinedResults.length) {
                this._cache.set(trimmedQuery, { data: [...combinedResults], timestamp: Date.now() });
              }
            })
          );
        })
      )
      .subscribe({
        /**
         * @brief Processes the results from both APIs and merges them.
         *
         * @param response Object containing results from internal and external APIs.
         * @returns {void}
         */
        next: (response: any) => {
          this.isLoading = false;
          if (response) {
            const internalResults = response.internalResults || [];
            const offResults = response.offResults?.products || [];

            // Merge results with a source identifier
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
            this.searchResults = combinedResults.slice(0, 5); // Limit to 5 suggestions.
            this.noResultsMessage = this.searchResults.length ? '' : 'No product found.';
          }
        },
        error: (error) => {
          this.isLoading = false;
          console.error('❌ Error during search:', error)
        },
      });
  }

  /**
   * @function ngOnInit
   * @description Lifecycle hook that initializes the component
   * @details Fetches authentication status, countries, categories, and brands
   */
  async ngOnInit(): Promise<void> {

    // Retrieve countries from cache
    this.dataCacheService.getCountries().subscribe(countries => {
      this.countries = countries;
    });

    // Retrieve categories from cache
    this.dataCacheService.getCategories().subscribe(categories => {
      this.categories = categories;
    });

    // Retrieve brands from cache
    this.dataCacheService.getBrands().subscribe(brands => {
      this.brands = brands;
    });

    // Get the cookie's info
    const userRole = this.usersService.getUserRole();
    // Check if the role allows you to add a product
    this.canAddProduct = userRole?.toLowerCase() === 'user' || userRole?.toLowerCase() === 'admin';
  }

  /**
 * @function toggleFilterDropdown
 * @description Toggles the visibility of the filter dropdown.
 */
  toggleFilterDropdown() {
    this.filterDropdownOpen = !this.filterDropdownOpen;
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
    event as KeyboardEvent;
    if (this.searchQuery.trim() !== '' && event.key === 'Enter') {
      if (this.selectedProduct) {
        this.search(true);    // Search including the selected product
      } else {
        if (this.fullSearchResults.length > 0) {
          this.router.navigate(['/searched-prod'], {
            state: { resultsArray: this.fullSearchResults },
          });
        } else {
          this.search(false); // Search without including the selected product
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
    this.wholeSelectedProduct = product;
    this.noResultsMessage = '';
    this.searchResults = []; // Hide suggestions after selection.
  }

  /**
   * @brief Executes a product search with applied filters and navigates to the results page.
   * 
   * @details
   * This method applies the selected filters and sends them to the API to retrieve matching products.  
   * It handles two cases:
   * - **With a selected product:** Searches for products similar to the selected one.
   * - **Without a selected product:** Searches based solely on the applied filters.
   *  
   * @param includeSelectedProduct (boolean) Indicates whether the selected product should be included in the search criteria.  
   *        - `true`: Includes the selected product for similarity-based search.  
   *        - `false`: Searches using only the applied filters. (default: `false`)  
   * 
   * @returns {void} This function does not return anything but navigates to the results page upon completion.
   */
  search(includeSelectedProduct: boolean = false): void {
    this.applyFilters(); // Apply filters before performing the search.

    // Warn if no filters or selected product is present
    if (!includeSelectedProduct && !Object.keys(this.appliedFilters).length) {
      console.warn('⚠️ No filters applied.');
      return;
    }

    const filtersToSend = {
      ...this.appliedFilters, // Include all applied filters
      productId: includeSelectedProduct ? this.selectedProduct : null, // Include selected product ID if required
      productSource: this.wholeSelectedProduct ? this.wholeSelectedProduct.source : null, // If no id means only the filters
      currentRoute: this.router.url, // Pass the current route for backend context
    };

    this.isLoading = true;
    // Send filters to the API and handle response
    this.apiService.postProductsWithFilters(filtersToSend).subscribe({
      next: (response) => {
        this.isLoading = false;
        // Navigate to results page with the response
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
          this.router.navigate(['/searched-prod'], { state: { resultsArray: response } });
        });
      },
      error: (error) => console.error('❌ Search error:', error),
    });
  }

  // ======================== FILTER FUNCTIONS

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
      category: this.selectedCategory || null,
      brand: this.selectedBrand || null,
      price: { min: this.minPrice, max: this.maxPrice },
    };

    this.appliedFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== null && value !== '')
    );
  }
}