import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from '../../../services/admin/admin.service';

@Component({
  selector: 'app-admin-init',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-init">
      <div class="init-container">
        <h2>Initialisation du Compte Administrateur</h2>
        <p class="info">Cette page n'est accessible qu'une seule fois pour créer le premier administrateur.</p>

        <div *ngIf="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <form (ngSubmit)="onSubmit()" #adminForm="ngForm">
          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              [(ngModel)]="email"
              required
              email
              #emailInput="ngModel"
            >
            <div class="error" *ngIf="emailInput.invalid && emailInput.touched">
              Email invalide
            </div>
          </div>

          <div class="form-group">
            <label for="password">Mot de passe</label>
            <input
              type="password"
              id="password"
              name="password"
              [(ngModel)]="password"
              required
              minlength="6"
              #passwordInput="ngModel"
            >
            <div class="error" *ngIf="passwordInput.invalid && passwordInput.touched">
              Le mot de passe doit contenir au moins 6 caractères
            </div>
          </div>

          <button type="submit" [disabled]="adminForm.invalid || isLoading">
            <span *ngIf="!isLoading">Créer le compte administrateur</span>
            <span *ngIf="isLoading">Création en cours...</span>
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .admin-init {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background-color: #f8f9fa;
      padding: 1rem;
    }

    .init-container {
      background: white;
      padding: 2rem;
      border-radius: 10px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      width: 100%;
      max-width: 400px;
    }

    h2 {
      color: #2c3e50;
      margin-bottom: 0.5rem;
    }

    .info {
      color: #6c757d;
      margin-bottom: 2rem;
      font-size: 0.9rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      color: #4b5563;
    }

    input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 5px;
      font-size: 1rem;
    }

    input:focus {
      outline: none;
      border-color: #1976d2;
      box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.2);
    }

    .error {
      color: #dc2626;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }

    .error-message {
      background-color: #fee2e2;
      color: #dc2626;
      padding: 1rem;
      border-radius: 5px;
      margin-bottom: 1rem;
    }

    button {
      width: 100%;
      padding: 0.75rem;
      background-color: #1976d2;
      color: white;
      border: none;
      border-radius: 5px;
      font-size: 1rem;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    button:hover:not(:disabled) {
      background-color: #1565c0;
    }

    button:disabled {
      background-color: #9e9e9e;
      cursor: not-allowed;
    }
  `]
})
export class AdminInitComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private adminService: AdminService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (!this.email || !this.password) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.adminService.createInitialAdmin(this.email, this.password).subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Une erreur est survenue lors de la création du compte administrateur';
      }
    });
  }
} 