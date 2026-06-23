import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { GhsCurrencyPipe } from '../core/pipes/ghs-currency.pipe';
import { MockDataBannerComponent } from '../shared/mock-data-banner.component';
import { OrderService } from '../core/services/order.service';
import { RiderService } from '../core/services/rider.service';
import { AdminOrder } from '../core/models';
import { ApiError } from '../core/interceptors/error.interceptor';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, GhsCurrencyPipe, MockDataBannerComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  private readonly orderService = inject(OrderService);
  private readonly riderService = inject(RiderService);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly activeRiderCount = signal(0);
  readonly activeOrderCount = signal(0);
  readonly completedTodayCount = signal(0);
  readonly earningsToday = signal(0);
  readonly recentOrders = signal<AdminOrder[]>([]);

  // The leaderboard ("Most Completed Orders Today") and live fleet map have
  // no supporting endpoint yet (no analytics/leaderboard or GPS feed) — kept
  // as illustrative preview content with a visible banner.
  topRiders = [
    { name: 'Eddie Lobanovskiy', email: 'labanovskiy@gmail.com', count: 16, avatar: 'https://i.pravatar.cc/36?img=11' },
    { name: 'Alexey Stave', email: 'alexeyst@gmail.com', count: 10, avatar: 'https://i.pravatar.cc/36?img=12' },
    { name: 'Anton Tkacheve', email: 'tkacheveanton@gmail.com', count: 9, avatar: 'https://i.pravatar.cc/36?img=13' },
    { name: 'Kwesi Boateng', email: 'kwesib@gmail.com', count: 4, avatar: 'https://i.pravatar.cc/36?img=14' },
  ];

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);

    this.riderService.list({ limit: 1, is_active: true, active_status: 'online' }).subscribe({
      next: (data) => this.activeRiderCount.set(data.total),
      error: () => {
        /* Non-fatal — leave at 0 rather than blocking the rest of the dashboard. */
      },
    });

    this.orderService.list({ limit: 10 }).subscribe({
      next: (data) => {
        this.recentOrders.set(data.orders.slice(0, 5));
        this.activeOrderCount.set(
          data.orders.filter((o) => !['delivered', 'cancelled', 'failed'].includes(o.status)).length,
        );

        const today = new Date().toDateString();
        const completedToday = data.orders.filter(
          (o) => o.status === 'delivered' && new Date(o.created_at).toDateString() === today,
        );
        this.completedTodayCount.set(completedToday.length);
        this.earningsToday.set(completedToday.reduce((sum, o) => sum + (o.price || 0), 0));

        this.loading.set(false);
      },
      error: (err: unknown) => {
        this.loading.set(false);
        this.error.set(err instanceof ApiError ? err.message : 'Failed to load dashboard data.');
      },
    });
  }

  statusBadgeClass(status: string): string {
    if (status === 'delivered') return 'badge-completed';
    if (status === 'cancelled' || status === 'failed') return 'badge-cancelled';
    return 'badge-pending';
  }

  statusLabel(status: string): string {
    return status
      .split('_')
      .map((w) => w[0].toUpperCase() + w.slice(1))
      .join(' ');
  }
}
