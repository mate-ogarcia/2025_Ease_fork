import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../../../services/auth/auth.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink],
})
export class NavbarComponent implements OnInit, OnDestroy {
  isAuthenticated: boolean = false;
  userRole: string | null = null;
  showDropdown: boolean = false;
  isMobile: boolean = false;
  menuOpen: boolean = false;
  private destroy$ = new Subject<void>();

  constructor(private authService: AuthService, private router: Router) {
    // S'abonner aux changements d'état d'authentification
    this.authService.getAuthStatus()
      .pipe(takeUntil(this.destroy$))
      .subscribe(status => {
        console.log('Auth status changed:', status);
        this.isAuthenticated = status;
      });

    // S'abonner aux changements de rôle
    this.authService.getUserRole()
      .pipe(takeUntil(this.destroy$))
      .subscribe(role => {
        console.log('Role changed:', role);
        this.userRole = role;
      });
  }

  ngOnInit(): void {
    // Gérer la vue mobile
    this.checkIfMobile();
    window.addEventListener('resize', () => this.checkIfMobile());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    document.removeEventListener('click', this.closeDropdown);
    window.removeEventListener('resize', () => this.checkIfMobile());
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
    // Fermer le menu au clic en dehors
    if (this.showDropdown) {
      setTimeout(() => {
        document.addEventListener('click', this.closeDropdown);
      });
    }
  }

  private closeDropdown = (event: MouseEvent) => {
    const dropdownElement = document.querySelector('.dropdown-menu');
    const profileImage = document.querySelector('.userprofile');
    
    if (dropdownElement && profileImage && 
        !dropdownElement.contains(event.target as Node) && 
        !profileImage.contains(event.target as Node)) {
      this.showDropdown = false;
      document.removeEventListener('click', this.closeDropdown);
    }
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  logout(): void {
    this.showDropdown = false;
    this.authService.logout().subscribe();
  }

  private checkIfMobile(): void {
    this.isMobile = window.innerWidth <= 768;
    if (!this.isMobile) {
      this.menuOpen = false;
    }
  }
}
