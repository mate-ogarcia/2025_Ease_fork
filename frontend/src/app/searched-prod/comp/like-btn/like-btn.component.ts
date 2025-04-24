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
   * @brief Inverse l'état du "like" et émet la nouvelle valeur
   */
  onCheckboxChange(): void {
    const oldState = this.liked;
    this.liked = !this.liked;
    this.likeToggled.emit(this.liked);
  }
}
