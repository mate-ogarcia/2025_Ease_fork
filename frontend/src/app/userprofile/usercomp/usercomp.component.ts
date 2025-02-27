import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { HistoryComponent } from './history/history.component';

@Component({
  selector: 'app-usercomp',
  imports: [CommonModule, HistoryComponent],
  templateUrl: './usercomp.component.html',
  styleUrl: './usercomp.component.css'
})
export class UsercompComponent {
  activeTab: string = 'Work'; // ✅ Par défaut, l'onglet "Work" est actif

  // Méthode pour changer d'onglet
  changeTab(tabName: string) {
    this.activeTab = tabName;
  }

  // Simuler l'upload d'un fichier
  uploadFile(event: any) {
    const file = event.target.files[0];
    if (file) {
      alert(`Fichier "${file.name}" téléchargé avec succès !`);
    }
  }
}
