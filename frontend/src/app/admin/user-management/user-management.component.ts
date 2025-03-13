import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminService, User } from '../../../services/admin/admin.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  selectedUser: User | null = null;
  roles: string[] = ['user', 'admin'];
  isLoading: boolean = true;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private adminService: AdminService) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.adminService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Erreur lors du chargement des utilisateurs';
        this.isLoading = false;
      }
    });
  }

  selectUser(user: User): void {
    this.selectedUser = { ...user };
  }

  updateUserRole(): void {
    if (!this.selectedUser) return;

    this.adminService.updateUserRole(this.selectedUser.email, this.selectedUser.role).subscribe({
      next: () => {
        const userIndex = this.users.findIndex(u => u.email === this.selectedUser?.email);
        if (userIndex !== -1) {
          this.users[userIndex] = { ...this.selectedUser! };
        }
        this.successMessage = "Rôle de l'utilisateur mis à jour avec succès";
        this.selectedUser = null;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Erreur lors de la mise à jour du rôle';
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }

  deleteUser(userId: string): void {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;

    this.adminService.deleteUser(userId).subscribe({
      next: () => {
        this.users = this.users.filter(u => u.email !== userId);
        this.successMessage = "Utilisateur supprimé avec succès";
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Erreur lors de la suppression de l\'utilisateur';
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }
} 