import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Achievement {
  title: string;
  level: string;
  icon: string;
  progress: number;
}

@Component({
  selector: 'app-achivement',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './achivement.component.html',
  styleUrls: ['./achivement.component.css']
})
export class AchivementComponent implements OnInit {

  achievements: Achievement[] = [
    {
      title: 'Media Star',
      level: 'Senior',
      icon: 'assets/icons/media-star.png', // Vérifie que ce fichier existe
      progress: 75
    },
    {
      title: 'Explorer',
      level: 'Junior',
      icon: 'assets/icons/explorer.png',
      progress: 45
    },
    {
      title: 'Innovator',
      level: 'Pro',
      icon: 'assets/icons/innovator.png',
      progress: 90
    }
  ];

  constructor() { }

  ngOnInit(): void {
    // Tu peux mettre à jour dynamiquement la progression ici si besoin
  }
}
