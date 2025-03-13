import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';


// Dashboard Comp
import { StatsComponent } from '../stats/stats.component';
import { ProductRequestsComponent } from '../product-requests/product-requests.component';
import { UsersComponent } from '../users/users.component';
import { UsersService } from '../../../../services/users/users.service';

@Component({
  standalone: true,
  selector: 'app-super-admin-dashboard',
  imports: [StatsComponent, ProductRequestsComponent, UsersComponent, CommonModule],
  templateUrl: './super-admin-dashboard.component.html',
  styleUrl: './super-admin-dashboard.component.css'
})
export class SuperAdminDashboardComponent {
  activeTab: string = 'stats';

  // How to change tabs
  selectTab(tabName: string) {
    this.activeTab = tabName;
  }
   isAuthorized: boolean = false;
  
    constructor(private usersService: UsersService) { }
  
    ngOnInit() {
      const userRole = this.usersService.getUserRole()?.toLowerCase();
      this.isAuthorized = userRole === 'superadmin' || userRole === 'admin';
    }
}
