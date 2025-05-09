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
import { ApiService } from '../../../../services/api.service';
import { UsersService } from '../../../../services/users/users.service';
import { ApiOpenFoodFacts } from '../../../../services/openFoodFacts/openFoodFacts.service';
// Cache API
import { DataCacheService } from '../../../../services/cache/data-cache.service';
// History service
import { HistoryService } from '../../../../services/history/history.service';
// Location component import
import { LocationDropdownComponent } from '../location-dropdown/location-dropdown.component';

@Component({
  selector: 'app-searchbar',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    LocationDropdownComponent
  ],
  templateUrl: './searchbar.component.html',
  styleUrls: ['./searchbar.component.css'],
})
export class SearchbarComponent implements OnInit {
  // Search state variables
  searchQuery: string = '';     // The search query entered by the user.
  searchResults: any[] = [];    // Array of search results based on the current query.
  fullSearchResults: any[] = []; // Complete list of search results.
  noResultsMessage: string = ''; // Message shown when no results are found.
  selectedProduct: string = ''; // ID of the selected product.
  wholeSelectedProduct: any; // Full details of the selected product.
  isFilterPanelOpen: boolean = false; // Boolean indicating whether the filter panel is open.
  canAddProduct: boolean = false; // Boolean indicating whether the user can add products.
  // Filter state variables
  countries: string[] = []; // List of countries for filtering.
  selectedCountry: string = ''; // Selected country for filtering.
  selectedDepartment: string = ''; // Selected department for filtering.
  selectedCategory: string = ''; // Selected category for filtering.
  categories: any[] = []; // List of categories for filtering.
  selectedBrand: string = ''; // Selected brand for filtering.
  brands: any[] = []; // List of brands for filtering.

  appliedFilters: any = {}; // Object holding the applied filters.

  // Search & cache variables
  private _searchSubject = new Subject<string>(); // RxJS subject for debouncing search queries.
  private _cache = new Map<string, { data: any[]; timestamp: number }>(); // Cache to store search results.
  private CACHE_DURATION = 5 * 60 * 1000; // Cache duration (5 minutes).
  // Dropdown control variables
  filterDropdownOpen: boolean = false; // Boolean indicating whether the filter dropdown is open.

  isLoading: boolean = false; // Boolean indicating whether the search results are being loaded.

  @Output() searchExecuted = new EventEmitter<void>(); // Event emitter for search execution.

  /**
   * @brief Constructs the SearchbarComponent and sets up search logic.
   * @details The constructor initializes the search subject, sets up a debounce for search input,
   *          and combines results from internal APIs and OpenFoodFacts. 
   *          It also handles result caching and updating UI states like loading and results display.
   * 
   * @param apiService The service for sending search queries to the internal API.
   * @param router The Angular router for navigation.
   * @param usersService The service for handling user data.
   * @param apiOFF The service for interacting with OpenFoodFacts API.
   * @param dataCacheService The service for managing cached data.
   * @param historyService The service for managing search history.
   */
  constructor(
    private apiService: ApiService,
    private router: Router,
    private usersService: UsersService,
    private apiOFF: ApiOpenFoodFacts,
    private dataCacheService: DataCacheService,
    private historyService: HistoryService
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
            this.noResultsMessage = this.searchResults.length ? '' : 'No products found';
            this.canAddProduct = this.searchResults.length === 0 && this.searchQuery.trim() !== '';
            return of(null);
          }
          this.isLoading = true;  // Display a loading message
          // Launch parallel requests: Internal API + Open Food Facts
          return forkJoin({
            internalResults: this.apiService.sendSearchData({ search: trimmedQuery }),
            offResults: this.apiOFF.getProductInfo(trimmedQuery),
          }).pipe(
            tap(({ internalResults, offResults }) => {
              this.isLoading = false;
              const combinedResults = [
                ...(internalResults || []),
                ...(offResults?.products || []),  // Include Open Food Facts products.
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
            this.noResultsMessage = this.searchResults.length ? '' : 'Aucun produit trouvé';
            this.canAddProduct = this.searchResults.length === 0 && this.searchQuery.trim() !== '';
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.noResultsMessage = 'Erreur lors de la recherche. Cette fonctionnalité n\'est pas encore complètement implémentée.';
          this.canAddProduct = this.searchQuery.trim() !== '';
          console.error('❌ Error during search:', error);
        },
      });
  }

