import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { GhsCurrencyPipe } from '../core/pipes/ghs-currency.pipe';
import { MockDataBannerComponent } from '../shared/mock-data-banner.component';
import { OrderService } from '../core/services/order.service';
import { RiderService } from '../core/services/rider.service';
import { AnalyticsService } from '../core/services/analytics.service';
import { AdminOrder, RiderLeaderboardEntry, RiderLiveLocation } from '../core/models';
import { ApiError } from '../core/interceptors/error.interceptor';
import { GoogleMapsLoaderService } from '../core/services/google-maps-loader.service';

declare const google: any;

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, GhsCurrencyPipe],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit, AfterViewInit {
  private readonly orderService = inject(OrderService);
  private readonly riderService = inject(RiderService);
  private readonly analyticsService = inject(AnalyticsService);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly activeRiderCount = signal(0);
  readonly activeOrderCount = signal(0);
  readonly completedTodayCount = signal(0);
  readonly earningsToday = signal(0);
  readonly recentOrders = signal<AdminOrder[]>([]);

  // ---- Order status donut (wired to /admin/analytics/orders) ----
  // Stroke-dasharray segments out of a 440 circumference circle (r=70).
  readonly donut = signal({ completedPct: 0, pendingPct: 0, cancelledPct: 0 });

  @ViewChild('dashMapContainer') dashMapContainer!: ElementRef;
  private dashMap: any;

  private readonly mapsLoader = inject(GoogleMapsLoaderService);

  // ---- "Most Completed Orders Today" (wired to /admin/analytics/riders/leaderboard) ----
  topRiders: { name: string; email: string; count: number; avatar: string }[] = [];

  private riderLocations: RiderLiveLocation[] = [];

  ngOnInit(): void {
    this.load();
  }

  ngAfterViewInit(): void {
    this.mapsLoader
      .load()
      .then(() => this.initDashMap())
      .catch((err) => console.error('Maps failed to load:', err));
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

    this.analyticsService.orders({ days: 7 }).subscribe({
      next: (data) => {
        const total = data.statusBreakdown.reduce((sum, s) => sum + s.count, 0) || 1;
        const find = (statuses: string[]) =>
          data.statusBreakdown
            .filter((s) => statuses.includes(s.status))
            .reduce((sum, s) => sum + s.count, 0);
        const completed = find(['delivered', 'completed']);
        const cancelled = find(['cancelled', 'failed']);
        const pending = total - completed - cancelled;
        this.donut.set({
          completedPct: Math.round((completed / total) * 100),
          pendingPct: Math.round((pending / total) * 100),
          cancelledPct: Math.round((cancelled / total) * 100),
        });
      },
      error: () => {
        /* Non-fatal — donut chart just stays at 0. */
      },
    });

    this.analyticsService.ridersLeaderboard({ limit: 4 }).subscribe({
      next: (rows: RiderLeaderboardEntry[]) => {
        this.topRiders = rows.map((r) => ({
          name: r.fullName,
          email: r.email ?? '',
          count: r.completedOrders,
          avatar: r.avatarUrl ?? 'https://i.pravatar.cc/36',
        }));
      },
      error: () => {
        /* Non-fatal — leaderboard card just stays empty. */
      },
    });

    this.analyticsService.ridersLocations().subscribe({
      next: (rows) => {
        this.riderLocations = rows;
        this.plotDashMapMarkers();
      },
      error: () => {
        /* Non-fatal — map just stays without live pins. */
      },
    });

    this.orderService.list({ limit: 10 }).subscribe({
      next: (data) => {
        this.recentOrders.set(data.orders.slice(0, 5));
        this.activeOrderCount.set(
          data.orders.filter((o) => !['delivered', 'cancelled', 'failed'].includes(o.status))
            .length,
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

  private initDashMap(): void {
    this.dashMap = new google.maps.Map(this.dashMapContainer.nativeElement, {
      center: { lat: 5.6037, lng: -0.187 },
      zoom: 12,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      styles: [
        { featureType: 'poi', stylers: [{ visibility: 'off' }] },
        { featureType: 'transit', stylers: [{ visibility: 'off' }] },
      ],
    });
    this.plotDashMapMarkers();
  }

  private dashMarkers: any[] = [];

  // Plots live online-rider positions from /admin/analytics/riders/locations.
  // Called once the map is ready, and again whenever fresh location data arrives.
  private plotDashMapMarkers(): void {
    if (!this.dashMap) return;
    this.dashMarkers.forEach((m) => m.setMap(null));
    this.dashMarkers = this.riderLocations.map(
      (r) =>
        new google.maps.Marker({
          position: { lat: r.lat, lng: r.lng },
          map: this.dashMap,
          title: r.fullName,
        }),
    );
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
