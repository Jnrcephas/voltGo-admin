import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MockDataBannerComponent } from '../shared/mock-data-banner.component';
import { AnalyticsService } from '../core/services/analytics.service';
import { ApiError } from '../core/interceptors/error.interceptor';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, MockDataBannerComponent],
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.css'],
})
export class AnalyticsComponent implements OnInit {
  private readonly analyticsService = inject(AnalyticsService);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  // ---- Executive KPIs: avg delivery time + ETA accuracy come from
  // /admin/analytics/orders, rider utilization from /admin/analytics/riders/utilization.
  // "First-Attempt Success" has no backing endpoint yet and stays as preview data.
  kpis = [
    {
      label: 'Avg Delivery Time',
      value: '—',
      change: '',
      positive: true,
      icon: 'ri-time-line',
      color: 'blue',
    },
    {
      label: 'First-Attempt Success',
      value: '94%',
      change: '+3%',
      positive: true,
      icon: 'ri-checkbox-circle-line',
      color: 'green',
    },
    {
      label: 'Rider Utilization',
      value: '—',
      change: '',
      positive: true,
      icon: 'ri-pulse-line',
      color: 'purple',
    },
    {
      label: 'Avg ETA Accuracy',
      value: '—',
      change: '',
      positive: true,
      icon: 'ri-route-line',
      color: 'orange',
    },
  ];

  // ---- Weekly delivery trend (wired to /admin/analytics/orders) ----
  weeklyTrend: { day: string; value: number }[] = [];

  get maxTrend(): number {
    return this.weeklyTrend.length ? Math.max(...this.weeklyTrend.map((d) => d.value)) : 1;
  }

  // ---- Geographic / zone analysis — no endpoint exists yet, kept as preview ----
  zones = [
    { name: 'Madina', orders: 312, percent: 28 },
    { name: 'East Legon', orders: 248, percent: 22 },
    { name: 'Lapaz', orders: 196, percent: 17 },
    { name: 'Kasoa', orders: 154, percent: 14 },
    { name: 'Adenta', orders: 122, percent: 11 },
    { name: 'Other zones', orders: 88, percent: 8 },
  ];

  // ---- Fleet health — no endpoint exists yet, kept as preview ----
  fleetHealth = {
    avgBattery: 76,
    dueMaintenance: 6,
    totalVehicles: 90,
    avgMileage: '1,240 km',
  };

  // ---- Customer retention (wired to /admin/analytics/customer-retention) ----
  retention: { tier: string; renewalRate: number; churn: number }[] = [];

  // ---- AI performance — no endpoint exists yet, kept as preview ----
  aiPerformance = {
    timeSavedPct: 31,
    distanceSavedPct: 24,
    co2AvoidedKg: 1840,
    avgOptTimeMs: 870,
  };

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);

    this.analyticsService.orders({ days: 7 }).subscribe({
      next: (data) => {
        this.weeklyTrend = data.weeklyTrend.map((p) => ({ day: p.label, value: p.count }));
        if (data.avgDeliveryTimeMinutes) {
          this.kpis[0].value = `${Math.round(data.avgDeliveryTimeMinutes)} min`;
        }
        if (data.avgEtaAccuracyMinutes) {
          this.kpis[3].value = `±${Math.round(data.avgEtaAccuracyMinutes)} min`;
        }
      },
      error: () => {
        /* Non-fatal — weekly trend stays empty. */
      },
    });

    this.analyticsService.ridersUtilization().subscribe({
      next: (rows) => {
        if (rows.length) {
          const avg = rows.reduce((sum, r) => sum + r.utilizationPercent, 0) / rows.length;
          this.kpis[2].value = `${Math.round(avg)}%`;
        }
      },
      error: () => {
        /* Non-fatal — leave KPI placeholder rather than blocking the page. */
      },
    });

    this.analyticsService.customerRetention().subscribe({
      next: (rows) => {
        this.retention = rows.map((r) => ({
          tier: r.tier,
          renewalRate: Math.round(r.renewalRate),
          churn: Math.round(r.churnRate),
        }));
        this.loading.set(false);
      },
      error: (err: unknown) => {
        this.loading.set(false);
        this.error.set(
          err instanceof ApiError ? err.message : 'Failed to load customer retention data.',
        );
      },
    });
  }
}
