import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.css']
})
export class StatsComponent {
  salesOpen = false;
  customerOpen = false;
  productOpen = false;
  revenueOpen = false;
  ordersOpen = false;
  profitOpen = false;
  earningsOpen = false;

  toggleSales(event: Event) {
    event.stopPropagation();
    this.salesOpen = !this.salesOpen;
  }

  toggleCustomer(event: Event) {
    event.stopPropagation();
    this.customerOpen = !this.customerOpen;
  }

  toggleProduct(event: Event) {
    event.stopPropagation();
    this.productOpen = !this.productOpen;
  }

  toggleRevenue(event: Event) {
    event.stopPropagation();
    this.revenueOpen = !this.revenueOpen;
  }

  toggleOrders(event: Event) {
    event.stopPropagation();
    this.ordersOpen = !this.ordersOpen;
  }

  toggleProfit(event: Event) {
    event.stopPropagation();
    this.profitOpen = !this.profitOpen;
  }

  toggleEarnings(event: Event) {
    event.stopPropagation();
    this.earningsOpen = !this.earningsOpen;
  }
}
