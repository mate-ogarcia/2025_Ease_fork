import { Routes } from '@angular/router';
import { AuthGuard } from '../services/auth.guard';

export const routes: Routes = [
  {
    path: 'products-alternative/:id',
    loadComponent: () =>
      import('./altprod/altprod.component').then((m) => m.AltprodComponent),
    canActivate: [AuthGuard], //  Protégé
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./homepage/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'category',
    loadComponent: () =>
      import('./category/category.component').then((m) => m.CategoryComponent),
    canActivate: [AuthGuard], //  Protégé
  },
  {
    path: 'data-display',
    loadComponent: () =>
      import('./data-display/data-display.component').then(
        (m) => m.DataDisplayComponent
      ),
    canActivate: [AuthGuard], //  Protégé
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: '/home',
  },
];
