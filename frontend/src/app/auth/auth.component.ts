/**
 * @file auth.component.ts
 * @brief Component for handling user authentication.
 * 
 * This component manages user authentication, including login and registration.
 * It provides UI functionalities such as dark mode, input styling, password visibility,
 * and form submission handling.
 */

import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as bcrypt from 'bcryptjs';

@Component({
  selector: 'app-auth',
  standalone: true,
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
  imports: [CommonModule, FormsModule, RouterLink],
  providers: []
})
export class AuthComponent implements AfterViewInit {
  isLoginMode: boolean = true;
  isDarkMode: boolean = false;
  showPassword: boolean = false;

  username: string = '';
  email: string = '';
  password: string = '';

  usernameFieldTouched: boolean = false;
  emailFieldTouched: boolean = false;
  passwordFieldTouched: boolean = false;

  usernameError: string = '';
  emailError: string = '';
  passwordError: string = '';
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
  ) { }

  @ViewChild('usernameInput', { static: false }) usernameInput!: ElementRef;
  @ViewChild('passwordInput', { static: false }) passwordInput!: ElementRef;
  @ViewChild('emailInput', { static: false }) emailInput!: ElementRef;

  /**
   * @brief Initializes event listeners after the view is rendered.
   * 
   * This method ensures input fields have appropriate styling
   * for focus and blur events.
   */
  ngAfterViewInit() {
    this.setupFocusBlurListeners();
  }

  /**
   * @brief Switches between login and registration mode.
   * 
   * This function toggles between login and registration states
   * and resets input fields to avoid UI glitches.
   * 
   * @param {boolean} isLogin - `true` for login mode, `false` for registration mode.
   */
  setLoginMode(isLogin: boolean): void {
    if (this.isLoginMode !== isLogin) {
      this.isLoginMode = isLogin;
      this.resetForm();
      setTimeout(() => this.setupFocusBlurListeners(), 10);
    }
  }

  /**
   * @brief Toggles the application's dark mode.
   * 
   * This function switches between light and dark themes.
   */
  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('darkMode', this.isDarkMode.toString());
  }

  /**
   * @brief Adds event listeners to input fields to handle focus and blur styling.
   * 
   * This function ensures that input fields receive appropriate styling
   * when focused and lose styling when blurred if left empty.
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
   * @brief Toggles password visibility.
   * 
   * This function allows users to show or hide their password
   * in the input field.
   */
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  /**
   * @brief Handles form submission for login or registration.
   * 
   * This method validates the form, sends authentication data to the API,
   * and navigates the user upon successful login.
   * 
   * @param {any} form - The submitted form object containing user inputs.
   */
  async onSubmit(form: any): Promise<void> {
    // Réinitialiser les messages d'erreur
    this.resetErrors();

    if (this.isLoginMode) {
      // Mode connexion
      if (!this.validateEmail() || !this.validatePassword()) {
        return;
      }

      this.authService.login(this.email, this.password).subscribe({
        next: (response) => {
          console.log("Login successful:", response);
          this.router.navigate(['/home']);
        },
        error: (err) => {
          console.error("Login error:", err);
          switch (err.status) {
            case 401:
              this.errorMessage = 'Email ou mot de passe incorrect';
              break;
            case 403:
              this.errorMessage = 'Compte non vérifié';
              break;
            default:
              this.errorMessage = 'Une erreur est survenue lors de la connexion';
          }
        },
      });
    } else {
      // Mode inscription
      if (!this.validateUsername() || !this.validateEmail() || !this.validatePassword()) {
        return;
      }

      this.authService.register(this.username, this.email, this.password).subscribe({
        next: (response) => {
          console.log("Registration successful:", response);
          this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
            this.router.navigate(['/login']);
          });
        },
        error: (err) => {
          console.error("Registration error:", err);
          switch (err.status) {
            case 409:
              this.errorMessage = 'Cet email est déjà utilisé';
              break;
            case 400:
              this.errorMessage = 'Les données fournies sont invalides';
              break;
            default:
              this.errorMessage = 'Une erreur est survenue lors de l\'inscription';
          }
        },
      });
    }
  }

  /**
   * @brief Navigue vers la page d'accueil
   */
  goToHome(): void {
    this.router.navigate(['/home']);
  }

  /**
   * @brief Initialise le composant
   * 
   * Cette méthode est appelée après la construction du composant.
   * Elle restaure les préférences utilisateur (mode sombre) et
   * configure les validateurs de formulaire.
   */
  ngOnInit(): void {
    // Restaurer le mode sombre depuis le localStorage
    const savedMode = localStorage.getItem('darkMode');
    this.isDarkMode = savedMode === 'true';

    // Initialiser les validateurs
    this.setupValidators();
  }

  /**
   * @brief Configure les validateurs de formulaire
   * 
   * Cette méthode met en place les validateurs pour chaque champ
   * et leurs messages d'erreur associés.
   */
  private setupValidators(): void {
    // Réinitialiser les erreurs quand le mode change
    this.resetErrors();
  }

  /**
   * @brief Réinitialise tous les messages d'erreur
   */
  private resetErrors(): void {
    this.usernameError = '';
    this.emailError = '';
    this.passwordError = '';
    this.errorMessage = '';
  }

  /**
   * @brief Valide le champ username
   * @returns {boolean} true si le champ est valide
   */
  validateUsername(): boolean {
    if (!this.username) {
      this.usernameError = 'Le nom d\'utilisateur est requis';
      return false;
    }
    if (this.username.length < 3) {
      this.usernameError = 'Le nom d\'utilisateur doit contenir au moins 3 caractères';
      return false;
    }
    this.usernameError = '';
    return true;
  }

  /**
   * @brief Valide le champ email
   * @returns {boolean} true si le champ est valide
   */
  validateEmail(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!this.email) {
      this.emailError = 'L\'email est requis';
      return false;
    }
    if (!emailRegex.test(this.email)) {
      this.emailError = 'L\'email n\'est pas valide';
      return false;
    }
    this.emailError = '';
    return true;
  }

  /**
   * @brief Valide le champ password
   * @returns {boolean} true si le champ est valide
   */
  validatePassword(): boolean {
    if (!this.password) {
      this.passwordError = 'Le mot de passe est requis';
      return false;
    }
    if (this.password.length < 6) {
      this.passwordError = 'Le mot de passe doit contenir au moins 6 caractères';
      return false;
    }
    this.passwordError = '';
    return true;
  }

  /**
   * @brief Réinitialise le formulaire et les états de validation
   */
  private resetForm(): void {
    // Réinitialiser les champs
    this.username = '';
    this.email = '';
    this.password = '';

    // Réinitialiser les états de validation
    this.usernameFieldTouched = false;
    this.emailFieldTouched = false;
    this.passwordFieldTouched = false;

    // Réinitialiser les erreurs
    this.resetErrors();
  }

  /**
   * @brief Marque un champ comme touché et lance sa validation
   * @param {string} field - Le nom du champ à marquer comme touché
   */
  onFieldTouched(field: string): void {
    switch (field) {
      case 'username':
        this.usernameFieldTouched = true;
        this.validateUsername();
        break;
      case 'email':
        this.emailFieldTouched = true;
        this.validateEmail();
        break;
      case 'password':
        this.passwordFieldTouched = true;
        this.validatePassword();
        break;
    }
  }
}
