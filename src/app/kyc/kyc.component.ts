import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RiderService } from '../core/services/rider.service';
import { AdminRider, KycStatus } from '../core/models';
import { ApiError } from '../core/interceptors/error.interceptor';

/**
 * KYC review is not a separate backend resource — the swagger contract only
 * exposes KYC status as a filter on `/admin/riders` plus the
 * approve/reject actions on `/admin/riders/{id}`. This page is therefore a
 * focused view over RiderService rather than a distinct "KYC submissions"
 * service, which is the most faithful mapping to what the backend actually
 * provides.
 */
@Component({
  selector: 'app-kyc',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './kyc.component.html',
  styleUrls: ['./kyc.component.css'],
})
export class KycComponent implements OnInit {
  private readonly riderService = inject(RiderService);

  readonly submissions = signal<AdminRider[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly total = signal(0);
  readonly page = signal(1);
  readonly pages = signal(1);

  readonly selectedSubmission = signal<AdminRider | null>(null);
  readonly actionPending = signal(false);
  readonly actionError = signal<string | null>(null);
  readonly showRejectModal = signal(false);
  readonly rejectReason = signal('');

  searchTerm = '';
  statusFilter: 'All' | KycStatus = 'pending';

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
        kyc_status: this.statusFilter === 'All' ? undefined : this.statusFilter,
      })
      .subscribe({
        next: (data) => {
          this.submissions.set(data.riders);
          this.total.set(data.total);
          this.page.set(data.page);
          this.pages.set(data.pages || 1);
          this.loading.set(false);
        },
        error: (err: unknown) => {
          this.loading.set(false);
          this.error.set(err instanceof ApiError ? err.message : 'Failed to load KYC submissions.');
        },
      });
  }

  applyFilters(): void {
    this.load(1);
  }

  get filteredSubmissions(): AdminRider[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.submissions();
    return this.submissions().filter(
      (s) => s.full_name.toLowerCase().includes(term) || s.id.toLowerCase().includes(term),
    );
  }

  get pendingCount(): number {
    return this.submissions().filter((s) => s.kyc_status === 'pending').length;
  }
  get approvedCount(): number {
    return this.submissions().filter((s) => s.kyc_status === 'approved').length;
  }
  get rejectedCount(): number {
    return this.submissions().filter((s) => s.kyc_status === 'rejected').length;
  }

  reviewSubmission(s: AdminRider): void {
    this.selectedSubmission.set(s);
    this.actionError.set(null);
  }

  closeReview(): void {
    this.selectedSubmission.set(null);
  }

  approve(): void {
    const rider = this.selectedSubmission();
    if (!rider) return;

    this.actionPending.set(true);
    this.riderService.approve(rider.id).subscribe({
      next: (updated) => {
        this.actionPending.set(false);
        this.submissions.set(this.submissions().map((s) => (s.id === updated.id ? updated : s)));
        this.closeReview();
      },
      error: (err: unknown) => {
        this.actionPending.set(false);
        this.actionError.set(err instanceof ApiError ? err.message : 'Approval failed. Please try again.');
      },
    });
  }

  openRejectModal(): void {
    this.rejectReason.set('');
    this.showRejectModal.set(true);
  }

  closeRejectModal(): void {
    this.showRejectModal.set(false);
  }

  confirmReject(): void {
    const rider = this.selectedSubmission();
    const reason = this.rejectReason().trim();
    if (!rider || !reason) return;

    this.actionPending.set(true);
    this.riderService.reject(rider.id, { reason }).subscribe({
      next: (updated) => {
        this.actionPending.set(false);
        this.submissions.set(this.submissions().map((s) => (s.id === updated.id ? updated : s)));
        this.showRejectModal.set(false);
        this.closeReview();
      },
      error: (err: unknown) => {
        this.actionPending.set(false);
        this.actionError.set(err instanceof ApiError ? err.message : 'Rejection failed. Please try again.');
      },
    });
  }

  goToPage(target: number): void {
    if (target < 1 || target > this.pages()) return;
    this.load(target);
  }
}
