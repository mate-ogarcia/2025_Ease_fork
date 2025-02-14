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
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as bcrypt from 'bcryptjs';

@Component({
  selector: 'app-auth',
  standalone: true,
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
  imports: [CommonModule, FormsModule],
  providers: []
})
export class AuthComponent implements AfterViewInit {
  isLoginMode: boolean = true;
  isDarkMode: boolean = false;
  showPassword: boolean = false;

  username: string = '';
  email: string = '';
  password: string = '';
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

      // Reset fields to prevent input lag on mode switch
      this.email = '';
      this.password = '';
      this.username = '';

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
    if (!form.valid) {
      this.errorMessage = 'Please fill in all fields correctly.';
      return;
    }   
    
    // If the user wants to log in
    if (this.isLoginMode) {
      this.authService.login(this.username, this.password).subscribe({
        next: (response) => {
          console.log("Server response:", response);
          this.router.navigate(['/home']);
        },
        error: (err) => {
          console.log("Login error:", err);
          this.errorMessage = 'Invalid email or password.';
        },
      });
    }
  // If the user wants to create an account
  if (!this.isLoginMode) {
    // Hash the password before sending it to the server
      const hashedPassword = await bcrypt.hash(this.password, 10);

      // Call register with the hashed password
      this.authService.register(this.username, this.email, hashedPassword).subscribe({
        next: (response) => {
          console.log("Server response:", response);
          // Navigate to profile or home, or show success message
          // this.router.navigate(['/profile']);
        },
        error: (err) => {
          console.log("Register error:", err);
          this.errorMessage = 'Invalid email or password.';
        },
      });
    };
  }
}
