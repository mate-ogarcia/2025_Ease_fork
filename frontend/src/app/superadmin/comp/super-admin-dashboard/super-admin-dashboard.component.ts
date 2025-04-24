import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

// Dashboard Components
import { StatsComponent } from '../stats/stats.component';
import { ProductRequestsComponent } from '../product-requests/product-requests.component';
import { UsersComponent } from '../users/users.component';
import { UsersService } from '../../../../services/users/users.service';

/**
 * @component SuperAdminDashboardComponent
 * @description Component responsible for rendering the super admin dashboard with navigation between different views.
 */
@Component({
  standalone: true,
  selector: 'app-super-admin-dashboard',
  imports: [
    StatsComponent,
    ProductRequestsComponent,
    UsersComponent,
    CommonModule
  ],
  templateUrl: './super-admin-dashboard.component.html',
  styleUrls: ['./super-admin-dashboard.component.css']
})
export class SuperAdminDashboardComponent implements OnInit {

  /** @property {string} activeTab - The currently selected dashboard tab */
  activeTab: string = 'stats';

  /** @property {boolean} isAuthorized - Indicates whether the user has the correct role to access this dashboard */
  isAuthorized: boolean = false;

  /** @property {boolean} menuOpen - Tracks whether the responsive burger menu is open or closed */
  menuOpen: boolean = false;

  /**
   * @constructor
   * @param {UsersService} usersService - Service to retrieve user information
   */
  constructor(private usersService: UsersService) { }

  /**
   * @lifecycle OnInit
   * @description Checks the user role to determine access authorization
   */
  ngOnInit(): void {
    const userRole = this.usersService.getUserRole()?.toLowerCase();
    this.isAuthorized = userRole === 'superadmin' || userRole === 'admin';
  }

  /**
   * @method selectTab
   * @description Changes the current tab and closes the burger menu if open
   * @param {string} tabName - Name of the tab to activate
   */
  selectTab(tabName: string): void {
    this.activeTab = tabName;
    this.menuOpen = false;
  }

  /**
   * @method toggleMenu
   * @description Toggles the burger menu visibility for mobile/responsive mode
   */
  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }
}
