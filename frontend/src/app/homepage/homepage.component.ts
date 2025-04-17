import { Component, AfterViewInit, OnDestroy, ElementRef, ViewChild, OnInit } from '@angular/core';
import * as VANTA from 'vanta/src/vanta.birds';
import * as THREE from 'three';
// Component
import { NavbarComponent } from '../shared/components/navbar/navbar.component';
import { SearchbarComponent } from '../shared/components/searchbar/searchbar.component';
import { SettingsButtonComponent } from '../shared/components/settings-button/settings-button.component';
import { CommonModule } from '@angular/common';

/**
 * @class HomepageComponent
 * @brief Handles the home page UI, Vanta.js background animation, dark mode, and user settings.
 *
 * @details
 * Features:
 * - Animated birds background via Vanta.js.
 * - Dark mode toggle with class manipulation.
 * - Settings panel for user preferences.
 * - Project information modal with responsive design.
 * - Retrieves and logs the user role from cookies.
 * - Persistent animation state using localStorage.
 */
@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [NavbarComponent, SearchbarComponent, SettingsButtonComponent, CommonModule],
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.css'
})
export class HomepageComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild('vantaBackground') vantaBackground!: ElementRef;
  isVantaActive: boolean = true;
  isDarkMode: boolean = false;
  isSettingsOpen: boolean = false;
  isProjectInfoOpen: boolean = false;
  private vantaEffect: any;
  private vantaContainer: HTMLElement | null = null;

  constructor() {
    // Récupérer l'état sauvegardé de l'animation depuis le localStorage
    const savedVantaState = localStorage.getItem('vantaActive');
    if (savedVantaState !== null) {
      this.isVantaActive = savedVantaState === 'true';
    }

    // Récupérer l'état du mode sombre (optionnel)
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) {
      this.isDarkMode = savedDarkMode === 'true';
      document.body.classList.toggle('dark-mode', this.isDarkMode);
    }
  }

  ngOnInit(): void {
    // Ajouter un écouteur d'événement pour les changements d'état de l'animation
    document.addEventListener('vantaToggle', this.handleVantaToggle.bind(this));
  }

  ngAfterViewInit(): void {
    // Initialiser l'effet Vanta immédiatement sans délai
    this.vantaContainer = this.vantaBackground.nativeElement;

    if (this.isVantaActive && this.vantaContainer) {
      this.initVantaEffect();
    }
  }

  /**
   * @brief Handles the vantaToggle event from the settings button
   * @param event Custom event with detail.isActive indicating the new state
   */
  private handleVantaToggle(event: any): void {
    const isActive = event.detail?.isActive;

    if (isActive !== undefined) {
      this.isVantaActive = isActive;

      if (this.isVantaActive) {
        this.initVantaEffect();
      } else if (this.vantaEffect) {
        this.vantaEffect.destroy();
        this.vantaEffect = null;
      }
    }
  }

  /**
   * @brief Initializes the Vanta.js birds effect.
   * 
   * @details
   * Configures various visual parameters such as background color, speed, and bird properties.
   */
  private initVantaEffect(): void {
    // Destroy existing effect if there is one
    if (this.vantaEffect) {
      this.vantaEffect.destroy();
    }

    // Ensure the container has the right dimensions
    if (this.vantaContainer) {
      // Force the container to take the full height and width of the window
      this.vantaContainer.style.width = '100%';
      this.vantaContainer.style.height = '100vh';
      this.vantaContainer.style.position = 'fixed';
      this.vantaContainer.style.top = '0';
      this.vantaContainer.style.left = '0';
      this.vantaContainer.style.zIndex = '0';
    }

    this.vantaEffect = (VANTA as any).default({
      el: this.vantaContainer,
      THREE: THREE,
      backgroundColor: 0x023436,
      color1: 0xff0000,
      color2: 0xd1ff,
      birdSize: 1.20,
      wingSpan: 27.00,
      speedLimit: 2.00,
      separation: 62.00,
      cohesion: 79.00,
      quantity: 4.00,
      mouseControls: true,
      touchControls: true,
      gyroControls: false,
      minHeight: window.innerHeight,
      minWidth: window.innerWidth,
      scale: 1.00
    });

    // Add a resize handler to ensure the animation adapts
    window.addEventListener('resize', this.handleResize.bind(this));
  }

  /**
   * @brief Handles window resize events to update the Vanta effect dimensions.
   */
  private handleResize(): void {
    if (this.vantaEffect) {
      this.vantaEffect.resize();
    }
  }

  /**
   * @brief Toggles the dark mode theme and saves the state to localStorage.
   * 
   * @details
   * Adds or removes the `dark-mode` class from the document body to switch themes.
   * Persists the state in browser's localStorage.
   */
  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('dark-mode', this.isDarkMode);

    // Sauvegarder l'état du mode sombre dans le localStorage
    localStorage.setItem('darkMode', this.isDarkMode.toString());
  }

  /**
   * @brief Toggles the visibility of the settings panel.
   * 
   * @details
   * Updates the `isSettingsOpen` flag to show or hide user settings.
   */
  toggleSettingsPanel(): void {
    this.isSettingsOpen = !this.isSettingsOpen;
  }

  /**
   * @brief Toggles the visibility of the project information panel.
   * 
   * @details
   * Updates the `isProjectInfoOpen` flag to show or hide the project information.
   * Prevents scrolling of the background when the panel is open.
   * Adds smooth animations for card appearance.
   */
  toggleProjectInfo(): void {
    this.isProjectInfoOpen = !this.isProjectInfoOpen;

    // If the panel is open, add a class to the body to prevent scrolling
    if (this.isProjectInfoOpen) {
      // Don't block scrolling of the main page
      // document.body.style.overflow = 'hidden';

      // Enhanced animation for cards with progressive delay
      setTimeout(() => {
        const cards = document.querySelectorAll('.info-card');
        const intro = document.querySelector('.info-intro');
        const footer = document.querySelector('.info-footer');

        // Intro animation
        if (intro) {
          const introElement = intro as HTMLElement;
          introElement.style.opacity = '0';
          introElement.style.transform = 'translateY(-20px)';
          setTimeout(() => {
            introElement.style.transition = 'all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            introElement.style.opacity = '1';
            introElement.style.transform = 'translateY(0)';
          }, 200);
        }

        // Card animation with cascade effect
        cards.forEach((card, index) => {
          const cardElement = card as HTMLElement;
          cardElement.style.opacity = '0';
          cardElement.style.transform = 'translateY(40px)';
          setTimeout(() => {
            cardElement.style.transition = 'all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            cardElement.style.opacity = '1';
            cardElement.style.transform = 'translateY(0)';
          }, 300 + (index * 150));
        });

        // Footer animation
        if (footer) {
          const footerElement = footer as HTMLElement;
          footerElement.style.opacity = '0';
          footerElement.style.transform = 'translateY(20px)';
          setTimeout(() => {
            footerElement.style.transition = 'all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            footerElement.style.opacity = '1';
            footerElement.style.transform = 'translateY(0)';
          }, 300 + (cards.length * 150) + 100);
        }
      }, 100);
    } else {
      // If the panel is closed, restore scrolling
      // document.body.style.overflow = 'auto';
    }
  }

  /**
   * @brief Closes the project information panel and starts the application.
   * 
   * @details
   * Closes the information panel and can trigger additional actions
   * like scrolling to the search section.
   * Ajoute une animation de fermeture fluide.
   */
  startExploring(): void {
    // Animation de fermeture
    const panel = document.querySelector('.info-panel');
    if (panel) {
      const panelElement = panel as HTMLElement;
      panelElement.style.transition = 'all 0.4s cubic-bezier(0.6, -0.28, 0.735, 0.045)';

      // Sur mobile, faire glisser vers le bas
      if (window.innerWidth <= 480) {
        panelElement.style.transform = 'translateY(100%)';
      } else {
        panelElement.style.opacity = '0';
        panelElement.style.transform = 'translate(-50%, -50%) scale(0.9)';
      }

      // Mettre à jour l'état et restaurer le défilement après la fin de l'animation
      setTimeout(() => {
        this.isProjectInfoOpen = false;

        // S'assurer que le défilement est toujours activé
        document.body.style.overflow = '';

        // Réinitialiser les styles pour permettre une réouverture correcte
        panelElement.style.transition = '';
        if (window.innerWidth <= 480) {
          // Ne pas réinitialiser immédiatement pour éviter un flash visuel
          setTimeout(() => {
            panelElement.style.transform = '';
          }, 50);
        } else {
          panelElement.style.opacity = '';
          panelElement.style.transform = '';
        }

        // Optionnel : faire défiler jusqu'à la section de recherche
        const searchSection = document.querySelector('.search-container');
        if (searchSection) {
          searchSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 400);
    } else {
      this.isProjectInfoOpen = false;

      // S'assurer que le défilement est toujours activé
      document.body.style.overflow = '';
    }
  }

  /**
   * @brief Lifecycle hook called before the component is destroyed.
   * 
   * @details
   * Destroys the Vanta.js animation effect to prevent memory leaks.
   * Removes event listeners.
   */
  ngOnDestroy(): void {
    if (this.vantaEffect) {
      this.vantaEffect.destroy();
    }

    // Supprimer les écouteurs d'événements
    window.removeEventListener('resize', this.handleResize.bind(this));
    document.removeEventListener('vantaToggle', this.handleVantaToggle.bind(this));

    // Restaurer le défilement du body si nécessaire
    document.body.style.overflow = '';
  }
}
