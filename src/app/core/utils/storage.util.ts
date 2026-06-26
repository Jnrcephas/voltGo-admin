/**
 * Thin wrapper around `localStorage` used for persisting the admin session.
 * Wrapping it in one place means we can swap storage strategy later
 * (e.g. to sessionStorage or an httpOnly cookie handshake) without touching
 * every call site.
 */
const PREFIX = 'voltgo_admin:';

function isStorageAvailable(): boolean {
  try {
    return typeof window !== 'undefined' && !!window.localStorage;
  } catch {
    return false;
  }
}

export const storage = {
  getItem(key: string): string | null {
    if (!isStorageAvailable()) return null;
    try {
      return window.localStorage.getItem(PREFIX + key);
    } catch {
      return null;
    }
  },

  setItem(key: string, value: string): void {
    if (!isStorageAvailable()) return;
    try {
      window.localStorage.setItem(PREFIX + key, value);
    } catch {
      // Storage may be full or disabled (e.g. private browsing) — fail silently.
    }
  },

  removeItem(key: string): void {
    if (!isStorageAvailable()) return;
    try {
      window.localStorage.removeItem(PREFIX + key);
    } catch {
      // no-op
    }
  },

  getJson<T>(key: string): T | null {
    const raw = this.getItem(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },

  setJson(key: string, value: unknown): void {
    this.setItem(key, JSON.stringify(value));
  },
};
