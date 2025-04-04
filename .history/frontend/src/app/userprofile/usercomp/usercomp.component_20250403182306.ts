import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HistoryComponent } from './history/history.component';
import { BadgesComponent }  from './badges/badges.component';
import { }
// Services
import { AuthService } from '../../../services/auth/auth.service';
import { LocationService } from '../../../services/location/location.service';
@Component({
  selector: 'app-usercomp',
  imports: [CommonModule, HistoryComponent, BadgesComponent],
  templateUrl: './usercomp.component.html',
  styleUrl: './usercomp.component.css'
})
export class UsercompComponent implements OnInit {
  activeTab: string = 'Badges'; // By default, the “Work” tab is active
  // User management
  isAuthenticated = false; // Tracks user authentication status.
  userRole: string | null = null; // Stores the user role.
  userInfo: any // User's infos
  location: string = 'Chargement...';

  /**
   * @brief Constructor injecting authentication service.
   * @param[in] authService Service for authentication management.
   */
  constructor(
    private authService: AuthService,
    private locationService: LocationService,
  ) { }

  /**
   * @brief Initializes component, checks authentication, and retrieves user role.
   */
  ngOnInit(): void {
    this.authService.isAuthenticated().subscribe((status) => {
      this.isAuthenticated = status;
    });

    this.authService.getUserRole().subscribe((role) => {
      this.userRole = role;
    });
    // retrieves user info
    this.userInfo = this.authService.getUserInfo();
    this.locationService.getLocation().subscribe({
      next: (data) => {
        this.location = `${data.city}, ${data.country}`;
      },
      error: (error) => {
        console.error("Error retrieving location", error);
        this.location = "Location not available";
      }
    });
  }

  // How to change tabs
  changeTab(tabName: string) {
    this.activeTab = tabName;
  }

  // Simulate file upload
  uploadFile(event: any) {
    const file = event.target.files[0];
    if (file) {
      alert(`Fichier "${file.name}" téléchargé avec succès !`);
    }
  }
}
