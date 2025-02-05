import { Component, ElementRef, AfterViewInit, OnDestroy, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms'; // Pour [(ngModel)]
import { CommonModule } from '@angular/common'; // Pour *ngFor et *ngIf
import * as VANTA from 'vanta/src/vanta.birds'; 
import * as THREE from 'three';
import { NavbarComponent } from '../navbar/navbar.component';
@Component({
  selector: 'app-searchbar',
  imports: [FormsModule, CommonModule, NavbarComponent],
  templateUrl: './searchbar.component.html',
  styleUrl: './searchbar.component.css',
  standalone: true, // Déclare le composant comme standalone
})
export class SearchbarComponent implements AfterViewInit, OnDestroy {
  searchQuery: string = '';
  results: string[] = ['Apple', 'Banane', 'Cerise', 'Datte', 'Fraise', 'Mangue', 'Orange', 'Pomme', 'Raisin', 'Tomate',
    'Franboise', 'Cassis', 'Myrtille', 'Mûre', 'Groseille', 'Cranberry', 'Clémentine', 'Kaki', 'Kiwi', 'Pamplemousse',
    'Citron', 'Mandarine', 'Nectarine', 'Pêche', 'Abricot', 'Prune', 'Mirabelle', 'Quetsche', 'Poire', 'Coing', 'Figue',
    'Rhubarbe', 'Ananas', 'Litchi', 'Grenade', 'Fruit de la passion', 'Papaye', 'Goyave', 'Mangoustan', 'Durian', 'Fruit de l\'arbre à pain'];
  filteredResults: string[] = [];

  private vantaEffect: any;

  @ViewChild('vantaBackground', { static: true }) vantaRef!: ElementRef;

  ngAfterViewInit(): void {
    this.vantaEffect = (VANTA as any).default({
      el: '.container',
      THREE: THREE, // Assurez-vous que Three.js est bien passé
      backgroundColor: 0x14386a,
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
