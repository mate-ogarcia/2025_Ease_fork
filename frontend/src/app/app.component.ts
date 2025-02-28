/**
 * @file app.component.ts
 * @brief Root component of the Ease-2025 application.
 * 
 * This component initializes the application and ensures that cached 
 * data is loaded at startup. It also sets up the router module for navigation.
 */

import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';  
import { DataCacheService } from '../services/cache/data-cache.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,   // Provides Angular common directives.
    RouterModule,   // Enables navigation between application routes.
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'Ease-2025';

  /**
   * @brief Constructor for AppComponent.
   * 
   * Initializes services required at the root level.
   * @param dataCacheService Service for preloading and caching data from the backend.
   */
  constructor(
    private dataCacheService: DataCacheService,
  ) {}

  /**
   * @brief Lifecycle hook that runs when the component is initialized.
   * 
   * Ensures that essential data (e.g., countries, categories, brands) is preloaded 
   * from the backend and cached to optimize performance.
   */
  ngOnInit(): void {
    this.dataCacheService.loadData(); // Loads and caches data at application startup.
  }
}
