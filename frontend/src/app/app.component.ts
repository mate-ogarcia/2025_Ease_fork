/**
 * @file app.component.ts
 * @brief Root component of the Ease-2025 application.
 * 
 * This component initializes the application and ensures that cached 
 * data is loaded at startup. It also sets up the router module for navigation.
 */

import { Component, OnInit, Renderer2 } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DataCacheService } from '../services/cache/data-cache.service';
import { AuthService } from '../services/auth/auth.service';
import { timer } from 'rxjs';

declare global {
  interface Window {
    domLoaded: boolean;
  }
}

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
  private readonly MIN_LOADING_TIME = 2000; // Temps minimum d'affichage du chargement en ms

  /**
   * @brief Constructor for AppComponent.
   * 
   * Initializes services required at the root level.
   * @param dataCacheService Service for preloading and caching data from the backend.
   * @param authService Service for managing authentication state.
   * @param renderer Renderer2 pour manipuler le DOM de manière sécurisée.
   */
  constructor(
    private dataCacheService: DataCacheService,
    private authService: AuthService,
    private renderer: Renderer2
  ) { }

  /**
   * @brief Lifecycle hook that runs when the component is initialized.
   * 
   * Ensures that essential data is preloaded and authentication state is initialized
   * before displaying the application content.
   */
  ngOnInit(): void {
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
   * @brief Complète l'initialisation en respectant un temps minimum d'affichage.
   * 
   * Cette méthode calcule le temps écoulé depuis le début de l'initialisation
   * et attend le temps restant si nécessaire avant de marquer l'application comme prête.
   * Elle gère également la transition entre l'écran de chargement et le contenu de l'application.
   * 
   * @param startTime Timestamp du début de l'initialisation
   */
  private completeInitialization(startTime: number): void {
    const elapsedTime = Date.now() - startTime;
    const remainingTime = Math.max(0, this.MIN_LOADING_TIME - elapsedTime);

    // Attendre le temps restant si nécessaire
    setTimeout(() => {
      // Étape 1: Rendre le composant app-root visible mais garder l'écran de chargement
      const appRoot = document.querySelector('app-root');
      if (appRoot) {
        this.renderer.addClass(appRoot, 'ready');
      }

      // Étape 2: Après un court délai, commencer à masquer l'écran de chargement
      setTimeout(() => {
        const initialLoading = document.getElementById('initial-loading');
        if (initialLoading) {
          this.renderer.setStyle(initialLoading, 'opacity', '0');

          // Étape 3: Une fois l'animation de fondu terminée, masquer complètement l'écran de chargement
          setTimeout(() => {
            this.renderer.setStyle(initialLoading, 'display', 'none');

            // Étape 4: Ajouter une classe 'loaded' au body pour les animations
            this.renderer.addClass(document.body, 'loaded');
          }, 800); // Durée de l'animation de fondu
        }
      }, 300); // Délai pour s'assurer que le contenu est prêt
    }, remainingTime);
  }
}

