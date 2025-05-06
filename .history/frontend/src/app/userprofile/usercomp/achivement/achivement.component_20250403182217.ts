import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-achivement',
  impo
  templateUrl: './achivement.component.html',
  styleUrls: ['./achivement.component.css']
})
export class AchivementComponent implements OnInit {

  // Tableau d'achievements
  achievements = [
    {
      title: 'Découvreur Européen',
      subtitle: 'Explorant des solutions',
      icon: 'assets/icons/decouvreur.png', // adapte le chemin si besoin
      color: '#f5a623'
    },
    {
      title: 'Curateur Expert',
      subtitle: 'Alternatives subtiles',
      icon: 'assets/icons/curateur.png',
      color: '#f8e71c'
    },
    {
      title: 'Connecteur Européen',
      subtitle: 'Réseaux multiples',
      icon: 'assets/icons/connecteur.png',
      color: '#50e3c2'
    }
  ];

  // Valeurs pour la barre de progression
  minValue = 0;
  maxValue = 100;
  currentValue = 45; // valeur initiale (modifiable dynamiquement)

  constructor() { }

  ngOnInit(): void {
    // Exemple : mise à jour de la valeur actuelle après 2 secondes pour simuler une progression
    setTimeout(() => {
      this.currentValue = 75;
    }, 2000);
  }

  // Calcul de la largeur de la barre en pourcentage
  get progressBarWidth(): number {
    const range = this.maxValue - this.minValue;
    const normalizedValue = this.currentValue - this.minValue;
    const percentage = (normalizedValue / range) * 100;
    return Math.min(Math.max(percentage, 0), 100);
  }
}
