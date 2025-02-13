/**
 * @file data-display.component.ts
 * @brief Component for displaying and sending data to the backend.
 * 
 * This component retrieves data from the backend, displays it, and allows
 * the user to add new items by sending them via an API request.
 */

// TODO Delete this component

import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-data-display',
  imports: [FormsModule],
  standalone: true,
  templateUrl: './data-display.component.html',
  styleUrls: ['./data-display.component.css'],
})
export class DataDisplayComponent {
  data: any[] = []; // Array to store retrieved data
  newItem = { id: '', name: '' }; // Model for form input

  constructor(private apiService: ApiService) {}

  /**
   * @brief Retrieves data from the backend and updates the data array.
   * 
   * This method is executed when the component initializes (`ngOnInit`).
   * It makes a GET request to the backend via `ApiService.getData()`
   * and updates `this.data` with the received values.
   * 
   * @returns {void} Updates `this.data` with backend data.
   */
  ngOnInit() {
    // this.apiService.getData().subscribe({
    //   next: (response) => {
    //     this.data = response;
    //   },
    //   error: (error) => {
    //     console.error('❌ Error retrieving data:', error);
    //   },
    // });
  }

  /**
   * @brief Sends new data to the backend via an HTTP POST request.
   * 
   * This method uses `ApiService.sendData()` to send `newItem` to the backend.
   * If the request is successful, the new data is added to `this.data`,
   * and the form is reset.
   * 
   * @returns {void} Updates `this.data` with the new entry.
   */
  sendData() {
    // this.apiService.sendData(this.newItem).subscribe({
    //   next: (response) => {
    //     console.log('✅ Data successfully sent:', response);
    //     this.data.push(this.newItem);
    //     this.newItem = { id: '', name: '' };
    //   },
    //   error: (error) => {
    //     console.error('❌ Error sending data:', error);
    //   },
    // });
  }
}
