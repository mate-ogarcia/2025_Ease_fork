/**
 * @file form.component.ts
 * @brief Form component for product data input.
 * 
 * This component handles product creation, tag management, brand selection, and data validation.
 */

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataCacheService } from '../../../services/cache/data-cache.service';
import { ApiService } from '../../../services/api.service';
import { Product } from '../../models/product.model';
import { first, forkJoin } from 'rxjs';

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})
export class FormComponent implements OnInit {
  countries: string[] = [];                   // List of all available countries.
  categories: string[] = [];                  // List of all available product categories.
  brands: { id: string; name: string }[] = [];// List of all available brands (ID and name).
  newBrandDescription: string = '';           // Description of a new brand if added.
  tagInput: string = '';                      // Input field for a new tag.
  selectedBrand: string = '';     // Stores selected brand.
  isOtherBrand: boolean = false;  // Flag to check if a new brand is being added.
  newBrand: string = '';          // Stores the new brand name entered by the user.
  // Product object model.
  product: Product = {
    id: '',
    name: '',
    brand: '',
    description: '',
    category: '',
    tags: [],
    ecoscore: '',
    origin: '',
    manufacturing_places: '',
    image: '',
    source: 'Internal',
    status: '',
  };

  constructor(
    private dataCacheService: DataCacheService,
    private apiService: ApiService,
  ) { }

  /**
   * @brief Initializes component and loads cached data.
   */
  ngOnInit(): void {
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

    // Refresh brands every 5 minutes
    setInterval(() => {
      this.dataCacheService.refreshBrands();
    }, 5 * 60 * 1000);
  }

  /**
   * @brief Adds a tag when Enter is pressed.
   * @param event KeyboardEvent triggered by keypress.
   */
  addTag(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      const trimmedTag = this.tagInput.trim();
      if (trimmedTag && !this.product.tags.includes(trimmedTag) && this.product.tags.length < 10) {
        this.product.tags.push(trimmedTag);
      } else {
        window.alert('Tag already exists or maximum number reached');
      }
      this.tagInput = '';
    }
  }

  /**
   * @brief Removes a tag from the list.
   * @param tag Tag to be removed.
   */
  removeTag(tag: string): void {
    this.product.tags = this.product.tags.filter(t => t !== tag);
  }

  /**
   * @brief Refreshes the list of brands.
   */
  refreshBrands(): void {
    this.dataCacheService.refreshBrands();
  }

  /**
   * @brief Saves the product data and submits it to the backend.
   */
  async onSave() {  
    if (!this.checkProductField(this.product)) {
      return;
    }
    
    let newBrandInfo = null;
    
    if (this.isOtherBrand && this.newBrand.trim() !== '') {
      newBrandInfo = {
        name: this.newBrand,
        description: this.newBrandDescription
      };
    }
    
    const payload = {
      product: this.product,
      newBrand: newBrandInfo
    };
    
    this.apiService.postAddProduct(payload).subscribe({
      next: () => {
        alert("Product submitted for admin review!");
        this.dataCacheService.refreshBrands();
        this.onCancel();
      },
      error: (err) => {
        console.error("Error submitting product:", err);
        alert("Error submitting product!");
      }
    });
  }

  /**
   * @brief Validates product fields before submission.
   * @param product The product object to be validated.
   * @return True if all required fields are valid, false otherwise.
   */
  checkProductField(product: Product): boolean {
    let errors: string[] = [];
    
    const requiredFields: (keyof Product)[] = [
      "name", "description", "category", "tags",
      "ecoscore", "origin", "source", "status"
    ];
    
    const missingFields = requiredFields.filter(field => !product[field]);
    if (missingFields.length > 0) {
      errors.push(`Missing required fields: ${missingFields.join(", ")}`);
    }
    
    if (!this.isOtherBrand && !product.brand) {
      errors.push("Brand is required.");
    }
    
    if (this.isOtherBrand && !this.newBrand.trim()) {
      errors.push("New brand name is required.");
    }
    
    if (!Array.isArray(product.tags)) {
      errors.push("Tags must be an array.");
    }
    
    if (!["Internal", "OpenFoodFacts"].includes(product.source)) {
      errors.push("Source must be 'Internal' or 'OpenFoodFacts'.");
    }
    
    if (errors.length > 0) {
      alert(errors.join("\n"));
      console.error("Product validation errors:", errors);
      return false;
    }
    
    return true;
  }

  /**
   * @brief Resets all form fields.
   */
  onCancel(): void {
    this.product = {
      id: '', name: '', brand: '', description: '', category: '', tags: [],
      ecoscore: '', origin: '', manufacturing_places: '', image: '', source: 'Internal', status: ''
    };
    this.tagInput = '';
  }

  /**
 * @brief Handles the change event when a brand is selected.
 * @param event The change event object.
 */
onBrandChange(event: Event): void {
  const selectElement = event.target as HTMLSelectElement;
  this.selectedBrand = selectElement.value;

  // Check if the user selected "Other" to add a new brand
  this.isOtherBrand = this.selectedBrand === 'other';

  if (!this.isOtherBrand) {
    this.product.brand = this.selectedBrand; // Assign the selected brand to the product
    this.newBrand = ''; // Reset new brand input
    this.newBrandDescription = ''; // Reset brand description input
  } else {
    this.product.brand = ''; // Clear brand field for a new entry
  }
}

}
