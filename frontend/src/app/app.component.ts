import { Component } from '@angular/core';
import { DataDisplayComponent } from './data-display/data-display.component';
import { NavbarComponent } from './homepage/navbar/navbar.component';
import { SearchbarComponent } from './homepage/searchbar/searchbar.component';
import { ArticleComponent } from './homepage/article/article.component';

@Component({
  selector: 'app-root',
  standalone: true, // Composant autonome
  imports: [
    DataDisplayComponent,
    NavbarComponent,
    SearchbarComponent,
    ArticleComponent,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'my-angular-app';
}
