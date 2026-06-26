import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { authGuard, guestGuard } from './core/guards/auth.guard';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AnalyticsComponent } from './analytics/analytics.component';
import { FinanceComponent } from './finance/finance.component';
import { BundlesComponent } from './bundles/bundles.component';
import { OrdersComponent } from './orders/orders.component';
import { FleetTrackingComponent } from './fleet-tracking/fleet-tracking.component';
import { DashcamComponent } from './dashcam/dashcam.component';
import { RidersComponent } from './riders/riders.component';
import { KycComponent } from './kyc/kyc.component';
import { VehiclesComponent } from './vehicles/vehicles.component';
import { CustomersComponent } from './customers/customers.component';
import { MessagesComponent } from './messages/messages.component';
import { UserRolesComponent } from './user-roles/user-roles.component';
import { SettingsComponent } from './settings/settings.component';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'change-password',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./auth/change-password/change-password.component').then((m) => m.ChangePasswordComponent),
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'analytics', component: AnalyticsComponent },
      { path: 'finance', component: FinanceComponent },
      { path: 'bundles', component: BundlesComponent },
      { path: 'orders', component: OrdersComponent },
      { path: 'fleet-tracking', component: FleetTrackingComponent },
      { path: 'dashcam', component: DashcamComponent },
      { path: 'riders', component: RidersComponent },
      { path: 'kyc', component: KycComponent },
      { path: 'vehicles', component: VehiclesComponent },
      { path: 'customers', component: CustomersComponent },
      { path: 'messages', component: MessagesComponent },
      { path: 'user-roles', component: UserRolesComponent },
      { path: 'settings', component: SettingsComponent },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
