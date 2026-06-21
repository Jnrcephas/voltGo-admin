import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent {

  sidebarOpen = false;
  currentTitle = 'Dashboard';

  private titleMap: Record<string, string> = {
    'dashboard': 'Dashboard',
    'analytics': 'Analytics',
    'finance': 'Finance',
    'bundles': 'Bundles',
    'orders': 'Orders',
    'fleet-tracking': 'Fleet Tracking',
    'dashcam': 'Dashcam Monitor',
    'riders': 'Riders',
    'kyc': 'KYC Submissions',
    'vehicles': 'Vehicles',
    'customers': 'Customers',
    'messages': 'Messages',
    'user-roles': 'User Roles',
    'settings': 'Settings',
  };

  constructor(private router: Router) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        const segment = this.router.url.split('/')[1] || 'dashboard';
        this.currentTitle = this.titleMap[segment] || 'Dashboard';
      });
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar() {
    this.sidebarOpen = false;
  }
}