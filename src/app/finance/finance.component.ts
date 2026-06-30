import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GhsCurrencyPipe } from '../core/pipes/ghs-currency.pipe';
import { MockDataBannerComponent } from '../shared/mock-data-banner.component';
import { PaymentService } from '../core/services/payment.service';
import { AnalyticsService } from '../core/services/analytics.service';
import { AdminPayment, PaymentStatus, PaymentType } from '../core/models';
import { ApiError } from '../core/interceptors/error.interceptor';

interface PayoutRow {
  riderId: string;
  riderName: string;
  avatar: string;
  amount: number;
  method: string;
  status: 'Paid' | 'Pending' | 'Failed';
  date: string;
}

@Component({
  selector: 'app-finance',
  standalone: true,
  imports: [CommonModule, FormsModule, GhsCurrencyPipe, MockDataBannerComponent],
  templateUrl: './finance.component.html',
  styleUrls: ['./finance.component.css'],
})
export class FinanceComponent implements OnInit {
  private readonly paymentService = inject(PaymentService);
  private readonly analyticsService = inject(AnalyticsService);

  activeTab: 'transactions' | 'payouts' = 'transactions';

  // ---- Real transactions (wired to /payments/admin/list) ----
  readonly payments = signal<AdminPayment[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly total = signal(0);
  readonly page = signal(1);
  readonly pages = signal(1);

  readonly showActivateModal = signal(false);
  readonly activateReference = signal('');
  readonly activatePending = signal(false);
  readonly activateError = signal<string | null>(null);
  readonly activateSuccess = signal(false);

  // ---- Revenue/payment-split charts (wired to /admin/analytics/finance) ----
weeklyRevenue = signal<{ day: string; value: number }[]>([]);
  get maxRevenue(): number {
    return this.weeklyRevenue().length ? Math.max(...this.weeklyRevenue().map((d) => d.value)) : 1;
  }

  private readonly splitColors = ['#ffc107', '#ef4444', '#3b82f6', '#8b5cf6', '#22c55e', '#f97316'];
  paymentSplit = signal<{ method: string; percent: number; color: string }[]>([]);

  searchTerm = '';
  statusFilter: 'All' | PaymentStatus | 'Paid' | 'Pending' | 'Failed' = 'All';
  typeFilter: 'All' | PaymentType = 'All';

  // ---- Payouts have no backend admin endpoint yet — preview data only ----
  payouts: PayoutRow[] = [
    { riderId: 'RD-1042', riderName: 'Eddie Lobanovskiy', avatar: 'https://i.pravatar.cc/36?img=11', amount: 640, method: 'MTN MoMo', status: 'Paid', date: 'Jun 16, 2026' },
    { riderId: 'RD-1043', riderName: 'Alexey Stave', avatar: 'https://i.pravatar.cc/36?img=12', amount: 412, method: 'Vodafone Cash', status: 'Paid', date: 'Jun 16, 2026' },
    { riderId: 'RD-1044', riderName: 'Anton Tkacheve', avatar: 'https://i.pravatar.cc/36?img=13', amount: 388, method: 'MTN MoMo', status: 'Pending', date: 'Jun 16, 2026' },
    { riderId: 'RD-1045', riderName: 'Kwesi Boateng', avatar: 'https://i.pravatar.cc/36?img=15', amount: 290, method: 'AirtelTigo Money', status: 'Failed', date: 'Jun 16, 2026' },
    { riderId: 'RD-1046', riderName: 'Yaw Darko', avatar: 'https://i.pravatar.cc/36?img=16', amount: 510, method: 'MTN MoMo', status: 'Paid', date: 'Jun 16, 2026' },
  ];

  ngOnInit(): void {
    this.load();
    this.loadAnalytics();
  }

  loadAnalytics(): void {
    this.analyticsService.finance({ days: 7 }).subscribe({
      next: (data) => {
       this.weeklyRevenue.set(data.revenueChart.map((p) => ({ day: p.label, value: p.amount })));
        this.paymentSplit.set(data.paymentMethodBreakdown.map((p, i) => ({
          method: p.method,
          percent: p.percent,
          color: this.splitColors[i % this.splitColors.length],
        })));
      },
      error: () => {
        /* Non-fatal — revenue/payment-split widgets just stay empty. */
      },
    });
  }

  load(page = 1): void {
    this.loading.set(true);
    this.error.set(null);

    const txnStatus = ['success', 'pending', 'failed', 'refunded'].includes(this.statusFilter)
      ? (this.statusFilter as PaymentStatus)
      : undefined;

    this.paymentService
      .list({
        page,
        limit: 20,
        status: txnStatus,
        type: this.typeFilter === 'All' ? undefined : this.typeFilter,
      })
      .subscribe({
        next: (data) => {
          this.payments.set(data.payments);
          this.total.set(data.total);
          this.page.set(data.page);
          this.pages.set(data.pages || 1);
          this.loading.set(false);
        },
        error: (err: unknown) => {
          this.loading.set(false);
          this.error.set(err instanceof ApiError ? err.message : 'Failed to load payments.');
        },
      });
  }

  applyFilters(): void {
    this.load(1);
  }

  setTab(tab: 'transactions' | 'payouts'): void {
    this.activeTab = tab;
  }

  get filteredTransactions(): AdminPayment[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.payments();
    return this.payments().filter(
      (t) => t.customer.full_name.toLowerCase().includes(term) || t.reference.toLowerCase().includes(term),
    );
  }

  get filteredPayouts(): PayoutRow[] {
    return this.payouts.filter((p) => {
      const matchesSearch =
        p.riderName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        p.riderId.toLowerCase().includes(this.searchTerm.toLowerCase());
      const payoutStatusFilter = this.statusFilter as 'All' | 'Paid' | 'Pending' | 'Failed';
      const matchesStatus = payoutStatusFilter === 'All' || p.status === payoutStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }

  typeLabel(type: PaymentType): string {
    const labels: Record<PaymentType, string> = {
      bundle_purchase: 'Bundle Purchase',
      delivery_payment: 'Pay-Per-Delivery',
      refund: 'Refund',
    };
    return labels[type] ?? type;
  }

  openActivateModal(): void {
    this.activateReference.set('');
    this.activateError.set(null);
    this.activateSuccess.set(false);
    this.showActivateModal.set(true);
  }

  closeActivateModal(): void {
    this.showActivateModal.set(false);
  }

  confirmActivate(): void {
    const reference = this.activateReference().trim();
    if (!reference) return;

    this.activatePending.set(true);
    this.activateError.set(null);

    this.paymentService.activate({ reference }).subscribe({
      next: () => {
        this.activatePending.set(false);
        this.activateSuccess.set(true);
        this.load(this.page());
      },
      error: (err: unknown) => {
        this.activatePending.set(false);
        this.activateError.set(
          err instanceof ApiError ? err.message : 'Could not activate this payment. Check the reference and try again.',
        );
      },
    });
  }

  goToPage(target: number): void {
    if (target < 1 || target > this.pages()) return;
    this.load(target);
  }
}


