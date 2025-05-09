import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-like-btn',
  templateUrl: './like-btn.component.html',
  styleUrls: ['./like-btn.component.css']
})
export class LikeBtnComponent {
  @Input() liked = false;
  @Output() likeToggled = new EventEmitter<boolean>();

  /**
   * @brief Toggles the "like" state and emits the new value
   */
  onCheckboxChange(): void {
    const oldState = this.liked;
    this.liked = !this.liked;
    this.likeToggled.emit(this.liked);
  }
}
