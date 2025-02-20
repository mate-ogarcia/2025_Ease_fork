import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-display-results',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './display-results.component.html',
  styleUrl: './display-results.component.css',
})
export class DisplayResultsComponent implements OnInit {
  resultsArray: any[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.resultsArray = history.state.resultsArray || [];
    console.log('🔹 Results received: (display-results.ts)', this.resultsArray);
  }
  
}
