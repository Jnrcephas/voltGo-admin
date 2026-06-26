import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VehicleService } from '../core/services/vehicle.service';
import { RiderService } from '../core/services/rider.service';
import { AdminVehicle, AdminRider, VehicleType, VehicleStatus } from '../core/models';
import { ApiError } from '../core/interceptors/error.interceptor';

@Component({
  selector: 'app-vehicles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vehicles.component.html',
  styleUrls: ['./vehicles.component.css'],
})
export class VehiclesComponent implements OnInit {
  private readonly vehicleService = inject(VehicleService);
  private readonly riderService = inject(RiderService);

  readonly vehicles = signal<AdminVehicle[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly total = signal(0);
  readonly page = signal(1);
  readonly pages = signal(1);

  readonly unassignedRiders = signal<AdminRider[]>([]);

  searchTerm = '';
  typeFilter: 'All' | VehicleType = 'All';
  statusFilter: 'All' | VehicleStatus = 'All';

  readonly showAddModal = signal(false);
  readonly showAssignModal = signal(false);
  readonly assignTarget = signal<AdminVehicle | null>(null);
  readonly selectedRiderToAssign = signal('');
  readonly actionPending = signal(false);
  readonly actionError = signal<string | null>(null);

  newVehicle = {
    type: 'bicycle' as VehicleType,
    plate_no: '',
    gps_tracker_id: '',
    dashcam_id: '',
  };

  ngOnInit(): void {
    this.load();
  }

  load(page = 1): void {
    this.loading.set(true);
    this.error.set(null);

    this.vehicleService
      .list({
        page,
        limit: 20,
        type: this.typeFilter === 'All' ? undefined : this.typeFilter,
        status: this.statusFilter === 'All' ? undefined : this.statusFilter,
      })
      .subscribe({
        next: (data) => {
          this.vehicles.set(data.vehicles);
          this.total.set(data.total);
          this.page.set(data.page);
          this.pages.set(data.pages || 1);
          this.loading.set(false);
        },
        error: (err: unknown) => {
          this.loading.set(false);
          this.error.set(err instanceof ApiError ? err.message : 'Failed to load vehicles.');
        },
      });
  }

  applyFilters(): void {
    this.load(1);
  }

  get filteredVehicles(): AdminVehicle[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.vehicles();
    return this.vehicles().filter(
      (v) =>
        v.id.toLowerCase().includes(term) ||
        (v.plate_no?.toLowerCase().includes(term) ?? false) ||
        (v.assigned_rider?.full_name.toLowerCase().includes(term) ?? false),
    );
  }

  get availableCount(): number {
    return this.vehicles().filter((v) => v.status === 'available').length;
  }
  get assignedCount(): number {
    return this.vehicles().filter((v) => v.status === 'in_use').length;
  }
  get maintenanceCount(): number {
    return this.vehicles().filter((v) => v.status === 'maintenance').length;
  }

  openAddModal(): void {
    this.newVehicle = { type: 'bicycle', plate_no: '', gps_tracker_id: '', dashcam_id: '' };
    this.actionError.set(null);
    this.showAddModal.set(true);
  }

  closeAddModal(): void {
    this.showAddModal.set(false);
  }

  saveVehicle(): void {
    if (!this.newVehicle.gps_tracker_id.trim()) return;

    this.actionPending.set(true);
    this.actionError.set(null);

    this.vehicleService
      .create({
        type: this.newVehicle.type,
        plate_no: this.newVehicle.plate_no || undefined,
        gps_tracker_id: this.newVehicle.gps_tracker_id,
        dashcam_id: this.newVehicle.dashcam_id || undefined,
      })
      .subscribe({
        next: () => {
          this.actionPending.set(false);
          this.closeAddModal();
          this.load(this.page());
        },
        error: (err: unknown) => {
          this.actionPending.set(false);
          this.actionError.set(
            err instanceof ApiError ? err.message : 'Could not add vehicle. Please try again.',
          );
        },
      });
  }

  openAssignModal(vehicle: AdminVehicle): void {
    this.assignTarget.set(vehicle);
    this.selectedRiderToAssign.set('');
    this.actionError.set(null);
    this.showAssignModal.set(true);

    // Lazily fetch a page of approved, active, unassigned-vehicle riders to
    // populate the assignment dropdown. The backend doesn't expose a
    // dedicated "unassigned riders" filter, so we approximate it client-side.
    this.riderService.list({ limit: 50, is_active: true, kyc_status: 'approved' }).subscribe({
      next: (data) => this.unassignedRiders.set(data.riders.filter((r) => !r.vehicle)),
      error: () => this.unassignedRiders.set([]),
    });
  }

  closeAssignModal(): void {
    this.showAssignModal.set(false);
    this.assignTarget.set(null);
  }

  confirmAssign(): void {
    const vehicle = this.assignTarget();
    const riderId = this.selectedRiderToAssign();
    if (!vehicle || !riderId) return;

    this.actionPending.set(true);
    this.riderService.assignVehicle(riderId, { vehicle_id: vehicle.id }).subscribe({
      next: () => {
        this.actionPending.set(false);
        this.closeAssignModal();
        this.load(this.page());
      },
      error: (err: unknown) => {
        this.actionPending.set(false);
        this.actionError.set(err instanceof ApiError ? err.message : 'Assignment failed. Please try again.');
      },
    });
  }

  unassign(vehicle: AdminVehicle): void {
    if (!vehicle.assigned_rider) return;
    this.actionPending.set(true);
    this.riderService.unassignVehicle(vehicle.assigned_rider.id).subscribe({
      next: () => {
        this.actionPending.set(false);
        this.load(this.page());
      },
      error: (err: unknown) => {
        this.actionPending.set(false);
        this.error.set(err instanceof ApiError ? err.message : 'Could not unassign vehicle.');
      },
    });
  }

  setMaintenance(vehicle: AdminVehicle): void {
    const nextStatus: VehicleStatus = vehicle.status === 'maintenance' ? 'available' : 'maintenance';
    this.actionPending.set(true);
    this.vehicleService.setStatus(vehicle.id, { status: nextStatus }).subscribe({
      next: (updated) => {
        this.actionPending.set(false);
        this.vehicles.set(this.vehicles().map((v) => (v.id === updated.id ? updated : v)));
      },
      error: (err: unknown) => {
        this.actionPending.set(false);
        this.error.set(err instanceof ApiError ? err.message : 'Could not update vehicle status.');
      },
    });
  }

  goToPage(target: number): void {
    if (target < 1 || target > this.pages()) return;
    this.load(target);
  }
}


