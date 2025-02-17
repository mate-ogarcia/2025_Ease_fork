import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../../../services/auth/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink],
})
export class NavbarComponent implements OnInit {
  menuOpen = false;
  isAuthenticated = false;
  showDropdown = false; // Gère le menu sur desktop
  isMobile = false; // ✅ Détecte si on est en mode responsive

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.authService.isAuthenticated().subscribe((status) => {
      this.isAuthenticated = status;
    });

    this.checkScreenSize(); // Vérifie la taille au chargement
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  toggleDropdown() {
    if (!this.isMobile) {
      this.showDropdown = !this.showDropdown;
    }
  }

  logout() {
    this.authService.logout();
    this.showDropdown = false;
  }

  // ✅ Vérifie la taille de l'écran et met à jour isMobile
  @HostListener('window:resize', ['$event'])
  checkScreenSize() {
    this.isMobile = window.innerWidth <= 768;
  }
}
