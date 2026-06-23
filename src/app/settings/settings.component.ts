import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MockDataBannerComponent } from '../shared/mock-data-banner.component';
import { SettingsService } from '../core/services/settings.service';
import { SettingKey, SystemSetting } from '../core/models';
import { ApiError } from '../core/interceptors/error.interceptor';

type SettingsTab = 'general' | 'pricing' | 'bundles' | 'ai' | 'notifications' | 'security';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, MockDataBannerComponent],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
})
export class SettingsComponent implements OnInit {
  private readonly settingsService = inject(SettingsService);
  private readonly router = inject(Router);

  activeTab: SettingsTab = 'general';
  saved = false;

  // ---- Real backend settings (the only two the API supports) ----
  readonly liveSettings = signal<SystemSetting[]>([]);
  readonly settingsLoading = signal(false);
  readonly settingsError = signal<string | null>(null);
  readonly savingKey = signal<SettingKey | null>(null);

  // Draft values bound to the dropdowns, seeded from liveSettings once loaded.
  draftValues: Record<string, string> = {};

  // ---- General / Company Profile (no backend endpoint — preview only) ----
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
    Accra: true,
    Kumasi: false,
    Tema: false,
    Takoradi: false,
  };

  // ---- Pricing / Surge (no backend endpoint — preview only) ----
  pricing = {
    baseFareBicycle: 15,
    baseFareMoto: 20,
    perKmRate: 2.5,
    surgeMin: 1.1,
    surgeMax: 1.8,
    surgeThreshold: 1.5,
    longDistanceCredits: 2,
  };

  // ---- AI Settings (no backend endpoint — preview only) ----
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

  // ---- Notification toggles (no backend endpoint — preview only) ----
  notifications = {
    orderAlerts: true,
    riderSOS: true,
    kycSubmissions: true,
    paymentFailures: true,
    slaBreaches: true,
    weeklyReports: true,
    marketingEmails: false,
  };

  // ---- Security (toggles are preview only; password change is real) ----
  security = {
    twoFactorRequired: true,
    sessionTimeoutMin: 60,
    passwordExpiryDays: 90,
    ipRestrictionEnabled: false,
  };

  loginHistory = [
    {
      admin: 'Cephas',
      device: 'Chrome · Windows',
      location: 'Accra, GH',
      time: 'Just now',
      status: 'Success',
    },
    {
      admin: 'Akosua Frimpong',
      device: 'Safari · macOS',
      location: 'Accra, GH',
      time: '2h ago',
      status: 'Success',
    },
    {
      admin: 'Unknown',
      device: 'Chrome · Android',
      location: 'Lagos, NG',
      time: '1d ago',
      status: 'Blocked',
    },
    {
      admin: 'Michael Asare',
      device: 'Edge · Windows',
      location: 'Tema, GH',
      time: '2d ago',
      status: 'Success',
    },
  ];

  ngOnInit(): void {
    this.loadLiveSettings();
  }

  private readonly SETTING_LABELS: Record<string, string> = {
    bundle_overlap_behaviour: 'Bundle Overlap Behaviour',
    bundle_carryover_expiry: 'Bundle Carry-over Expiry',
    bundle_expiry_enabled: 'Bundle Expiry Enabled',
  };

  settingLabel(key: string): string {
    return (
      this.SETTING_LABELS[key] ?? key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    );
  }

  loadLiveSettings(): void {
    this.settingsLoading.set(true);
    this.settingsError.set(null);

    this.settingsService.list().subscribe({
      next: (settings) => {
        this.liveSettings.set(settings);
        for (const s of settings) this.draftValues[s.key] = s.value;
        this.settingsLoading.set(false);
      },
      error: (err: unknown) => {
        this.settingsLoading.set(false);
        this.settingsError.set(
          err instanceof ApiError ? err.message : 'Failed to load system settings.',
        );
      },
    });
  }

  saveLiveSetting(setting: SystemSetting): void {
    const value = this.draftValues[setting.key];
    if (!value || value === setting.value) return;

    this.savingKey.set(setting.key);
    this.settingsService.update(setting.key, { value }).subscribe({
      next: () => {
        this.savingKey.set(null);
        this.liveSettings.set(
          this.liveSettings().map((s) => (s.key === setting.key ? { ...s, value } : s)),
        );
        this.saved = true;
        setTimeout(() => (this.saved = false), 2500);
      },
      error: (err: unknown) => {
        this.savingKey.set(null);
        this.settingsError.set(err instanceof ApiError ? err.message : 'Could not update setting.');
      },
    });
  }

  setTab(tab: SettingsTab): void {
    this.activeTab = tab;
    this.saved = false;
  }

  goToChangePassword(): void {
    this.router.navigate(['/change-password']);
  }

  /** No-op save for the preview-only tabs (General/Pricing/AI/Notifications/Security toggles). */
  saveSettings(): void {
    this.saved = true;
    setTimeout(() => (this.saved = false), 2500);
  }
}
