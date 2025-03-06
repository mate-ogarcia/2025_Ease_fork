import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';


//comp dashboard
import { StatsComponent } from '../stats/stats.component';
import { ProductRequestsComponent} from '../product-requests/product-requests.component';
import { UsersComponent } from '../users/users.component';
@Component({
  standalone: true,
  selector: 'app-super-admin-dashboard',
  imports: [StatsComponent, ProductRequestsComponent, UsersComponent,CommonModule],
  templateUrl: './super-admin-dashboard.component.html',
  styleUrl: './super-admin-dashboard.component.css'
})
export class SuperAdminDashboardComponent {
  activeTab: string = 'stats';

   // Méthode pour changer d'onglet
   selectTab(tabName: string) {
     this.activeTab = tabName;
   }
}
