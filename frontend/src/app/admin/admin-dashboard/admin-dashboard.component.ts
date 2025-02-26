/**
 * @file admin-dashboard.component.ts
 * @brief Admin dashboard component
 * @details This component displays the admin dashboard with user statistics
 * and administrative actions. It has been enhanced with better error handling
 * and loading state management.
 * 
 * @author Original Author
 * @date Original Date
 * @modified 2023-XX-XX
 */

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { AdminService } from '../../../services/admin/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  userCount: number = 0;
  isLoading: boolean = true;
  errorMessage: string = '';

  /**
   * @constructor
   * @description Initializes the AdminDashboardComponent
   * @param {AuthService} authService - Service for authentication operations
   * @param {AdminService} adminService - Service for administrative operations
   */
  constructor(
    private authService: AuthService,
    private adminService: AdminService
  ) {}

  /**
   * @function ngOnInit
   * @description Lifecycle hook that initializes the component
   * @details Verifies the user role and loads user count
   */
  ngOnInit(): void {
    // Vérification du rôle
    this.authService.getUserRole().subscribe({
      next: role => {
        console.log('Current user role:', role);
      },
      error: error => {
        console.error('Error getting user role:', error);
      }
    });

    // Récupération du nombre d'utilisateurs
    this.loadUsers();
  }

  /**
   * @function loadUsers
   * @description Loads the users and updates the user count
   * @details Sets loading state and error message appropriately
   */
  loadUsers(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.adminService.getAllUsers().subscribe({
      next: (users) => {
        this.userCount = users?.length || 0;
        console.log('Nombre d\'utilisateurs:', this.userCount);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des utilisateurs:', error);
        this.errorMessage = 'Impossible de charger les utilisateurs. Veuillez réessayer plus tard.';
        this.isLoading = false;
      }
    });
  }
} 