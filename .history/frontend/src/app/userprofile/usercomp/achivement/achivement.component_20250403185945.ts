import { Component, OnInit } from '@angular/core';
import { Comm}

interface Achievement {
  title: string;
  level: string;
  emoji: string;
  progress: number;
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
