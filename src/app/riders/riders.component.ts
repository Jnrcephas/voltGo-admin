import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GhsCurrencyPipe } from '../core/pipes/ghs-currency.pipe';
import { RiderService } from '../core/services/rider.service';
import { AdminRider, KycStatus, RiderActiveStatus } from '../core/models';
import { ApiError } from '../core/interceptors/error.interceptor';

/** View-friendly status badges derived from the raw API fields. */
type AccountStatusView = 'Active' | 'Suspended' | 'Deactivated';
type KycStatusView = 'Verified' | 'Pending' | 'Rejected';

function toAccountStatusView(rider: AdminRider): AccountStatusView {
  if (!rider.is_active) return 'Deactivated';
  return rider.active_status === 'offline' && !rider.is_active ? 'Deactivated' : 'Active';
}

function toKycStatusView(status: KycStatus): KycStatusView {
  if (status === 'approved') return 'Verified';
  if (status === 'rejected') return 'Rejected';
  return 'Pending';
}

@Component({
  selector: 'app-riders',
  standalone: true,
  imports: [CommonModule, FormsModule, GhsCurrencyPipe],
  templateUrl: './riders.component.html',
  styleUrls: ['./riders.component.css'],
})
export class RidersComponent implements OnInit {
  private readonly riderService = inject(RiderService);

  // ---- Server state ----
  readonly riders = signal<AdminRider[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly total = signal(0);
  readonly page = signal(1);
  readonly pages = signal(1);

  // ---- Drawer / action state ----
  readonly selectedRider = signal<AdminRider | null>(null);
  readonly actionPending = signal(false);
  readonly actionError = signal<string | null>(null);
  readonly showRejectModal = signal(false);
  readonly rejectReason = signal('');

  // ---- Filters ----
  searchTerm = '';
  statusFilter: 'All' | 'Active' | 'Suspended' = 'All';
  kycFilter: 'All' | KycStatus = 'All';

  // ---- View helpers exposed to template ----
  readonly toAccountStatusView = toAccountStatusView;
  readonly toKycStatusView = toKycStatusView;

  ngOnInit(): void {
    this.load();
  }

  load(page = 1): void {
    this.loading.set(true);
    this.error.set(null);

    this.riderService
      .list({
        page,
        limit: 20,
        kyc_status: this.kycFilter === 'All' ? undefined : this.kycFilter,
        is_active: this.statusFilter === 'All' ? undefined : this.statusFilter === 'Active',
      })
      .subscribe({
        next: (data) => {
          this.riders.set(data.riders);
          this.total.set(data.total);
          this.page.set(data.page);
          this.pages.set(data.pages || 1);
          this.loading.set(false);
        },
        error: (err: unknown) => {
          this.loading.set(false);
          this.error.set(err instanceof ApiError ? err.message : 'Failed to load riders.');
        },
      });
  }

  applyFilters(): void {
    this.load(1);
  }

  get filteredRiders(): AdminRider[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.riders();
    return this.riders().filter(
      (r) =>
        r.full_name.toLowerCase().includes(term) ||
        r.id.toLowerCase().includes(term) ||
        r.phone.includes(term),
    );
  }

  get zones(): string[] {
    return Array.from(new Set(this.riders().map((r) => r.zone).filter((z): z is string => !!z)));
  }

  viewRider(rider: AdminRider): void {
    this.selectedRider.set(rider);
    this.actionError.set(null);
  }

  closeDrawer(): void {
    this.selectedRider.set(null);
    this.actionError.set(null);
  }

  private runAction(action: () => import('rxjs').Observable<AdminRider>): void {
    this.actionPending.set(true);
    this.actionError.set(null);

    action().subscribe({
      next: (updated) => {
        this.actionPending.set(false);
        this.selectedRider.set(updated);
        this.riders.set(this.riders().map((r) => (r.id === updated.id ? updated : r)));
      },
      error: (err: unknown) => {
        this.actionPending.set(false);
        this.actionError.set(err instanceof ApiError ? err.message : 'Action failed. Please try again.');
      },
    });
  }

  approveKyc(rider: AdminRider): void {
    this.runAction(() => this.riderService.approve(rider.id));
  }

  openRejectModal(): void {
    this.rejectReason.set('');
    this.showRejectModal.set(true);
  }

  closeRejectModal(): void {
    this.showRejectModal.set(false);
  }

  confirmReject(): void {
    const rider = this.selectedRider();
    const reason = this.rejectReason().trim();
    if (!rider || !reason) return;

    this.actionPending.set(true);
    this.riderService.reject(rider.id, { reason }).subscribe({
      next: (updated) => {
        this.actionPending.set(false);
        this.selectedRider.set(updated);
        this.riders.set(this.riders().map((r) => (r.id === updated.id ? updated : r)));
        this.showRejectModal.set(false);
      },
      error: (err: unknown) => {
        this.actionPending.set(false);
        this.actionError.set(err instanceof ApiError ? err.message : 'Rejection failed. Please try again.');
      },
    });
  }

  activateRider(rider: AdminRider): void {
    this.runAction(() => this.riderService.activate(rider.id));
  }

  suspendRider(rider: AdminRider): void {
    this.runAction(() => this.riderService.suspend(rider.id));
  }

  deactivateRider(rider: AdminRider): void {
    this.runAction(() => this.riderService.deactivate(rider.id));
  }

  resetStuckStatus(rider: AdminRider): void {
    this.runAction(() => this.riderService.resetStatus(rider.id));
  }

  unassignVehicle(rider: AdminRider): void {
    this.runAction(() => this.riderService.unassignVehicle(rider.id));
  }

  // ---- KPI summary derived from the currently loaded page ----
  get activeCount(): number {
    return this.riders().filter((r) => r.is_active).length;
  }
  get pendingKycCount(): number {
    return this.riders().filter((r) => r.kyc_status === 'pending').length;
  }
  get suspendedCount(): number {
    return this.riders().filter((r) => !r.is_active).length;
  }

  goToPage(target: number): void {
    if (target < 1 || target > this.pages()) return;
    this.load(target);
  }
}
