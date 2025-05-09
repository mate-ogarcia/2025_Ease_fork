/**
 * @file comments-section.component.ts
 * @brief Component for managing and displaying product comments with pagination.
 *
 * This component displays a list of comments for a given product and supports
 * pagination for loading additional comments. Users with appropriate permissions
 * can submit new comments.
 */

import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Comment } from '../models/comments.model';
import { CommentsService } from '../../services/comments/comments.service';
import { AuthService } from '../../services/auth/auth.service';
import { NotificationService } from '../../services/notification/notification.service';

/**
 * @class CommentsSectionComponent
 * @brief Component class for displaying and managing comments.
 *
 * @note This component handles:
 *   - Comment loading and pagination.
 *   - Display of the comment list.
 *   - Comment form submission and reset.
 *   - User permission checks for adding comments.
 */
@Component({
  selector: 'app-comments-section',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './comments-section.component.html',
  styleUrls: ['./comments-section.component.css'],
})
export class CommentsSectionComponent implements OnInit, OnChanges {
  @Input() productId!: string; // Product ID from parent component
  @Input() productSource!: string; // Product source from parent component
  comments: Comment[] = []; // Array of comments for current product
  loading = false; // Whether component is fetching data
  showCommentForm = false; // Whether to show rating and buttons
  canAddComment = false; // Whether user can add comments
  // Get current user's email for sorting
  currentUserEmail: string = '';
  editingCommentId: string | null = null; // Add this line to track which comment is being edited
  // Object containing pagination-related data and state.
  pagination = {
    currentPage: 1, // Current page index
    totalPages: 0, // Total number of pages
    totalCount: 0, // Total number of comments
    pageSize: 10, // Comments per page
    hasNextPage: false, // Whether another page exists
  };
  /**
   * @brief Model object for a new comment, bound to the form via [(ngModel)].
   *
   * @details
   *   - "id" is omitted so the backend can generate it.
   *   - userId is assigned upon role validation (see ngOnInit).
   */
  comment: Omit<Comment, 'id'> = {
    dateCom: '',
    contentCom: '',
    userRatingCom: 5,
    source: '',
    userId: 0,
    productId: '',
  };

  /**
   * @brief Component constructor.
   *
   * @param commentService Service for communicating with the comments API.
   * @param authService Service for user authentication and role checks.
   * @param notifService Service for displaying success and error notifications.
   */
  constructor(
    private commentService: CommentsService,
    private authService: AuthService,
    private notifService: NotificationService
  ) { }

  /**
   * @brief Lifecycle hook called after the component's initialization.
   *
   * @details
   *   - Resets the pagination object.
   *   - Initializes and loads comments.
   *   - Checks user role to set comment permissions.
   */
  ngOnInit(): void {
    // Reset pagination
    this.pagination = {
      currentPage: 1,
      totalCount: 0,
      totalPages: 0,
      pageSize: 10,
      hasNextPage: false,
    };

    this.resetForm();
    this.loadComments(false);

    // Check user role to enable or disable comments
    this.authService.getUserRole().subscribe((role) => {
      if (role) {
        this.canAddComment = ['user', 'admin', 'superadmin'].includes(
          role.toLowerCase()
        );
        // Get user info from auth service
        const userInfo = this.authService.getUserInfo();
        if (userInfo && this.canAddComment) {
          this.comment.userId = userInfo.email; // Use email as userId
          this.currentUserEmail = userInfo.email;
        }
      } else {
        this.canAddComment = false;
      }
    });
  }

  /**
   * @brief Lifecycle hook called when an input property changes.
   *
   * @param changes An object containing the changed properties.
   *
   * @details If "productId" or "productSource" changes, the form data is reset.
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['productId'] || changes['productSource']) {
      this.resetForm();
    }
  }

  /**
   * @brief Called when the user clicks on the single <input> to add a comment.
   * @details If the user has rights, we show rating & buttons; otherwise, we show an error.
   */
  onAddCommentClick(): void {
    if (!this.canAddComment) {
      this.notifService.showError('Please log in to comment.');
    } else {
      this.showCommentForm = true;
    }
  }

