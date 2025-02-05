import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-data-display',
  imports: [FormsModule],
  standalone: true,         // Composant autonome
  templateUrl: './data-display.component.html',
  styleUrls: ['./data-display.component.css'],
})
export class DataDisplayComponent {
  data: any[] = [];               // Tableau des données
  newItem = { id: '', name: '' }; // Modèle pour le formulaire

  constructor(private apiService: ApiService) {}

  /**
   * @brief Récupère les données depuis le backend et les affiche dans la console.
   * 
   * Cette méthode est exécutée au chargement du composant (`ngOnInit`) et effectue 
   * une requête GET au backend via `ApiService.getData()`. Elle met à jour la liste 
   * `data` avec les données reçues.
   * 
   * @returns {void} Ne retourne rien, mais met à jour `this.data` avec les données du backend.
   */
  ngOnInit() {
    this.apiService.getData().subscribe({
      next: (response) => {     // next: → Récupère les données correctement
        console.log('✅ Données récupérées depuis le backend :', response);
        this.data = response;
      },
      error: (error) => {       // error: → Capture les erreurs proprement
        console.error('❌ Erreur lors de la récupération des données :', error);
      },
      complete: () => {         // complete: → Exécute une action quand la requête est terminée (facultatif)
        console.log('✅ Requête terminée avec succès.');
      },
    });
    
  }

  /**
   * @brief Envoie des données au backend via une requête HTTP POST.
   * 
   * Cette méthode utilise `ApiService.sendData()` pour envoyer `newItem` au backend.
   * Une fois les données envoyées avec succès, elles sont ajoutées à `this.data` et 
   * le formulaire est réinitialisé.
   * 
   * @returns {void} Ne retourne rien, mais met à jour `this.data` avec la nouvelle entrée.
   */
  sendData() {
    this.apiService.sendData(this.newItem).subscribe({
      next: (response) => {
        console.log('✅ Données envoyées avec succès :', response);
        this.data.push(this.newItem); 
        this.newItem = { id: '', name: '' };
      },
      error: (error) => {
        console.error('❌ Erreur lors de l’envoi des données :', error);
      },
    });
  }
}
