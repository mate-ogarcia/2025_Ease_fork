import { Component, OnInit } from '@angular/core';

interface Achievement {
  title: string;
  level: string;
  icon: string;
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
      icon: 'assets/icons/media-star.png', // adapte le chemin si besoin
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
    // Vous pouvez par exemple mettre à jour la progression de chacun dynamiquement ici
  }
}
