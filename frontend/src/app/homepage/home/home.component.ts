/**
 * @file home.component.ts
 * @brief Main component for the home page of the application.
 *
 * @details
 * The `HomeComponent` manages the homepage visuals and user interface settings, including:
 * - Background animations (using Vanta.js with birds effect).
 * - Dark mode toggling.
 * - Settings panel visibility.
 * - User role retrieval from cookies.
 *
 * Key functionalities:
 * - Initializes a dynamic background with Vanta.js.
 * - Allows toggling dark mode for the application.
 * - Provides settings panel access.
 * - Reads and logs user role from the JWT stored in cookies.
 */

import { Component, AfterViewInit, OnDestroy, ViewChild, ElementRef, OnInit } from '@angular/core';
import * as VANTA from 'vanta/src/vanta.birds';  // Vanta.js birds animation
import * as THREE from 'three';                  // Three.js for rendering 3D graphics

// Components
import { SearchbarComponent } from './comp/searchbar/searchbar.component';
import { NavbarComponent } from './comp/navbar/navbar.component';

// Services
import { UsersService } from '../../../services/users/users.service';
import { CookieService } from 'ngx-cookie-service'; // For cookie management

/**
 * @class HomeComponent
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
  selector: 'app-home',
  standalone: true,
  imports: [SearchbarComponent, NavbarComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements AfterViewInit, OnDestroy, OnInit {
  @ViewChild('vantaBackground', { static: true }) vantaRef!: ElementRef; // Reference to the Vanta background element

  isVantaActive: boolean = true;    // Determines whether the Vanta effect is active
  isDarkMode: boolean = false;      // State for dark mode
  isSettingsOpen: boolean = false;  // State for settings panel visibility

  private vantaEffect: any;         // Instance of the Vanta.js effect

  username: string = '';            // Placeholder for the user's name (if needed)
  token: string = '';               // Placeholder for the JWT token (if needed)

  /**
   * @brief Constructor injecting necessary services.
   * @param cookieService Service for managing cookies.
   * @param usersService Service for fetching user information from JWT tokens.
   */
  constructor(
    private usersService: UsersService,
  ) { }

  /**
   * @brief Lifecycle hook called upon component initialization.
   * 
   * @details
   * - Retrieves and logs the user role from the stored JWT token in cookies.
   */
  ngOnInit(): void {
    const userRole = this.usersService.getUserRole();
    console.log("🔑 User Role from Cookie:", userRole);
  }

  /**
   * @brief Lifecycle hook called after the component's view is initialized.
   * 
   * @details
   * Initializes the Vanta.js effect if `isVantaActive` is `true`.
   */
  ngAfterViewInit(): void {
    if (this.isVantaActive) {
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
      el: '.container',
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
   * @brief Lifecycle hook called before the component is destroyed.
   * 
   * @details
   * Destroys the Vanta.js animation effect to prevent memory leaks.
   */
  ngOnDestroy(): void {
    if (this.vantaEffect) {
      this.vantaEffect.destroy();
    }
  }
}
