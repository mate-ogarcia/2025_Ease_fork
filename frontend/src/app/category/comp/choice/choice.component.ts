import { Component } from '@angular/core';
import { NgFor, NgClass, NgStyle } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Product {
  name: string;
  region: string;
  description: string;
  ecologicalImpact: 'bad' | 'neutral' | 'good';
  rating: number;
}

interface Rayon {
  name: string;
  icon: string;
  products: Product[];
}

@Component({
  selector: 'app-choice',
  standalone: true, // Permet d'utiliser ce composant sans module
  templateUrl: './choice.component.html',
  styleUrl: './choice.component.css',
  imports: [NgFor, NgClass, NgStyle, FormsModule] // Importation des modules Angular directement
})
export class ChoiceComponent {
  rayons: Rayon[] = [
    { name: 'Fruits', icon: '🍎', products: [] },
    { name: 'Légumes', icon: '🥦', products: [] },
    { name: 'Produits Laitiers', icon: '🧀', products: [] },
    { name: 'Viandes', icon: '🥩', products: [] },
    { name: 'Épices', icon: '🌶️', products: [] },
    { name: 'Boissons', icon: '🍹', products: [] },
    { name: 'Céréales', icon: '🌾', products: [] },
    { name: 'Poissons', icon: '🐟', products: [] },
    { name: 'Pâtisseries', icon: '🥐', products: [] },
    { name: 'Conserves', icon: '🥫', products: [] },
    { name: 'Surgelés', icon: '❄️', products: [] },
    { name: 'Vins', icon: '🍷', products: [] },
    { name: 'Noix & Graines', icon: '🥜', products: [] },
    { name: 'Sauces', icon: '🍯', products: [] },
    { name: 'Snacks', icon: '🍫', products: [] },
  ];
  
  rayonsData: { [key: string]: Product[] } = {
    Fruits: [
      { name: 'Pomme', region: 'Normandie', description: 'Une pomme rouge juteuse.', ecologicalImpact: 'good', rating: 90 },
      { name: 'Banane', region: 'Guadeloupe', description: 'Banane bio importée.', ecologicalImpact: 'neutral', rating: 75 },
      { name: 'Orange', region: 'Espagne', description: 'Orange sucrée et vitaminée.', ecologicalImpact: 'good', rating: 85 },
      { name: 'Raisin', region: 'Bordeaux', description: 'Raisin noir, idéal pour les desserts.', ecologicalImpact: 'good', rating: 80 },
      { name: 'Mangue', region: 'Brésil', description: 'Mangue tropicale très parfumée.', ecologicalImpact: 'neutral', rating: 70 },
    ],
    Légumes: [
      { name: 'Carotte', region: 'Bretagne', description: 'Carotte locale et bio.', ecologicalImpact: 'good', rating: 95 },
      { name: 'Tomate', region: 'Provence', description: 'Tomate bien mûre et savoureuse.', ecologicalImpact: 'bad', rating: 50 },
      { name: 'Poivron', region: 'Sud-Ouest', description: 'Poivron rouge croquant et sucré.', ecologicalImpact: 'good', rating: 88 },
      { name: 'Concombre', region: 'Île-de-France', description: 'Concombre bio rafraîchissant.', ecologicalImpact: 'good', rating: 92 },
    ],
    'Produits Laitiers': [
      { name: 'Camembert', region: 'Normandie', description: 'Fromage au lait cru, goût intense.', ecologicalImpact: 'neutral', rating: 80 },
      { name: 'Yaourt Nature', region: 'Bretagne', description: 'Yaourt bio crémeux et doux.', ecologicalImpact: 'good', rating: 90 },
      { name: 'Beurre Fermier', region: 'Loire', description: 'Beurre doux artisanal.', ecologicalImpact: 'good', rating: 85 },
      { name: 'Lait Frais', region: 'Jura', description: 'Lait de vache frais et local.', ecologicalImpact: 'neutral', rating: 70 },
    ],
    Viandes: [
      { name: 'Bœuf', region: 'Limousin', description: 'Viande tendre et savoureuse.', ecologicalImpact: 'bad', rating: 60 },
      { name: 'Poulet Fermier', region: 'Bresse', description: 'Poulet élevé en plein air.', ecologicalImpact: 'good', rating: 85 },
      { name: 'Agneau', region: 'Pyrénées', description: 'Agneau doux et parfumé.', ecologicalImpact: 'neutral', rating: 75 },
    ],
    Épices: [
      { name: 'Poivre Noir', region: 'Inde', description: 'Poivre fort et aromatique.', ecologicalImpact: 'neutral', rating: 80 },
      { name: 'Curcuma', region: 'Madagascar', description: 'Curcuma bio aux multiples bienfaits.', ecologicalImpact: 'good', rating: 95 },
      { name: 'Cumin', region: 'Maroc', description: 'Épice parfumée pour vos plats.', ecologicalImpact: 'good', rating: 85 },
    ],
    Boissons: [
      { name: 'Jus d\'Orange', region: 'Brésil', description: 'Jus pur pressé sans additifs.', ecologicalImpact: 'good', rating: 90 },
      { name: 'Café Arabica', region: 'Éthiopie', description: 'Café doux et fruité.', ecologicalImpact: 'neutral', rating: 80 },
      { name: 'Thé Vert', region: 'Chine', description: 'Thé riche en antioxydants.', ecologicalImpact: 'good', rating: 95 },
    ],
    Poissons: [
      { name: 'Saumon', region: 'Norvège', description: 'Saumon frais riche en oméga-3.', ecologicalImpact: 'neutral', rating: 75 },
      { name: 'Thon', region: 'Océan Indien', description: 'Thon rouge de qualité.', ecologicalImpact: 'bad', rating: 50 },
      { name: 'Cabillaud', region: 'Atlantique', description: 'Cabillaud tendre et savoureux.', ecologicalImpact: 'good', rating: 85 },
    ],
    'Noix & Graines': [
      { name: 'Amandes', region: 'Californie', description: 'Amandes riches en protéines.', ecologicalImpact: 'good', rating: 95 },
      { name: 'Noix de Cajou', region: 'Vietnam', description: 'Délicieuses noix croquantes.', ecologicalImpact: 'neutral', rating: 80 },
      { name: 'Graines de Chia', region: 'Pérou', description: 'Superaliment riche en oméga-3.', ecologicalImpact: 'good', rating: 90 },
    ],
    Sauces: [
      { name: 'Ketchup Maison', region: 'France', description: 'Ketchup sans additifs.', ecologicalImpact: 'good', rating: 88 },
      { name: 'Mayonnaise Bio', region: 'Normandie', description: 'Mayonnaise sans conservateurs.', ecologicalImpact: 'good', rating: 85 },
      { name: 'Sauce Piquante', region: 'Mexique', description: 'Sauce relevée pour épicer vos plats.', ecologicalImpact: 'neutral', rating: 75 },
    ],
    Snacks: [
      { name: 'Chocolat Noir 70%', region: 'Belgique', description: 'Chocolat pur cacao.', ecologicalImpact: 'good', rating: 95 },
      { name: 'Chips Bio', region: 'France', description: 'Chips de pommes de terre locales.', ecologicalImpact: 'neutral', rating: 80 },
      { name: 'Barre Énergétique', region: 'USA', description: 'Snack protéiné naturel.', ecologicalImpact: 'good', rating: 85 },
    ],
  };
  