  /**
   * @brief Deletes a comment if the current user is the owner.
   *
   * This method checks if the provided comment ID is valid, retrieves the comment,
   * verifies ownership, and sends a DELETE request via the comment service.
   * Displays appropriate success or error notifications based on the result.
   *
   * @param id The ID of the comment to delete.
   */
  deleteComment(id: string | undefined): void {
    if (!id) {
      this.notifService.showError('Cannot delete comment: Invalid comment ID');
      return;
    }

    // Find the comment to check ownership
    const commentToDelete = this.comments.find((c) => c.id?.toString() === id);
    if (!commentToDelete) {
      this.notifService.showError('Comment not found.');
      return;
    }

    // Check if the current user is the owner of the comment
    if (commentToDelete.userId !== this.currentUserEmail) {
      this.notifService.showError('You can only delete your own comments.');
      return;
    }

    this.commentService.deleteComment(id).subscribe({
      next: () => {
        this.loadComments(false);
        this.notifService.showSuccess('Comment deleted successfully.');
      },
      error: () => {
        this.notifService.showError('Failed to delete comment.');
      },
    });
  }

  /**
   * @brief Prepares a comment for editing if the current user is the owner.
   *
   * This method retrieves the comment to be edited using its ID, verifies that the
   * current user is the owner, pre-fills the comment form with its data, and displays
   * the form for editing.
   *
   * @param id The ID of the comment to edit.
   */
  editComment(id: string | undefined): void {
    if (!id) {
      this.notifService.showError('Cannot edit comment: Invalid comment ID');
      return;
    }

    // Get the comment to edit
    const commentToEdit = this.comments.find((c) => c.id?.toString() === id);
    if (!commentToEdit) {
      this.notifService.showError('Comment not found.');
      return;
    }

    // Check if the current user is the owner of the comment
    if (commentToEdit.userId !== this.currentUserEmail) {
      this.notifService.showError('You can only edit your own comments.');
      return;
    }

    // Set the form values to the comment being edited
    this.comment = {
      dateCom: commentToEdit.dateCom,
      contentCom: commentToEdit.contentCom,
      userRatingCom: commentToEdit.userRatingCom,
      source: commentToEdit.source,
      userId: commentToEdit.userId,
      productId: commentToEdit.productId,
    };

    // Set editing state
    this.editingCommentId = id;
    this.showCommentForm = true;

    // Scroll to the form after a short delay to ensure it's rendered
    setTimeout(() => {
      this.scrollToCommentForm();
    }, 100);
  }

