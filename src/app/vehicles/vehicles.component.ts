import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Vehicle {
  vehicleId: string;
  type: 'Bicycle' | 'E-Motorcycle';
  plateNo: string | null;
  gpsTrackerId: string;
  dashcamId: string | null;
  battery: number;
  assignedRider: string | null;
  assignedRiderAvatar?: string;
  status: 'Available' | 'Assigned' | 'Maintenance' | 'Retired';
  addedDate: string;
}

@Component({
  selector: 'app-vehicles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vehicles.component.html',
  styleUrls: ['./vehicles.component.css']
})
export class VehiclesComponent {

  stats = [
    { label: 'Total Fleet',     value: '90', change: '+0%', positive: true,  icon: 'ri-e-bike-2-fill',        color: 'blue'   },
    { label: 'Available',       value: '14', change: '+2',  positive: true,  icon: 'ri-checkbox-circle-fill', color: 'green'  },
    { label: 'Assigned',        value: '70', change: '+1%', positive: true,  icon: 'ri-user-follow-fill',     color: 'purple' },
    { label: 'In Maintenance',  value: '6',  change: '+2',  positive: false, icon: 'ri-tools-fill',           color: 'orange' },
  ];

  searchTerm = '';
  typeFilter = 'All';
  statusFilter = 'All';

  unassignedRiders = [
    'Linda Mensah', 'Kojo Asante', 'Esi Owusu', 'Nana Yeboah'
  ];

  vehicles: Vehicle[] = [
    { vehicleId: 'VH-2201', type: 'E-Motorcycle', plateNo: 'GR-4421-23', gpsTrackerId: 'GPS-8801', dashcamId: 'DC-5501', battery: 82,  assignedRider: 'Eddie Lobanovskiy', assignedRiderAvatar: 'https://i.pravatar.cc/36?img=11', status: 'Assigned',  addedDate: 'Jan 10, 2026' },
    { vehicleId: 'VH-2202', type: 'Bicycle',       plateNo: null,         gpsTrackerId: 'GPS-8802', dashcamId: null,        battery: 100, assignedRider: 'Alexey Stave',      assignedRiderAvatar: 'https://i.pravatar.cc/36?img=12', status: 'Assigned',  addedDate: 'Jan 10, 2026' },
    { vehicleId: 'VH-2203', type: 'E-Motorcycle', plateNo: 'GR-4422-23', gpsTrackerId: 'GPS-8803', dashcamId: 'DC-5502', battery: 64,  assignedRider: 'Anton Tkacheve',    assignedRiderAvatar: 'https://i.pravatar.cc/36?img=13', status: 'Assigned',  addedDate: 'Jan 12, 2026' },
    { vehicleId: 'VH-2204', type: 'E-Motorcycle', plateNo: 'GR-4423-23', gpsTrackerId: 'GPS-8804', dashcamId: 'DC-5503', battery: 19,  assignedRider: 'Kwesi Boateng',     assignedRiderAvatar: 'https://i.pravatar.cc/36?img=15', status: 'Maintenance', addedDate: 'Feb 02, 2026' },
    { vehicleId: 'VH-2205', type: 'Bicycle',       plateNo: null,         gpsTrackerId: 'GPS-8805', dashcamId: null,        battery: 91,  assignedRider: 'Yaw Darko',         assignedRiderAvatar: 'https://i.pravatar.cc/36?img=16', status: 'Assigned',  addedDate: 'Feb 14, 2026' },
    { vehicleId: 'VH-2206', type: 'E-Motorcycle', plateNo: 'GR-4424-23', gpsTrackerId: 'GPS-8806', dashcamId: 'DC-5504', battery: 73,  assignedRider: 'Linda Mensah',      assignedRiderAvatar: 'https://i.pravatar.cc/36?img=25', status: 'Assigned',  addedDate: 'Mar 01, 2026' },
    { vehicleId: 'VH-2207', type: 'Bicycle',       plateNo: null,         gpsTrackerId: 'GPS-8807', dashcamId: null,        battery: 100, assignedRider: null,                status: 'Available', addedDate: 'Apr 18, 2026' },
    { vehicleId: 'VH-2208', type: 'E-Motorcycle', plateNo: 'GR-4425-23', gpsTrackerId: 'GPS-8808', dashcamId: 'DC-5505', battery: 100, assignedRider: null,                status: 'Available', addedDate: 'May 05, 2026' },
    { vehicleId: 'VH-2209', type: 'E-Motorcycle', plateNo: 'GR-4426-23', gpsTrackerId: 'GPS-8809', dashcamId: 'DC-5506', battery: 0,   assignedRider: null,                status: 'Retired',   addedDate: 'Oct 11, 2025' },
  ];

  showAddModal = false;
  showAssignModal = false;
  assignTarget: Vehicle | null = null;
  selectedRiderToAssign = '';

  newVehicle: Partial<Vehicle> = {
    vehicleId: '', type: 'Bicycle', plateNo: '', gpsTrackerId: '', dashcamId: ''
  };

  get filteredVehicles(): Vehicle[] {
    return this.vehicles.filter(v => {
      const matchesSearch = v.vehicleId.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                             (v.assignedRider?.toLowerCase().includes(this.searchTerm.toLowerCase()) ?? false) ||
                             (v.plateNo?.toLowerCase().includes(this.searchTerm.toLowerCase()) ?? false);
      const matchesType = this.typeFilter === 'All' || v.type === this.typeFilter;
      const matchesStatus = this.statusFilter === 'All' || v.status === this.statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }

  openAddModal() {
    this.newVehicle = { vehicleId: '', type: 'Bicycle', plateNo: '', gpsTrackerId: '', dashcamId: '' };
    this.showAddModal = true;
  }

  closeAddModal() {
    this.showAddModal = false;
  }

  saveVehicle() {
    if (!this.newVehicle.vehicleId || !this.newVehicle.gpsTrackerId) return;
    if (this.vehicles.some(v => v.vehicleId === this.newVehicle.vehicleId)) {
      alert('A vehicle with this ID already exists.');
      return;
    }
    this.vehicles.unshift({
      vehicleId: this.newVehicle.vehicleId!,
      type: this.newVehicle.type as 'Bicycle' | 'E-Motorcycle',
      plateNo: this.newVehicle.plateNo || null,
      gpsTrackerId: this.newVehicle.gpsTrackerId!,
      dashcamId: this.newVehicle.dashcamId || null,
      battery: 100,
      assignedRider: null,
      status: 'Available',
      addedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
    });
    this.closeAddModal();
  }

  openAssignModal(v: Vehicle) {
    this.assignTarget = v;
    this.selectedRiderToAssign = '';
    this.showAssignModal = true;
  }

  closeAssignModal() {
    this.showAssignModal = false;
    this.assignTarget = null;
  }

  confirmAssign() {
    if (this.assignTarget && this.selectedRiderToAssign) {
      this.assignTarget.assignedRider = this.selectedRiderToAssign;
      this.assignTarget.status = 'Assigned';
      this.unassignedRiders = this.unassignedRiders.filter(r => r !== this.selectedRiderToAssign);
    }
    this.closeAssignModal();
  }

  unassign(v: Vehicle) {
    if (v.assignedRider) {
      this.unassignedRiders.push(v.assignedRider);
    }
    v.assignedRider = undefined as any;
    v.status = 'Available';
  }

  setMaintenance(v: Vehicle) {
    v.status = v.status === 'Maintenance' ? 'Available' : 'Maintenance';
  }
}