import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private toastElement: HTMLDivElement | null = null;

  showError(message: string, duration: number = 5000) {
    this.showToast(message, 'error', duration);
  }

  showWarning(message: string, duration: number = 5000) {
    this.showToast(message, 'warning', duration);
  }

  showSuccess(message: string, duration: number = 3000) {
    this.showToast(message, 'success', duration);
  }

  private showToast(message: string, type: 'error' | 'warning' | 'success', duration: number) {
    // Supprimer le toast précédent s'il existe
    if (this.toastElement) {
      document.body.removeChild(this.toastElement);
    }

    // Créer un nouveau toast
    this.toastElement = document.createElement('div');
    this.toastElement.textContent = message;
    this.toastElement.className = `toast-notification toast-${type}`;

    // Styles pour le toast
    const styles = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      padding: 16px 24px;
      border-radius: 4px;
      color: white;
      font-size: 14px;
      z-index: 1000;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      animation: slideUp 0.3s ease-out;
    `;

    const typeStyles = {
      error: 'background-color: #f44336;',
      warning: 'background-color: #ff9800;',
      success: 'background-color: #4caf50;'
    };

    this.toastElement.style.cssText = styles + typeStyles[type];

    // Ajouter le toast au document
    document.body.appendChild(this.toastElement);

    // Supprimer le toast après la durée spécifiée
    setTimeout(() => {
      if (this.toastElement && this.toastElement.parentNode) {
        this.toastElement.style.animation = 'slideDown 0.3s ease-out';
        setTimeout(() => {
          if (this.toastElement && this.toastElement.parentNode) {
            document.body.removeChild(this.toastElement);
            this.toastElement = null;
          }
        }, 300);
      }
    }, duration);
  }
} 