  /**
   * @brief Scrolls to the comment form when it's opened.
   */
  private scrollToCommentForm(): void {
    const formElement = document.querySelector('.comment-input');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Focus the input field
      const inputElement = formElement.querySelector('input');
      if (inputElement) {
        inputElement.focus();
      }
    }
  }

  /**
   * @brief Triggered when the comment form is submitted.
   *
   * @param newComment The comment data without the "id" field.
   *
   * @details Calls the service to add a new comment and updates the comment list on success.
   */
  onCommentSubmitted(newComment: Omit<Comment, 'id'>): void {
    // Build the payload for the API
    const commentPayload = {
      dateCom: newComment.dateCom,
      contentCom: newComment.contentCom,
      userRatingCom: newComment.userRatingCom,
      source: newComment.source,
      userId: newComment.userId,
      productId: this.productId,
    };

    if (this.editingCommentId) {
      // If we're editing an existing comment
      this.commentService
        .editComment(this.editingCommentId, commentPayload)
        .subscribe({
          next: () => {
            this.notifService.showSuccess('Comment updated successfully!');
            this.loadComments(false);
            this.showCommentForm = false;
            this.resetForm();
            this.editingCommentId = null;
          },
          error: (err) => {
            console.error('Error updating comment:', err);
            this.notifService.showError('Failed to update comment.');
          },
        });
    } else {
      // If we're adding a new comment
      this.commentService.postAddComment(commentPayload).subscribe({
        next: () => {
          this.notifService.showSuccess('Comment added!');
          this.pagination.currentPage = 1;
          this.loadComments(false);
          this.showCommentForm = false;
          this.resetForm();
        },
        error: (err) => {
          console.error('Error adding comment:', err);
          this.notifService.showError('Failed to add comment.');
        },
      });
    }
  }

  /**
   * @brief Loads comments from the backend and applies pagination.
   *
   * @param append If true, newly fetched comments are appended to the existing ones;
   *               otherwise, they replace the current list.
   *
   * @details
   *   - Validates the productId and productSource before making the API call.
   *   - Retrieves the entire list of comments, then slices based on pagination.
   *   - Updates pagination fields like totalCount, totalPages, and hasNextPage.
   */
  loadComments(append: boolean = false): void {
    if (!this.productId || !this.productSource) {
      console.error('Product ID or source missing to load comments.');
      return;
    }

    this.loading = true;

    this.commentService.getCommentsByProduct(this.productId).subscribe({
      next: (data: Comment[]) => {
        // Sort comments: user's comments first, then by date (newest first)
        const allComments = data
          .map((c: Comment) => ({
            ...c,
            id: c.id,
            userRatingCom: Number(c.userRatingCom),
          }))
          .sort((a, b) => {
            // First sort by whether it's the user's comment
            if (
              a.userId === this.currentUserEmail &&
              b.userId !== this.currentUserEmail
            )
              return -1;
            if (
              a.userId !== this.currentUserEmail &&
              b.userId === this.currentUserEmail
            )
              return 1;
            // Then sort by date (newest first)
            return (
              new Date(b.dateCom).getTime() - new Date(a.dateCom).getTime()
            );
          });

        // Manual pagination
        const start =
          (this.pagination.currentPage - 1) * this.pagination.pageSize;
        const end = start + this.pagination.pageSize;
        const paginatedComments = allComments.slice(start, end);

        if (append) {
          // Avoid duplicates
          const existingIds = new Set(this.comments.map((c) => c.id));
          const uniqueNewComments = paginatedComments.filter(
            (c) => !existingIds.has(c.id)
          );
          this.comments = [...this.comments, ...uniqueNewComments];
        } else {
          this.comments = paginatedComments;
        }

        // Update pagination info
        this.pagination.totalCount = allComments.length;
        this.pagination.totalPages = Math.ceil(
          this.pagination.totalCount / this.pagination.pageSize
        );
        this.pagination.hasNextPage =
          this.pagination.currentPage < this.pagination.totalPages;
      },
      error: () => {
        this.notifService.showError('Error loading comments.');
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  /**
   * @brief Loads more comments by incrementing the current page index.
   *
   * @details Checks if the next page is available and if the component is not currently loading.
   */
  handleLoadMore(): void {
    if (this.pagination.hasNextPage && !this.loading) {
      this.pagination.currentPage++;
      this.loadComments(true);
    }
  }

  /**
   * @brief Cancels the rating/buttons display and resets the form if desired.
   */
  cancelForm(): void {
    this.showCommentForm = false;
    this.editingCommentId = null;
    this.resetForm();
  }

  /**
   * @brief Resets the comment form to default values.
   *
   * @details
   *   - Sets dateCom to the current ISO string.
   *   - Resets userRatingCom, contentCom, etc. to their defaults.
   */
  resetForm(): void {
    this.comment = {
      dateCom: new Date().toISOString(),
      contentCom: '',
      userRatingCom: 5,
      source: this.productSource,
      userId: this.comment.userId, // Keep the userId if already set
      productId: this.productId,
    };
  }
}
