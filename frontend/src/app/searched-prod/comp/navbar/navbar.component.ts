import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../../services/auth/auth.service';
import { SearchbarComponent } from '../../../homepage/home/comp/searchbar/searchbar.component';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink, SearchbarComponent],
})
export class NavbarComponent implements OnInit {
  menuOpen = false;
  isAuthenticated = false;
  showDropdown = false; // Gère le menu sur desktop (affiché sur clic de la photo)
  isMobile = false; // Détecte si on est en mode responsive
  showNavDropdown = false;

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.authService.isAuthenticated().subscribe((status) => {
      this.isAuthenticated = status;
    });
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
  }
  toggleNavDropdown() {
    this.showNavDropdown = !this.showNavDropdown;
  }


  logout(): void {
    this.authService.logout();
    this.showDropdown = false;
  }

}