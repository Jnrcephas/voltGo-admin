import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Rider {
  id: string;
  name: string;
  avatar: string;
  phone: string;
  email: string;
  ghanaCard: string;
  vehicleType: 'Bicycle' | 'E-Motorcycle';
  vehicleId: string | null;
  kycStatus: 'Verified' | 'Pending' | 'Rejected';
  accountStatus: 'Active' | 'Suspended' | 'Deactivated';
  rating: number;
  completionRate: number;
  onTimeRate: number;
  totalDeliveries: number;
  earningsThisMonth: number;
  zone: string;
  joinedDate: string;
}

@Component({
  selector: 'app-riders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './riders.component.html',
  styleUrls: ['./riders.component.css']
})
export class RidersComponent {

  stats = [
    { label: 'Total Riders',   value: '142', change: '+8%', positive: true,  icon: 'ri-e-bike-fill',          color: 'blue'   },
    { label: 'Active Now',     value: '78',  change: '+6%', positive: true,  icon: 'ri-checkbox-circle-fill', color: 'green'  },
    { label: 'Pending KYC',    value: '11',  change: '+3',  positive: false, icon: 'ri-file-shield-2-line',   color: 'orange' },
    { label: 'Suspended',      value: '4',   change: '-1',  positive: true,  icon: 'ri-forbid-line',          color: 'red'    },
  ];

  searchTerm = '';
  statusFilter = 'All';
  zoneFilter = 'All';

  riders: Rider[] = [
    { id: 'RD-1042', name: 'Eddie Lobanovskiy', avatar: 'https://i.pravatar.cc/48?img=11', phone: '+233 24 111 2233', email: 'labanovskiy@gmail.com', ghanaCard: 'GHA-849213765-0', vehicleType: 'E-Motorcycle', vehicleId: 'VH-2201', kycStatus: 'Verified', accountStatus: 'Active', rating: 4.8, completionRate: 96, onTimeRate: 92, totalDeliveries: 612, earningsThisMonth: 2840, zone: 'Adenta', joinedDate: 'Jan 14, 2026' },
    { id: 'RD-1043', name: 'Alexey Stave', avatar: 'https://i.pravatar.cc/48?img=12', phone: '+233 24 222 3344', email: 'alexeyst@gmail.com', ghanaCard: 'GHA-772910458-1', vehicleType: 'Bicycle', vehicleId: 'VH-2202', kycStatus: 'Verified', accountStatus: 'Active', rating: 4.6, completionRate: 91, onTimeRate: 88, totalDeliveries: 388, earningsThisMonth: 1920, zone: 'Lapaz', joinedDate: 'Feb 02, 2026' },
    { id: 'RD-1044', name: 'Anton Tkacheve', avatar: 'https://i.pravatar.cc/48?img=13', phone: '+233 24 333 4455', email: 'tkacheveanton@gmail.com', ghanaCard: 'GHA-639281047-2', vehicleType: 'E-Motorcycle', vehicleId: 'VH-2203', kycStatus: 'Verified', accountStatus: 'Active', rating: 4.9, completionRate: 98, onTimeRate: 95, totalDeliveries: 745, earningsThisMonth: 3210, zone: 'East Legon', joinedDate: 'Nov 28, 2025' },
    { id: 'RD-1045', name: 'Kwesi Boateng', avatar: 'https://i.pravatar.cc/48?img=15', phone: '+233 24 444 5566', email: 'kboateng@gmail.com', ghanaCard: 'GHA-518273940-3', vehicleType: 'E-Motorcycle', vehicleId: 'VH-2204', kycStatus: 'Verified', accountStatus: 'Suspended', rating: 3.9, completionRate: 74, onTimeRate: 61, totalDeliveries: 204, earningsThisMonth: 580, zone: 'Madina', joinedDate: 'Mar 19, 2026' },
    { id: 'RD-1046', name: 'Yaw Darko', avatar: 'https://i.pravatar.cc/48?img=16', phone: '+233 24 555 6677', email: 'ydarko@gmail.com', ghanaCard: 'GHA-405162839-4', vehicleType: 'Bicycle', vehicleId: 'VH-2205', kycStatus: 'Verified', accountStatus: 'Active', rating: 4.7, completionRate: 94, onTimeRate: 90, totalDeliveries: 421, earningsThisMonth: 2050, zone: 'Kasoa', joinedDate: 'Dec 11, 2025' },
    { id: 'RD-1047', name: 'Linda Mensah', avatar: 'https://i.pravatar.cc/48?img=25', phone: '+233 24 666 7788', email: 'lmensah@gmail.com', ghanaCard: 'GHA-394057261-5', vehicleType: 'E-Motorcycle', vehicleId: 'VH-2206', kycStatus: 'Pending', accountStatus: 'Active', rating: 4.5, completionRate: 89, onTimeRate: 85, totalDeliveries: 156, earningsThisMonth: 1340, zone: 'Madina', joinedDate: 'May 02, 2026' },
    { id: 'RD-1048', name: 'Kojo Asante', avatar: 'https://i.pravatar.cc/48?img=18', phone: '+233 24 777 8899', email: 'kasante@gmail.com', ghanaCard: 'GHA-283746159-6', vehicleType: 'Bicycle', vehicleId: null, kycStatus: 'Pending', accountStatus: 'Deactivated', rating: 0, completionRate: 0, onTimeRate: 0, totalDeliveries: 0, earningsThisMonth: 0, zone: 'East Legon', joinedDate: 'Jun 15, 2026' },
  ];

  selectedRider: Rider | null = null;
  editMode = false;
  editBuffer: Rider | null = null;

  get filteredRiders(): Rider[] {
    return this.riders.filter(r => {
      const matchesSearch = r.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                             r.id.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                             r.phone.includes(this.searchTerm);
      const matchesStatus = this.statusFilter === 'All' || r.accountStatus === this.statusFilter;
      const matchesZone = this.zoneFilter === 'All' || r.zone === this.zoneFilter;
      return matchesSearch && matchesStatus && matchesZone;
    });
  }

  get zones(): string[] {
    return Array.from(new Set(this.riders.map(r => r.zone)));
  }

  viewRider(rider: Rider) {
    this.selectedRider = rider;
    this.editMode = false;
  }

  closeDrawer() {
    this.selectedRider = null;
    this.editMode = false;
    this.editBuffer = null;
  }

  startEdit() {
    if (this.selectedRider) {
      this.editBuffer = { ...this.selectedRider };
      this.editMode = true;
    }
  }

  cancelEdit() {
    this.editMode = false;
    this.editBuffer = null;
  }

  saveEdit() {
    if (this.editBuffer && this.selectedRider) {
      Object.assign(this.selectedRider, this.editBuffer);
      this.editMode = false;
      this.editBuffer = null;
    }
  }

  setAccountStatus(rider: Rider, status: 'Active' | 'Suspended' | 'Deactivated') {
    rider.accountStatus = status;
  }
}