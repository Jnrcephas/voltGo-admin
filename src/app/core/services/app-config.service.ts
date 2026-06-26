import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

/**
 * Shape of the runtime configuration file served from `public/config.json`.
 * This lets ops change the API base URL for a deployed build (e.g. switching
 * from staging to production) without rebuilding the Angular app.
 */
export interface RuntimeConfig {
  apiBaseUrl: string;
  googleMapsApiKey: string;
}

/**
 * Holds the resolved runtime configuration for the app.
 *
 * Resolution order:
 *  1. `public/config.json` (fetched once at bootstrap, see `main.ts`)
 *  2. Compile-time `environment.apiBaseUrl` fallback
 *
 * This is a plain class (not reactive) because it is populated exactly once,
 * before the Angular app bootstraps, via `provideAppInitializer`.
 */
@Injectable({ providedIn: 'root' })
export class AppConfigService {
  private config: RuntimeConfig = {
    apiBaseUrl: environment.apiBaseUrl,
    googleMapsApiKey: '',
  };

  get apiBaseUrl(): string {
    return this.config.apiBaseUrl;
  }

  get googleMapsApiKey(): string {
    return this.config?.googleMapsApiKey ?? '';
  }

  /** Called once at bootstrap by the app initializer in `app.config.ts`. */
  async load(): Promise<void> {
    try {
      const response = await fetch('config.json', { cache: 'no-store' });
      if (response.ok) {
        const json = (await response.json()) as Partial<RuntimeConfig>;
        if (json.apiBaseUrl) {
          this.config = { ...this.config, ...json };
        }
      }
    } catch {
      // config.json is optional — silently fall back to the compiled environment value.
    }
  }
}
