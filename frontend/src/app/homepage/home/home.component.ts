import { Component } from '@angular/core';
import { SearchbarComponent } from './comp/searchbar/searchbar.component';
import { DataDisplayComponent } from "../../data-display/data-display.component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [SearchbarComponent, DataDisplayComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  
}
