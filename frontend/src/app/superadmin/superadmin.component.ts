import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../searched-prod/comp/navbar/navbar.component';
import { SuperAdminDashboardComponent } from './comp/super-admin-dashboard/super-admin-dashboard.component';
@Component({
  selector: 'app-superadmin',
  imports: [NavbarComponent,CommonModule, SuperAdminDashboardComponent],
  templateUrl: './superadmin.component.html',
  styleUrl: './superadmin.component.css'
})
export class SuperadminComponent {
 
}
