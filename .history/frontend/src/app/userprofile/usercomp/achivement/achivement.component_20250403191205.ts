import { Component, OnInit } from '@angular/core';

interface Achievement {
  title: string;
  level: string;
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
      level: 'Senior',
      emoji: '🌟',
      progress: 75,
      cardBg: '#e8f5e9',  // Fond vert clair
      emojiBg: '#c8e6c9'  // Vert encore plus doux pour l'emoji
    },
    {
      title: 'Explorer',
      level: 'Junior',
      emoji: '🧭',
      progress: 45,
      cardBg: '#e3f2fd',  // Fond bleu clair
      emojiBg: '#bbdefb'  // Bleu doux
    },
    {
      title: 'Innovator',
      level: 'Pro',
      emoji: '💡',
      progress: 90,
      cardBg: '#fff3e0',  // Fond orange clair
      emojiBg: '#ffe0b2'  // Orange pâle
    }
  ];

  constructor() { }

  ngOnInit(): void {
    // Tu peux mettre à jour dynamiquement la progression ici si besoin
  }
}
