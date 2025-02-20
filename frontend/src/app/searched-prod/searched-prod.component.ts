import { Component } from '@angular/core';
// Component
import { DisplayResultsComponent } from './comp/display-results/display-results.component';
import { SearchbarComponent } from '../homepage/home/comp/searchbar/searchbar.component';
import { NavbarComponent } from '../homepage/home/comp/navbar/navbar.component';

@Component({
  selector: 'app-searched-prod',
  imports: [
    DisplayResultsComponent,
    NavbarComponent,
    SearchbarComponent
  ],
  templateUrl: './searched-prod.component.html',
  styleUrl: './searched-prod.component.css'
})
export class SearchedProdComponent {

}
