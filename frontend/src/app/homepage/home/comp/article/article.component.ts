import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

// Interface pour typer les objets Rayon
interface Rayon {
  icon: string;
  name: string;
  items: string[];
}

@Component({
  selector: 'app-article',
  standalone: true, // Composant autonome
  imports: [CommonModule], // Importation des directives comme NgFor et NgIf
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.css']
})
export class ArticleComponent {
  @ViewChild('carousel') carousel!: ElementRef; // Référence du carrousel

  // Liste des rayons avec leurs icônes, noms et produits
  rayons: Rayon[] = [
    {
      name: 'Fruits et Légumes',
      icon: '🥦',
      items: ['Pommes', 'Bananes', 'Tomates', 'Carottes', 'Salade', 'Brocolis']
    },
    {
      name: 'Boucherie',
      icon: '🥩',
      items: ['Poulet', 'Bœuf', 'Porc', 'Agneau', 'Saucisses']
    },
    {
      name: 'Poissonnerie',
      icon: '🐟',
      items: ['Saumon', 'Thon', 'Crevettes', 'Moules', 'Calamars']
    },
    {
      name: 'Boulangerie',
      icon: '🥖',
      items: ['Baguette', 'Croissant', 'Pain de mie', 'Brioche']
    },
    {
      name: 'Épicerie',
      icon: '🛒',
      items: ['Riz', 'Pâtes', 'Farine', 'Huile d’olive', 'Sucre', 'Sel']
    },
    {
      name: 'Produits laitiers',
      icon: '🧀',
      items: ['Lait', 'Fromage', 'Yaourt', 'Beurre', 'Crème fraîche']
    },
    {
      name: 'Boissons',
      icon: '🥤',
      items: ['Jus d’orange', 'Eau minérale', 'Soda', 'Café', 'Thé']
    },
    {
      name: 'Surgelés',
      icon: '❄️',
      items: ['Pizza surgelée', 'Glaces', 'Légumes surgelés']
    },
    {
      name: 'Hygiène et Beauté',
      icon: '🛁',
      items: ['Shampoing', 'Savon', 'Dentifrice', 'Déodorant']
    },
    {
      name: 'Maison et Entretien',
      icon: '🏡',
      items: ['Lessive', 'Éponge', 'Papier toilette', 'Détergent']
    }
  ];

  // Rayon sélectionné
  selectedRayon: Rayon | null = null;

  // Sélectionne un rayon
  selectRayon(rayon: Rayon): void {
    this.selectedRayon = rayon;
  }

  // Navigation du carrousel avec des boutons
  scrollCarousel(direction: 'left' | 'right'): void {
    const scrollAmount = 300; // Taille du défilement
    if (this.carousel) {
      if (direction === 'left') {
        this.carousel.nativeElement.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        this.carousel.nativeElement.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  }
}