  /**
   * @brief Initializes the component and loads necessary data.
   * @details This method loads the countries, categories, and brands from the cache service and sets up periodic refresh of brands.
   *          It also checks the user role to determine if they are allowed to add products.
   */
  async ngOnInit(): Promise<void> {
    this.dataCacheService.loadData();
    // Fetch the data in the localStorage
    forkJoin({
      countries: this.dataCacheService.getCountries().pipe(first()),
      categories: this.dataCacheService.getCategories().pipe(first()),
      brands: this.dataCacheService.getBrands().pipe(first())
    }).subscribe(({ countries, categories, brands }) => {
      this.countries = countries;
      this.categories = categories.map(category => category.name);
      this.brands = brands;
    });
    // Refresh brands automatically every 10 minutes
    setInterval(() => {
      this.dataCacheService.refreshBrands();
    }, 10 * 60 * 1000);

    console.log("Initialisation du composant SearchBar");

    // Force canAddProduct à true par défaut dans cette version
    this.canAddProduct = true;

    // Log pour débogage
    console.log("canAddProduct initialisé à:", this.canAddProduct);
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

    // Force canAddProduct to true when there's a search query
    if (this.searchQuery.trim().length > 0) {
      const userRole = this.usersService.getUserRole();
      this.canAddProduct = userRole?.toLowerCase() === 'user' || userRole?.toLowerCase() === 'admin' || userRole?.toLowerCase() === 'superadmin';
    }

    // Trigger the search
    this._searchSubject.next(this.searchQuery);

    // Set the no results message if there are no results after a delay
    setTimeout(() => {
      if (this.searchResults.length === 0 && this.searchQuery.trim() !== '' && !this.isLoading) {
        this.noResultsMessage = 'Aucun produit trouvé';
        // S'assurer que canAddProduct est bien défini si l'utilisateur a le bon rôle
        const userRole = this.usersService.getUserRole();
        this.canAddProduct = userRole?.toLowerCase() === 'user' || userRole?.toLowerCase() === 'admin' || userRole?.toLowerCase() === 'superadmin';
      }
    }, 500);
  }

  /**
   * @function onEnter
   * @description Sends a search request when the Enter key is pressed.
   * Saves the exact search term to history and then performs the search.
   * @param event The keyboard event.
   */
  onEnter(event: any) {
    event as KeyboardEvent;
    if (this.searchQuery.trim() !== '' && event.key === 'Enter') {
      // Save search term directly to history
      this.addToHistory(null);

      if (this.selectedProduct) {
        this.search(true);  // Search including the selected product
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
    this.fullSearchResults = [];
    this.noResultsMessage = '';
    this.selectedProduct = '';
    this.wholeSelectedProduct = null;
    this.isLoading = false;
    this.canAddProduct = false; // Réinitialiser explicitement canAddProduct

    // Close the filter dropdown if open
    this.filterDropdownOpen = false;
  }

  /**
   * @brief Selects a product from the search suggestions.
   * After selection, the suggestions are hidden.
   * @param product The product selected from suggestions.
   */
  selectProduct(product: any) {
    // Update search field with product name
    this.searchQuery = product.name;
    this.selectedProduct = product.id;
    this.wholeSelectedProduct = product;
    this.noResultsMessage = '';
    this.searchResults = []; // Hide suggestions after selection.

    // Add the exact term displayed in the search bar to history
    this.addToHistory(product);

    // Launch the research
    this.search(true);
  }

  /**
   * @brief Adds the search term to history
   * @param product The product or search term
   */
  private addToHistory(product: any): void {
    // If it's a direct search (Enter key press), use the raw search term
    if (!product && this.searchQuery && this.searchQuery.trim() !== '') {
      const searchTerm = this.searchQuery.trim();

      // Create a simple object for history
      const historyItem = {
        id: Date.now().toString(), // Unique temporary ID
        name: searchTerm           // The exact term typed by the user
      };

      this.historyService.addToHistory(
        historyItem.id,
        searchTerm  // Use the search term directly
      ).subscribe();

      return;
    }

    // Default behavior for product selections
    if (!product || !product.id) {
      return;
    }

    // Simplify data sent to history
    const productName = product.name || '';
    // No longer add source information
    // const sourceInfo = product.source ? ` (${product.source})` : '';
    const fullProductName = productName; // Just the product name

    this.historyService.addToHistory(
      product.id,
      fullProductName
    ).subscribe();
  }

  /**
   * @brief Performs a search based on applied filters and optional selected product.
   * 
   * @details This method applies filters, validates if any filters are applied, 
   * constructs the search request, and sends it to the API. The results are processed 
   * and then navigates to the results page.
   * 
   * @param {boolean} [includeSelectedProduct=false] - Whether to include the selected product in the search.
   * 
   * @returns {void}
   */
  search(includeSelectedProduct: boolean = false): void {
    this.applyFilters(); // Apply filters before performing the search.

    // If searching with filters only and filters are applied, save the search
    if (!includeSelectedProduct && Object.keys(this.appliedFilters).length > 0) {
      // Create a descriptive term based on applied filters
      const filterDescription = this.createFilterDescription();
      const filterId = `filter-${Date.now()}`; // Unique ID for this filter search

      this.historyService.addToHistory(
        filterId,
        filterDescription
      ).subscribe();
    }

    // Warn if no filters or selected product is present
    if (!includeSelectedProduct && !Object.keys(this.appliedFilters).length) {
      return;
    }
    const filtersToSend = {
      ...this.appliedFilters, // Include all applied filters
      productId: includeSelectedProduct ? this.selectedProduct : null, // Include selected product ID if required
      productSource: this.wholeSelectedProduct ? this.wholeSelectedProduct.source : null, // If no id means only the filters
      currentRoute: this.router.url, // Pass the current route for backend context
    };

    this.isLoading = true;
    this.noResultsMessage = ''; // Reset error message

    // Send filters to the API and handle response
    this.apiService.postProductsWithFilters(filtersToSend).subscribe({
      next: (response) => {
        this.isLoading = false;

        if (!response || response.length === 0) {
          this.noResultsMessage = 'Aucun produit trouvé avec ces critères';
          // S'assurer que canAddProduct est correctement défini si aucun résultat n'est trouvé
          const userRole = this.usersService.getUserRole();
          this.canAddProduct = userRole?.toLowerCase() === 'user' || userRole?.toLowerCase() === 'admin' || userRole?.toLowerCase() === 'superadmin';
          return;
        }

        // History saving is already done in onEnter

        // Ensure the selected product is at the first position
        if (includeSelectedProduct && this.selectedProduct) {
          response = this.reorderResults(response, this.selectedProduct);
        }

        // Navigate to results page with the response
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
          this.router.navigate(['/searched-prod'], { state: { resultsArray: response } });
        });
      },
      error: (error) => {
        this.isLoading = false;
        this.noResultsMessage = 'Erreur lors de la recherche. Cette fonctionnalité n\'est pas encore complètement implémentée.';
        this.canAddProduct = this.searchQuery.trim() !== '';
      },
    });
  }

