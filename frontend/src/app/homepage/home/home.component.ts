import { Component } from '@angular/core';
import { SearchbarComponent } from './comp/searchbar/searchbar.component';
import { ArticleComponent } from './comp/article/article.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [SearchbarComponent, ArticleComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  
}
