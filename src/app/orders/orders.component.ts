import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GhsCurrencyPipe } from '../core/pipes/ghs-currency.pipe';
import { OrderService } from '../core/services/order.service';
import { RiderService } from '../core/services/rider.service';
import { AdminOrder, AdminRider, OrderStatus, OrderVehicleType } from '../core/models';
import { ApiError } from '../core/interceptors/error.interceptor';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, GhsCurrencyPipe],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css'],
})
export class OrdersComponent implements OnInit {
  private readonly orderService = inject(OrderService);
  private readonly riderService = inject(RiderService);

  readonly orders = signal<AdminOrder[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly total = signal(0);
  readonly page = signal(1);
  readonly pages = signal(1);

  readonly availableRiders = signal<AdminRider[]>([]);

  searchTerm = '';
  statusFilter: 'All' | OrderStatus = 'All';
  vehicleTypeFilter: 'All' | OrderVehicleType = 'All';

  readonly selectedOrder = signal<AdminOrder | null>(null);
  readonly showReassignModal = signal(false);
  readonly reassignTarget = signal('');
  readonly showCancelModal = signal(false);
  readonly cancelReason = signal('');
  readonly actionPending = signal(false);
  readonly actionError = signal<string | null>(null);

  ngOnInit(): void {
    this.load();
  }

  load(page = 1): void {
    this.loading.set(true);
    this.error.set(null);

    this.orderService
      .list({
        page,
        limit: 20,
        status: this.statusFilter === 'All' ? undefined : this.statusFilter,
        vehicle_type: this.vehicleTypeFilter === 'All' ? undefined : this.vehicleTypeFilter,
      })
      .subscribe({
        next: (data) => {
          this.orders.set(data.orders);
          this.total.set(data.total);
          this.page.set(data.page);
          this.pages.set(data.pages || 1);
          this.loading.set(false);
        },
        error: (err: unknown) => {
          this.loading.set(false);
          this.error.set(err instanceof ApiError ? err.message : 'Failed to load orders.');
        },
      });
  }

  applyFilters(): void {
    this.load(1);
  }

  get filteredOrders(): AdminOrder[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.orders();
    return this.orders().filter(
      (o) =>
        o.customer.full_name.toLowerCase().includes(term) ||
        o.id.toLowerCase().includes(term) ||
        (o.rider?.full_name.toLowerCase().includes(term) ?? false),
    );
  }

  get activeCount(): number {
    return this.orders().filter((o) => !['delivered', 'cancelled', 'failed'].includes(o.status)).length;
  }
  get unassignedCount(): number {
    return this.orders().filter((o) => ['pending', 'searching'].includes(o.status)).length;
  }
  get slaBreachCount(): number {
    return this.orders().filter((o) => o.sla_breach).length;
  }
  get completedCount(): number {
    return this.orders().filter((o) => o.status === 'delivered').length;
  }

  /** Maps the backend's lifecycle statuses onto the badge classes the design already styles. */
  statusBadgeClass(status: OrderStatus): string {
    switch (status) {
      case 'delivered':
        return 'badge-active';
      case 'cancelled':
      case 'failed':
        return 'badge-cancelled';
      case 'pending':
      case 'searching':
        return 'badge-warning';
      default:
        return 'badge-info';
    }
  }

  statusLabel(status: OrderStatus): string {
    const labels: Record<OrderStatus, string> = {
      pending: 'Pending',
      searching: 'Searching',
      assigned: 'Assigned',
      rider_arriving: 'Rider Arriving',
      collected: 'Collected',
      in_transit: 'In Transit',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
      failed: 'Failed',
    };
    return labels[status] ?? status;
  }

  openReassign(order: AdminOrder): void {
    this.selectedOrder.set(order);
    this.reassignTarget.set(order.rider?.id ?? '');
    this.actionError.set(null);
    this.showReassignModal.set(true);

    this.riderService.list({ limit: 50, is_active: true, active_status: 'online' }).subscribe({
      next: (data) => this.availableRiders.set(data.riders),
      error: () => this.availableRiders.set([]),
    });
  }

  closeReassign(): void {
    this.showReassignModal.set(false);
    this.selectedOrder.set(null);
  }

  confirmReassign(): void {
    const order = this.selectedOrder();
    const riderId = this.reassignTarget();
    if (!order || !riderId) return;

    this.actionPending.set(true);
    this.actionError.set(null);

    const isFirstAssign = ['pending', 'searching'].includes(order.status);
    const call = isFirstAssign
      ? this.orderService.assignRider(order.id, { rider_id: riderId })
      : this.orderService.reassignRider(order.id, { rider_id: riderId });

    call.subscribe({
      next: (updated) => {
        this.actionPending.set(false);
        this.orders.set(this.orders().map((o) => (o.id === updated.id ? updated : o)));
        this.closeReassign();
      },
      error: (err: unknown) => {
        this.actionPending.set(false);
        this.actionError.set(
          err instanceof ApiError ? err.message : 'Could not assign rider. Please try again.',
        );
      },
    });
  }

  openCancelModal(order: AdminOrder): void {
    this.selectedOrder.set(order);
    this.cancelReason.set('');
    this.actionError.set(null);
    this.showCancelModal.set(true);
  }

  closeCancelModal(): void {
    this.showCancelModal.set(false);
    this.selectedOrder.set(null);
  }

  confirmCancel(): void {
    const order = this.selectedOrder();
    const reason = this.cancelReason().trim();
    if (!order || !reason) return;

    this.actionPending.set(true);
    this.orderService.cancel(order.id, { cancellation_reason: reason }).subscribe({
      next: (updated) => {
        this.actionPending.set(false);
        this.orders.set(this.orders().map((o) => (o.id === updated.id ? updated : o)));
        this.closeCancelModal();
      },
      error: (err: unknown) => {
        this.actionPending.set(false);
        this.actionError.set(err instanceof ApiError ? err.message : 'Could not cancel order. Please try again.');
      },
    });
  }

  goToPage(target: number): void {
    if (target < 1 || target > this.pages()) return;
    this.load(target);
  }
}
