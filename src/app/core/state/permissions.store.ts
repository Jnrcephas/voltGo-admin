import { Injectable, computed, inject, signal } from '@angular/core';
import { catchError, of, tap } from 'rxjs';
import { AuthStore } from './auth.store';
import { RoleService } from '../services/role.service';

/**
 * The login/me responses only return a role *summary* (id + name) — the
 * actual permission keys for that role are fetched separately via
 * `GET /admin/roles/{id}?include_permissions=true` and cached here for the
 * lifetime of the session so we don't re-fetch on every guard check.
 */
@Injectable({ providedIn: 'root' })
export class PermissionsStore {
  private readonly authStore = inject(AuthStore);
  private readonly roleService = inject(RoleService);

  private readonly _permissionNames = signal<Set<string>>(new Set());
  private readonly _loaded = signal(false);

  readonly loaded = computed(() => this._loaded());

  /** Loads (or reloads) the permission set for the currently logged-in admin's role. */
  loadForCurrentAdmin() {
    const roleId = this.authStore.admin()?.role?.id;
    if (!roleId) {
      this._permissionNames.set(new Set());
      this._loaded.set(true);
      return of(null);
    }

    return this.roleService.getRole(roleId, true).pipe(
      tap((role) => {
        const names = new Set((role.permissions ?? []).map((p) => p.name));
        this._permissionNames.set(names);
        this._loaded.set(true);
      }),
      catchError(() => {
        // If permission resolution fails, fail safe: treat as no granular
        // permissions rather than silently granting access.
        this._permissionNames.set(new Set());
        this._loaded.set(true);
        return of(null);
      }),
    );
  }

  has(permissionName: string): boolean {
    if (this.authStore.isSuperAdmin()) return true;
    return this._permissionNames().has(permissionName);
  }

  hasAny(permissionNames: string[]): boolean {
    if (this.authStore.isSuperAdmin()) return true;
    return permissionNames.some((name) => this._permissionNames().has(name));
  }

  clear(): void {
    this._permissionNames.set(new Set());
    this._loaded.set(false);
  }
}
