/**
 * Types for the `/admin/analytics/*` family of endpoints.
 *
 * The backend's exact field names for these new endpoints aren't pinned
 * down in the API contract beyond the high-level description, so every
 * service method that consumes them normalizes the raw response into
 * these shapes and defends against a couple of likely field-name variants
 * (the same pattern already used in `payment.service.ts`).
 */

// ---------------------------------------------------------------------
// GET /admin/analytics/finance
// ---------------------------------------------------------------------
export interface FinanceRevenuePoint {
  label: string; // e.g. day name or date
  amount: number;
}

export interface FinancePaymentMethodSplit {
  method: string;
  percent: number;
  amount?: number;
}

export interface FinanceAnalytics {
  revenueChart: FinanceRevenuePoint[];
  paymentMethodBreakdown: FinancePaymentMethodSplit[];
  totalRevenue: number;
  totalTransactions: number;
  avgTransactionValue: number;
}

// ---------------------------------------------------------------------
// GET /admin/analytics/orders
// ---------------------------------------------------------------------
export interface OrderStatusCount {
  status: string;
  count: number;
}

export interface WeeklyDeliveryPoint {
  label: string; // day name or date
  count: number;
}

export interface OrdersAnalytics {
  statusBreakdown: OrderStatusCount[];
  weeklyTrend: WeeklyDeliveryPoint[];
  avgDeliveryTimeMinutes: number;
  avgEtaAccuracyMinutes: number;
}

// ---------------------------------------------------------------------
// GET /admin/analytics/riders/leaderboard
// ---------------------------------------------------------------------
export interface RiderLeaderboardEntry {
  riderId: string;
  fullName: string;
  avatarUrl?: string;
  email?: string;
  completedOrders: number;
}

// ---------------------------------------------------------------------
// GET /admin/analytics/riders/locations
// ---------------------------------------------------------------------
export interface RiderLiveLocation {
  riderId: string;
  fullName: string;
  avatarUrl?: string;
  vehicleType?: string;
  lat: number;
  lng: number;
  lastUpdatedAt?: string;
}

// ---------------------------------------------------------------------
// GET /admin/analytics/riders/utilization
// ---------------------------------------------------------------------
export interface RiderUtilizationEntry {
  riderId: string;
  fullName: string;
  onlineMinutes: number;
  activeMinutes: number;
  utilizationPercent: number;
}

export interface RiderUtilizationParams {
  date?: string;
  shift_hours?: number;
}

// ---------------------------------------------------------------------
// GET /admin/analytics/customer-retention
// ---------------------------------------------------------------------
export interface BundleTierRetention {
  tier: string;
  renewalRate: number;
  churnRate: number;
}

export interface CustomerRetentionParams {
  renewal_window_days?: number;
}

export interface OrdersAnalyticsParams {
  days?: number;
}

export interface FinanceAnalyticsParams {
  days?: number;
}

export interface RidersLeaderboardParams {
  limit?: number;
}
