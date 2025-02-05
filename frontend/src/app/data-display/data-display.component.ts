import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service'; // Assurez-vous que le chemin est correct

@Component({
  selector: 'app-data-display',
  standalone: true,         // Composant autonome
  templateUrl: './data-display.component.html',
  styleUrls: ['./data-display.component.css'],
})
export class DataDisplayComponent {
  data: any[] = []; // Tableau des données

  constructor(private apiService: ApiService) {}

  /**
   * Récupère les données envoyées du backend et les affiche dans la console
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
}
