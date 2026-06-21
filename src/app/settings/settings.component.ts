import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent {

  activeTab: 'general' | 'pricing' | 'ai' | 'notifications' | 'security' = 'general';

  saved = false;

  // ---- General / Company Profile ----
  general = {
    companyName: 'VoltGo Technologies Ltd.',
    supportEmail: 'support@voltgo.com',
    supportPhone: '+233 30 222 4455',
    operatingCity: 'Accra',
    defaultLanguage: 'English',
    timezone: 'GMT (Accra)',
  };

  cities = ['Accra', 'Kumasi', 'Tema', 'Takoradi'];
  enabledCities: Record<string, boolean> = {
    Accra: true, Kumasi: false, Tema: false, Takoradi: false
  };

  // ---- Pricing / Surge ----
  pricing = {
    baseFareBicycle: 15,
    baseFareMoto: 20,
    perKmRate: 2.5,
    surgeMin: 1.1,
    surgeMax: 1.8,
    surgeThreshold: 1.5,
    longDistanceCredits: 2,
  };

  // ---- AI Settings (SRD 6.1 - 6.5) ----
  ai = {
    routeOptimizationEnabled: true,
    reoptimizeIntervalSec: 60,
    batchingEnabled: true,
    maxBatchOrdersMoto: 3,
    maxBatchOrdersBike: 1,
    demandForecastEnabled: true,
    speedAnomalyThreshold: 60,
    idleAnomalyMinutes: 30,
    etaAccuracyTargetMin: 5,
  };

  // ---- Notification toggles ----
  notifications = {
    orderAlerts: true,
    riderSOS: true,
    kycSubmissions: true,
    paymentFailures: true,
    slaBreaches: true,
    weeklyReports: true,
    marketingEmails: false,
  };

  // ---- Security ----
  security = {
    twoFactorRequired: true,
    sessionTimeoutMin: 60,
    passwordExpiryDays: 90,
    ipRestrictionEnabled: false,
  };

  loginHistory = [
    { admin: 'Cephas',          device: 'Chrome · Windows', location: 'Accra, GH', time: 'Just now',  status: 'Success' },
    { admin: 'Akosua Frimpong', device: 'Safari · macOS',   location: 'Accra, GH', time: '2h ago',    status: 'Success' },
    { admin: 'Unknown',         device: 'Chrome · Android', location: 'Lagos, NG', time: '1d ago',    status: 'Blocked' },
    { admin: 'Michael Asare',   device: 'Edge · Windows',   location: 'Tema, GH',  time: '2d ago',    status: 'Success' },
  ];

  setTab(tab: 'general' | 'pricing' | 'ai' | 'notifications' | 'security') {
    this.activeTab = tab;
    this.saved = false;
  }

  saveSettings() {
    this.saved = true;
    setTimeout(() => this.saved = false, 2500);
  }
}