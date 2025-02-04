import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
  standalone: true, // Déclare le composant comme standalone
})
export class NavbarComponent {
  menuOpen = false;

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }
  navigateToAbout() {
    window.location.href = '../../about/about.component.html'; // Rechargement complet de la page
  }

  navigateToHome() {
    window.location.href = '/'; // Rechargement complet de la page
  }
}
