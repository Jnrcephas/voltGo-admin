import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewInit,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MockDataBannerComponent } from '../shared/mock-data-banner.component';
import { GoogleMapsLoaderService } from '../core/services/google-maps-loader.service';
import { AnalyticsService } from '../core/services/analytics.service';

declare const google: any;

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
  lat: number;
  lng: number;
}

@Component({
  selector: 'app-fleet-tracking',
  standalone: true,
  imports: [CommonModule, FormsModule, MockDataBannerComponent],
  templateUrl: './fleet-tracking.component.html',
  styleUrls: ['./fleet-tracking.component.css'],
})
export class FleetTrackingComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapContainer') mapContainer!: ElementRef;

  private map!: any;
  private markers = new Map<string, any>();
  private readonly mapsLoader = inject(GoogleMapsLoaderService);
  private readonly analyticsService = inject(AnalyticsService);

  stats = [
    {
      label: 'Online Vehicles',
      value: '100',
      change: '+4%',
      positive: true,
      icon: 'ri-wifi-fill',
      color: 'green',
    },
    {
      label: 'Offline',
      value: '12',
      change: '-1%',
      positive: true,
      icon: 'ri-wifi-off-line',
      color: 'red',
    },
    {
      label: 'Idle > 30 min',
      value: '5',
      change: '+2%',
      positive: false,
      icon: 'ri-pause-circle-fill',
      color: 'orange',
    },
    {
      label: 'Speed Alerts',
      value: '3',
      change: '+1%',
      positive: false,
      icon: 'ri-speed-up-fill',
      color: 'purple',
    },
  ];

  searchTerm = '';
  statusFilter = 'All';
  zoneFilter = 'All';

  selectedVehicle: Vehicle | null = null;
  showPlaybackModal = false;
  playbackTarget: Vehicle | null = null;

  // lat/lng replaces the old top/left CSS positioning
  vehicles: Vehicle[] = [
    {
      id: 'VH-2201',
      riderName: 'Eddie Lobanovskiy',
      riderAvatar: 'https://i.pravatar.cc/36?img=11',
      vehicleType: 'E-Motorcycle',
      battery: 82,
      speed: 28,
      status: 'Online',
      currentOrder: '#876702',
      lastUpdate: '2s ago',
      zone: 'Adenta',
      flagged: false,
      lat: 5.65,
      lng: -0.16,
    },
    {
      id: 'VH-2202',
      riderName: 'Alexey Stave',
      riderAvatar: 'https://i.pravatar.cc/36?img=12',
      vehicleType: 'Bicycle',
      battery: 100,
      speed: 0,
      status: 'Idle',
      currentOrder: null,
      lastUpdate: '38m ago',
      zone: 'Lapaz',
      flagged: true,
      flagReason: 'Idle 38 min during active hours',
      lat: 5.58,
      lng: -0.23,
    },
    {
      id: 'VH-2203',
      riderName: 'Anton Tkacheve',
      riderAvatar: 'https://i.pravatar.cc/36?img=13',
      vehicleType: 'E-Motorcycle',
      battery: 64,
      speed: 65,
      status: 'Online',
      currentOrder: '#876710',
      lastUpdate: '1s ago',
      zone: 'East Legon',
      flagged: true,
      flagReason: 'Speed 65 km/h exceeds 60 km/h limit',
      lat: 5.62,
      lng: -0.14,
    },
    {
      id: 'VH-2204',
      riderName: 'Kwesi Boateng',
      riderAvatar: 'https://i.pravatar.cc/36?img=15',
      vehicleType: 'E-Motorcycle',
      battery: 19,
      speed: 0,
      status: 'Offline',
      currentOrder: null,
      lastUpdate: '2h ago',
      zone: 'Madina',
      flagged: true,
      flagReason: 'Low battery before disconnect',
      lat: 5.635,
      lng: -0.185,
    },
    {
      id: 'VH-2205',
      riderName: 'Yaw Darko',
      riderAvatar: 'https://i.pravatar.cc/36?img=16',
      vehicleType: 'Bicycle',
      battery: 91,
      speed: 14,
      status: 'Online',
      currentOrder: null,
      lastUpdate: '4s ago',
      zone: 'Kasoa',
      flagged: false,
      lat: 5.55,
      lng: -0.21,
    },
    {
      id: 'VH-2206',
      riderName: 'Linda Mensah',
      riderAvatar: 'https://i.pravatar.cc/36?img=25',
      vehicleType: 'E-Motorcycle',
      battery: 73,
      speed: 22,
      status: 'Online',
      currentOrder: '#876705',
      lastUpdate: '3s ago',
      zone: 'Madina',
      flagged: false,
      lat: 5.61,
      lng: -0.17,
    },
  ];

  ngOnInit(): void {
    // Live GPS positions are now backed by /admin/analytics/riders/locations.
    // Other fields (battery, speed, status, current order, zone, flags) have
    // no supporting endpoint yet, so the table itself stays preview data —
    // we only overwrite lat/lng for riders we can match by name.
    this.analyticsService.ridersLocations().subscribe({
      next: (rows) => {
        rows.forEach((loc) => {
          const match = this.vehicles.find((v) => v.riderName === loc.fullName);
          if (match) {
            match.lat = loc.lat;
            match.lng = loc.lng;
          }
        });
        this.refreshMarkers();
      },
      error: () => {
        /* Non-fatal — map keeps its initial preview positions. */
      },
    });
  }

  ngAfterViewInit(): void {
    this.mapsLoader
      .load()
      .then(() => this.initMap())
      .catch((err) => console.error('Maps failed to load:', err));
  }

  ngOnDestroy(): void {
    this.markers.forEach((m) => m.setMap(null));
    this.markers.clear();
  }

  private initMap(): void {
    // Centre on Accra
    this.map = new google.maps.Map(this.mapContainer.nativeElement, {
      center: { lat: 5.6037, lng: -0.187 },
      zoom: 12,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      styles: [
        { featureType: 'poi', stylers: [{ visibility: 'off' }] },
        { featureType: 'transit', stylers: [{ visibility: 'off' }] },
      ],
    });

    this.vehicles.forEach((v) => this.addMarker(v));
  }

  private markerColor(v: Vehicle): string {
    if (v.flagged) return '#ef4444'; // red
    if (v.status === 'Online') return '#22c55e'; // green
    if (v.status === 'Idle') return '#f59e0b'; // amber
    return '#9ca3af'; // grey = offline
  }

  private addMarker(v: Vehicle): void {
    const color = this.markerColor(v);

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
        <circle cx="16" cy="16" r="13" fill="${color}" stroke="#fff" stroke-width="3"/>
      </svg>`;

    const icon = {
      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg),
      scaledSize: new google.maps.Size(32, 32),
      anchor: new google.maps.Point(16, 16),
    };

    const marker = new google.maps.Marker({
      position: { lat: v.lat, lng: v.lng },
      map: this.map,
      icon,
      title: v.riderName,
    });

    marker.addListener('click', () => this.selectVehicle(v));
    this.markers.set(v.id, marker);
  }

  // Call this whenever vehicle data updates (e.g. after the GPS endpoint arrives)
  private refreshMarkers(): void {
    this.filteredVehicles.forEach((v) => {
      const marker = this.markers.get(v.id);
      if (!marker) {
        this.addMarker(v);
        return;
      }

      const color = this.markerColor(v);
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
          <circle cx="16" cy="16" r="13" fill="${color}" stroke="#fff" stroke-width="3"/>
        </svg>`;
      marker.setIcon({
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg),
        scaledSize: new google.maps.Size(32, 32),
        anchor: new google.maps.Point(16, 16),
      });
      marker.setPosition({ lat: v.lat, lng: v.lng });
    });
  }

  get filteredVehicles(): Vehicle[] {
    return this.vehicles.filter((v) => {
      const matchesSearch =
        v.riderName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        v.id.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesStatus = this.statusFilter === 'All' || v.status === this.statusFilter;
      const matchesZone = this.zoneFilter === 'All' || v.zone === this.zoneFilter;
      return matchesSearch && matchesStatus && matchesZone;
    });
  }

  get zones(): string[] {
    return Array.from(new Set(this.vehicles.map((v) => v.zone)));
  }

  get onlineCount(): number {
    return this.vehicles.filter((v) => v.status === 'Online').length;
  }
  get offlineCount(): number {
    return this.vehicles.filter((v) => v.status === 'Offline').length;
  }

  selectVehicle(v: Vehicle): void {
    this.selectedVehicle = this.selectedVehicle?.id === v.id ? null : v;

    if (this.selectedVehicle && this.map) {
      this.map.panTo({ lat: v.lat, lng: v.lng });
    }
  }

  toggleFullscreen(): void {
    const mapEl = this.mapContainer.nativeElement as HTMLElement;

    if (!document.fullscreenElement) {
      mapEl
        .requestFullscreen()
        .then(() => {
          // Google Maps doesn't auto-resize on fullscreen — trigger it manually
          setTimeout(() => {
            google.maps.event.trigger(this.map, 'resize');
            this.map.setCenter({ lat: 5.6037, lng: -0.187 });
          }, 200);
        })
        .catch((err) => console.error('Fullscreen error:', err));
    } else {
      document.exitFullscreen();
    }
  }

  openPlayback(v: Vehicle): void {
    this.playbackTarget = v;
    this.showPlaybackModal = true;
  }

  closePlayback(): void {
    this.showPlaybackModal = false;
    this.playbackTarget = null;
  }
}
