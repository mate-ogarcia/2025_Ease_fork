// comment-form.component.ts
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-comment-form',
  standalone: true,
  imports: [FormsModule, CommonModule],  // Ajoutez FormsModule aux imports
  templateUrl: './comment-form.component.html',
  styleUrls: ['./comment-form.component.css']
})
export class CommentFormComponent {
  @Output() commentSubmitted = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();
 
  comment = {
    rating: 5,
    text: ''
  };
 
  submitComment() {
    this.commentSubmitted.emit(this.comment);
    this.resetForm();
  }
 
  resetForm() {
    this.comment = {
      rating: 5,
      text: ''
    };
  }
 
  cancelForm() {
    this.cancel.emit();
  }
}