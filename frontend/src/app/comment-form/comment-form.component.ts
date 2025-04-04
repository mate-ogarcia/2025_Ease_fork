// comment-form.component.ts
import { Component, EventEmitter, Output, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
// API
import { AuthService } from '../../services/auth/auth.service';
// Model
import { Comment } from '../models/comments.model';

@Component({
  selector: 'app-comment-form',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './comment-form.component.html',
  styleUrls: ['./comment-form.component.css']
})
export class CommentFormComponent {
  @Output() commentSubmitted = new EventEmitter<Comment>(); // EventEmitter triggered when a comment is submitted 
  @Output() cancel = new EventEmitter<void>();              // EventEmitter triggered when the form is canceled
  @Input() productId: number | undefined;                   // Optional Input for product ID
  @Input() productSource: string | undefined;               // Optional Input for product source
  userInfo: any // User's infos

  constructor (
    private authService: AuthService,
  ) {}
  
  /** Model for the comment data */
  comment: Comment = {
    dateCom: new Date().toISOString().split('T')[0], // Current date in format YYYY-MM-DD
    contentCom: '',
    userRatingCom: 5,
    source: '',
    userId: 0,
    productId: 0 // Will be updated in ngOnInit if productId input is provided
  };

  /**
   * @brief Lifecycle hook that runs when the component is initialized.
   * Updates the productId in the comment object if it's provided as an input.
   * And retrieves user role
   */
  ngOnInit(): void {
    // retrieves user info
    this.userInfo = this.authService.getUserInfo();
    if (this.productId) {
      this.comment.productId = this.productId;
    }
    if (this.productSource) {
      this.comment.source = this.productSource;
    }
  }

  /**
   * @brief Handles the submission of the comment form.
   *
   * This method emits the comment data when the user submits the form and resets the form fields.
   */
  submitComment() {
    this.comment.dateCom = new Date().toISOString().split('T')[0];  // Update the date to current date before submission
    this.comment.userId = this.userInfo.email;    // Set tu current userId automatically

    // Emit the submitted comment to the parent component
    this.commentSubmitted.emit({ ...this.comment });

    // Reset the form fields after submission
    this.resetForm();
  }

  /**
   * @brief Resets the form fields to their initial values.
   *
   * This method is called after a comment is submitted to clear the form.
   */
  resetForm() {
    this.comment = {
      dateCom: new Date().toISOString().split('T')[0],
      contentCom: '',
      userRatingCom: 5,
      source: '',
      userId: this.comment.userId, // Preserve the user ID
      productId: this.comment.productId // Preserve the product ID
    };
  }

  /**
   * @brief Cancels the comment form and emits a cancel event.
   *
   * This method is triggered when the user cancels the comment submission, and it emits a cancel event.
   */
  cancelForm() {
    // Emit a cancel event to the parent component
    this.cancel.emit();
  }
}