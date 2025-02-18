import { Component } from '@angular/core';
import { NgFor, NgClass, NgStyle, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Product {
  name: string;
  region: string;
  description: string;
  ecologicalImpact: 'bad' | 'neutral' | 'good';
}

interface Rayon {
  name: string;
  icon: string;
  backgroundColor: string;
  textColor: string;
  products: Product[];
}

@Component({
  selector: 'app-choice',
  standalone: true,
  templateUrl: './choice.component.html',
  styleUrl: './choice.component.css',
  imports: [NgFor, NgClass, NgStyle, FormsModule, NgIf]
})
export class ChoiceComponent {
  rayons: Rayon[] = [
    { name: 'Nourriture', icon: '🍽️', backgroundColor: '#FF5733', textColor: '#FFFFFF', products: [] },
    { name: 'Boissons', icon: '🍹', backgroundColor: '#3498DB', textColor: '#FFFFFF', products: [] },
    { name: 'Épicerie', icon: '🛒', backgroundColor: '#2ECC71', textColor: '#FFFFFF', products: [] },
    { name: 'Hygiène', icon: '🧼', backgroundColor: '#F4D03F', textColor: '#333333', products: [] },
    { name: 'Électronique', icon: '📱', backgroundColor: '#9B59B6', textColor: '#FFFFFF', products: [] },
    { name: 'Vêtements', icon: '👗', backgroundColor: '#E74C3C', textColor: '#FFFFFF', products: [] },
    { name: 'Bricolage', icon: '🔨', backgroundColor: '#34495E', textColor: '#FFFFFF', products: [] },
    { name: 'Jouets', icon: '🧸', backgroundColor: '#F39C12', textColor: '#FFFFFF', products: [] },
    { name: 'Sport', icon: '⚽', backgroundColor: '#1ABC9C', textColor: '#FFFFFF', products: [] },
    { name: 'Animaux', icon: '🐶', backgroundColor: '#8E44AD', textColor: '#FFFFFF', products: [] },
  ];
  
  subCategoriesData: { [key: string]: string[] } = {
    Nourriture: ['Fruits', 'Légumes', 'Viandes', 'Poissons', 'Produits Laitiers', 'Céréales'],
    Boissons: ['Jus', 'Sodas', 'Cafés', 'Thés', 'Alcools'],
    Épicerie: ['Épices', 'Sauces', 'Snacks', 'Conserves'],
    Hygiène: ['Soins du corps', 'Cheveux', 'Hygiène dentaire'],
    Électronique: ['Téléphones', 'Ordinateurs', 'Accessoires'],
    Vêtements: ['Homme', 'Femme', 'Enfant'],
    Bricolage: ['Outils', 'Matériaux', 'Équipements'],
    Jouets: ['Peluches', 'Jeux éducatifs', 'Jeux de société'],
    Sport: ['Football', 'Tennis', 'Randonnée'],
    Animaux: ['Alimentation', 'Jouets', 'Accessoires'],
  };
  
  rayonsData: { [key: string]: Product[] } = {};
  
  currentRayon: string | null = null;
  currentSubCategories: string[] = [];
  currentSubCategory: string | null = null;
  searchQuery: string = '';
  filteredProducts: Product[] = [];

  constructor() {
    this.rayonsData = this.initializeRayonsData();
  }
  
  initializeRayonsData(): { [key: string]: Product[] } {
    return {
      Fruits: [
        { name: 'Pomme', region: 'Normandie', description: 'Une pomme rouge juteuse.', ecologicalImpact: 'good' },
        { name: 'Banane', region: 'Guadeloupe', description: 'Banane bio importée.', ecologicalImpact: 'neutral' },
      ],
      Légumes: [
        { name: 'Carotte', region: 'Bretagne', description: 'Carotte locale et bio.', ecologicalImpact: 'good' },
        { name: 'Tomate', region: 'Provence', description: 'Tomate bien mûre et savoureuse.', ecologicalImpact: 'bad' },
      ],
    };
  }
  
  selectRayon(rayonName: string): void {
    this.currentRayon = rayonName;
    this.currentSubCategories = this.subCategoriesData[rayonName] || [];
    this.currentSubCategory = null;
    this.searchQuery = '';
    this.filteredProducts = [];
  }

  selectSubCategory(subCategory: string): void {
    this.currentSubCategory = subCategory;
    this.filterProducts();
  }

  filterProducts(): void {
    if (!this.currentSubCategory) {
      this.filteredProducts = [];
      return;
    }
    this.filteredProducts = this.rayonsData[this.currentSubCategory] || [];
  }
}
