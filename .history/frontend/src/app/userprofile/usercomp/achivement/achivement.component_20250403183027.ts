import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-achivement',
  templateUrl: './achivement.component.html',
  styleUrls: ['./achivement.component.css']
})
export class AchivementComponent implements OnInit {

  // Exemple de valeur de progression
  progressPercentage = 50;

  // Exemple de titre, sous-titre ou autres informations
  achievementTitle = 'Media Star';
  achievementLevel = 'Senior';

  constructor() {}

  ngOnInit(): void {
    // Ex. mettre à jour la progression après 2s
    setTimeout(() => {
      this.progressPercentage = 75;
    }, 2000);
  }
}
