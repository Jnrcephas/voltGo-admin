import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TimeAgoPipe } from '../core/pipes/time-ago.pipe';
import { RoleService } from '../core/services/role.service';
import { AdminUserService } from '../core/services/admin-user.service';
import { AuthStore } from '../core/state/auth.store';
import { AdminUserListItem, Permission, Role } from '../core/models';
import { ApiError } from '../core/interceptors/error.interceptor';

/** Stable color accents for role cards, cycled by index since the backend doesn't return a color field. */
const ROLE_COLORS = ['#8b5cf6', '#3b82f6', '#22c55e', '#f97316', '#06b6d4', '#9ca3af', '#ec4899', '#eab308'];

function generateTempPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$';
  let out = '';
  for (let i = 0; i < 12; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

@Component({
  selector: 'app-user-roles',
  standalone: true,
  imports: [CommonModule, FormsModule, TimeAgoPipe],
  templateUrl: './user-roles.component.html',
  styleUrls: ['./user-roles.component.css'],
})
export class UserRolesComponent implements OnInit {
  private readonly roleService = inject(RoleService);
  private readonly adminUserService = inject(AdminUserService);
  readonly authStore = inject(AuthStore);

  // ---- Server state ----
  readonly roles = signal<Role[]>([]);
  readonly permissions = signal<Permission[]>([]);
  readonly adminUsers = signal<AdminUserListItem[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  // ---- Role modal state ----
  readonly selectedRole = signal<Role | null>(null);
  readonly draftPermissionIds = signal<Set<string>>(new Set());
  readonly showRoleModal = signal(false);
  readonly showCreateRoleModal = signal(false);
  readonly roleActionPending = signal(false);
  readonly roleActionError = signal<string | null>(null);

  newRole = { name: '', description: '' };

  // ---- Create admin user state ----
  readonly showCreateUserModal = signal(false);
  readonly userActionPending = signal(false);
  readonly userActionError = signal<string | null>(null);
  readonly createdUserCredentials = signal<{ email: string; password: string } | null>(null);

  newAdminUser = { full_name: '', email: '', phone: '', role_id: '' };

  searchTerm = '';
  roleFilter = 'All';

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.loading.set(true);
    this.error.set(null);

    this.roleService.listRoles(true).subscribe({
      next: (roles) => this.roles.set(roles),
      error: (err: unknown) => this.error.set(err instanceof ApiError ? err.message : 'Failed to load roles.'),
    });

    this.roleService.listPermissions().subscribe({
      next: (permissions) => this.permissions.set(permissions),
      error: () => {
        /* Permission catalogue failing to load shouldn't block the rest of the page. */
      },
    });

    this.adminUserService.list({ limit: 100 }).subscribe({
      next: (data) => {
        this.adminUsers.set(data.users);
        this.loading.set(false);
      },
      error: (err: unknown) => {
        this.loading.set(false);
        this.error.set(err instanceof ApiError ? err.message : 'Failed to load admin users.');
      },
    });
  }

  roleColor(index: number): string {
    return ROLE_COLORS[index % ROLE_COLORS.length];
  }

  roleById(roleId: string): Role | undefined {
    return this.roles().find((r) => r.id === roleId);
  }

  get filteredUsers(): AdminUserListItem[] {
    return this.adminUsers().filter((u) => {
      const matchesSearch =
        u.full_name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesRole = this.roleFilter === 'All' || u.role.id === this.roleFilter;
      return matchesSearch && matchesRole;
    });
  }

  get totalAdminUsers(): number {
    return this.adminUsers().length;
  }
  get activeRoleCount(): number {
    return this.roles().filter((r) => r.is_active).length;
  }
  get suspendedUserCount(): number {
    return this.adminUsers().filter((u) => !u.is_active).length;
  }

  // ---- Role permission editing ----
  viewRole(role: Role): void {
    this.selectedRole.set(role);
    this.draftPermissionIds.set(new Set((role.permissions ?? []).map((p) => p.id)));
    this.roleActionError.set(null);
    this.showRoleModal.set(true);
  }

  closeRoleModal(): void {
    this.showRoleModal.set(false);
    this.selectedRole.set(null);
  }

  isPermissionChecked(permissionId: string): boolean {
    return this.draftPermissionIds().has(permissionId);
  }

  togglePermission(permissionId: string): void {
    const next = new Set(this.draftPermissionIds());
    if (next.has(permissionId)) next.delete(permissionId);
    else next.add(permissionId);
    this.draftPermissionIds.set(next);
  }

  get permissionGroups(): { group: string; items: Permission[] }[] {
    const groups = new Map<string, Permission[]>();
    for (const p of this.permissions()) {
      const list = groups.get(p.group) ?? [];
      list.push(p);
      groups.set(p.group, list);
    }
    return Array.from(groups.entries()).map(([group, items]) => ({ group, items }));
  }

  isSuperAdminRole(role: Role | null): boolean {
    return (role?.name ?? '').toLowerCase() === 'super_admin';
  }

  saveRolePermissions(): void {
    const role = this.selectedRole();
    if (!role) return;

    this.roleActionPending.set(true);
    this.roleActionError.set(null);

    this.roleService.setRolePermissions(role.id, { permission_ids: Array.from(this.draftPermissionIds()) }).subscribe({
      next: (updated) => {
        this.roleActionPending.set(false);
        this.roles.set(this.roles().map((r) => (r.id === updated.id ? updated : r)));
        this.closeRoleModal();
      },
      error: (err: unknown) => {
        this.roleActionPending.set(false);
        this.roleActionError.set(
          err instanceof ApiError ? err.message : 'Could not save permissions. Please try again.',
        );
      },
    });
  }

  // ---- Create role ----
  openCreateRoleModal(): void {
    this.newRole = { name: '', description: '' };
    this.draftPermissionIds.set(new Set());
    this.roleActionError.set(null);
    this.showCreateRoleModal.set(true);
  }

  closeCreateRoleModal(): void {
    this.showCreateRoleModal.set(false);
  }

  createRole(): void {
    if (!this.newRole.name.trim()) return;

    this.roleActionPending.set(true);
    this.roleActionError.set(null);

    this.roleService
      .createRole({
        name: this.newRole.name.trim(),
        description: this.newRole.description.trim(),
        permission_ids: Array.from(this.draftPermissionIds()),
      })
      .subscribe({
        next: () => {
          this.roleActionPending.set(false);
          this.closeCreateRoleModal();
          this.loadAll();
        },
        error: (err: unknown) => {
          this.roleActionPending.set(false);
          this.roleActionError.set(
            err instanceof ApiError ? err.message : 'Could not create role. Please try again.',
          );
        },
      });
  }

  // ---- Create admin user ----
  openCreateUserModal(): void {
    this.newAdminUser = { full_name: '', email: '', phone: '', role_id: this.roles()[0]?.id ?? '' };
    this.userActionError.set(null);
    this.createdUserCredentials.set(null);
    this.showCreateUserModal.set(true);
  }

  closeCreateUserModal(): void {
    this.showCreateUserModal.set(false);
    this.createdUserCredentials.set(null);
  }

  createAdminUser(): void {
    const { full_name, email, phone, role_id } = this.newAdminUser;
    if (!full_name.trim() || !email.trim() || !phone.trim() || !role_id) return;

    const tempPassword = generateTempPassword();

    this.userActionPending.set(true);
    this.userActionError.set(null);

    this.adminUserService
      .create({
        full_name: full_name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password: tempPassword,
        role_id,
        reset_required: true,
      })
      .subscribe({
        next: () => {
          this.userActionPending.set(false);
          this.createdUserCredentials.set({ email: email.trim(), password: tempPassword });
          this.loadAll();
        },
        error: (err: unknown) => {
          this.userActionPending.set(false);
          this.userActionError.set(
            err instanceof ApiError ? err.message : 'Could not create admin user. Please try again.',
          );
        },
      });
  }

  toggleUserStatus(u: AdminUserListItem): void {
    if (!u.is_active) return; // Backend only exposes deactivate, not reactivate, for admin users.
    this.adminUserService.deactivate(u.id).subscribe({
      next: () => this.adminUsers.set(this.adminUsers().map((x) => (x.id === u.id ? { ...x, is_active: false } : x))),
      error: (err: unknown) => this.error.set(err instanceof ApiError ? err.message : 'Could not deactivate user.'),
    });
  }
}


