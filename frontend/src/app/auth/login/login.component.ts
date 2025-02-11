/**
 * @file login.component.ts
 * @brief Component for handling user login and registration.
 * 
 * This component provides functionality for toggling between login and registration,
 * managing form input states, and handling dark mode.
 */

import { Component, ElementRef, ViewChild, AfterViewChecked, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements AfterViewChecked {
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
   * Called after Angular has checked the view. Sets up focus and blur listeners on input fields.
   */
  ngAfterViewChecked() {
    if (this.usernameInput?.nativeElement) {
      this.setupFocusBlurListeners(this.usernameInput.nativeElement);
    }
    if (this.passwordInput?.nativeElement) {
      this.setupFocusBlurListeners(this.passwordInput.nativeElement);
    }
    if (!this.isLoginMode && this.emailInput?.nativeElement) {
      this.setupFocusBlurListeners(this.emailInput.nativeElement);
    }
  }

  /**
   * Toggles password visibility.
   */
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  /**
   * Sets up event listeners for focus and blur on an input field.
   * @param inputElement The input field to attach listeners to.
   */
  setupFocusBlurListeners(inputElement: HTMLInputElement) {
    const parentDiv = inputElement.closest('.input-container');

    inputElement.addEventListener('focus', () => {
      parentDiv?.classList.add('focus');
    });

    inputElement.addEventListener('blur', () => {
      if (inputElement.value.trim() === '') {
        parentDiv?.classList.remove('focus');
      }
    });
  }

  /**
   * Toggles dark mode by adding or removing the 'dark-mode' class on the body.
   */
  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    if (this.isDarkMode) {
      this.renderer.addClass(document.body, 'dark-mode');
    } else {
      this.renderer.removeClass(document.body, 'dark-mode');
    }
  }

  /**
   * Toggles between login and registration modes.
   */
  toggleLoginRegister(): void {
    this.isLoginMode = !this.isLoginMode;

    // Wait for Angular to update the DOM before applying effects to the Email field
    setTimeout(() => {
      if (!this.isLoginMode && this.emailInput?.nativeElement) {
        this.setupFocusBlurListeners(this.emailInput.nativeElement);
      }
    });
  }

  /**
   * Handles form submission and logs the input values.
   * @param form The form object containing user input values.
   */
  onSubmit(form: NgForm): void {
    if (form.invalid) {
      alert("Please fill all required fields correctly.");
      return;
    }

    if (this.isLoginMode) {
      console.log('Logging in with:', this.username, this.password);
    } else {
      console.log('Registering with:', this.username, this.email, this.password);
    }
  }

  /**
   * Sets the login mode.
   * @param isLogin A boolean indicating whether the mode should be login or register.
   */
  setLoginMode(isLogin: boolean): void {
    this.isLoginMode = isLogin;
  }
}