  currentRayon: string | null = null;
  searchQuery: string = '';
  filteredProducts: Product[] = [];

  constructor() {
    // Initialisation des produits pour chaque rayon
    this.rayons.forEach(rayon => {
      rayon.products = this.rayonsData[rayon.name] || [];
    });
  }

  selectRayon(rayonName: string): void {
    this.currentRayon = rayonName;
    this.searchQuery = '';
    this.filterProducts();
  }

  filterProducts(): void {
    if (!this.currentRayon) {
      this.filteredProducts = [];
      return;
    }

    const rayonProducts = this.rayons.find(r => r.name === this.currentRayon)?.products || [];

    this.filteredProducts = rayonProducts.filter(product =>
      product.name.toLowerCase().includes(this.searchQuery.toLowerCase()) /*||
      product.region.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(this.searchQuery.toLowerCase())*/
    );
  }

  getRatingDotClass(ecologicalImpact: 'bad' | 'neutral' | 'good'): string {
    switch (ecologicalImpact) {
      case 'bad': return 'rating-dot-bad';
      case 'neutral': return 'rating-dot-neutral';
      case 'good': return 'rating-dot-good';
      default: return 'rating-dot-neutral';
    }
  }
  getPastelColor(rayonName: string): string {
    const pastelColors: { [key: string]: string } = {
      Fruits: '#FFDDC1',  // Orange pastel
      Légumes: '#D4EDDA', // Vert pastel
      'Produits Laitiers': '#FFF3CD', // Jaune pastel
      Viandes: '#FAD2E1', // Rose pastel
      Épices: '#FDE2E4', // Rouge pastel
      Boissons: '#D6E4F0', // Bleu pastel
      Céréales: '#FFF7D6', // Jaune pâle
      Poissons: '#CFE2F3', // Bleu clair
      Pâtisseries: '#E5D8F2', // Violet pastel
      Conserves: '#E8E8E8', // Gris clair
      Surgelés: '#D1ECF1', // Bleu glacé
      Vins: '#E4C1F9', // Violet doux
      'Noix & Graines': '#F3E5AB', // Beige doux
      Sauces: '#FFEBCC', // Orange clair
      Snacks: '#FFD8B1' // Abricot pastel
    };
  
    return pastelColors[rayonName] || '#E9ECEF'; // Couleur par défaut
  }
  
}
