import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-info-btn',
  templateUrl: './info-btn.component.html',
  styleUrls: ['./info-btn.component.css']
})
export class InfoBtnComponent {
  /** 
   * @brief State of the "info" button (whether it is active or not).
   * 
   * This property determines whether the info button is in an active state.
   * The default value is `false`, meaning the button is not active.
   */
  @Input() infoActive = false;

  /** 
   * @brief Event emitted whenever the state of the info button changes.
   * 
   * This event is emitted with the updated state (`true` if active, `false` if inactive).
   */
  @Output() infoToggled = new EventEmitter<boolean>();

  /** 
   * @brief Event emitted when the info button is clicked.
   * 
   * This event signals that the info button was clicked, regardless of its state.
   */
  @Output() infoClicked = new EventEmitter<void>();

  /**
   * @brief Toggles the state of the "info" button and emits the new value.
   * 
   * This method inverts the current `infoActive` state and emits the new state using the `infoToggled` event.
   */
  onCheckboxChange(): void {
    this.infoActive = !this.infoActive;
    this.infoToggled.emit(this.infoActive);
  }

  /**
   * @brief Emits an event when the info button is clicked.
   * 
   * This method prevents the default action and stops the event propagation
   * to avoid triggering unintended behaviors. It then emits the `infoClicked` event.
   *
   * @param {Event} event The click event triggered by the user on the info button.
   */
  onInfoClick(event: Event): void {
    // Prevent checkbox change event from being triggered
    event.preventDefault();
    event.stopPropagation();
    this.infoClicked.emit();
  }
}
