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
// History service
import { HistoryService } from '../../../../../services/history/history.service';
// Import du composant de localisation
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
  // Price filter state variables
  priceFilter: boolean = false; // Boolean indicating whether the price filter is applied.
  minPrice: number = 0; // Minimum price for filtering.
  maxPrice: number = 5000; // Maximum price for filtering.
  appliedFilters: any = {}; // Object holding the applied filters.
  minPriceRange: number = 0; // Minimum range for price filter.
  maxPriceRange: number = 5000; // Maximum range for price filter.
  stepPrice: number = 10; // Step value for price range adjustments.
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
            this.noResultsMessage = this.searchResults.length ? '' : 'No product found.';
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
            this.noResultsMessage = this.searchResults.length ? '' : 'No product found.';
          }
        },
        error: (error) => {
          this.isLoading = false;
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

    // Get the cookie's info
    const userRole = this.usersService.getUserRole();
    // Check if the role allows you to add a product
    this.canAddProduct = userRole?.toLowerCase() === 'user' || userRole?.toLowerCase() === 'admin';
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
   * Saves the exact search term to history and then performs the search.
   * @param event The keyboard event.
   */
  onEnter(event: any) {
    event as KeyboardEvent;
    if (this.searchQuery.trim() !== '' && event.key === 'Enter') {
      // Sauvegarder directement le terme de recherche dans l'historique
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
    this.noResultsMessage = '';
  }

  /**
   * @brief Selects a product from the search suggestions.
   * After selection, the suggestions are hidden.
   * @param product The product selected from suggestions.
   */
  selectProduct(product: any) {
    // Mettre à jour le champ de recherche avec le nom du produit
    this.searchQuery = product.name;
    this.selectedProduct = product.id;
    this.wholeSelectedProduct = product;
    this.noResultsMessage = '';
    this.searchResults = []; // Hide suggestions after selection.

    // Ajouter à l'historique le terme exact affiché dans la barre de recherche
    this.addToHistory(null);

    // Launch the research
    this.search(true);
  }

  /**
   * @brief Ajoute le terme de recherche à l'historique
   * @param product Le produit ou le terme recherché
   */
  private addToHistory(product: any): void {
    console.log('🔍 searchbar.addToHistory appelé avec:', product);

    // Si c'est une recherche directe (appui sur Entrée), utiliser le terme de recherche brut
    if (this.searchQuery && this.searchQuery.trim() !== '') {
      const searchTerm = this.searchQuery.trim();
      console.log('🔍 Utilisation du terme de recherche direct:', searchTerm);

      // Créer un objet simple pour l'historique
      const historyItem = {
        id: Date.now().toString(), // ID temporaire unique
        name: searchTerm           // Le terme exact tapé par l'utilisateur
      };

      this.historyService.addToHistory(
        historyItem.id,
        searchTerm  // Utiliser directement le terme recherché
      ).subscribe({
        next: (response) => {
          console.log(`✅ Terme "${searchTerm}" ajouté à l'historique:`, response);
        },
        error: (err) => {
          console.error('❌ Erreur lors de l\'ajout à l\'historique:', err);
        }
      });

      return;
    }

    // Comportement par défaut pour les sélections de produits
    if (!product || !product.id) {
      console.warn('⚠️ Produit invalide pour l\'historique:', product);
      return;
    }

    // Simplifier les données envoyées à l'historique
    const productName = product.name || '';

    console.log('🔍 Envoi à l\'historique:', {
      id: product.id,
      name: productName
    });

    this.historyService.addToHistory(
      product.id,
      productName
    ).subscribe({
      next: (response) => {
        console.log(`✅ Produit "${productName}" ajouté à l'historique:`, response);
      },
      error: (err) => {
        console.error('❌ Erreur lors de l\'ajout à l\'historique:', err);
      }
    });
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

        // La sauvegarde dans l'historique est déjà faite dans onEnter

        // Ensure the selected product is at the first position
        if (includeSelectedProduct && this.selectedProduct) {
          response = this.reorderResults(response, this.selectedProduct);
        }

        // Navigate to results page with the response
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
          this.router.navigate(['/searched-prod'], { state: { resultsArray: response } });
        });
      },
      error: (error) => console.error('❌ Search error:', error),
    });
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

  // ======================== DROPDOWN TOGGLING
  /**
   * @function toggleFilterDropdown
   * @description Toggles the visibility of the filter dropdown.
   */
  toggleFilterDropdown() {
    this.filterDropdownOpen = !this.filterDropdownOpen;
  }
}
