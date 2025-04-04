// comment-form.component.ts
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-comment-form',
  standalone: true,
  imports: [FormsModule, CommonModule],  // Import FormsModule for handling form controls
  templateUrl: './comment-form.component.html',
  styleUrls: ['./comment-form.component.css']
})
export class CommentFormComponent {
  
  /** EventEmitter triggered when a comment is submitted */
  @Output() commentSubmitted = new EventEmitter<any>();
  
  /** EventEmitter triggered when the form is canceled */
  @Output() cancel = new EventEmitter<void>();
  
  /** Model for the comment data */
  // TODO add A real model
  comment = {
    rating: 5,  // Default rating is set to 5
    text: ''    // Initial text is empty
  };
 
  /**
   * @brief Handles the submission of the comment form.
   * 
   * This method emits the comment data when the user submits the form and resets the form fields.
   */
  submitComment() {
    // Emit the submitted comment to the parent component
    this.commentSubmitted.emit(this.comment);
    
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
      rating: 5,  // Reset rating to default value
      text: ''    // Reset text to an empty string
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
