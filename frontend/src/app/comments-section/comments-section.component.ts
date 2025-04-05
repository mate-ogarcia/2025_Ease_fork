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
  ) {}

  /**
   * @brief Lifecycle hook - called after component initialization.
   * Loads comments and determines if the user can post comments.
   */
  ngOnInit(): void {
    this.loadComments();
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
  loadComments(): void {
    if (!this.productId || !this.productSource) {
      console.error('Product ID or source missing to load comments.');
      return;
    }

    this.loading = true;
    this.commentService.getCommentsByProduct(this.productId, this.productSource, this.pagination.currentPage).subscribe({
      next: (data) => {
        this.comments.push(...data.comments);
        this.pagination.totalCount = data.pagination.totalCount;
        this.pagination.hasNextPage = data.pagination.hasNextPage;
      },
      error: () => this.notifService.showError('Erreur lors du chargement des commentaires.'),
      complete: () => this.loading = false
    });
  }

  /**
   * @brief Handles the click on "Load More" to load more comments.
   */
  handleLoadMore(): void {
    if (this.pagination.hasNextPage && !this.loading) {
      this.pagination.currentPage++;
      this.loadComments();
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
