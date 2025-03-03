import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../../services/auth/auth.service';
import { SearchbarComponent } from '../../../homepage/home/comp/searchbar/searchbar.component';
import { UsersService } from '../../../../services/users/users.service';

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
  showDropdown = false; // Gère le menu sur desktop
  isMobile = false; // ✅ Détecte si on est en mode responsive
  canAddProduct: boolean = false;   // Default: user cannot add product

  constructor(
    private authService: AuthService, 
    private router: Router,
    private usersService: UsersService,
  
  ) { }



  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  toggleDropdown() {
    if (!this.isMobile) {
      this.showDropdown = !this.showDropdown;
    }
  }


  logout(): void {
    this.authService.logout();
    this.showDropdown = false;
  }

  // ✅ Vérifie la taille de l'écran et met à jour isMobile
  @HostListener('window:resize', ['$event'])
  checkScreenSize() {
    this.isMobile = window.innerWidth <= 850;
  }
  async ngOnInit(): Promise<void> {
    this.authService.isAuthenticated().subscribe((status) => {
      this.isAuthenticated = status;
    });

    this.checkScreenSize(); // Vérifie la taille au chargement

    // Get the cookie's info
    const userRole = this.usersService.getUserRole();
    console.log("🔑 User Role from Cookie:", userRole);
    // Check if the role allows you to add a product
    this.canAddProduct = userRole?.toLowerCase() === 'user' || userRole?.toLowerCase() === 'admin';
  }
}