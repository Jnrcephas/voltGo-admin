import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MockDataBannerComponent } from '../shared/mock-data-banner.component';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, MockDataBannerComponent],
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.css']
})
export class AnalyticsComponent {

  // Executive KPIs
  kpis = [
    { label: 'Avg Delivery Time', value: '24 min', change: '-8%', positive: true,  icon: 'ri-time-line',          color: 'blue'   },
    { label: 'First-Attempt Success', value: '94%', change: '+3%', positive: true,  icon: 'ri-checkbox-circle-line', color: 'green'  },
    { label: 'Rider Utilization', value: '78%',  change: '+5%', positive: true,  icon: 'ri-pulse-line',         color: 'purple' },
    { label: 'Avg ETA Accuracy', value: '±4 min', change: '+1%', positive: true,  icon: 'ri-route-line',         color: 'orange' },
  ];

  // Weekly delivery trend (for bar chart) - days of week
  weeklyTrend = [
    { day: 'Mon', value: 62 },
    { day: 'Tue', value: 78 },
    { day: 'Wed', value: 55 },
    { day: 'Thu', value: 91 },
    { day: 'Fri', value: 102 },
    { day: 'Sat', value: 134 },
    { day: 'Sun', value: 88 },
  ];

  get maxTrend(): number {
    return Math.max(...this.weeklyTrend.map(d => d.value));
  }

  // Geographic / zone analysis
  zones = [
    { name: 'Madina',      orders: 312, percent: 28 },
    { name: 'East Legon',  orders: 248, percent: 22 },
    { name: 'Lapaz',       orders: 196, percent: 17 },
    { name: 'Kasoa',       orders: 154, percent: 14 },
    { name: 'Adenta',      orders: 122, percent: 11 },
    { name: 'Other zones', orders: 88,  percent: 8  },
  ];

  // Fleet health
  fleetHealth = {
    avgBattery: 76,
    dueMaintenance: 6,
    totalVehicles: 90,
    avgMileage: '1,240 km',
  };

  // Customer retention
  retention = [
    { tier: 'Starter Pack',   renewalRate: 41, churn: 22 },
    { tier: 'Business Lite',  renewalRate: 68, churn: 11 },
    { tier: 'Business Pro',   renewalRate: 82, churn: 6  },
    { tier: 'Enterprise',     renewalRate: 91, churn: 3  },
  ];

  // AI performance
  aiPerformance = {
    timeSavedPct: 31,
    distanceSavedPct: 24,
    co2AvoidedKg: 1840,
    avgOptTimeMs: 870,
  };
}