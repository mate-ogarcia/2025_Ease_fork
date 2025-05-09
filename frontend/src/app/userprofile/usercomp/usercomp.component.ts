import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HistoryComponent } from './history/history.component';
import { FavoritesComponent } from './favorites/favorites.component';
import { BadgesComponent } from './badges/badges.component';
import { AchivementComponent } from './achivement/achivement.component';
// Services
import { AuthService } from '../../../services/auth/auth.service';
import { NotificationService } from '../../../services/notification/notification.service';

/**
 * @component UsercompComponent
 * @description Component for displaying user content such as favorites and history, depending on authentication status.
 */
@Component({
  selector: 'app-usercomp',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HistoryComponent, FavoritesComponent, BadgesComponent, AchivementComponent],
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

  /** @property {boolean} isEditing - Whether the user is currently editing their profile */
  isEditing: boolean = false;

  /** @property {FormGroup} profileForm - Form for editing user profile information */
  profileForm!: FormGroup;

  /**
   * @constructor
   * @param authService Service to manage authentication
   * @param fb FormBuilder to create reactive forms
   * @param notificationService Service pour afficher des notifications
   */
  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private notificationService: NotificationService
  ) { }

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

    // Initialize form
    this.initProfileForm();
  }

  /**
   * @method initProfileForm
   * @description Initialize the profile edit form with current user data
   */
  initProfileForm(): void {
    this.profileForm = this.fb.group({
      username: [this.userInfo?.username || '', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.minLength(6)]],
      confirmPassword: [''],
      postCode: [this.userInfo?.address?.postCode || ''],
      city: [this.userInfo?.address?.city || ''],
      country: [this.userInfo?.address?.country || '']
    }, { validators: this.passwordMatchValidator });
  }

  /**
   * @method passwordMatchValidator
   * @description Custom validator to check that password and confirm password match
   * @param formGroup The form group to validate
   */
  passwordMatchValidator(formGroup: FormGroup): { mismatch: boolean } | null {
    const passwordControl = formGroup.get('password');
    const confirmPasswordControl = formGroup.get('confirmPassword');

    if (!passwordControl || !confirmPasswordControl) {
      return null;
    }

    if (passwordControl.value === '' && confirmPasswordControl.value === '') {
      // Si les deux champs sont vides, on ne valide pas
      return null;
    }

    return passwordControl.value === confirmPasswordControl.value
      ? null
      : { mismatch: true };
  }

  /**
   * @method toggleEditMode
   * @description Toggles between display and edit mode for the profile
   */
  toggleEditMode(): void {
    this.isEditing = !this.isEditing;

    // If canceling edit, reset the form
    if (!this.isEditing) {
      this.initProfileForm();
    }
  }

  /**
   * @method updateProfile
   * @description Update the user profile with the form values
   */
  updateProfile(): void {
    if (this.profileForm.valid) {
      const formData = this.profileForm.value;

      // Create an update object
      const updateData: {
        username?: string;
        password?: string;
        address?: {
          postCode?: string;
          city?: string;
          country?: string;
        }
      } = {};

      // Only include fields that have values
      if (formData.username) updateData.username = formData.username;
      if (formData.password) updateData.password = formData.password;

      // Update address if any address field is provided
      if (formData.postCode || formData.city || formData.country) {
        updateData.address = {
          postCode: formData.postCode,
          city: formData.city,
          country: formData.country
        };
      }

      // Call the service to update user info
      this.authService.updateUserProfile(updateData).subscribe({
        next: (updatedUser: any) => {
          // Update local user info
          this.userInfo = updatedUser;
          // Exit edit mode
          this.isEditing = false;
          this.notificationService.showSuccess('Profil mis à jour avec succès!');
        },
        error: (error: any) => {
          console.error('Erreur lors de la mise à jour du profil:', error);
          this.notificationService.showError('Erreur lors de la mise à jour du profil. Veuillez réessayer.');
        }
      });
    }
  }

  /**
   * @method hasAddress
   * @description Check if the user has any address information
   */
  hasAddress(): boolean {
    return !!(
      this.userInfo?.address?.postCode ||
      this.userInfo?.address?.city ||
      this.userInfo?.address?.country
    );
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
      this.notificationService.showInfo(`Fichier "${file.name}" téléchargé avec succès!`);
    }
  }
}
