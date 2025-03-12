import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../../services/auth/auth.service';
import { SearchbarComponent } from '../../../homepage/home/comp/searchbar/searchbar.component';
import { UsersService } from '../../../../services/users/users.service';
import { CookieService } from 'ngx-cookie-service';
import { jwtDecode } from 'jwt-decode';

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
  isMobile = false; // Détecte si on est en mode responsive
  userRole: string | null = null; // Ajout de la propriété pour stocker le rôle
  canAddProduct: boolean = false; // Default: user cannot add product
  canAccessDashboard: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private usersService: UsersService,
    private cookieService: CookieService,
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
    this.authService.logout().subscribe();
    this.showDropdown = false;
  }

  // Vérifie la taille de l'écran et met à jour isMobile
  @HostListener('window:resize', ['$event'])
  checkScreenSize() {
    this.isMobile = window.innerWidth <= 850;
  }

  ngOnInit(): void {
    console.log("🚀 Initializing NavbarComponent...");

    this.authService.isAuthenticated().subscribe((status) => {
      this.isAuthenticated = status;
      console.log("🔐 Authentication Status:", status);
    });

    this.authService.getUserRole().subscribe((role) => {
      this.userRole = role;
      console.log("🔑 User Role:", role);

      // Vérifier les permissions basées sur le rôle
      this.canAddProduct = role?.toLowerCase() === 'user' || role?.toLowerCase() === 'admin' || role?.toLowerCase() === 'superadmin';
      this.canAccessDashboard = role?.toLowerCase() === 'admin' || role?.toLowerCase() === 'superadmin';

      console.log("📝 Can Add Product:", this.canAddProduct);
      console.log("🎯 Can Access Dashboard:", this.canAccessDashboard);
    });

    this.checkScreenSize();

    // Get the cookie's info
    this.userRole = this.usersService.getUserRole();
    console.log("🔑 Raw User Role from Cookie:", this.userRole);

    // Check permissions based on role
    console.log("👤 Current Role:", this.userRole);

    console.log("🎭 Role Comparisons:", {
      isUser: this.userRole === 'User',
      isAdmin: this.userRole === 'Admin',
      isSuperAdmin: this.userRole === 'SuperAdmin'
    });

    // Liste tous les cookies pour débogage
    const cookies = this.cookieService.getAll();
    console.log("🍪 All Cookies:", cookies);

    // Vérification supplémentaire du token JWT
    const token = this.cookieService.get('access_token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        console.log("🎫 Decoded JWT Token:", decoded);
      } catch (error) {
        console.error("❌ Error decoding JWT:", error);
      }
    } else {
      console.warn("⚠️ No access_token found in cookies");
    }
  }
}