import { Injectable, inject } from '@angular/core';
import { AppConfigService } from './app-config.service';

@Injectable({ providedIn: 'root' })
export class GoogleMapsLoaderService {
  private readonly config = inject(AppConfigService);
  private loaded = false;
  private loading: Promise<void> | null = null;

  load(): Promise<void> {
    if (this.loaded) return Promise.resolve();

    if (this.loading) return this.loading;

    this.loading = new Promise<void>((resolve, reject) => {
      const key = this.config.googleMapsApiKey;
      if (!key) {
        reject(new Error('Google Maps API key is not configured.'));
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${key}`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        this.loaded = true;
        resolve();
      };
      script.onerror = () => reject(new Error('Failed to load Google Maps SDK.'));
      document.head.appendChild(script);
    });

    return this.loading;
  }
}
