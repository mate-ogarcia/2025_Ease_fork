import { Component } from '@angular/core';
import { SearchbarComponent } from './comp/searchbar/searchbar.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [SearchbarComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  
}
