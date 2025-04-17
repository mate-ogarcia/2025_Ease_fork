// homepage.component.ts
import { Component, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import * as VANTA from 'vanta/src/vanta.birds';
import * as THREE from 'three';
// Component
import { NavbarComponent } from '../shared/components/navbar/navbar.component';
import { SearchbarComponent } from '../shared/components/searchbar/searchbar.component';
import { CommonModule } from '@angular/common';
import { InfoComponent } from "./info/info.component";

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
 */
@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [NavbarComponent, SearchbarComponent, CommonModule, InfoComponent],
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.css'
})
export class HomepageComponent implements AfterViewInit, OnDestroy {
  @ViewChild('vantaBackground') vantaBackground!: ElementRef;
  isVantaActive: boolean = true;
  isDarkMode: boolean = false;
  isSettingsOpen: boolean = false;
  private vantaEffect: any;
  private vantaContainer: HTMLElement | null = null;

  ngAfterViewInit(): void {
    // Wait for the DOM to be completely loaded and rendered
    setTimeout(() => {
      // Access the element via the ViewChild reference
      this.vantaContainer = this.vantaBackground.nativeElement;

      if (this.isVantaActive && this.vantaContainer) {
        this.initVantaEffect();
      }
    }, 100); // A short delay to ensure the DOM is fully rendered
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
   * @brief Toggles the Vanta.js effect on or off.
   * 
   * @details
   * - If active, destroys the effect.
   * - If inactive, reinitializes the animation.
   */
  toggleVantaEffect(): void {
    this.isVantaActive = !this.isVantaActive;

    if (this.isVantaActive) {
      this.initVantaEffect();
    } else if (this.vantaEffect) {
      this.vantaEffect.destroy();
      this.vantaEffect = null;
    }
  }

  /**
   * @brief Toggles the dark mode theme.
   * 
   * @details
   * Adds or removes the `dark-mode` class from the document body to switch themes.
   */
  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('dark-mode', this.isDarkMode);
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
   * @brief Lifecycle hook called before the component is destroyed.
   * 
   * @details
   * Destroys the Vanta.js animation effect to prevent memory leaks.
   */
  ngOnDestroy(): void {
    if (this.vantaEffect) {
      this.vantaEffect.destroy();
    }

    // Supprimer le gestionnaire d'événements de redimensionnement
    window.removeEventListener('resize', this.handleResize.bind(this));

    // Restaurer le défilement du body si nécessaire
    document.body.style.overflow = '';
  }
}
