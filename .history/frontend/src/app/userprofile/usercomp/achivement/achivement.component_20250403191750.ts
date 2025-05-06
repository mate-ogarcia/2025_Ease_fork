import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
interface Achievement {
  title: string;
  emoji: string;
  progress: number;
  cardBg: string;  // Couleur de fond pour la carte
  emojiBg: string; // Couleur de fond pour le conteneur de l'emoji
}

@Component({
  selector: 'app-achivement',
  imports: [CommonModule],
  templateUrl: './achivement.component.html',
  styleUrls: ['./achivement.component.css']
})
export class AchivementComponent implements OnInit {

  achievements: Achievement[] = [
    {
      title: 'Media Star',
      emoji: '🌟',
      progress: 75,
      cardBg: '#e8f5e9',  // Vert clair
      emojiBg: '#c8e6c9'
    },
    {
      title: 'Explorer',
      emoji: '🧭',
      progress: 45,
      cardBg: '#e3f2fd',  // Bleu clair
      emojiBg: '#bbdefb'
    },
    {
      title: 'Innovator',
      emoji: '💡',
      progress: 90,
      cardBg: '#fff3e0',  // Orange clair
      emojiBg: '#ffe0b2'
    },
    {
      title: 'Master',
      emoji: '🏆',
      progress: 60,
      cardBg: '#fce4ec',  // Rose pâle
      emojiBg: '#f8bbd0'
    },
    {
      title: 'Pioneer',
      emoji: '🚀',
      progress: 80,
      cardBg: '#f3e5f5',  // Violet clair
      emojiBg: '#e1bee7'
    },
    {
      title: 'Champion',
      emoji: '🥇',
      progress: 95,
      cardBg: '#fff9c4',  // Jaune clair
      emojiBg: '#fff59d'
    }
  ];

  constructor() { }

  ngOnInit(): void {
    // Vous pouvez mettre à jour dynamiquement la progression ici
  }
}
