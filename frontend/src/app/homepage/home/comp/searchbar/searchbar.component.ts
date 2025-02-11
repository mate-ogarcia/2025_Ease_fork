/**
 * @file searchbar.component.ts
 * @brief Component for handling product search functionality.
 * 
 * This component provides a search bar that fetches product suggestions
 * from the backend and allows the user to select a product for further actions.
 */

import { Component, ElementRef, AfterViewInit, OnDestroy, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms'; // For [(ngModel)]
import { CommonModule } from '@angular/common'; // For *ngFor and *ngIf
import * as VANTA from 'vanta/src/vanta.birds';
import * as THREE from 'three';
import { NavbarComponent } from '../navbar/navbar.component';
import { Router } from '@angular/router';
import { switchMap } from 'rxjs/operators';
// Services API
import { ApiService } from '../../../../../services/api.service';

@Component({
  selector: 'app-searchbar',
  imports: [FormsModule, CommonModule, NavbarComponent],
  templateUrl: './searchbar.component.html',
  styleUrl: './searchbar.component.css',
  standalone: true, // Declare the component as standalone
})
export class SearchbarComponent implements AfterViewInit, OnDestroy {
  searchQuery: string = '';
  searchResults: any[] = [];
  noResultsMessage: string = '';
  selectedProduct: string = '';
  private vantaEffect: any;
  
  @ViewChild('vantaBackground', { static: true }) vantaRef!: ElementRef;

  constructor(
    private apiService: ApiService,
    private router: Router
  ) { }

  /**
   * Initializes the Vanta.js birds effect after the component's view is loaded.
   */
  ngAfterViewInit(): void {
    this.vantaEffect = (VANTA as any).default({
      el: '.container',
      THREE: THREE, 
      backgroundColor: 0x13172e,
      color1: 0xff0000,
      color2: 0xd1ff,
      birdSize: 1,
      quantity: 4.00,
      speedLimit: 5.00,
      separation: 90.00,
      alignment: 20.00
    });
  }

  /**
   * Cleans up Vanta.js effect when the component is destroyed.
   */
  ngOnDestroy(): void {
    if (this.vantaEffect) {
      this.vantaEffect.destroy();
    }
  }

  get hasSuggestions(): boolean {
    return this.searchResults.length > 0;
  }

  /**
   * Handles input change and fetches search suggestions from the API.
   * @param event The keyboard event triggered by user input.
   */
  onInputChange(event: any) {
    if (this.searchQuery.trim() !== '') {
      this.apiService.sendSearchData({ search: this.searchQuery.trim() }).subscribe({
        next: (response) => {
          console.log('🔹 Search results received:', response);
          this.searchResults = response.length ? response.map((result: any) => ({
            id: result.id,
            name: result.fields.name,
            description: result.fields.description,
          })) : [];
          this.noResultsMessage = this.searchResults.length ? '' : 'No product found.';
        },
        error: (error) => console.error("❌ Error during search:", error)
      });
    }
  }

  /**
   * Handles the "Enter" key event to select a product.
   * @param event The keyboard event triggered by pressing enter.
   */
  onEnter(event: any) {
    if (this.searchQuery.trim() !== '' && event.key === 'Enter') {
      const product = this.searchResults.find(p => p.name.toLowerCase() === this.searchQuery.trim().toLowerCase());
      if (product) {
        this.selectProduct(product);
      } else {
        console.warn("⚠️ Product not found in results!");
      }
    }
  }

  /**
   * Clears the search input and hides the results.
   */
  clearSearch() {
    this.searchQuery = '';
    this.searchResults = [];
    this.noResultsMessage = '';
  }

  /**
   * Selects a product from the search results and navigates to its details page.
   * @param product The selected product object.
   */
  selectProduct(product: any) {
    this.searchQuery = product.name;
    this.selectedProduct = product.id;
    this.noResultsMessage = '';

    if (!this.selectedProduct) {
      console.warn("⚠️ No product ID found!");
      return;
    }

    this.apiService.postProductSelection({ productId: this.selectedProduct }).subscribe({
      next: () => {
        console.log('✅ Product ID successfully sent:', this.selectedProduct);
        this.router.navigate(['/products-alternative', this.selectedProduct]).then(success => {
          console.log("✅ Navigation successful!");
        }).catch(error => {
          console.error("❌ Navigation error:", error);
        });
      },
      error: (error) => console.error("❌ Error sending product ID:", error)
    });
  }
}
