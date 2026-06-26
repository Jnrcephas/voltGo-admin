import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GhsCurrencyPipe } from '../core/pipes/ghs-currency.pipe';
import { MockDataBannerComponent } from '../shared/mock-data-banner.component';
import { BundleService } from '../core/services/bundle.service';
import { AdminBundleProduct } from '../core/models';
import { ApiError } from '../core/interceptors/error.interceptor';

interface SubscriptionRow {
  customer: string;
  avatar: string;
  tier: string;
  creditsTotal: number;
  creditsRemaining: number;
  expiresAt: string;
  autoRenew: boolean;
  status: 'Active' | 'Expiring Soon' | 'Expired';
}

/** Stable color accents for bundle cards, cycled by index since the backend doesn't return a color field. */
const TIER_COLORS = ['#3b82f6', '#8b5cf6', '#f97316', '#22c55e', '#06b6d4', '#ec4899'];

@Component({
  selector: 'app-bundles',
  standalone: true,
  imports: [CommonModule, FormsModule, GhsCurrencyPipe, MockDataBannerComponent],
  templateUrl: './bundles.component.html',
  styleUrls: ['./bundles.component.css'],
})
export class BundlesComponent implements OnInit {
  private readonly bundleService = inject(BundleService);

  readonly bundles = signal<AdminBundleProduct[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly showCreateModal = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly actionPending = signal(false);
  readonly actionError = signal<string | null>(null);

  newBundle = { name: '', credits: 5, price_ghs: 75, validity_days: 30, discount_percent: 0 };

  searchTerm = '';
  tierFilter = 'All';
  statusFilter = 'All';

  // Customer subscriptions have no backend admin endpoint yet (see README) —
  // this table stays on illustrative sample data with a visible banner.
  subscriptions: SubscriptionRow[] = [
    { customer: 'Camera Barnlu', avatar: 'https://i.pravatar.cc/36?img=21', tier: 'Business Pro', creditsTotal: 40, creditsRemaining: 28, expiresAt: 'Jul 12, 2026', autoRenew: true, status: 'Active' },
    { customer: 'Benson Opoku', avatar: 'https://i.pravatar.cc/36?img=22', tier: 'Starter Pack', creditsTotal: 5, creditsRemaining: 1, expiresAt: 'Jun 21, 2026', autoRenew: false, status: 'Expiring Soon' },
    { customer: 'Argan Oliver', avatar: 'https://i.pravatar.cc/36?img=23', tier: 'Business Lite', creditsTotal: 15, creditsRemaining: 0, expiresAt: 'Jun 10, 2026', autoRenew: false, status: 'Expired' },
    { customer: 'Parfumer Jacob', avatar: 'https://i.pravatar.cc/36?img=24', tier: 'Enterprise', creditsTotal: 100, creditsRemaining: 76, expiresAt: 'Sep 02, 2026', autoRenew: true, status: 'Active' },
    { customer: 'Linda Mensah', avatar: 'https://i.pravatar.cc/36?img=25', tier: 'Business Pro', creditsTotal: 40, creditsRemaining: 3, expiresAt: 'Jun 20, 2026', autoRenew: true, status: 'Expiring Soon' },
  ];

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);

    this.bundleService.list().subscribe({
      next: (bundles) => {
        this.bundles.set(bundles);
        this.loading.set(false);
      },
      error: (err: unknown) => {
        this.loading.set(false);
        this.error.set(err instanceof ApiError ? err.message : 'Failed to load bundle products.');
      },
    });
  }

  tierColor(index: number): string {
    return TIER_COLORS[index % TIER_COLORS.length];
  }

  avgDiscount(): number {
    const list = this.bundles();
    if (list.length === 0) return 0;
    const sum = list.reduce((acc, b) => acc + (b.discount_percent || 0), 0);
    return Math.round(sum / list.length);
  }

  openCreateModal(): void {
    this.editingId.set(null);
    this.newBundle = { name: '', credits: 5, price_ghs: 75, validity_days: 30, discount_percent: 0 };
    this.actionError.set(null);
    this.showCreateModal.set(true);
  }

  openEditModal(bundle: AdminBundleProduct): void {
    this.editingId.set(bundle.id);
    this.newBundle = {
      name: bundle.name,
      credits: bundle.credits,
      price_ghs: bundle.price_ghs,
      validity_days: bundle.validity_days,
      discount_percent: bundle.discount_percent,
    };
    this.actionError.set(null);
    this.showCreateModal.set(true);
  }

  closeCreateModal(): void {
    this.showCreateModal.set(false);
  }

  saveBundle(): void {
    if (!this.newBundle.name.trim() || !this.newBundle.credits || !this.newBundle.price_ghs) return;

    this.actionPending.set(true);
    this.actionError.set(null);

    const editingId = this.editingId();
    const call = editingId
      ? this.bundleService.update(editingId, this.newBundle)
      : this.bundleService.create(this.newBundle);

    call.subscribe({
      next: () => {
        this.actionPending.set(false);
        this.closeCreateModal();
        this.load();
      },
      error: (err: unknown) => {
        this.actionPending.set(false);
        this.actionError.set(err instanceof ApiError ? err.message : 'Could not save bundle. Please try again.');
      },
    });
  }

  toggleBundleActive(bundle: AdminBundleProduct): void {
    const call = bundle.is_active
      ? this.bundleService.deprecate(bundle.id)
      : this.bundleService.restore(bundle.id);

    call.subscribe({
      next: (updated) => {
        this.bundles.set(this.bundles().map((b) => (b.id === updated.id ? updated : b)));
      },
      error: (err: unknown) => {
        this.error.set(err instanceof ApiError ? err.message : 'Could not update bundle status.');
      },
    });
  }

  get filteredSubscriptions(): SubscriptionRow[] {
    return this.subscriptions.filter((s) => {
      const matchesSearch = s.customer.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesTier = this.tierFilter === 'All' || s.tier === this.tierFilter;
      const matchesStatus = this.statusFilter === 'All' || s.status === this.statusFilter;
      return matchesSearch && matchesTier && matchesStatus;
    });
  }
}
