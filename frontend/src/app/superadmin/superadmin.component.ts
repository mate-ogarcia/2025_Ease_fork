import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../searched-prod/comp/navbar/navbar.component';
import { SuperAdminDashboardComponent } from './comp/super-admin-dashboard/super-admin-dashboard.component';
import { UsersComponent } from './comp/users/users.component';
import { UsersService } from '../../services/users/users.service';

@Component({
  selector: 'app-superadmin',
  standalone: true,
  imports: [NavbarComponent, CommonModule, SuperAdminDashboardComponent, UsersComponent],
  templateUrl: './superadmin.component.html',
  styleUrl: './superadmin.component.css'
})
export class SuperadminComponent implements OnInit {
  isAuthorized: boolean = false;

  constructor(private usersService: UsersService) { }

  ngOnInit() {
    const userRole = this.usersService.getUserRole()?.toLowerCase();
    this.isAuthorized = userRole === 'superadmin' || userRole === 'admin';
  }
}
