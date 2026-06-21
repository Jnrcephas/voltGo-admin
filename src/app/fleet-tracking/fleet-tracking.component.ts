import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Vehicle {
  id: string;
  riderName: string;
  riderAvatar: string;
  vehicleType: 'Bicycle' | 'E-Motorcycle';
  battery: number;
  speed: number;
  status: 'Online' | 'Idle' | 'Offline';
  currentOrder: string | null;
  lastUpdate: string;
  zone: string;
  flagged: boolean;
  flagReason?: string;
  top: string;
  left: string;
}

@Component({
  selector: 'app-fleet-tracking',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './fleet-tracking.component.html',
  styleUrls: ['./fleet-tracking.component.css']
})
export class FleetTrackingComponent {

  stats = [
    { label: 'Online Vehicles', value: '100', change: '+4%', positive: true,  icon: 'ri-wifi-fill',            color: 'green'  },
    { label: 'Offline',         value: '12',  change: '-1%', positive: true,  icon: 'ri-wifi-off-line',        color: 'red'    },
    { label: 'Idle > 30 min',   value: '5',   change: '+2%', positive: false, icon: 'ri-pause-circle-fill',    color: 'orange' },
    { label: 'Speed Alerts',    value: '3',   change: '+1%', positive: false, icon: 'ri-speed-up-fill',        color: 'purple' },
  ];

  searchTerm = '';
  statusFilter = 'All';
  zoneFilter = 'All';

  selectedVehicle: Vehicle | null = null;
  showPlaybackModal = false;
  playbackTarget: Vehicle | null = null;

  vehicles: Vehicle[] = [
    { id: 'VH-2201', riderName: 'Eddie Lobanovskiy', riderAvatar: 'https://i.pravatar.cc/36?img=11', vehicleType: 'E-Motorcycle', battery: 82, speed: 28, status: 'Online', currentOrder: '#876702', lastUpdate: '2s ago',  zone: 'Adenta',     flagged: false, top: '30%', left: '40%' },
    { id: 'VH-2202', riderName: 'Alexey Stave',      riderAvatar: 'https://i.pravatar.cc/36?img=12', vehicleType: 'Bicycle',      battery: 100,speed: 0,  status: 'Idle',   currentOrder: null,     lastUpdate: '38m ago', zone: 'Lapaz',     flagged: true, flagReason: 'Idle 38 min during active hours', top: '55%', left: '25%' },
    { id: 'VH-2203', riderName: 'Anton Tkacheve',    riderAvatar: 'https://i.pravatar.cc/36?img=13', vehicleType: 'E-Motorcycle', battery: 64, speed: 65, status: 'Online', currentOrder: '#876710', lastUpdate: '1s ago',  zone: 'East Legon', flagged: true, flagReason: 'Speed 65 km/h exceeds 60 km/h limit', top: '48%', left: '60%' },
    { id: 'VH-2204', riderName: 'Kwesi Boateng',     riderAvatar: 'https://i.pravatar.cc/36?img=15', vehicleType: 'E-Motorcycle', battery: 19, speed: 0,  status: 'Offline',currentOrder: null,     lastUpdate: '2h ago',  zone: 'Madina',     flagged: true, flagReason: 'Low battery before disconnect', top: '42%', left: '38%' },
    { id: 'VH-2205', riderName: 'Yaw Darko',         riderAvatar: 'https://i.pravatar.cc/36?img=16', vehicleType: 'Bicycle',      battery: 91, speed: 14, status: 'Online', currentOrder: null,     lastUpdate: '4s ago',  zone: 'Kasoa',      flagged: false, top: '68%', left: '64%' },
    { id: 'VH-2206', riderName: 'Linda Mensah',      riderAvatar: 'https://i.pravatar.cc/36?img=25', vehicleType: 'E-Motorcycle', battery: 73, speed: 22, status: 'Online', currentOrder: '#876705', lastUpdate: '3s ago',  zone: 'Madina',     flagged: false, top: '60%', left: '47%' },
  ];

  get filteredVehicles(): Vehicle[] {
    return this.vehicles.filter(v => {
      const matchesSearch = v.riderName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                             v.id.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesStatus = this.statusFilter === 'All' || v.status === this.statusFilter;
      const matchesZone = this.zoneFilter === 'All' || v.zone === this.zoneFilter;
      return matchesSearch && matchesStatus && matchesZone;
    });
  }

  get zones(): string[] {
    return Array.from(new Set(this.vehicles.map(v => v.zone)));
  }

  get onlineCount(): number {
    return this.vehicles.filter(v => v.status === 'Online').length;
  }
  get offlineCount(): number {
    return this.vehicles.filter(v => v.status === 'Offline').length;
  }

  selectVehicle(v: Vehicle) {
    this.selectedVehicle = this.selectedVehicle?.id === v.id ? null : v;
  }

  openPlayback(v: Vehicle) {
    this.playbackTarget = v;
    this.showPlaybackModal = true;
  }

  closePlayback() {
    this.showPlaybackModal = false;
    this.playbackTarget = null;
  }
}