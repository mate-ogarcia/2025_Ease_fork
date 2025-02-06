import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router'; // Importer le Router

@Component({
  selector: 'app-navbar',
  imports: [RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
  standalone: true, // Déclare le composant comme standalone
})
export class NavbarComponent {
  menuOpen = false;

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }
  constructor(private router: Router) {} // Injecter le service Router

  goToAbout() {
    this.router.navigate(['/home']); // Naviguer vers la page About
  }
}
