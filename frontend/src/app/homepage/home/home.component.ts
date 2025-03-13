import { Component, AfterViewInit, OnDestroy, ElementRef } from '@angular/core';
import * as VANTA from 'vanta/src/vanta.birds';
import * as THREE from 'three';
// Component
import { SearchbarComponent } from './comp/searchbar/searchbar.component';
import { NavbarComponent } from './comp/navbar/navbar.component';
import { CommonModule } from '@angular/common';

/**
 * @class HomeComponent
 * @brief Handles the home page UI, Vanta.js background animation, dark mode, and user settings.
 *
 * @details
 * Features:
 * - Animated birds background via Vanta.js.
 * - Dark mode toggle with class manipulation.
 * - Settings panel for user preferences.
 * - Project information modal with responsive design.
 * - Retrieves and logs the user role from cookies.
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [SearchbarComponent, NavbarComponent, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements AfterViewInit, OnDestroy {
  isVantaActive: boolean = true;
  isDarkMode: boolean = false;
  isSettingsOpen: boolean = false;
  isProjectInfoOpen: boolean = false;
  private vantaEffect: any;
  private vantaContainer: HTMLElement | null = null;

  ngAfterViewInit(): void {
    // Accéder à l'élément directement via le DOM
    this.vantaContainer = document.querySelector('.container');

    if (this.isVantaActive && this.vantaContainer) {
      this.initVantaEffect();
    }
  }

  /**
   * @brief Initializes the Vanta.js birds effect.
   * 
   * @details
   * Configures various visual parameters such as background color, speed, and bird properties.
   */
  private initVantaEffect(): void {
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
    });
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
   * @brief Toggles the visibility of the project information panel.
   * 
   * @details
   * Updates the `isProjectInfoOpen` flag to show or hide the project information.
   */
  toggleProjectInfo(): void {
    this.isProjectInfoOpen = !this.isProjectInfoOpen;

    // Si le panel est ouvert, ajouter une classe au body pour empêcher le défilement
    if (this.isProjectInfoOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
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

    // Restaurer le défilement du body si nécessaire
    document.body.style.overflow = '';
  }
}
