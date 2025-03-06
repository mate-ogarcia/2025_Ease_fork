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
  requests: any[] = [];         // List of product requests retrieved from the backend.
  selectedRequest: any = null;  // The currently selected product request.
  tagInput: string = '';        //Input field for adding a new tag to the selected request.

  constructor(private adminService: AdminService) { }

  /**
   * @brief Lifecycle hook that runs on component initialization.
   * @details Calls the method to fetch product requests from the backend.
   */
  ngOnInit(): void {
    this.loadProductRequests();
  }

  /**
   * @brief Fetches product requests from the backend.
   * @details Calls the AdminService to retrieve product requests and updates the component state.
   * 
   * @public
   */
  loadProductRequests(): void {
    this.adminService.getAllProductsRequests().subscribe({
      next: (data) => {
        this.requests = data;
      },
      error: (error) => {
        console.error('❌ Error while loading product requests:', error);
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
    this.selectedRequest = request;
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
    if (this.selectedRequest) {
      this.selectedRequest.isEditing = false;
      // TODO: Implement backend update logic
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
      // TODO: Implement logic to revert changes if necessary
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
}
