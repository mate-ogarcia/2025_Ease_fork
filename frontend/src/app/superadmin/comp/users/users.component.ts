/**
 * @file users.component.ts
 * @description Component for managing user accounts, including search, role updates, banning, and deleting users.
 */

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, User } from '../../../../services/admin/admin.service';
import { NotificationService } from '../../../../services/notification/notification.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

/**
 * @component UsersComponent
 * @description Displays a list of users with functionalities to filter, edit roles, delete or ban users.
 */
@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent implements OnInit {
  /** @property {string} searchTerm - Current user search input */
  searchTerm: string = '';

  /** @property {Array} users - List of users including edit state */
  users: (User & { isEditing: boolean })[] = [];

  /** @property {string[]} availableRoles - List of available roles excluding 'Banned' */
  availableRoles: string[] = [];

  /** @property {boolean} isSuperAdmin - True if the current user is a SuperAdmin */
  isSuperAdmin: boolean = false;

  /** @property {boolean} isLoadingUsers - Indicates if user data is currently being loaded */
  isLoadingUsers: boolean = false;

  /** @property {boolean} isLoadingRoles - Indicates if role list is currently being loaded */
  isLoadingRoles: boolean = false;

  /**
   * @constructor
   * @param {AdminService} adminService - Service for admin operations
   * @param {NotificationService} notificationService - Service to display notifications
   */
  constructor(
    private adminService: AdminService,
    private notificationService: NotificationService
  ) {}

  /**
   * @lifecycle ngOnInit
   * @description Initializes component by checking user role and loading users and roles
   */
  ngOnInit(): void {
    this.checkUserRole();
    this.loadUsers();
    this.loadRoles();
  }

  /**
   * @method checkUserRole
   * @description Verifies if the current user is a SuperAdmin
   * @private
   */
  private checkUserRole(): void {
    this.adminService.getCurrentUserRole().subscribe({
      next: (role) => {
        console.log('🔍 Role received from server:', role);
        this.isSuperAdmin = role === 'SuperAdmin';
        console.log('✅ Is SuperAdmin?', this.isSuperAdmin);
      },
      error: (error) => {
        console.error('❌ Error checking user role:', error);
        this.isSuperAdmin = false;
      }
    });
  }

  /**
   * @method loadUsers
   * @description Loads the list of all users from the server
   */
  loadUsers(): void {
    this.isLoadingUsers = true;
    this.adminService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users.map(user => ({ ...user, isEditing: false }));
        console.log('✅ Users loaded:', this.users);
        this.isLoadingUsers = false;
      },
      error: (error) => {
        console.error('❌ Error loading users:', error);
        this.isLoadingUsers = false;
        this.notificationService.showError('Failed to load users');
      }
    });
  }

  /**
   * @method loadRoles
   * @description Loads the list of available roles excluding 'Banned'
   */
  loadRoles(): void {
    this.isLoadingRoles = true;
    this.adminService.getAllRoles().subscribe({
      next: (roles) => {
        this.availableRoles = roles.filter(role => role !== 'Banned');
        console.log('✅ Roles loaded:', this.availableRoles);
        this.isLoadingRoles = false;
      },
      error: (error) => {
        console.error('❌ Error loading roles:', error);
        this.availableRoles = ['SuperAdmin', 'Admin', 'Utilisateur'];
        this.isLoadingRoles = false;
        this.notificationService.showError('Erreur de chargement des utilisateurs');
      }
    });
  }

  /**
   * @method filteredUsers
   * @description Returns the list of users filtered by search term
   * @returns {Array<User>} Filtered user list
   */
  get filteredUsers(): (User & { isEditing: boolean })[] {
    if (!this.searchTerm.trim()) return this.users;

    const term = this.searchTerm.toLowerCase();
    return this.users.filter(user =>
      user.username.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term)
    );
  }

  /**
   * @method editRole
   * @description Enables role edit mode for a user
   * @param {User & { isEditing: boolean }} user - The user to edit
   */
  editRole(user: User & { isEditing: boolean }): void {
    user.isEditing = true;
  }

  /**
   * @method saveRole
   * @description Saves the updated role for a user
   * @param {User & { isEditing: boolean }} user - The user being updated
   * @param {string} newRole - The new role to assign
   */
  saveRole(user: User & { isEditing: boolean }, newRole: string): void {
    console.log(`🔄 Attempting role update for ${user.email} from ${user.role} to ${newRole}`);

    if (user.role === newRole) {
      console.log('ℹ️ No role change detected, canceling edit');
      user.isEditing = false;
      return;
    }

    this.adminService.updateUserRole(user.email, newRole).subscribe({
      next: () => {
        user.role = newRole;
        user.isEditing = false;
        console.log(`✅ Role successfully updated for ${user.email}: ${newRole}`);
      },
      error: (error) => {
        console.error('❌ Error updating role:', error);
        alert(`Error updating role: ${error.message}`);
        this.loadUsers(); // Refresh data on failure
      }
    });
  }

  /**
   * @method cancelEdit
   * @description Cancels role editing for a user
   * @param {User & { isEditing: boolean }} user - The user to cancel edit for
   */
  cancelEdit(user: User & { isEditing: boolean }): void {
    user.isEditing = false;
  }

  /**
   * @method deleteUser
   * @description Deletes a user after confirmation
   * @param {User & { isEditing: boolean }} user - The user to delete
   */
  deleteUser(user: User & { isEditing: boolean }): void {
    if (confirm(`Are you sure you want to delete ${user.username}?`)) {
      this.adminService.deleteUser(user.email).subscribe({
        next: () => {
          this.users = this.users.filter(u => u.email !== user.email);
          console.log('✅ User successfully deleted');
        },
        error: (error) => {
          console.error('❌ Error deleting user:', error);
          this.loadUsers(); // Refresh list on error
        }
      });
    }
  }

  /**
   * @method banUser
   * @description Toggles ban/unban for a user
   * @param {User & { isEditing: boolean }} user - The user to ban or unban
   */
  banUser(user: User & { isEditing: boolean }): void {
    const newRole = user.role === 'Banned' ? 'User' : 'Banned';
    const action = user.role === 'Banned' ? 'unbanned' : 'banned';

    if (confirm(`Are you sure you want to ${action} ${user.username}?`)) {
      this.adminService.updateUserRole(user.email, newRole).subscribe({
        next: () => {
          user.role = newRole;
          user.isEditing = false;
          console.log(`✅ Utilisateurs a bien été ${action}`);
          this.notificationService.showSuccess(`User ${user.username} was successfully ${action}`);
        },
        error: (error) => {
          console.error(`❌ Error during ${action}:`, error);
          this.notificationService.showError(`Error ${action} user ${user.username}`);
          this.loadUsers(); // Refresh on failure
        }
      });
    }
  }
}
