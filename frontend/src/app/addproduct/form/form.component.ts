import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})
export class FormComponent {
  // Modèle pour le formulaire
  product = {
    name: '',
    description: '',
    status: 'add-product',
    category: '',
    brand: '',
    barcode: '',
    tags: [] as string[], // tags devient un tableau de chaînes
    price: 0,
    discountType: 'none',
    origin: '',
    vatAmount: 0
  };

  // Listes pour les sélecteurs
  categories: string[] = ['Electronics', 'Books', 'Clothing', 'Home'];
  brands: string[] = ['Brand A', 'Brand B', 'Brand C'];
  origins: string[] = ['USA', 'China', 'France', 'Germany'];

  // Propriété pour la saisie d'un nouveau tag
  tagInput: string = '';

  // Ajoute un tag lors du pressage de la touche Enter
addTag(event: KeyboardEvent): void {
  if (event.key === 'Enter') {
    event.preventDefault(); // Empêche la soumission du formulaire par défaut
    const trimmedTag = this.tagInput.trim();
    if ( trimmedTag && !this.product.tags.includes(trimmedTag) && this.product.tags.length < 10) {
      this.product.tags.push(trimmedTag);
    }
    else{
      window.alert('Tag already exists or you have reached the maximum number of tags allowed');
    }
    this.tagInput = ''; // Réinitialise l'entrée
  }
}

  // Supprime un tag de la liste
  removeTag(tag: string): void {
    this.product.tags = this.product.tags.filter(t => t !== tag);
  }

  // Bouton "Save"
  onSave() {
    console.log('Saving product', this.product);
    // Logique pour envoyer les données au backend
  }

  // Bouton "Cancel"
  // Bouton "Cancel" : réinitialise tous les champs du formulaire
onCancel() {
  // Réinitialise l'objet product avec ses valeurs par défaut
  this.product = {
    name: '',
    description: '',
    status: 'add-product',
    category: '',
    brand: '',
    barcode: '',
    tags: [] as string[],
    price: 0,
    discountType: 'none',
    origin: '',
    vatAmount: 0
  };
  // Réinitialise également le champ de saisie de tag
  this.tagInput = '';
  console.log('Form reset');
}


  isDarkMode: boolean = false;
  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
  }
}
