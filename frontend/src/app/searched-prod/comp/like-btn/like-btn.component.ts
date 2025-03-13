import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-like-btn',
  templateUrl: './like-btn.component.html',
  styleUrls: ['./like-btn.component.css']
})
export class LikeBtnComponent {
  /** État du "like" (vrai ou faux) */
  @Input() liked = false;
  /** Événement émis à chaque fois que l’état "liked" change */
  @Output() likeToggled = new EventEmitter<boolean>();

  /**
   * @brief Inverse l’état du "like" et émet la nouvelle valeur
   */
  onCheckboxChange(): void {
    this.liked = !this.liked;
    this.likeToggled.emit(this.liked);
  }
}
