import { Component, ElementRef, AfterViewInit, OnDestroy, ViewChild, } from '@angular/core';
import { FormsModule } from '@angular/forms'; // For [(ngModel)]
import { CommonModule } from '@angular/common'; // For *ngFor and *ngIf
import * as VANTA from 'vanta/src/vanta.birds';
import * as THREE from 'three';
import { NavbarComponent } from '../navbar/navbar.component';
import { ApiService } from '../../../../../services/api.service';

@Component({
  selector: 'app-searchbar',
  imports: [FormsModule, CommonModule, NavbarComponent],
  templateUrl: './searchbar.component.html',
  styleUrl: './searchbar.component.css',
  standalone: true, // Declare the component as standalone
})
export class SearchbarComponent implements AfterViewInit, OnDestroy {
  // Other
  searchQuery: string = '';
  
  // Results of the query from the database
  searchResults: any[] = [];
  noResultsMessage: string = '';

  private vantaEffect: any;

  @ViewChild('vantaBackground', { static: true }) vantaRef!: ElementRef;

  // Declare the ApiService with its constructor
  constructor(private apiService: ApiService) { }

  /**
   * @brief Initializes the Vanta.js effect after the component's view is initialized.
   *
   * This method applies a Vanta.js birds effect as the background using Three.js to generate dynamic visuals.
   */
  ngAfterViewInit(): void {
    this.vantaEffect = (VANTA as any).default({
      el: '.container',
      THREE: THREE, // Ensure that Three.js is passed properly
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

  ngOnDestroy(): void {
    if (this.vantaEffect) {
      this.vantaEffect.destroy();
    }
  }

  get hasSuggestions(): boolean {
    return this.searchResults.length > 0;
  }
  
  

  /**
   * @brief Handles the "Enter" key event to select a product.
   *
   * When the user presses "Enter" in the search input, this method selects the product and clears the filtered results.
   * @param event The keyboard event triggered by the user pressing a key.
   */
  onInputChange(event: any) {
    if (this.searchQuery.trim() !== '') {
      this.selectProduct(this.searchQuery.trim());
    }
  }
  

  /**
   * @brief Clears the search query and hides the results.
   *
   * This method resets the `searchQuery` and hides the `filteredResults` list, effectively clearing the search input.
   */
  clearSearch() {
    this.searchQuery = ''; // Clear the search input
    this.searchResults = [];
    this.noResultsMessage = '';
  }

  /**
   * @brief Selects a product from the search results and sends it to the backend.
   *
   * This method updates the search input with the selected product, clears the result list,
   * and sends the product to the backend using the ApiService.
   * It handles the response and updates the results or displays a "no results" message if necessary.
   * 
   * @param product The selected product to be sent to the backend.
   */
  selectProduct(product: string) {
    this.searchQuery = product; // Fill the search bar with the selected product
    this.filteredResults = [];  // Hide the results list
    this.noResultsMessage = '';

    // Once the product is selected, send it to the backend
    this.apiService.sendSearchData({ search: product }).subscribe({
      next: (response) => {
        console.log(
          'Searched product sent successfully \nHere is the response: ', response
        );

        // If no products match
        if (response.length === 0) {
          this.noResultsMessage = 'Aucun produit trouvé pour cette recherche.'; // Display a no results message
          this.searchResults = []; // Clear the search results
        }
        // If there are some results
        else {
          this.searchResults = response.map((result: any) => {
            return {
              id: result.id,
              name: result.fields.name,
              description: result.fields.description,
            }
          });
        }
      },
      // If something went wrong
      error: (error) => console.error('Error when sending product: ', error)
    });
  }
}
