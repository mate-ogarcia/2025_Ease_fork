/**
 * @file login.component.ts
 * @brief Component for handling user login and registration.
 *
 * This component provides functionality for toggling between login and registration,
 * managing form input states, and handling dark mode.
 */

import { Component, ElementRef, ViewChild, AfterViewInit, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements AfterViewInit {
  // Variables pour Login
  usernameLogin: string = '';
  passwordLogin: string = '';

  // Variables pour Register
  usernameRegister: string = '';
  emailRegister: string = '';
  passwordRegister: string = '';

  showPassword: boolean = false;
  isDarkMode: boolean = false;
  isLoginMode: boolean = true;

  @ViewChild('usernameInput', { static: false }) usernameInput!: ElementRef;
  @ViewChild('passwordInput', { static: false }) passwordInput!: ElementRef;
  @ViewChild('usernameRegisterInput', { static: false }) usernameRegisterInput!: ElementRef;
  @ViewChild('emailInput', { static: false }) emailInput!: ElementRef;
  @ViewChild('passwordRegisterInput', { static: false }) passwordRegisterInput!: ElementRef;

  constructor(private renderer: Renderer2) {}

  /**
   * Initialise les listeners après que la vue soit rendue.
   */
  ngAfterViewInit() {
    this.setupFocusBlurListeners();
  }

  /**
   * Toggle la visibilité du mot de passe.
   */
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  /**
   * Applique les styles dynamiques aux inputs (évite les ajouts répétés).
   */
  setupFocusBlurListeners() {
    const inputs = [
      this.usernameInput?.nativeElement,
      this.passwordInput?.nativeElement,
      this.usernameRegisterInput?.nativeElement,
      this.emailInput?.nativeElement,
      this.passwordRegisterInput?.nativeElement
    ].filter(Boolean);

    inputs.forEach(input => {
      const parentDiv = input.closest('.input-container');

      input.addEventListener('focus', () => {
        parentDiv?.classList.add('focus');
      });

      input.addEventListener('blur', () => {
        if (input.value.trim() === '') {
          parentDiv?.classList.remove('focus');
        }
      });
    });
  }

  /**
   * Active/Désactive le mode sombre.
   */
  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    this.renderer.setAttribute(document.body, 'class', this.isDarkMode ? 'dark-mode' : '');
  }

  /**
   * Bascule entre Login et Register et applique les effets de champ.
   */
  setLoginMode(isLogin: boolean): void {
    if (this.isLoginMode !== isLogin) {
      this.isLoginMode = isLogin;

      // Réinitialisation des champs pour éviter les valeurs persistantes
      if (this.isLoginMode) {
        this.usernameRegister = '';
        this.emailRegister = '';
        this.passwordRegister = '';
      } else {
        this.usernameLogin = '';
        this.passwordLogin = '';
      }

      // Attendre que le DOM se mette à jour avant de réappliquer les effets
      setTimeout(() => this.setupFocusBlurListeners(), 50);
    }
  }

  /**
   * Gère la soumission du formulaire.
   */
  onSubmit(form: NgForm): void {
    if (form.invalid) {
      alert("Merci de remplir tous les champs correctement.");
      return;
    }

    if (this.isLoginMode) {
      console.log('Connexion avec :', this.usernameLogin, this.passwordLogin);
    } else {
      console.log('Inscription avec :', this.usernameRegister, this.emailRegister, this.passwordRegister);
    }
  }
}
