import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MockDataBannerComponent } from '../shared/mock-data-banner.component';

interface FeedSlot {
  vehicleId: string;
  riderName: string;
  riderAvatar: string;
  zone: string;
  live: boolean;
  justification?: string;
}

interface ArchiveClip {
  sessionId: string;
  vehicleId: string;
  riderName: string;
  adminUser: string;
  startTime: string;
  duration: string;
  justification: string;
  date: string;
}

@Component({
  selector: 'app-dashcam',
  standalone: true,
  imports: [CommonModule, FormsModule, MockDataBannerComponent],
  templateUrl: './dashcam.component.html',
  styleUrls: ['./dashcam.component.css']
})
export class DashcamComponent {

  stats = [
    { label: 'Vehicles with Dashcam', value: '90',  change: '+0%', positive: true,  icon: 'ri-vidicon-fill',        color: 'blue'   },
    { label: 'Live Feeds Open',       value: '3',   change: '+2',  positive: true,  icon: 'ri-live-fill',           color: 'red'    },
    { label: 'Feed Uptime (30d)',     value: '99.5%', change: '+0.2%', positive: true, icon: 'ri-signal-tower-fill', color: 'green'  },
    { label: 'Archived Clips',        value: '214', change: '+18', positive: true,  icon: 'ri-archive-fill',        color: 'purple' },
  ];

  maxFeeds = 10;

  availableVehicles = [
    { vehicleId: 'VH-2201', riderName: 'Eddie Lobanovskiy', riderAvatar: 'https://i.pravatar.cc/36?img=11', zone: 'Adenta' },
    { vehicleId: 'VH-2202', riderName: 'Alexey Stave',      riderAvatar: 'https://i.pravatar.cc/36?img=12', zone: 'Lapaz' },
    { vehicleId: 'VH-2203', riderName: 'Anton Tkacheve',    riderAvatar: 'https://i.pravatar.cc/36?img=13', zone: 'East Legon' },
    { vehicleId: 'VH-2205', riderName: 'Yaw Darko',         riderAvatar: 'https://i.pravatar.cc/36?img=16', zone: 'Kasoa' },
    { vehicleId: 'VH-2206', riderName: 'Linda Mensah',      riderAvatar: 'https://i.pravatar.cc/36?img=25', zone: 'Madina' },
  ];

  openFeeds: FeedSlot[] = [
    { vehicleId: 'VH-2201', riderName: 'Eddie Lobanovskiy', riderAvatar: 'https://i.pravatar.cc/36?img=11', zone: 'Adenta',     live: true },
    { vehicleId: 'VH-2203', riderName: 'Anton Tkacheve',    riderAvatar: 'https://i.pravatar.cc/36?img=13', zone: 'East Legon', live: true },
    { vehicleId: 'VH-2206', riderName: 'Linda Mensah',      riderAvatar: 'https://i.pravatar.cc/36?img=25', zone: 'Madina',     live: true },
  ];

  showOpenFeedModal = false;
  selectedVehicleToOpen = '';
  justificationText = '';

  searchTerm = '';

  archive: ArchiveClip[] = [
    { sessionId: 'DS-9001', vehicleId: 'VH-2204', riderName: 'Kwesi Boateng',  adminUser: 'Cephas (Super admin)', startTime: '08:14 AM', duration: '6 min',  justification: 'Customer complaint review',     date: 'Jun 19, 2026' },
    { sessionId: 'DS-9002', vehicleId: 'VH-2202', riderName: 'Alexey Stave',   adminUser: 'Cephas (Super admin)', startTime: '02:40 PM', duration: '3 min',  justification: 'Idle anomaly check',            date: 'Jun 19, 2026' },
    { sessionId: 'DS-9003', vehicleId: 'VH-2203', riderName: 'Anton Tkacheve', adminUser: 'Cephas (Super admin)', startTime: '11:05 AM', duration: '12 min', justification: 'Speed alert investigation',     date: 'Jun 18, 2026' },
    { sessionId: 'DS-9004', vehicleId: 'VH-2201', riderName: 'Eddie Lobanovskiy', adminUser: 'Cephas (Super admin)', startTime: '04:22 PM', duration: '4 min', justification: 'Random safety audit', date: 'Jun 17, 2026' },
  ];

  openFeedModal() {
    this.selectedVehicleToOpen = '';
    this.justificationText = '';
    this.showOpenFeedModal = true;
  }

  closeFeedModal() {
    this.showOpenFeedModal = false;
  }

  confirmOpenFeed() {
    if (!this.selectedVehicleToOpen || !this.justificationText.trim()) return;
    if (this.openFeeds.length >= this.maxFeeds) return;

    const vehicle = this.availableVehicles.find(v => v.vehicleId === this.selectedVehicleToOpen);
    if (vehicle && !this.openFeeds.some(f => f.vehicleId === vehicle.vehicleId)) {
      this.openFeeds.push({
        ...vehicle,
        live: true,
        justification: this.justificationText
      });
    }
    this.closeFeedModal();
  }

  closeFeed(vehicleId: string) {
    this.openFeeds = this.openFeeds.filter(f => f.vehicleId !== vehicleId);
  }

  get filteredArchive(): ArchiveClip[] {
    return this.archive.filter(c =>
      c.riderName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      c.vehicleId.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      c.justification.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }
}