  /**
   * @brief Creates a human-readable description of the applied filters.
   * @returns {string} A description of the applied filters.
   */
  private createFilterDescription(): string {
    const parts = [];

    if (this.appliedFilters.country)
      parts.push(`Country: ${this.appliedFilters.country}`);

    if (this.appliedFilters.department)
      parts.push(`Department: ${this.appliedFilters.department}`);

    if (this.appliedFilters.category)
      parts.push(`Category: ${this.appliedFilters.category}`);

    if (this.appliedFilters.brand)
      parts.push(`Brand: ${this.appliedFilters.brand}`);

    return parts.length ? parts.join(', ') : 'Search with filters';
  }

  /**
   * @brief Moves the searched product to the first position in the results array.
   * @param results The array of product results.
   * @param searchedProductId The ID of the searched product.
   * @returns The reordered array with the searched product first.
   */
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
  /**
   * @function onCountryChange
   * @description Called when a country is selected.
   */
  onCountryChange() {
    // Optionally, fetch departments based on the selected country.
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
    };

    this.appliedFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== null && value !== '')
    );
  }

  // ======================== DROPDOWN TOGGLING
  /**
   * @function toggleFilterDropdown
   * @description Toggles the visibility of the filter dropdown.
   */
  toggleFilterDropdown() {
    this.filterDropdownOpen = !this.filterDropdownOpen;
  }

  /**
   * @function addNewProduct
   * @description Redirects to the product addition page with the current search query
   * as a suggested product name when no results are found.
   */
  addNewProduct() {
    if (this.searchQuery.trim() !== '') {
      try {
        // Enregistrer le terme de recherche dans le localStorage aussi pour plus de sécurité
        localStorage.setItem('pendingProductName', this.searchQuery.trim());

        // Store the product name in the cache service
        this.dataCacheService.setPendingProductName(this.searchQuery.trim());

        // Check if we're already on the add product page
        if (this.router.url.includes('/add-product')) {
          // If we're already on the page, reload to refresh the form
          window.location.reload();
        } else {
          // Otherwise, navigate to the add page
          this.router.navigate(['/add-product']);
        }
      } catch (err) {
        console.error('Erreur lors de la redirection vers la page d\'ajout de produit:', err);
        // Redirection de secours en cas d'erreur
        window.location.href = '/add-product';
      }
    }
  }
} 