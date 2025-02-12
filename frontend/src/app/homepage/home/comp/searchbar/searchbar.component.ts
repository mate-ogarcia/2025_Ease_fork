/**
 * @file searchbar.component.ts
 * @brief Component for handling product search functionality with optimized caching.
 * 
 * This component provides a search bar that fetches product suggestions
 * from the backend and allows the user to select a product for further actions.
 * It includes caching to optimize performance and prevent unnecessary API calls.
 */

import { Component, ElementRef, AfterViewInit, OnDestroy, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import * as VANTA from 'vanta/src/vanta.birds';
import * as THREE from 'three';
import { Router } from '@angular/router';
// RXJS for debounce
import { debounceTime, distinctUntilChanged, switchMap, tap, filter } from 'rxjs/operators';
import { Subject, of } from 'rxjs';
import { NavbarComponent } from '../navbar/navbar.component';
// API services
import { ApiService } from '../../../../../services/api.service';

@Component({
  selector: 'app-searchbar',
  imports: [FormsModule, CommonModule, NavbarComponent],
  templateUrl: './searchbar.component.html',
  styleUrl: './searchbar.component.css',
  standalone: true,
})
export class SearchbarComponent implements AfterViewInit, OnDestroy {
  searchQuery: string = '';
  searchResults: any[] = [];
  noResultsMessage: string = '';
  selectedProduct: string = '';
  private vantaEffect: any;
  private _searchSubject = new Subject<string>();
  private _cache = new Map<string, { data: any[], timestamp: number }>();
  private CACHE_DURATION = 5 * 60 * 1000; // 5 minutes expiration time

  @ViewChild('vantaBackground', { static: true }) vantaRef!: ElementRef;

  constructor(private apiService: ApiService, private router: Router) {}

  /**
   * Initializes the Vanta.js birds effect 
   * and sets up search functionality with caching.
   */
  ngAfterViewInit(): void {
    this.vantaEffect = (VANTA as any).default({
      el: '.container',
      THREE: THREE,
      backgroundColor: 0x13172e,
      color1: 0xff0000,
      color2: 0xd1ff,
      birdSize: 1,
      quantity: 4.0,
      speedLimit: 5.0,
      separation: 90.0,
      alignment: 20.0,
    });

    this._searchSubject
      .pipe(
        debounceTime(50),
        distinctUntilChanged(),
        filter(query => query.trim() !== ''),
        switchMap((query) => {
          const trimmedQuery = query.trim();
          const cachedData = this._cache.get(trimmedQuery);

          if (cachedData && (Date.now() - cachedData.timestamp < this.CACHE_DURATION)) {
            this.searchResults = cachedData.data.map((result: any) => ({
                id: result.id,
                name: result.fields?.name || 'Unknown name',
                description: result.fields?.description || 'No description available',
            }));
            this.noResultsMessage = this.searchResults.length ? '' : 'No product found.';
            return of(null);
          }

          return this.apiService.sendSearchData({ search: trimmedQuery }).pipe(
            tap(response => {
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

  /**
   * Cleans up the Vanta.js effect when the component is destroyed.
   */
  ngOnDestroy(): void {
    if (this.vantaEffect) {
      this.vantaEffect.destroy();
    }
  }

  /**
   * @brief Checks if there are search suggestions available.
   * 
   * This getter method returns `true` if there are search results available,
   * otherwise, it returns `false`.
   * 
   * @returns {boolean} `true` if there are search results, `false` otherwise.
   */
  get hasSuggestions(): boolean {
    return this.searchResults.length > 0;
  }

  /**
   * Triggers a new search based on input change.
   * @param event The input event containing the new search query.
   */
  onInputChange(event: any) {
    if (this.searchQuery.trim() === '') {
        this.clearSearch();
        return;
    }
    this._searchSubject.next(this.searchQuery);
  }

  /**
   * Retrieves cached results when the input field gains focus.
   */
  onFocus() {
    const trimmedQuery = this.searchQuery.trim();
    if (trimmedQuery === '') {
        this.clearSearch();
        return;
    }

    if (this._cache.has(trimmedQuery)) {
        this.searchResults = [...this._cache.get(trimmedQuery)?.data || []];
        this.noResultsMessage = this.searchResults.length ? '' : 'No product found.';
    }
  }

  /**
   * Handles the Enter key press to select a product.
   * @param event The keyboard event.
   */
  onEnter(event: any) {
    if (this.searchQuery.trim() !== '' && event.key === 'Enter') {
      const queryLower = this.searchQuery.trim().toLowerCase();
  
      // Search for products containing the search, not an exact match
      const product = this.searchResults.find(
        (p) => p.name.toLowerCase().includes(queryLower)
      );
      
      if (product) {
        this.selectProduct(product);
      } else {
        console.warn('⚠️ Product not found in results!');
        this.noResultsMessage = 'No product found.';
      }
    }
  }
  
  /**
   * Clears the search input and results.
   */
  clearSearch() {
    this.searchQuery = '';
    this.searchResults = [];
    this.noResultsMessage = '';
  }

  /**
   * Selects a product and navigates to its details page.
   * @param product The selected product object.
   */
  selectProduct(product: any) {
    this.searchQuery = product.name;
    this.selectedProduct = product.id;
    this.noResultsMessage = '';

    if (!this.selectedProduct) {
      console.warn('⚠️ No product ID found!');
      return;
    }

    this.apiService.postProductSelection({ productId: this.selectedProduct }).subscribe({
      next: () => {
        this.router.navigate(['/products-alternative', this.selectedProduct]).then(
          () => console.log('✅ Navigation successful!')
        ).catch((error) => console.error('❌ Navigation error:', error));
      },
      error: (error) => console.error('❌ Error sending product ID:', error),
    });
  }
}
