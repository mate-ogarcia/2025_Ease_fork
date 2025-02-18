/**
 * @file searchbar.component.ts
 * @description
 * This component implements a search bar with real-time search functionality, caching of results,
 * and product selection. It uses RxJS to debounce and manage search input while displaying results.
 * Filters are also available for refining search queries.
 * 
 * @component SearchbarComponent
 * @example
 * <app-searchbar></app-searchbar>
 * 
 * @author Your Name
 * @version 1.0
 * @since 2025-02-18
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
  maxPrice: number = 1000;       // Max price selected by the user
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
   * @brief Initializes the component by fetching the list of European countries.
   * 
   * This method is called when the component is initialized. It calls the `fetchEuropeanCountries` method
   * of the `ApiEuropeanCountries` service to retrieve the list of European countries. Once the countries are
   * fetched successfully, the `countries` property is updated with the list of country names.
   * If there is an error during the fetch process, an error message is logged to the console.
   * 
   * @returns {void} 
   * @throws {Error} Logs an error to the console if the countries cannot be fetched.
   */
  ngOnInit(): void {
    // Fetch the countries and update the countriesList
    this.apiCountries.fetchEuropeanCountries().then(() => {
      this.countries = this.apiCountries.europeanCountries.sort();
    }).catch(error => {
      console.error('❌ Error fetching countries:', error);
    });

    // Fetch all the category name
    this.apiService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        console.log("Categories name fetched.");
      },
      error: (error) => {
        console.error('❌ Erreur lors de la récupération des catégories:', error);
      },
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
   * Handles the Enter key press. If a product matches the query, it selects that product.
   * If no product is found, it displays a "no product found" message.
   * @param event The keyboard event triggered by pressing Enter.
   */
  onEnter(event: any) {
    if (this.searchQuery.trim() !== '' && event.key === 'Enter') {
      const queryLower = this.searchQuery.trim().toLowerCase();
      const product = this.searchResults.find((p) =>
        p.name.toLowerCase().includes(queryLower) // Checks if product name matches the query.
      );

      if (product) {
        this.selectProduct(product); // Select the product if it matches the query.
      } else {
        this.noResultsMessage = 'No product found.'; // Show message if no match is found.
      }
    }
  }

  /**
   * @function clearSearch
   * @description
   * Clears the search query, results, and message, essentially resetting the search bar.
   */
  clearSearch() {
    this.searchQuery = '';
    this.searchResults = [];
    this.noResultsMessage = '';
  }

  /**
   * @function selectProduct
   * @description
   * Selects a product from the search results and navigates to its details page.
   * If a valid product is selected, it sends a post request with the product ID.
   * @param product The product that was selected.
   */
  selectProduct(product: any) {
    this.searchQuery = product.name;
    this.selectedProduct = product.id;
    this.noResultsMessage = '';

    if (!this.selectedProduct) {
      return; // Exit if no valid product is selected.
    }

    // Send post request with the selected product ID to store the selection.
    this.apiService.postProductSelection({ productId: this.selectedProduct }).subscribe({
      next: () => {
        // Navigate to the product's details page after selection.
        this.router.navigate(['/products-alternative', this.selectedProduct]).catch((error) =>
          console.error('❌ Navigation error:', error)
        );
      },
      error: (error) => console.error('❌ Error sending product ID:', error),
    });
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

  // Method to handle min price update from the slider or manual input
  updateMinPrice() {
    if (this.minPrice < this.minPriceRange) {
      this.minPrice = this.minPriceRange;
    }
    if (this.minPrice > this.maxPrice) {
      this.maxPrice = this.minPrice;  // Ensure max is not lower than min
    }
  }

  // Method to handle max price update from the slider or manual input
  updateMaxPrice() {
    if (this.maxPrice > this.maxPriceRange) {
      this.maxPrice = this.maxPriceRange;
    }
    if (this.maxPrice < this.minPrice) {
      this.minPrice = this.maxPrice;  // Ensure min is not higher than max
    }
  }

  /**
   * @function applyFilters
   * @description
   * This function is triggered when the user clicks the "Appliquer" button. It checks the selected filters
   * and applies the logic accordingly.
   */
  applyFilters() {
    // Log the selected filters
    console.log({
      selectedCountry: this.selectedCountry,
      selectedDepartment: this.selectedDepartment,
      categoryFilter: this.categoryFilter,
      selectedCategory: this.selectedCategory,  // Log the selected category
      priceFilter: this.priceFilter,
      minPrice: this.minPrice,
      maxPrice: this.maxPrice
    });

    // Build the filters object based on selected values
    const filters = {
      country: this.selectedCountry,
      department: this.selectedDepartment,
      category: this.categoryFilter ? this.selectedCategory : null,  // Add selected category if filter is enabled
      price: this.priceFilter ? { min: this.minPrice, max: this.maxPrice } : null,
    };

    // Remove any null filters or filters with empty values
    const filteredParams = Object.fromEntries(
      Object.entries(filters).filter(([key, value]) => {
        // For boolean filters (like checkboxes)
        if (typeof value === 'boolean') {
          return value; // Only include if true
        }
        // For object filters (like price with min and max values)
        if (typeof value === 'object' && value !== null) {
          return value.min != null && value.max != null; // Only include if both min and max are defined
        }
        // For string filters (like country, category)
        if (typeof value === 'string') {
          return value.trim() !== ''; // Only include if the string is not empty
        }
        // Exclude null and undefined values
        return value !== null && value !== undefined;
      })
    );

    // Send a request to query products with the selected filters
    this.apiService.postProductsWithFilters(filteredParams).subscribe({
      next: (response) => {
        // Process the response
        console.log('Filtered products:', response);
        // TODO modify this part, need a other html page to display the products searched with a filter
        const test = response[0].id;
        console.log(test);

        // Navigate to the product's details page after selection
        this.router.navigate(['/products-alternative', test]).catch((error) =>
          console.error('❌ Navigation error:', error)
        );
      },
      error: (error) => {
        console.error('❌ Error applying filters', error);
      },
    });
  }



}
