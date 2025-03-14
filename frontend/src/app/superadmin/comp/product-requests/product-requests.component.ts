/**
 * @file product-requests.component.ts
 * @brief Component for managing product requests.
 * @details This component displays user-submitted product requests and allows 
 * administrators to view, edit, and manage these requests.
 * 
 * Key features:
 * - Fetch product requests from the backend.
 * - Select and view product request details.
 * - Edit and update product request information.
 * - Add and remove tags from product requests.
 * 
 * @author Original Author
 * @date Original Date
 * @modified 2023-XX-XX
 * @version 1.0.0
 */

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// API Service
import { AdminService } from '../../../../services/admin/admin.service';

@Component({
  selector: 'app-product-requests',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-requests.component.html',
  styleUrls: ['./product-requests.component.css']
})

/**
 * @class ProductRequestsComponent
 * @brief Component responsible for handling product requests.
 * 
 * This component allows administrators to review, edit, and manage 
 * product requests submitted by users.
 */
export class ProductRequestsComponent implements OnInit {
  productRequests: any[] = [];  // List of product requests retrieved from the backend.
  brandRequests: any[] = [];    // List of brands requests retrieved from the backend.
  selectedRequest: any = null;  // The currently selected product request.
  tagInput: string = '';        // Input field for adding a new tag to the selected request.

  // Indicateurs de chargement
  isLoadingRequests: boolean = false;
  isSavingRequest: boolean = false;

  constructor(private adminService: AdminService) { }

  /**
   * @brief Lifecycle hook that runs on component initialization.
   * @details Calls the method to fetch product requests from the backend.
   */
  ngOnInit(): void {
    this.loadProductRequests();
  }

  /**
   * @brief Fetches product and brand requests from the backend.
   * 
   * @details This method calls the `AdminService.getAllRequests()` to retrieve 
   * pending requests and categorizes them into products and brands. It updates 
   * the component state by filtering requests based on their status and assigns 
   * them a specific type (`'product'` or `'brand'`).
   * 
   * @public
   */
  loadProductRequests(): void {
    this.isLoadingRequests = true;
    this.adminService.getAllRequests().subscribe({
      next: (data) => {
        // Extract product requests
        this.productRequests = data
          .filter(item => item.status === "add-product")  // Identifies products
          .map(req => ({ ...req, type: 'product' }));     // Assigns the type

        // Extract brand requests
        this.brandRequests = data
          .filter(item => item.status === "add-brand")  // Identifies brands
          .map(req => ({ ...req, type: 'brand' }));     // Assigns the type

        this.isLoadingRequests = false;
      },
      error: (error) => {
        console.error('❌ Error while loading requests:', error);
        this.isLoadingRequests = false;
      }
    });
  }

  /**
   * @brief Selects a product request and displays its details.
   * 
   * @param {any} request - The product request object to select.
   * @public
   */
  selectRequest(request: any): void {
    this.selectedRequest = { ...request, isEditing: false };
    // Ensure tags is an array
    if (!this.selectedRequest.tags) {
      this.selectedRequest.tags = [];
    }
  }

  /**
   * @brief Enables edit mode for the selected product request.
   * @details Allows administrators to modify request details.
   * 
   * @public
   */
  editRequest(): void {
    if (this.selectedRequest) {
      this.selectedRequest.isEditing = true;
    }
  }

  /**
   * @brief Saves modifications and exits edit mode.
   * @details This method should be extended to send updated data to the backend.
   * 
   * @public
   */
  saveRequest(): void {
    if (this.selectedRequest && this.selectedRequest.isEditing) {
      this.isSavingRequest = true;

      // Simulate API call with setTimeout
      setTimeout(() => {
        console.log('✅ Request saved:', this.selectedRequest);
        this.selectedRequest.isEditing = false;
        this.isSavingRequest = false;
      }, 1000);
    }
  }

  /**
   * @brief Cancels editing mode and restores original values.
   * 
   * @public
   */
  cancelEdit(): void {
    if (this.selectedRequest) {
      this.selectedRequest.isEditing = false;
    }
  }

  /**
   * @brief Adds a tag to the selected product request when the Enter key is pressed.
   * 
   * @param {KeyboardEvent} event - The keyboard event triggered on key press.
   * @public
   */
  addTag(event: KeyboardEvent): void {
    if (event.key === 'Enter' && this.selectedRequest) {
      event.preventDefault();
      const trimmedTag = this.tagInput.trim();
      if (
        trimmedTag &&
        !this.selectedRequest.tags.includes(trimmedTag) &&
        this.selectedRequest.tags.length < 10
      ) {
        this.selectedRequest.tags.push(trimmedTag);
      } else {
        window.alert('Tag already exists or maximum number of tags reached');
      }
      this.tagInput = '';
    }
  }

  /**
   * @brief Removes a tag from the selected product request.
   * 
   * @param {string} tag - The tag to be removed.
   * @public
   */
  removeTag(tag: string): void {
    if (this.selectedRequest) {
      this.selectedRequest.tags = this.selectedRequest.tags.filter((t: string) => t !== tag);
    }
  }

  /**
   * @brief Updates the status of a selected request (product or brand).
   * 
   * @details Calls `updateEntity` in `AdminService` to update the status of a selected 
   * request. The function ensures the request type and ID are available before proceeding. 
   * If needed, additional fields can be updated alongside the status.
   * 
   * @param {any} selectedRequest - The selected request object (product or brand).
   * @param {string} status - The new status to be assigned (e.g., "Validated", "Rejected").
   * 
   * @returns {Promise<void>} - Resolves when the update process is completed.
   * 
   * @throws {Error} If an error occurs during the status update process.
   */
  async validateRequest(selectedRequest: any, status: string): Promise<void> {
    try {
      /**
       * Calling `updateEntity` with:
       * - `selectedRequest.id`: Extracts the unique entity ID.
       * - `{ status }`: Constructs an object `{ status: "Approved" }` to update only the status field.
       * 
       *  Final format of the data sent:
       * ```json
       * {
       *   "entityId": "some-entity-id",
       *   "status": "Approved"
       * }
       * ```
       * 
       * If needed, you can update multiple fields:
       * - `selectedRequest.id`: Extracts the unique entity ID.
       * - `{ status, name }`: Constructs an object to update both the status and the entity name.
       * 
       *  Final format of the data sent (when updating multiple fields):
       * ```json
       * {
       *   "entityId": "some-entity-id",
       *   "status": "Approved",
       *   "name": "New Entity Name"
       * }
       * ```
       */
      // Update entity status in the database
      const response = await this.adminService.updateEntity(
        selectedRequest.type,
        selectedRequest.id,
        { status }
      );

      console.log(`Status successfully updated:`, response);
    } catch (error) {
      console.error("❌ Error updating status:", error);
    }
  }

}
