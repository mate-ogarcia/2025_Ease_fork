import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Achievement {
  title: string;
  emoji: string;
  progress: number;
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
      progress: 75
    },
    {
      title: 'Explorer',
      level: 'Junior',
      emoji: '🧭',
      progress: 45
    },
    {
      title: 'Innovator',
      level: 'Pro',
      emoji: '💡',
      progress: 90
    }
  ];

  constructor() { }

  ngOnInit(): void {
    // Vous pouvez mettre à jour la progression dynamiquement ici
  }
}
