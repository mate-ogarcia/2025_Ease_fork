import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HistoryComponent } from './history/history.component';
import { FavoritesComponent } from './favorites/favorites.component';
import { BadgesComponent }  from './badges/badges.component';
import { AchivementComponent } from './achivement/achivement.component';
// Services
import { AuthService } from '../../../services/auth/auth.service';

/**
 * @component UsercompComponent
 * @description Component for displaying user content such as favorites and history, depending on authentication status.
 */
@Component({
  selector: 'app-usercomp',
  imports: [CommonModule, HistoryComponent, FavoritesComponent, BadgesComponent,AchivementComponent],
  templateUrl: './usercomp.component.html',
  styleUrl: './usercomp.component.css'
})
export class UsercompComponent implements OnInit {
  /** @property {string} activeTab - Currently active tab, default is "Favoris" */
  activeTab: string = 'Favoris'; // Set "Favoris" as the default active tab

  /** @property {boolean} isAuthenticated - Tracks if the user is authenticated */
  isAuthenticated = false;

  /** @property {string | null} userRole - The role of the currently logged-in user */
  userRole: string | null = null;

  /** @property {any} userInfo - Information about the current user */
  userInfo: any;
  location: string = 'Chargement...';

  /**
   * @constructor
   * @param authService Service to manage authentication
   */
  constructor(private authService: AuthService) {}

  /**
   * @lifecycle ngOnInit
   * @description Checks if the user is authenticated and retrieves user role and info.
   */
  ngOnInit(): void {
    this.authService.isAuthenticated().subscribe((status) => {
      this.isAuthenticated = status;
    });

    this.authService.getUserRole().subscribe((role) => {
      this.userRole = role;
    });

    // Retrieve user information
    this.userInfo = this.authService.getUserInfo();
  }

  /**
   * @method changeTab
   * @description Switches to a given tab
   * @param tabName The name of the tab to activate
   */
  changeTab(tabName: string): void {
    this.activeTab = tabName;
  }

  /**
   * @method uploadFile
   * @description Simulates a file upload action
   * @param event The file input change event
   */
  uploadFile(event: any): void {
    const file = event.target.files[0];
    if (file) {
      alert(`File "${file.name}" uploaded successfully!`);
    }
  }
}
