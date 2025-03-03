import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-requests',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-requests.component.html',
  styleUrls: ['./product-requests.component.css']
})
export class ProductRequestsComponent {
  // Liste des demandes de produits (exemple en dur)
  // Les tags sont stockés sous forme de tableau de chaînes
  requests = [
    {
      id: 1,
      productName: 'Chaise Ergonomique',
      category: 'Mobilier',
      brand: 'ConfortPlus',
      quantity: 15,
      status: 'En attente',
      description: 'Chaise ergonomique pour bureau avec support lombaire.',
      tags: ['bureau', 'ergonomique', 'confort'],
      ecoScore: 85,
      isEditing: false
    },
    {
      id: 2,
      productName: 'Lampe LED',
      category: 'Éclairage',
      brand: 'EcoLight',
      quantity: 50,
      status: 'Validé',
      description: 'Lampe LED basse consommation, idéale pour les bureaux.',
      tags: ['éclairage', 'LED', 'éco'],
      ecoScore: 90,
      isEditing: false
    },
    {
      id: 3,
      productName: 'Ordinateur Portable',
      category: 'Informatique',
      brand: 'TechPro',
      quantity: 20,
      status: 'Refusé',
      description: 'Ordinateur portable pour usage professionnel avec processeur i7.',
      tags: ['informatique', 'portable', 'high-tech'],
      ecoScore: 70,
      isEditing: false
    }
  ];

  // La demande actuellement sélectionnée
  selectedRequest: any = null;

  // Propriété pour la saisie d'un nouveau tag dans la demande sélectionnée
  tagInput: string = '';

  // Sélectionne une demande et l'affiche dans la zone de détails
  selectRequest(request: any): void {
    this.selectedRequest = request;
  }

  // Active le mode édition pour la demande sélectionnée
  editRequest(): void {
    if (this.selectedRequest) {
      this.selectedRequest.isEditing = true;
    }
  }

  // Sauvegarde les modifications et désactive le mode édition
  saveRequest(): void {
    if (this.selectedRequest) {
      this.selectedRequest.isEditing = false;
      // Vous pouvez ajouter ici la logique d'envoi au backend
    }
  }

  // Annule l'édition de la demande
  cancelEdit(): void {
    if (this.selectedRequest) {
      this.selectedRequest.isEditing = false;
      // Optionnel : réinitialiser les valeurs modifiées
    }
  }

  // Ajoute un tag lors du pressage de la touche Enter
  addTag(event: KeyboardEvent): void {
    if (event.key === 'Enter' && this.selectedRequest) {
      event.preventDefault();
      const trimmedTag = this.tagInput.trim();
      if (
        trimmedTag &&
        !this.selectedRequest.tags.includes(trimmedTag) &&
        this.selectedRequest.tags.length < 10
      ) {
        this.selectedRequest.tags.push(trimmedTag);
      } else {
        window.alert('Tag already exists or maximum number of tags reached');
      }
      this.tagInput = '';
    }
  }

  // Supprime un tag de la demande sélectionnée
  removeTag(tag: string): void {
    if (this.selectedRequest) {
      this.selectedRequest.tags = this.selectedRequest.tags.filter((t: string) => t !== tag);
    }
  }
}
