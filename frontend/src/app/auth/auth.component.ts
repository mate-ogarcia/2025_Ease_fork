import { Component } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-auth',
  standalone: true,
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
  imports: [CommonModule, FormsModule],
})
export class AuthComponent {
  isLoginMode: boolean = true;
  isDarkMode: boolean = false;
  showPassword: boolean = false;

  username: string = '';
  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  /**
   * Switches between login and register mode.
   * @param mode Boolean indicating login mode.
   */
  setLoginMode(mode: boolean): void {
    this.isLoginMode = mode;
  }

  /**
   * Toggles the dark mode.
   */
  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
  }

  /**
   * Toggles password visibility.
   */
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  /**
   * Handles form submission for login or registration.
   * @param form The form object.
   */
  onSubmit(form: any): void {
    if (!form.valid) {
      this.errorMessage = 'Please fill in all fields correctly.';
      return;
    }

    if (this.isLoginMode) {
      // Login request
      this.authService.login(this.email, this.password).subscribe({
        next: () => this.router.navigate(['/profile']),
        error: (err) => (this.errorMessage = 'Invalid email or password.'),
      });
    } else {
      // Register request
      this.authService.register(this.email, this.password).subscribe({
        next: () => {
          this.isLoginMode = true;
          this.errorMessage = 'Registration successful! Please log in.';
        },
        error: (err) => (this.errorMessage = 'Registration failed. Try again.'),
      });
    }
  }
}
