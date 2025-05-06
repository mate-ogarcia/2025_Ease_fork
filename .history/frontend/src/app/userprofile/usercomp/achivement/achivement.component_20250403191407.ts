import { Component, OnInit } from '@angular/core';
import 
interface Achievement {
  title: string;
  emoji: string;
  progress: number;
  cardBg: string;  // Couleur de fond pour la carte
  emojiBg: string; // Couleur de fond pour le conteneur de l'emoji
}

@Component({
  selector: 'app-achivement',
  templateUrl: './achivement.component.html',
  styleUrls: ['./achivement.component.css']
})
export class AchivementComponent implements OnInit {

  achievements: Achievement[] = [
    {
      title: 'Media Star',
      emoji: '🌟',
      progress: 75,
      cardBg: '#e8f5e9',  // Fond vert clair
      emojiBg: '#c8e6c9'  // Vert encore plus doux pour l'emoji
    },
    {
      title: 'Explorer',
      emoji: '🧭',
      progress: 45,
      cardBg: '#e3f2fd',  // Fond bleu clair
      emojiBg: '#bbdefb'  // Bleu doux
    },
    {
      title: 'Innovator',
      emoji: '💡',
      progress: 90,
      cardBg: '#fff3e0',  // Fond orange clair
      emojiBg: '#ffe0b2'  // Orange pâle
    }
  ];

  constructor() { }

  ngOnInit(): void {
    // Vous pouvez mettre à jour dynamiquement la progression ici
  }
}
