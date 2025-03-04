import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// Cache API
import { DataCacheService } from '../../../services/cache/data-cache.service';
import { ApiService } from '../../../services/api.service';
// Model
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
  countries: string[] = [];   // Contains all the countries
  categories: string[] = [];  // Contains all the categories name
  brands: { id: string; name: string }[] = []; // Contains all the brands (ID + name)
  newBrandDescription: string = ''; // Stocke la description de la nouvelle marque
  // Property for inputting a new tag
  tagInput: string = '';

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

  selectedBrand: string = ''; // Gère la sélection de la marque
  isOtherBrand: boolean = false; // Indique si l'utilisateur veut ajouter une nouvelle marque
  newBrand: string = ''; // Stocke la nouvelle marque saisie par l'utilisateur

  constructor(
    private dataCacheService: DataCacheService,
    private apiService: ApiService,
  ) { }

  ngOnInit(): void {
    this.dataCacheService.loadData();

    forkJoin({
      countries: this.dataCacheService.getCountries().pipe(first()),
      categories: this.dataCacheService.getCategories().pipe(first()),
      brands: this.dataCacheService.getBrands().pipe(first())
    }).subscribe(({ countries, categories, brands }) => {
      this.countries = countries;
      this.categories = categories.map(category => category.name);
      this.brands = brands.map(brand => brand.name);
    });
  }

  // Adds a tag when pressing Enter
  addTag(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault(); // Prevents form submission
      const trimmedTag = this.tagInput.trim();
      if (trimmedTag && !this.product.tags.includes(trimmedTag) && this.product.tags.length < 10) {
        this.product.tags.push(trimmedTag);
      } else {
        window.alert('Tag already exists or you have reached the maximum number of tags allowed');
      }
      this.tagInput = ''; // Reset input field
    }
  }

  // Removes a tag from the list
  removeTag(tag: string): void {
    this.product.tags = this.product.tags.filter(t => t !== tag);
  }

  // TODO
  async onSave() {
    console.log('status:', this.product.status);
  
    if (!this.checkProductField(this.product)) {
      return; // Bloquer l'exécution si le produit est invalide
    }
  
    let newBrandInfo = null; // 🔹 Variable temporaire pour stocker la nouvelle marque
  
    // Vérifier si une nouvelle marque a été saisie
    if (this.isOtherBrand && this.newBrand.trim() !== '') {
      newBrandInfo = {
        name: this.newBrand,
        description: this.newBrandDescription
      };
    }
  
    // Construire l'objet à envoyer au backend
    const payload = {
      product: this.product, // Le produit (sans modification)
      newBrand: newBrandInfo // La nouvelle marque, si existante
    };
  
    // Envoi de la requête avec l'objet combiné
    this.apiService.postAddProduct(payload).subscribe({
      next: (res) => {
        console.log("✅ Product submitted successfully:", res);
        alert("Product submitted for admin review!");
        this.onCancel();
      },
      error: (err) => {
        console.error("❌ Error submitting product:", err);
        alert("Error submitting product!");
      }
    });
  }
  

  // TODO
  checkProductField(product: Product): boolean {
    let errors: string[] = [];
  
    // Vérification des champs obligatoires (sauf `brand` si une nouvelle marque est saisie)
    const requiredFields: (keyof Product)[] = [
      "name",
      "description",
      "category",
      "tags",
      "ecoscore",
      "origin",
      "source",
      "status"
    ];
  
    const missingFields = requiredFields.filter(field => !product[field]);
    if (missingFields.length > 0) {
      errors.push(`❌ Missing required fields: ${missingFields.join(", ")}`);
    }
  
    // Gestion spéciale de la marque
    if (!this.isOtherBrand && !product.brand) {
      errors.push("❌ 'brand' is required.");
    }
  
    if (this.isOtherBrand && !this.newBrand.trim()) {
      errors.push("❌ You must provide a name for the new brand.");
    }
  
    // Vérification spécifique des formats
    if (!Array.isArray(product.tags)) {
      errors.push("❌ 'tags' must be an array.");
    }
  
    if (!["Internal", "OpenFoodFacts"].includes(product.source)) {
      errors.push("❌ 'source' must be either 'Internal' or 'OpenFoodFacts'.");
    }
  
    // Affichage des erreurs si nécessaire
    if (errors.length > 0) {
      alert(errors.join("\n")); // Affichage des erreurs en une seule fois
      console.error("❌ Product validation errors:", errors);
      return false; // Retourne false si des erreurs sont présentes
    }
  
    return true; // Retourne true si tout est valide
  }
  

  // "Cancel" button: resets all form fields
  onCancel() {
    this.product = {
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
    this.tagInput = ''; // Reset tag input field
    console.log('Form reset');
  }

  isDarkMode: boolean = false;
  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
  }

  // TODO
  onBrandChange(event: Event): void {
    const selectedValue = (event.target as HTMLSelectElement).value;

    if (selectedValue === "other") {
      this.isOtherBrand = true;
      this.newBrand = ""; // Réinitialiser le champ texte
      this.newBrandDescription = ""; // Réinitialiser la description
    } else {
      this.isOtherBrand = false;
      this.product.brand = selectedValue; // Assigner l'ID de la marque sélectionnée
    }
  }
}
