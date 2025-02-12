import { Component, ElementRef, ViewChild, AfterViewInit, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements AfterViewInit {
  username: string = '';
  password: string = '';
  email: string = '';
  showPassword: boolean = false;
  isDarkMode: boolean = false;
  isLoginMode: boolean = true;

  @ViewChild('usernameInput', { static: false }) usernameInput!: ElementRef;
  @ViewChild('passwordInput', { static: false }) passwordInput!: ElementRef;
  @ViewChild('emailInput', { static: false }) emailInput!: ElementRef;

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
    const inputs = [this.usernameInput?.nativeElement, this.passwordInput?.nativeElement, this.emailInput?.nativeElement].filter(Boolean);

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
   * Bascule entre Login et Register de manière fluide.
   */
  setLoginMode(isLogin: boolean): void {
    if (this.isLoginMode !== isLogin) {
      this.isLoginMode = isLogin;
      
      // Réinitialiser les champs pour éviter le lag dû au changement de valeur
      this.email = '';
      this.password = '';
      this.username = '';

      setTimeout(() => this.setupFocusBlurListeners(), 10);
    }
  }

  /**
   * Soumission du formulaire avec validation.
   */
  onSubmit(form: NgForm): void {
    if (form.invalid) {
      alert("Merci de remplir tous les champs correctement.");
      return;
    }

    if (this.isLoginMode) {
      console.log('Connexion avec :', this.username, this.password);
    } else {
      console.log('Inscription avec :', this.username, this.email, this.password);
    }
  }
}
