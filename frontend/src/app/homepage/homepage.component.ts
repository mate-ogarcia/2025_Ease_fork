// homepage.component.ts
import { Component, AfterViewInit, OnDestroy, ElementRef, ViewChild, OnInit } from '@angular/core';
import * as VANTA from 'vanta/src/vanta.birds';
import * as THREE from 'three';
// Component
import { NavbarComponent } from '../shared/components/navbar/navbar.component';
import { SearchbarComponent } from '../shared/components/searchbar/searchbar.component';
import { CommonModule } from '@angular/common';
import { InfoComponent } from "./info/info.component";
import { SettingsButtonComponent } from '../shared/components/settings-button/settings-button.component';

/**
 * @class HomepageComponent
 * @brief Handles the home page UI, Vanta.js background animation, dark mode, and user settings.
 *
 * @details
 * Features:
 * - Animated birds background via Vanta.js.
 * - Dark mode toggle with class manipulation.
 * - Settings panel for user preferences.
 * - Retrieves and logs the user role from cookies.
 * - Persistent animation state using localStorage.
 */
@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [NavbarComponent, SearchbarComponent, SettingsButtonComponent, CommonModule, InfoComponent],
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.css'
})
export class HomepageComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild('vantaBackground') vantaBackground!: ElementRef;
  isVantaActive: boolean = true;
  isDarkMode: boolean = false;
  isSettingsOpen: boolean = false;
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

    // REMARQUE : Nous avons retiré la partie qui forçait le conteneur à occuper tout le fond de la fenêtre.
    // Les dimensions sont désormais gérées via le CSS.
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
      // Utilisation de valeurs fixes pour minHeight et minWidth (en accord avec le CSS)

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
   * @brief Toggles the Vanta.js animation effect
   * 
   * @details
   * Enables or disables the background animation and saves the state to localStorage
   */
  toggleVantaEffect(): void {
    this.isVantaActive = !this.isVantaActive;

    if (this.isVantaActive) {
      this.initVantaEffect();
    } else if (this.vantaEffect) {
      this.vantaEffect.destroy();
      this.vantaEffect = null;
    }

    // Sauvegarder l'état de l'animation dans le localStorage
    localStorage.setItem('vantaActive', this.isVantaActive.toString());
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
