import { Component } from '@angular/core';
// Component
import { DisplayResultsComponent } from './comp/display-results/display-results.component';
import { SearchbarComponent } from '../homepage/home/comp/searchbar/searchbar.component';

@Component({
  selector: 'app-searched-prod',
  imports: [
    DisplayResultsComponent,
    SearchbarComponent
  ],
  templateUrl: './searched-prod.component.html',
  styleUrl: './searched-prod.component.css'
})
export class SearchedProdComponent {

}
