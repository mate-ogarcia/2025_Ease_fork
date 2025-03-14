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
import { AuthService } from '../services/auth/auth.service';
import { BehaviorSubject, timer } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

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
  title = 'Ease';
  isAppReady = new BehaviorSubject<boolean>(false);
  isAppReadyStarted = false;
  private readonly MIN_LOADING_TIME = 500; // Temps minimum d'affichage du chargement en ms

  /**
   * @brief Constructor for AppComponent.
   * 
   * Initializes services required at the root level.
   * @param dataCacheService Service for preloading and caching data from the backend.
   * @param authService Service for managing authentication state.
   */
  constructor(
    private dataCacheService: DataCacheService,
    private authService: AuthService
  ) { }

  /**
   * @brief Lifecycle hook that runs when the component is initialized.
   * 
   * Ensures that essential data is preloaded and authentication state is initialized
   * before displaying the application content.
   */
  ngOnInit(): void {
    // Masquer l'écran de chargement initial
    this.hideInitialLoadingScreen();

    // Précharger les données essentielles
    this.dataCacheService.loadData();

    // Créer un timer pour assurer un temps minimum d'affichage du chargement
    const startTime = Date.now();

    // Initialiser l'état d'authentification avec un timeout pour éviter un blocage
    const authTimeout = setTimeout(() => {
      console.log('⚠️ Timeout lors de l\'initialisation de l\'état d\'authentification');
      this.completeInitialization(startTime);
    }, 3000); // 3 secondes maximum pour l'authentification

    this.authService.refreshAuthState().subscribe({
      next: () => {
        clearTimeout(authTimeout);
        console.log('✅ État d\'authentification initialisé');
        this.completeInitialization(startTime);
      },
      error: () => {
        clearTimeout(authTimeout);
        console.log('❌ Erreur lors de l\'initialisation de l\'état d\'authentification - Continuer sans redirection');
        // Continuer sans redirection, juste terminer l'écran de chargement
        this.completeInitialization(startTime);
      }
    });
  }

  /**
   * @brief Masque l'écran de chargement initial.
   * 
   * Cette méthode masque l'écran de chargement initial qui est défini dans index.html.
   */
  private hideInitialLoadingScreen(): void {
    const initialLoading = document.getElementById('initial-loading');
    if (initialLoading) {
      initialLoading.style.opacity = '0';
      initialLoading.style.transition = 'opacity 0.5s ease-in-out';
      setTimeout(() => {
        initialLoading.style.display = 'none';
      }, 500);
    }
  }

  /**
   * @brief Complète l'initialisation en respectant un temps minimum d'affichage.
   * 
   * Cette méthode calcule le temps écoulé depuis le début de l'initialisation
   * et attend le temps restant si nécessaire avant de marquer l'application comme prête.
   * 
   * @param startTime Timestamp du début de l'initialisation
   */
  private completeInitialization(startTime: number): void {
    const elapsedTime = Date.now() - startTime;
    const remainingTime = Math.max(0, this.MIN_LOADING_TIME - elapsedTime);

    // Déclencher l'animation de transition
    this.isAppReadyStarted = true;

    // Attendre le temps restant si nécessaire
    setTimeout(() => {
      this.isAppReady.next(true);
    }, remainingTime);
  }
}
