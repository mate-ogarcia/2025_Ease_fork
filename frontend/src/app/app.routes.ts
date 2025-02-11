import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./homepage/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'category',
    loadComponent: () => import('./category/category.component').then(m => m.CategoryComponent)
  },
  {
    path: 'data-display',
    loadComponent: () => import('./data-display/data-display.component').then(m => m.DataDisplayComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/home'
  }
];
