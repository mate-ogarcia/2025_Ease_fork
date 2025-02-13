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
  /** Username for login */
  usernameLogin: string = '';
  
  /** Password for login */
  passwordLogin: string = '';

  /** Username for registration */
  usernameRegister: string = '';
  
  /** Email for registration */
  emailRegister: string = '';
  
  /** Password for registration */
  passwordRegister: string = '';

  /** Boolean to toggle password visibility */
  showPassword: boolean = false;
  
  /** Boolean to track dark mode state */
  isDarkMode: boolean = false;
  
  /** Boolean to track login mode state */
  isLoginMode: boolean = true;

  @ViewChild('usernameInput', { static: false }) usernameInput!: ElementRef;
  @ViewChild('passwordInput', { static: false }) passwordInput!: ElementRef;
  @ViewChild('usernameRegisterInput', { static: false }) usernameRegisterInput!: ElementRef;
  @ViewChild('emailInput', { static: false }) emailInput!: ElementRef;
  @ViewChild('passwordRegisterInput', { static: false }) passwordRegisterInput!: ElementRef;

  constructor(private renderer: Renderer2) {}

  /**
   * Initializes event listeners after the view is rendered.
   */
  ngAfterViewInit() {
    this.setupFocusBlurListeners();
  }

  /**
   * Retrieves input values dynamically from the form fields.
   */
  getInputValues() {
    if (this.isLoginMode) {
      this.usernameLogin = this.usernameInput.nativeElement.value;
      this.passwordLogin = this.passwordInput.nativeElement.value;
    } else {
      this.usernameRegister = this.usernameRegisterInput.nativeElement.value;
      this.emailRegister = this.emailInput.nativeElement.value;
      this.passwordRegister = this.passwordRegisterInput.nativeElement.value;
    }
  }

  /**
   * Toggles password visibility.
   */
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  /**
   * Applies dynamic styles to input fields (prevents repeated additions).
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
   * Toggles dark mode on or off.
   */
  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    this.renderer.setAttribute(document.body, 'class', this.isDarkMode ? 'dark-mode' : '');
  }

  /**
   * Switches between login and registration modes and applies field effects.
   * 
   * @param isLogin - Boolean indicating if the login mode should be active.
   */
  setLoginMode(isLogin: boolean): void {
    if (this.isLoginMode !== isLogin) {
      this.isLoginMode = isLogin;
      
      // Reset input fields to avoid persistent values
      setTimeout(() => this.setupFocusBlurListeners(), 50);
    }
  }

  /**
   * Handles form submission.
   * 
   * @param form - The submitted form data.
   */
  onSubmit(form: NgForm): void {
    if (form.invalid) {
      alert("Please fill in all fields correctly.");
      return;
    }
    
    this.getInputValues(); // Dynamically retrieve input values

    if (this.isLoginMode) {
      console.log('Logging in with:', this.usernameLogin, this.passwordLogin);
    } else {
      console.log('Registering with:', this.usernameRegister, this.emailRegister, this.passwordRegister);
    }
  }
}
