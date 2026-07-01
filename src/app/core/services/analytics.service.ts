import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api.constants';
import {
  BundleTierRetention,
  CustomerRetentionParams,
  FinanceAnalytics,
  FinanceAnalyticsParams,
  OrdersAnalytics,
  OrdersAnalyticsParams,
  RiderLeaderboardEntry,
  RiderLiveLocation,
  RidersLeaderboardParams,
  RiderUtilizationEntry,
  RiderUtilizationParams,
} from '../models';
import { AppConfigService } from './app-config.service';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(AppConfigService);

  private get baseUrl(): string {
    return this.config.apiBaseUrl;
  }

  /** GET /admin/analytics/finance */
  finance(params: FinanceAnalyticsParams = {}): Observable<FinanceAnalytics> {
    let httpParams = new HttpParams();
    if (params.days) httpParams = httpParams.set('days', params.days);

    return this.http
      .get<any>(`${this.baseUrl}${API_ENDPOINTS.adminAnalytics.finance}`, { params: httpParams })
      .pipe(
        map((res) => {
          const d = res.data ?? res;

          // Chart: backend key is "chart", amount key is "total_ghs"
          const chartRaw = d.chart ?? d.revenueChart ?? d.revenue_chart ?? [];
          // Payment methods: backend key is "by_method", percent key is "pct"
          const splitRaw = d.by_method ?? d.paymentMethodBreakdown ?? d.payment_method_breakdown ?? d.payment_methods ?? [];
          const summary = d.summary ?? d;

          return {
            revenueChart: chartRaw.map((p: any) => ({
              label: p.label ?? p.day ?? p.date ?? '',
              amount: parseFloat(p.total_ghs ?? p.amount ?? p.value ?? p.revenue ?? '0'),
            })),
            paymentMethodBreakdown: splitRaw.map((p: any) => ({
              method: p.method ?? p.name ?? p.provider ?? 'Other',
              percent: parseFloat(p.pct ?? p.percent ?? p.percentage ?? '0'),
              amount: p.total_ghs !== undefined ? parseFloat(p.total_ghs) : p.amount !== undefined ? parseFloat(p.amount) : undefined,
            })),
            totalRevenue: parseFloat(summary.revenue_ghs ?? summary.totalRevenue ?? summary.total_revenue ?? '0'),
            totalTransactions: parseInt(summary.successful ?? summary.totalTransactions ?? summary.total_transactions ?? '0', 10),
            avgTransactionValue: parseFloat(summary.avgTransactionValue ?? summary.avg_transaction_value ?? '0'),
          } as FinanceAnalytics;
        }),
      );
  }

  /** GET /admin/analytics/orders */
  orders(params: OrdersAnalyticsParams = {}): Observable<OrdersAnalytics> {
    let httpParams = new HttpParams();
    if (params.days) httpParams = httpParams.set('days', params.days);

    return this.http
      .get<any>(`${this.baseUrl}${API_ENDPOINTS.adminAnalytics.orders}`, { params: httpParams })
      .pipe(
        map((res) => {
          const d = res.data ?? res;

          // Backend returns donut as object {completed, pending, cancelled} OR array
          const donutRaw = d.donut ?? d.statusBreakdown ?? d.status_counts;
          let statusBreakdown: { status: string; count: number }[] = [];
          if (Array.isArray(donutRaw)) {
            statusBreakdown = donutRaw.map((p: any) => ({
              status: p.status ?? p.label ?? '',
              count: parseInt(p.count ?? p.value ?? '0', 10),
            }));
          } else if (donutRaw && typeof donutRaw === 'object') {
            // {completed: 20, pending: 0, cancelled: 28}
            statusBreakdown = Object.entries(donutRaw).map(([status, count]) => ({
              status,
              count: parseInt(String(count), 10),
            }));
          }

          // Backend key is "chart" for weekly trend
          const trendRaw = d.chart ?? d.weeklyTrend ?? d.weekly_trend ?? d.trend ?? [];

          return {
            statusBreakdown,
            weeklyTrend: trendRaw.map((p: any) => ({
              label: p.label ?? p.day ?? p.date ?? '',
              count: parseInt(p.count ?? p.value ?? '0', 10),
            })),
            // Backend: avg_delivery_mins / avg_eta_error_mins
            avgDeliveryTimeMinutes: parseFloat(
              d.avg_delivery_mins ?? d.avgDeliveryTimeMinutes ?? d.avg_delivery_time_minutes ?? '0',
            ),
            avgEtaAccuracyMinutes: parseFloat(
              d.avg_eta_error_mins ?? d.avgEtaAccuracyMinutes ?? d.avg_eta_accuracy_minutes ?? '0',
            ),
          } as OrdersAnalytics;
        }),
      );
  }

  /** GET /admin/analytics/riders/leaderboard */
  ridersLeaderboard(params: RidersLeaderboardParams = {}): Observable<RiderLeaderboardEntry[]> {
    let httpParams = new HttpParams();
    if (params.limit) httpParams = httpParams.set('limit', params.limit);

    return this.http
      .get<any>(`${this.baseUrl}${API_ENDPOINTS.adminAnalytics.ridersLeaderboard}`, { params: httpParams })
      .pipe(
        map((res) => {
          const d = res.data ?? res;
          const rows = d.leaderboard ?? d.riders ?? d.items ?? d ?? [];
          return (Array.isArray(rows) ? rows : []).map((r: any) => ({
            riderId: r.riderId ?? r.rider_id ?? r.id,
            fullName: r.fullName ?? r.full_name ?? r.name ?? '—',
            avatarUrl: r.avatarUrl ?? r.avatar_url,
            email: r.email,
            completedOrders: parseInt(
              r.completedOrders ?? r.completed_orders ?? r.count ?? r.deliveries ?? '0',
              10,
            ),
          })) as RiderLeaderboardEntry[];
        }),
      );
  }

  /** GET /admin/analytics/riders/locations */
  ridersLocations(): Observable<RiderLiveLocation[]> {
    return this.http
      .get<any>(`${this.baseUrl}${API_ENDPOINTS.adminAnalytics.ridersLocations}`)
      .pipe(
        map((res) => {
          const d = res.data ?? res;
          const rows = d.riders ?? d.locations ?? d.items ?? d ?? [];
          return (Array.isArray(rows) ? rows : [])
            .map((r: any) => ({
              riderId: r.riderId ?? r.rider_id ?? r.id,
              fullName: r.fullName ?? r.full_name ?? r.name ?? '—',
              avatarUrl: r.avatarUrl ?? r.avatar_url,
              vehicleType: r.vehicleType ?? r.vehicle_type,
              lat: parseFloat(r.lat ?? r.latitude ?? r.current_lat ?? '0'),
              lng: parseFloat(r.lng ?? r.lon ?? r.longitude ?? r.current_lng ?? '0'),
              lastUpdatedAt: r.lastUpdatedAt ?? r.last_updated_at ?? r.updated_at,
            }))
            .filter((r: RiderLiveLocation) => r.lat !== 0 && r.lng !== 0);
        }),
      );
  }

  /** GET /admin/analytics/riders/utilization */
  ridersUtilization(params: RiderUtilizationParams = {}): Observable<RiderUtilizationEntry[]> {
    let httpParams = new HttpParams();
    if (params.date) httpParams = httpParams.set('date', params.date);
    if (params.shift_hours) httpParams = httpParams.set('shift_hours', params.shift_hours);

    return this.http
      .get<any>(`${this.baseUrl}${API_ENDPOINTS.adminAnalytics.ridersUtilization}`, { params: httpParams })
      .pipe(
        map((res) => {
          const d = res.data ?? res;
          const rows = d.riders ?? d.items ?? d ?? [];
          return (Array.isArray(rows) ? rows : []).map((r: any) => ({
            riderId: r.riderId ?? r.rider_id ?? r.id,
            fullName: r.fullName ?? r.full_name ?? r.name ?? '—',
            onlineMinutes: parseFloat(r.onlineMinutes ?? r.online_minutes ?? '0'),
            activeMinutes: parseFloat(r.activeMinutes ?? r.active_minutes ?? '0'),
            utilizationPercent: parseFloat(
              r.utilizationPercent ?? r.utilization_percent ?? r.utilization ?? '0',
            ),
          })) as RiderUtilizationEntry[];
        }),
      );
  }

  /** GET /admin/analytics/customer-retention */
  customerRetention(params: CustomerRetentionParams = {}): Observable<BundleTierRetention[]> {
    let httpParams = new HttpParams();
    if (params.renewal_window_days)
      httpParams = httpParams.set('renewal_window_days', params.renewal_window_days);

    return this.http
      .get<any>(`${this.baseUrl}${API_ENDPOINTS.adminAnalytics.customerRetention}`, { params: httpParams })
      .pipe(
        map((res) => {
          const d = res.data ?? res;
          const rows = d.tiers ?? d.retention ?? d.items ?? d ?? [];
          return (Array.isArray(rows) ? rows : []).map((r: any) => ({
            tier: r.name ?? r.tier ?? r.bundle_tier ?? '—',
            renewalRate: parseFloat(r.renewal_rate ?? r.renewalRate ?? '0'),
            churnRate: parseFloat(r.churn_rate ?? r.churnRate ?? '0'),
          })) as BundleTierRetention[];
        }),
      );
  }
}
