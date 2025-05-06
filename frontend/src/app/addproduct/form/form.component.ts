/**
 * @file form.component.ts
 * @brief Form component for product data input.
 *
 * Handles product creation, tag management, brand selection, and data validation.
 */
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataCacheService } from '../../../services/cache/data-cache.service';
import { ApiService } from '../../../services/api.service';
import { Product } from '../../models/product.model';
import { first, forkJoin } from 'rxjs';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

/**
 * @class FormComponent
 * @brief Component for managing the product form.
 */
@Component({
  selector: 'app-form',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent],
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})
export class FormComponent implements OnInit {
  /** @brief List of all available countries. */
  countries: string[] = [];

  /** @brief List of all available product categories. */
  categories: string[] = [];

  /** @brief List of all available brands (ID and name). */
  brands: { id: string; name: string }[] = [];

  /** @brief Description of a new brand if added. */
  newBrandDescription: string = '';

  /** @brief Input field value for a new tag. */
  tagInput: string = '';

  /** @brief Currently selected brand identifier. */
  selectedBrand: string = '';

  /** @brief Flag indicating if 'Other' brand option is selected. */
  isOtherBrand: boolean = false;

  /** @brief Name of the new brand entered by the user. */
  newBrand: string = '';

  /** @brief Flag indicating if form is in submitting state. */
  isSubmitting: boolean = false;

  /**
   * @brief Product object model bound to the form.
   */
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

  /**
   * @brief Constructor with injected services.
   * @param dataCacheService Service for caching and retrieving data.
   * @param apiService Service for API calls.
   */
  constructor(
    private dataCacheService: DataCacheService,
    private apiService: ApiService,
  ) { }

  /**
   * @brief Initializes component and loads cached data.
   * Also sets up polling to refresh brands every 5 minutes.
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

    setInterval(() => {
      this.dataCacheService.refreshBrands();
    }, 5 * 60 * 1000);
  }

  /**
   * @brief Adds a tag when Enter key is pressed.
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
   * @brief Removes a tag from the product's tag list.
   * @param tag Tag string to be removed.
   */
  removeTag(tag: string): void {
    this.product.tags = this.product.tags.filter(t => t !== tag);
  }

  /**
   * @brief Manually triggers a refresh of the brand list.
   */
  refreshBrands(): void {
    this.dataCacheService.refreshBrands();
  }

  /**
   * @brief Validates and submits the product data to the backend.
   * @return Promise resolved after submission attempt.
   */
  async onSave(): Promise<void> {
    if (!this.checkProductField(this.product)) {
      return;
    }

    this.isSubmitting = true;

    let newBrandInfo = null;
    if (this.isOtherBrand && this.newBrand.trim() !== '') {
      newBrandInfo = {
        name: this.newBrand,
        description: this.newBrandDescription,
        status: 'add-brand'
      };
    }

    const payload = { product: this.product, newBrand: newBrandInfo };

    this.apiService.postAddProduct(payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        alert('Product submitted for admin review!');
        this.dataCacheService.refreshBrands();
        this.onCancel();
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('❌ API Error:', err);
        if (err.status === 400) {
          alert(err.error.error);
        } else if (err.status === 0) {
          alert('Unable to connect to server. Check your backend.');
        } else {
          alert('An unknown error has occurred.');
        }
      }
    });
  }

  /**
   * @brief Validates required fields of the product before submission.
   * @param product The product object to validate.
   * @return True if validation passes; False otherwise.
   */
  checkProductField(product: Product): boolean {
    let errors: string[] = [];
    const requiredFields: (keyof Product)[] = [
      'name', 'description', 'category', 'tags',
      'ecoscore', 'origin', 'source', 'status'
    ];
    const missingFields = requiredFields.filter(field => !product[field]);
    if (missingFields.length > 0) {
      errors.push(`Missing required fields: ${missingFields.join(', ')}`);
    }
    if (!this.isOtherBrand && !product.brand) {
      errors.push('Brand is required.');
    }
    if (this.isOtherBrand && !this.newBrand.trim()) {
      errors.push('New brand name is required.');
    }
    if (!Array.isArray(product.tags)) {
      errors.push('Tags must be an array.');
    }
    if (!['Internal', 'OpenFoodFacts'].includes(product.source)) {
      errors.push("Source must be 'Internal' or 'OpenFoodFacts'.");
    }
    if (errors.length > 0) {
      alert(errors.join('\n'));
      console.error('Product validation errors:', errors);
      return false;
    }
    return true;
  }

  /**
   * @brief Resets all form fields to their default values.
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
   * @param event Event object from the select element.
   */
  onBrandChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedBrand = selectElement.value;
    this.isOtherBrand = this.selectedBrand === 'other';
    if (!this.isOtherBrand) {
      this.product.brand = this.selectedBrand;
      this.newBrand = '';
      this.newBrandDescription = '';
    } else {
      this.product.brand = '';
    }
  }
}
