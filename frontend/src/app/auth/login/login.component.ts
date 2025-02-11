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

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

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

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    if (this.isDarkMode) {
      this.renderer.addClass(document.body, 'dark-mode');
    } else {
      this.renderer.removeClass(document.body, 'dark-mode');
    }
  }

  toggleLoginRegister(): void {
    this.isLoginMode = !this.isLoginMode;

    // Attendre que Angular mette à jour le DOM avant d'appliquer l'effet au champ Email
    setTimeout(() => {
      if (!this.isLoginMode && this.emailInput?.nativeElement) {
        this.setupFocusBlurListeners(this.emailInput.nativeElement);
      }
    });
  }

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
  setLoginMode(isLogin: boolean): void {
    this.isLoginMode = isLogin;
  }
  
}
