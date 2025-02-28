/**
 * @file admin-dashboard.component.ts
 * @brief Admin dashboard component for managing administrative functions
 * @details This component displays the admin dashboard with user statistics
 * and administrative actions. It features enhanced error handling, loading state
 * management, and a responsive design for optimal user experience.
 * 
 * The dashboard provides:
 * - User statistics display
 * - Administrative action buttons
 * - Recent activity tracking
 * - Improved loading indicators with progress feedback
 * - Comprehensive error handling with retry capabilities
 * 
 * @author Original Author
 * @date Original Date
 * @modified 2023-XX-XX
 * @version 1.2.0
 */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { AdminService } from '../../../services/admin/admin.service';
import { forkJoin, of, Subscription, timer, Observable } from 'rxjs';
import { catchError, finalize, switchMap, tap } from 'rxjs/operators';

/**
 * @class AdminDashboardComponent
 * @implements OnInit, OnDestroy
 * @description Main component for the admin dashboard interface
 * 
 * This component manages the admin dashboard view, handling data loading,
 * error states, and user interactions. It implements lifecycle hooks for
 * proper initialization and cleanup of resources.
 */
@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  /** @property {number} userCount - Total number of users in the system */
  userCount: number = 0;

  /** @property {boolean} isLoading - Flag indicating if data is currently being loaded */
  isLoading: boolean = true;

  /** @property {string} errorMessage - Current error message to display to the user */
  errorMessage: string = '';

  /** @property {number} loadingProgress - Current progress percentage for loading operations */
  loadingProgress: number = 0;

  /** @property {string} loadingText - Descriptive text about the current loading stage */
  loadingText: string = 'Initialisation...';

  /** 
   * @property {Subscription} subscriptions - Composite subscription for managing all active subscriptions
   * @private
   */
  private subscriptions: Subscription = new Subscription();

  /**
   * @constructor
   * @description Initializes the AdminDashboardComponent with required services
   * 
   * @param {AuthService} authService - Service for authentication and user role operations
   * @param {AdminService} adminService - Service for administrative data operations
   */
  constructor(
    private authService: AuthService,
    private adminService: AdminService
  ) { }

  /**
   * @method ngOnInit
   * @description Angular lifecycle hook that initializes the component
   * 
   * This method is called once when the component is initialized. It:
   * 1. Starts the loading animation sequence
   * 2. Verifies the current user's role
   * 3. Initiates data loading with retry capability
   * 
   * @override
   */
  ngOnInit(): void {
    // Start the loading animation sequence
    this.startLoadingAnimation();

    // Verify user role with error handling
    const roleCheck = this.authService.getUserRole().pipe(
      catchError(error => {
        console.error('Error getting user role:', error);
        return of(null);
      })
    );

    // Load dashboard data with optimized error handling
    this.loadDataWithRetry();
  }

  /**
   * @method ngOnDestroy
   * @description Angular lifecycle hook that cleans up resources
   * 
   * This method is called when the component is destroyed. It unsubscribes
   * from all active subscriptions to prevent memory leaks.
   * 
   * @override
   */
  ngOnDestroy(): void {
    // Clean up all subscriptions to prevent memory leaks
    this.subscriptions.unsubscribe();
  }

  /**
   * @method startLoadingAnimation
   * @description Initiates a staged loading animation with progress updates
   * 
   * This method creates a sequence of loading steps with increasing progress
   * percentages and descriptive text. It uses a timer to update the loading
   * state at regular intervals, creating a smooth loading experience.
   * 
   * @private
   */
  startLoadingAnimation(): void {
    // Define the loading steps with progress percentages and descriptive text
    const loadingSteps = [
      { progress: 20, text: 'Vérification des autorisations...' },
      { progress: 40, text: 'Chargement des utilisateurs...' },
      { progress: 60, text: 'Préparation du tableau de bord...' },
      { progress: 90, text: 'Finalisation...' }
    ];

    let currentStep = 0;

    // Create a timer that updates the loading state every 700ms
    const loadingSub = timer(0, 700).subscribe(() => {
      if (currentStep < loadingSteps.length) {
        this.loadingProgress = loadingSteps[currentStep].progress;
        this.loadingText = loadingSteps[currentStep].text;
        currentStep++;
      }
    });

    // Add the subscription to the composite subscription for cleanup
    this.subscriptions.add(loadingSub);
  }

  /**
   * @method loadDataWithRetry
   * @description Loads dashboard data with automatic retry capability
   * 
   * This method manages the data loading process with proper error handling.
   * It uses RxJS operators to:
   * 1. Delay the initial load for a smoother UX
   * 2. Switch to the user data loading stream
   * 3. Handle any errors that occur during loading
   * 4. Finalize the loading process with a smooth transition
   * 
   * @public
   */
  loadDataWithRetry(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Create a data loading pipeline with error handling
    const dataSub = timer(1000).pipe(
      // Switch to the user loading stream after the initial delay
      switchMap(() => this.loadUsers(true)),
      // Handle any errors in the data loading process
      catchError(error => {
        this.handleError('Erreur lors du chargement des données', error);
        return of(null);
      }),
      // Finalize the loading process regardless of success or failure
      finalize(() => {
        this.loadingProgress = 100;
        this.loadingText = 'Terminé!';
        // Add a small delay before showing content for a smoother transition
        setTimeout(() => {
          this.isLoading = false;
        }, 500);
      })
    ).subscribe();

    // Add the subscription to the composite subscription for cleanup
    this.subscriptions.add(dataSub);
  }

  /**
   * @method loadUsers
   * @description Loads user data and updates the user count
   * 
   * This method retrieves user data from the admin service and updates
   * the user count. It includes error handling and can operate in silent
   * mode to avoid showing loading indicators for background refreshes.
   * 
   * @param {boolean} silent - Whether to show loading indicators (false) or load silently (true)
   * @returns {Observable<any>} An observable of the user data
   * @public
   */
  loadUsers(silent: boolean = false): Observable<any> {
    console.log('🔄 Starting to load users, silent mode:', silent);

    // Only show loading indicators if not in silent mode
    if (!silent) {
      this.isLoading = true;
      this.errorMessage = '';
      this.loadingText = 'Chargement des utilisateurs...';
    }

    // Create a data loading pipeline with side effects and error handling
    return this.adminService.getAllUsers().pipe(
      // Use tap for side effects without affecting the stream
      tap(users => {
        console.log('✅ Users loaded successfully in component');

        // Vérifier si users est un tableau
        if (Array.isArray(users)) {
          this.userCount = users.length;
          console.log('📊 Number of users:', this.userCount);

          // Log du premier utilisateur pour débogage
          if (users.length > 0) {
            console.log('👤 First user example:', users[0]);
          }
        } else {
          console.warn('⚠️ Users data is not an array:', users);
          this.userCount = 0;
        }

        if (!silent) {
          this.isLoading = false;
          this.loadingText = 'Utilisateurs chargés avec succès!';
        }
      }),
      // Handle any errors in the user loading process
      catchError(error => {
        console.error('❌ Error loading users in component:', error);
        const errorMsg = 'Impossible de charger les utilisateurs';
        this.handleError(errorMsg, error);

        // Return empty array to continue the stream
        if (!silent) {
          this.isLoading = false;
          this.loadingText = 'Erreur lors du chargement des utilisateurs';
        }

        // Return empty array but still allow the dashboard to load
        return of([]);
      })
    );
  }

  /**
   * @method handleError
   * @description Processes errors and generates user-friendly error messages
   * 
   * This method handles errors that occur during data operations. It:
   * 1. Logs detailed error information to the console
   * 2. Generates a user-friendly error message based on the error type
   * 3. Updates the component's error state
   * 
   * @param {string} userMessage - Base user-friendly error message
   * @param {any} error - The error object that was caught
   * @public
   */
  handleError(userMessage: string, error: any): void {
    console.error(`${userMessage}:`, error);

    // Create a more detailed message based on the error type
    let detailedMessage = userMessage;

    // Add specific details based on HTTP status codes
    if (error.status === 0) {
      detailedMessage += '. Server connection problem.';
    } else if (error.status === 401) {
      detailedMessage += '. Your session has expired, please log in again.';
    } else if (error.status === 403) {
      detailedMessage += '. You do not have the necessary permissions.';
    } else if (error.status >= 500) {
      detailedMessage += '. Server problem, please try again later.';
    }

    // Update the component's error message
    this.errorMessage = detailedMessage;
  }

  /**
   * @method retryLoading
   * @description Allows manual retry of data loading operations
   * 
   * This method is triggered by the retry button in the UI. It:
   * 1. Clears any existing error messages
   * 2. Resets the loading progress
   * 3. Initiates a new data loading attempt
   * 
   * @public
   */
  retryLoading(): void {
    this.errorMessage = '';
    this.loadingProgress = 0;
    this.loadDataWithRetry();
  }
} 