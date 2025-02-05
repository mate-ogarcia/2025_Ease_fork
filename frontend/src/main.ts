import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router'; // Gère les routes

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),  // Gestion des requêtes HTTP
    provideRouter([]),    // Provider pour `ActivatedRoute`
  ],
});
