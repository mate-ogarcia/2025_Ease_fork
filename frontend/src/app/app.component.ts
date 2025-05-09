/**
 * @file app.component.ts
 * @brief Root component of the Ease-2025 application.
 * 
 * This component initializes the application and ensures that cached 
 * data is loaded at startup. It also sets up the router module for navigation.
 */

import { Component, OnInit, Renderer2 } from '@angular/core';
import { RouterModule, RouterOutlet, Router, NavigationEnd, NavigationStart } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DataCacheService } from '../services/cache/data-cache.service';
import { AuthService } from '../services/auth/auth.service';
import { timer, of, from, throwError } from 'rxjs';
import { retry, delay, catchError, mergeMap, filter } from 'rxjs/operators';
import { SettingsButtonComponent } from './shared/components/settings-button/settings-button.component';
import { CookieService } from 'ngx-cookie-service';

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
    SettingsButtonComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'Ease';
  private readonly MIN_LOADING_TIME = 2000; // Temps minimum d'affichage du chargement en ms
  isHomePage: boolean = false;

  /**
   * @brief Constructor for AppComponent.
   * 
   * Initializes services required at the root level.
   * @param dataCacheService Service for preloading and caching data from the backend.
   * @param authService Service for managing authentication state.
   * @param renderer Renderer2 pour manipuler le DOM de manière sécurisée.
   * @param router Router for navigation and route management.
   * @param cookieService Service for managing cookies.
   */
  constructor(
    private dataCacheService: DataCacheService,
    private authService: AuthService,
    private renderer: Renderer2,
    private router: Router,
    private cookieService: CookieService
  ) { }

  /**
   * @brief Lifecycle hook that runs when the component is initialized.
   * 
   * Ensures that essential data is preloaded and authentication state is initialized
   * before displaying the application content.
   */
  ngOnInit(): void {

    // Vérifier l'état des cookies au démarrage
    const cookies = this.cookieService.getAll();
    console.log('🍪 [AppComponent] Cookies au démarrage:', cookies);

    // Précharger les données essentielles
    this.dataCacheService.loadData();

    // Créer un timer pour assurer un temps minimum d'affichage du chargement
    const startTime = Date.now();

    // Initialiser l'état d'authentification avec un timeout pour éviter un blocage
    const authTimeout = setTimeout(() => {
      this.completeInitialization(startTime);
    }, 5000); // Augmenter le timeout à 5 secondes pour laisser le temps aux tentatives

    // Vérification immédiate de l'état d'authentification
    this.authService.checkAuthState();

    // Essayer de récupérer l'état d'authentification avec plusieurs tentatives en cas d'échec
    this.authService.refreshAuthState()
      .pipe(
        // Réessayer jusqu'à 3 fois avec un délai exponentiel entre les tentatives
        catchError(error => {
          if (error.status === 0 || error.status === 502 || error.status === 503 || error.status === 504) {
            // Le serveur est peut-être en train de redémarrer, essayer à nouveau
            return throwError(() => error);
          }
          // Pour les autres erreurs (comme 401), ne pas réessayer
          return throwError(() => error);
        }),
        retry({
          count: 3,
          delay: (error, retryCount) => {
            // Délai exponentiel: 1s, 2s, 4s
            const delayTime = Math.pow(2, retryCount - 1) * 1000;
            return timer(delayTime);
          }
        })
      )
      .subscribe({
        next: () => {
          clearTimeout(authTimeout);
          this.completeInitialization(startTime);
        },
        error: (err) => {
          clearTimeout(authTimeout);
          // Continuer sans redirection, juste terminer l'écran de chargement
          this.completeInitialization(startTime);
        }
      });

    // Vérification initiale si nous sommes sur la page d'accueil
    this.checkIfHomePage();

    // Surveille les changements de route
    this.router.events.pipe(
      filter(event => event instanceof NavigationStart)
    ).subscribe((event: NavigationStart) => {
      // Vérifier l'état d'authentification à chaque navigation
      this.authService.checkAuthState();
    });

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.checkIfHomePage();
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

  /**
   * @brief Vérifie si la route actuelle est la page d'accueil
   */
  private checkIfHomePage(): void {
    const currentUrl = this.router.url;
    this.isHomePage = currentUrl === '/' || currentUrl === '/home';
  }
}

