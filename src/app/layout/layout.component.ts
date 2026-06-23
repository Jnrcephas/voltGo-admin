import { Component, HostListener, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthStore } from '../core/state/auth.store';
import { PermissionsStore } from '../core/state/permissions.store';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  readonly authStore = inject(AuthStore);
  private readonly permissionsStore = inject(PermissionsStore);

  sidebarOpen = false;
  currentTitle = 'Dashboard';
  readonly userMenuOpen = signal(false);
  readonly loggingOut = signal(false);

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

  constructor() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        const segment = this.router.url.split('/')[1] || 'dashboard';
        this.currentTitle = this.titleMap[segment] || 'Dashboard';
        this.userMenuOpen.set(false);
      });
  }

  ngOnInit(): void {
    // Permissions aren't always pre-loaded (e.g. if the page was refreshed
    // and the session was restored from localStorage rather than a fresh
    // login), so resolve them here too.
    if (!this.permissionsStore.loaded()) {
      this.permissionsStore.loadForCurrentAdmin().subscribe();
    }
  }

  get adminInitial(): string {
    const name = this.authStore.admin()?.full_name ?? 'Admin';
    return name.charAt(0).toUpperCase();
  }

  get adminName(): string {
    return this.authStore.admin()?.full_name ?? 'Admin';
  }

  get adminRoleName(): string {
    const name = this.authStore.admin()?.role?.name ?? 'admin';
    return name
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar() {
    this.sidebarOpen = false;
  }

  toggleUserMenu(event?: Event): void {
    event?.stopPropagation();
    this.userMenuOpen.set(!this.userMenuOpen());
  }

  @HostListener('document:click')
  closeUserMenuOnOutsideClick(): void {
    if (this.userMenuOpen()) this.userMenuOpen.set(false);
  }

  goToChangePassword(): void {
    this.userMenuOpen.set(false);
    this.router.navigate(['/change-password']);
  }

  logout(): void {
    this.loggingOut.set(true);
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => {
        // Even if the network call fails, clear the local session so the
        // admin isn't stuck logged in on a dead token.
        this.authService.logoutLocally();
        this.router.navigate(['/login']);
      },
    });
  }
}
