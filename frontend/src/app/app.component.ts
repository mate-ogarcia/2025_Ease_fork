import { Component } from '@angular/core';
import { NavbarComponent } from './homepage/navbar/navbar.component';
import { SearchbarComponent } from './homepage/searchbar/searchbar.component';
import { ArticleComponent } from './homepage/article/article.component';
@Component({
  selector: 'app-root',
  imports: [NavbarComponent, SearchbarComponent,ArticleComponent], // Import explicite pour utiliser <app-navbar> et <app-searchbar>
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'my-angular-app';
}
