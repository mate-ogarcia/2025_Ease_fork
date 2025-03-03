import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-users',
  imports: [CommonModule,FormsModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent {
   // Terme de recherche
   searchTerm: string = '';

   // Liste d'utilisateurs en dur avec un flag pour l'édition du rôle
   users = [
     { id: 1, name: 'Alice Dupont', email: 'alice@example.com', role: 'Admin', isEditing: false },
     { id: 2, name: 'Bob Martin', email: 'bob@example.com', role: 'User', isEditing: false },
     { id: 3, name: 'Charlie Smith', email: 'charlie@example.com', role: 'User', isEditing: false },
     { id: 4, name: 'Diane Durand', email: 'diane@example.com', role: 'Moderator', isEditing: false }
   ];
 
   // Liste filtrée en fonction du terme de recherche
   get filteredUsers() {
     if (!this.searchTerm.trim()) {
       return this.users;
     }
     const term = this.searchTerm.toLowerCase();
     return this.users.filter(
       user =>
         user.name.toLowerCase().includes(term) ||
         user.email.toLowerCase().includes(term)
     );
   }
 
   // Active le mode édition pour le rôle d'un utilisateur
   editRole(user: any): void {
     user.isEditing = true;
   }
 
   // Sauvegarde le nouveau rôle et désactive le mode édition
   saveRole(user: any, newRole: string): void {
     user.role = newRole;
     user.isEditing = false;
   }
 
   // Annule l'édition du rôle
   cancelEdit(user: any): void {
     user.isEditing = false;
   }
 
   // Supprime l'utilisateur après confirmation
   deleteUser(user: any): void {
     if (confirm(`Voulez-vous vraiment supprimer ${user.name} ?`)) {
       this.users = this.users.filter(u => u.id !== user.id);
     }
   }
 
   // Bascule entre bannir et débannir l'utilisateur avec validation
   banUser(user: any): void {
     if (user.role !== 'Banned') {
       if (confirm(`Voulez-vous vraiment bannir ${user.name} ?`)) {
         user.role = 'Banned';
         user.isEditing = false;
       }
     } else {
       if (confirm(`Voulez-vous vraiment débannir ${user.name} ?`)) {
         user.role = 'User';
         user.isEditing = false;
       }
     }
   }
}

