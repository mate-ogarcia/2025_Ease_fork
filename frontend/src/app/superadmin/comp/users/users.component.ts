import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, User } from '../../../../services/admin/admin.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent implements OnInit {
  // Terme de recherche
  searchTerm: string = '';

  // Liste des utilisateurs
  users: (User & { isEditing: boolean })[] = [];

  // Liste des rôles disponibles
  availableRoles: string[] = [];

  // Indique si l'utilisateur actuel est SuperAdmin
  isSuperAdmin: boolean = false;

  constructor(private adminService: AdminService) { }

  ngOnInit() {
    this.checkUserRole();
    this.loadUsers();
    this.loadRoles();
  }

  // Vérifie si l'utilisateur est SuperAdmin
  private checkUserRole() {
    this.adminService.getCurrentUserRole().subscribe({
      next: (role) => {
        console.log('🔍 Rôle reçu du serveur:', role);
        // Vérification stricte du rôle SuperAdmin
        this.isSuperAdmin = role === 'SuperAdmin';
        console.log('✅ Est SuperAdmin ?', this.isSuperAdmin);
      },
      error: (error) => {
        console.error('❌ Erreur lors de la vérification du rôle:', error);
        this.isSuperAdmin = false;
      }
    });
  }

  // Charge la liste des utilisateurs
  loadUsers() {
    this.adminService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users.map(user => ({
          ...user,
          isEditing: false
        }));
        console.log('✅ Utilisateurs chargés:', this.users);
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des utilisateurs:', error);
      }
    });
  }

  // Charge la liste des rôles disponibles
  loadRoles() {
    this.adminService.getAllRoles().subscribe({
      next: (roles) => {
        this.availableRoles = roles;
        console.log('✅ Rôles chargés:', this.availableRoles);
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des rôles:', error);
        // Fallback sur des rôles par défaut en cas d'erreur
        this.availableRoles = ['SuperAdmin', 'Admin', 'User', 'Banned'];
      }
    });
  }

  // Liste filtrée en fonction du terme de recherche
  get filteredUsers() {
    if (!this.searchTerm.trim()) {
      return this.users;
    }
    const term = this.searchTerm.toLowerCase();
    return this.users.filter(
      user =>
        user.username.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term)
    );
  }

  // Active le mode édition pour le rôle d'un utilisateur
  editRole(user: User & { isEditing: boolean }): void {
    user.isEditing = true;
  }

  // Sauvegarde le nouveau rôle et désactive le mode édition
  saveRole(user: User & { isEditing: boolean }, newRole: string): void {
    console.log(`🔄 Tentative de mise à jour du rôle pour ${user.email} de ${user.role} à ${newRole}`);

    // Vérifier si le rôle a changé
    if (user.role === newRole) {
      console.log('ℹ️ Aucun changement de rôle détecté, annulation de l\'édition');
      user.isEditing = false;
      return;
    }

    this.adminService.updateUserRole(user.email, newRole).subscribe({
      next: (response) => {
        console.log('✅ Réponse du serveur:', response);
        user.role = newRole;
        user.isEditing = false;
        console.log(`✅ Rôle mis à jour avec succès pour ${user.email}: ${newRole}`);
      },
      error: (error) => {
        console.error('❌ Erreur lors de la mise à jour du rôle:', error);
        console.error('❌ Détails de l\'erreur:', {
          status: error.status,
          message: error.message,
          error: error.error
        });

        // Afficher un message d'erreur à l'utilisateur
        alert(`Erreur lors de la mise à jour du rôle: ${error.message}`);

        // Recharger les utilisateurs en cas d'erreur pour avoir l'état à jour
        this.loadUsers();
      }
    });
  }

  // Annule l'édition du rôle
  cancelEdit(user: User & { isEditing: boolean }): void {
    user.isEditing = false;
  }

  // Supprime l'utilisateur après confirmation
  deleteUser(user: User & { isEditing: boolean }): void {
    if (confirm(`Voulez-vous vraiment supprimer ${user.username} ?`)) {
      this.adminService.deleteUser(user.email).subscribe({
        next: () => {
          this.users = this.users.filter(u => u.email !== user.email);
          console.log('✅ Utilisateur supprimé avec succès');
        },
        error: (error) => {
          console.error('❌ Erreur lors de la suppression:', error);
          // Recharger les utilisateurs en cas d'erreur
          this.loadUsers();
        }
      });
    }
  }

  // Bascule entre bannir et débannir l'utilisateur avec validation
  banUser(user: User & { isEditing: boolean }): void {
    const newRole = user.role === 'Banned' ? 'User' : 'Banned';
    const action = user.role === 'Banned' ? 'débannir' : 'bannir';

    if (confirm(`Voulez-vous vraiment ${action} ${user.username} ?`)) {
      this.adminService.updateUserRole(user.email, newRole).subscribe({
        next: () => {
          user.role = newRole;
          user.isEditing = false;
          console.log(`✅ Utilisateur ${action} avec succès`);
        },
        error: (error) => {
          console.error(`❌ Erreur lors du ${action}:`, error);
          // Recharger les utilisateurs en cas d'erreur
          this.loadUsers();
        }
      });
    }
  }
}

