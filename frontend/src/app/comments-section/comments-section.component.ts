import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommentFormComponent } from '../comment-form/comment-form.component';
// Models
import { Comment } from '../models/comments.model';
// API
import { CommentsService } from '../../services/comments/comments.service';
import { AuthService } from '../../services/auth/auth.service';
import { NotificationService } from '../../services/notification/notification.service';

/**
 * @component CommentsSectionComponent
 * @brief Displays and handles the logic for product comments and the comment form.
 */
@Component({
  selector: 'app-comments-section',
  standalone: true,
  imports: [CommonModule, CommentFormComponent],
  templateUrl: './comments-section.component.html',
  styleUrls: ['./comments-section.component.css']
})
export class CommentsSectionComponent implements OnInit {
  @Input() productId!: string;  // ID of the product for which to display comments  
  @Input() productSource!: string;  // Source of the product (e.g., "Internal", "External")  
  comments: Comment[] = []; // Array to store fetched comments
  // Pagination info for loading comments
  pagination = {
    currentPage: 1,
    totalPages: 0,
    totalCount: 0,
    pageSize: 10,
    hasNextPage: false
  };
  loading = false;  // Indicates if the component is currently loading data  
  showCommentForm = false;  // Flag to show or hide the comment form  
  canAddComment = false;  // Flag to determine if the user is allowed to add comments

  /**
   * @constructor
   * @param commentService Service for handling comment API calls
   * @param authService Service for authentication and user role
   * @param notifService Service for displaying notifications
   */
  constructor(
    private commentService: CommentsService,
    private authService: AuthService,
    private notifService: NotificationService
  ) { }

  /**
   * @brief Lifecycle hook - called after component initialization.
   * Loads comments and determines if the user can post comments.
   */
  ngOnInit(): void {
    // Réinitialiser la pagination
    this.pagination = {
      currentPage: 1,
      totalCount: 0,
      totalPages: 0,
      pageSize: 10,
      hasNextPage: false
    };

    this.loadComments(false); // ou simplement this.loadComments();
    this.authService.getUserRole().subscribe((role) => {
      if (role) {
        this.canAddComment = ['user', 'admin', 'superadmin'].includes(role.toLowerCase());
      } else {
        this.canAddComment = false;
      }
    });
  }

  /**
   * @brief Loads comments for the current product and updates pagination.
   */
  loadComments(append: boolean = false): void {
    if (!this.productId || !this.productSource) {
      console.error('Product ID or source missing to load comments.');
      return;
    }

    this.loading = true;

    // Load all comments from the API
    this.commentService.getCommentsByProduct(this.productId).subscribe({
      next: (data) => {
        // Convert the new comments
        const allComments = data.map((c: Comment) => ({
          ...c,
          userRatingCom: Number(c.userRatingCom),
        }));

        // Apply frontend pagination
        const start = (this.pagination.currentPage - 1) * this.pagination.pageSize;
        const end = start + this.pagination.pageSize;
        const paginatedComments = allComments.slice(start, end);

        if (append) {
          const existingIds = new Set(this.comments.map(c => c.id));
          const uniqueNewComments = paginatedComments.filter((c: Comment) => !existingIds.has(c.id));

          this.comments = [...this.comments, ...uniqueNewComments];
        } else {
          this.comments = paginatedComments;
        }

        // Update pagination (no need to recalculate totalCount)
        this.pagination.totalCount = allComments.length;
        this.pagination.totalPages = Math.ceil(this.pagination.totalCount / this.pagination.pageSize);
        this.pagination.hasNextPage = this.pagination.currentPage < this.pagination.totalPages;
      },
      error: () => this.notifService.showError('Error loading comments.'),
      complete: () => this.loading = false
    });
  }

  /**
   * @brief Handles the click on "Load More" to load more comments.
   */
  handleLoadMore(): void {
    if (this.pagination.hasNextPage && !this.loading) {
      this.pagination.currentPage++;
      this.loadComments(true); // Passer true pour ajouter les nouveaux commentaires aux existants
    }
  }

  /**
   * @brief Handles the click on the "Add Comment" button.
   * Shows the comment form if the user has permission.
   */
  onAddCommentClick(): void {
    if (!this.canAddComment) {
      this.notifService.showError('Veuillez vous connecter pour commenter.');
    } else {
      this.showCommentForm = true;
    }
  }

  /**
   * @brief Handles the submission of a new comment.
   * Adds the comment to the top of the comment list if successful.
   * 
   * @param comment The newly submitted comment
   */
  onCommentSubmitted(comment: Comment): void {
    this.commentService.postAddComment(comment).subscribe({
      next: () => {
        this.notifService.showSuccess('Commentaire ajouté !');
        this.comments.unshift(comment);
        this.showCommentForm = false;
      },
      error: () => this.notifService.showError('Échec lors de l\'ajout du commentaire.')
    });
  }
}
