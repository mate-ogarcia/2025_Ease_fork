import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms'; // Pour [(ngModel)]
import { CommonModule } from '@angular/common'; // Pour *ngFor et *ngIf

@Component({
  selector: 'app-searchbar',
  imports: [FormsModule,CommonModule],
  templateUrl: './searchbar.component.html',
  styleUrl: './searchbar.component.css',
  standalone: true, // Déclare le composant comme standalone
})
export class SearchbarComponent {
  searchQuery: string = '';
  results: string[] = ['Apple', 'Banane', 'Cerise', 'Datte', 'Fraise', 'Mangue', 'Orange', 'Pomme', 'Raisin', 'Tomate','Franboise','Cassis','Myrtille','Mure','Groseille','Cranberry','Clementine','Kaki','Kiwi','Pamplemousse','Citron','Mandarine','Nectarine','Pêche','Abricot','Prune','Mirabelle','Quetsche','Poire','Coing','Figue','Rhubarbe','Ananas','Litchi','Grenade','Fruit de la passion','Papaye','Goyave','Mangoustan','Durian','Fruit de l\'arbre à pain'];
  filteredResults: string[] = [];

  onSearch() {
    if (this.searchQuery.trim() === '') {
      this.filteredResults = []; // Cache la liste si l'entrée est vide
      return;
    }

    this.filteredResults = this.results.filter(item =>
      item.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  clearSearch() {
    this.searchQuery = ''; // Efface la recherche
    this.filteredResults = []; // Cache la liste
  }

  selectProduct(product: string) {
    this.searchQuery = product; // Remplit la barre avec le produit sélectionné
    this.filteredResults = []; // Cache la liste
  }
}
