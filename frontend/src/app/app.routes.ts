import { Routes } from '@angular/router';
import { AuthGuard } from '../services/auth/auth.guard';

export const routes: Routes = [
  {
    path: 'admin-init',
    loadComponent: () =>
      import('./admin/admin-init/admin-init.component').then((m) => m.AdminInitComponent),
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./admin/admin-dashboard/admin-dashboard.component').then((m) => m.AdminDashboardComponent),
    canActivate: [AuthGuard],
    data: { roles: ['Admin'] },
  },
  {
    path: 'admin/users',
    loadComponent: () =>
      import('./admin/user-management/user-management.component').then((m) => m.UserManagementComponent),
    canActivate: [AuthGuard],
    data: { roles: ['Admin'] },
  },
  {
    path: 'products-alternative/:id/:source',
    loadComponent: () =>
      import('./altprod/altprod.component').then((m) => m.AltprodComponent),
  },
  {
    path: 'superadmin',
    loadComponent: () =>
      import('./superadmin/superadmin.component').then((m) => m.SuperadminComponent),
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
  },
  {
    path: 'user-profile',
    loadComponent: () =>
      import('./userprofile/userprofile.component').then(
        (m) => m.UserprofileComponent
      ),
    canActivate: [AuthGuard],
    data: { roles: ['Admin', 'User'] },
  },
  {
    path: 'add-product',
    loadComponent: () =>
      import('./addproduct/addproduct.component').then(
        (m) => m.AddproductComponent
      ),
    canActivate: [AuthGuard],
    data: { roles: ['Admin', 'User'] },
  },
  {
    path: 'searched-prod',
    loadComponent: () =>
      import('./searched-prod/searched-prod.component').then(
        (m) => m.SearchedProdComponent
      ),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./auth/auth.component').then((m) => m.AuthComponent),
  },
  {
    path: 'contact',
    loadComponent: () =>
      import('./contact/contact.component').then((m) => m.ContactComponent),
  },
  {
    path: 'product-page/:id/:source',
    loadComponent: () => import('./prodpage/prodpage.component').then(m => m.ProdpageComponent)
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
