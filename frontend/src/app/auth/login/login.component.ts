import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Ajout de FormsModule ici

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule], // Ajout de FormsModule ici
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements AfterViewInit {
  username: string = '';
  password: string = '';
  showPassword: boolean = false;
  isDarkMode: boolean = false; // ✅ Ajout de cette propriété

  @ViewChild('usernameInput', { static: false }) usernameInput!: ElementRef;
  @ViewChild('passwordInput', { static: false }) passwordInput!: ElementRef;

  ngAfterViewInit() {
    this.setupFocusBlurListeners(this.usernameInput.nativeElement);
    this.setupFocusBlurListeners(this.passwordInput.nativeElement);
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
      if (inputElement.value === '') {
        parentDiv?.classList.remove('focus');
      }
    });
  }

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    if (this.isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }
}
