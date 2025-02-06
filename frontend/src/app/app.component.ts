import { Component } from '@angular/core';
import { DataDisplayComponent } from './data-display/data-display.component';

import { SearchbarComponent } from './homepage/searchbar/searchbar.component';
import { ArticleComponent } from './homepage/article/article.component';

@Component({
  selector: 'app-root',
  standalone: true, // Composant autonome
  imports: [
    DataDisplayComponent,
    SearchbarComponent,
    ArticleComponent,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'Ease-2025';
}
