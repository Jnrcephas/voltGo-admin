import { Injectable, computed, signal } from '@angular/core';
import { AdminProfile } from '../models';
import { storage } from '../utils/storage.util';

const TOKEN_KEY = 'token';
const ADMIN_KEY = 'admin';

/**
 * Holds the current admin session in memory (via signals) and mirrors it to
 * localStorage so a page refresh doesn't log the admin out.
 *
 * This is intentionally a plain service with signals rather than NgRx/Akita —
 * the admin portal's client state is small (one logged-in admin, one set of
 * permissions) and doesn't warrant a full state management library.
 */
@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly _token = signal<string | null>(storage.getItem(TOKEN_KEY));
  private readonly _admin = signal<AdminProfile | null>(storage.getJson<AdminProfile>(ADMIN_KEY));

  readonly token = computed(() => this._token());
  readonly admin = computed(() => this._admin());
  readonly isAuthenticated = computed(() => !!this._token());

  /** Flat list of permission names the current admin holds, e.g. 'orders.view'. */
  readonly permissionNames = computed<string[]>(() => {
    // The /admin/auth/me and /admin/auth/login responses only return a role
    // summary (id + name), not the full permission list. Permissions are
    // resolved separately via RoleService.getRole(roleId, { include_permissions: true })
    // and cached in PermissionsStore — kept blank here to avoid a stale/empty
    // illusion of authority.
    return [];
  });

  readonly isSuperAdmin = computed(() => {
    const role = this._admin()?.role?.name?.toLowerCase() ?? '';
    return role === 'super_admin' || role === 'super admin';
  });

  setSession(token: string, admin: AdminProfile): void {
    this._token.set(token);
    this._admin.set(admin);
    storage.setItem(TOKEN_KEY, token);
    storage.setJson(ADMIN_KEY, admin);
  }

  updateAdminProfile(admin: AdminProfile): void {
    this._admin.set(admin);
    storage.setJson(ADMIN_KEY, admin);
  }

  clearSession(): void {
    this._token.set(null);
    this._admin.set(null);
    storage.removeItem(TOKEN_KEY);
    storage.removeItem(ADMIN_KEY);
  }
}
