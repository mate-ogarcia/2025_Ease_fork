import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

/**
 * @class SettingsButtonComponent
 * @brief Reusable settings button that provides dark mode and bird animation controls
 * 
 * @details
 * Features:
 * - Dark mode toggle for all pages
 * - Vanta.js birds effect toggle only for homepage
 * - Persistent settings via localStorage
 */
@Component({
  selector: 'app-settings-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './settings-button.component.html',
  styleUrl: './settings-button.component.css'
})
export class SettingsButtonComponent implements OnInit {
  @Input() showBirdControl: boolean = false;

  isSettingsOpen: boolean = false;
  isDarkMode: boolean = false;
  isVantaActive: boolean = true;
  isHomePage: boolean = false;

  constructor(private router: Router) { }

  ngOnInit(): void {
    // Vérifier si on est sur la page d'accueil
    this.isHomePage = this.router.url === '/' || this.router.url === '/home';

    // Récupérer l'état du mode sombre
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) {
      this.isDarkMode = savedDarkMode === 'true';
      document.body.classList.toggle('dark-mode', this.isDarkMode);
    }

    // Récupérer l'état de l'animation (uniquement pour la page d'accueil)
    if (this.isHomePage || this.showBirdControl) {
      const savedVantaState = localStorage.getItem('vantaActive');
      if (savedVantaState !== null) {
        this.isVantaActive = savedVantaState === 'true';
      }
    }

    // Charger FontAwesome si nécessaire
    this.loadFontAwesome();
  }

  /**
   * @brief Toggles the settings panel visibility
   */
  toggleSettingsPanel(): void {
    this.isSettingsOpen = !this.isSettingsOpen;
  }

  /**
   * @brief Toggles dark mode and saves state to localStorage
   */
  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('dark-mode', this.isDarkMode);
    localStorage.setItem('darkMode', this.isDarkMode.toString());
  }

  /**
   * @brief Toggles the Vanta.js bird effect and saves state to localStorage
   * @emits Event that the homepage component listens to
   */
  toggleVantaEffect(): void {
    this.isVantaActive = !this.isVantaActive;
    localStorage.setItem('vantaActive', this.isVantaActive.toString());

    // Émettre un événement personnalisé pour que la page d'accueil puisse réagir
    const event = new CustomEvent('vantaToggle', {
      detail: { isActive: this.isVantaActive },
      bubbles: true
    });
    document.dispatchEvent(event);
  }

  /**
   * @brief Loads FontAwesome if not already loaded
   */
  private loadFontAwesome(): void {
    if (!document.getElementById('font-awesome-css')) {
      const link = document.createElement('link');
      link.id = 'font-awesome-css';
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
      document.head.appendChild(link);
    }
  }
}
