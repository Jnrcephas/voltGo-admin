import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Permission {
  key: string;
  label: string;
}

interface Role {
  id: string;
  name: string;
  accessLevel: 'Full access' | 'High access' | 'Medium access' | 'Limited access' | 'Financial access' | 'Read-only';
  description: string;
  permissions: string[];
  userCount: number;
  color: string;
}

interface AdminUser {
  id: string;
  name: string;
  avatar: string;
  email: string;
  roleId: string;
  status: 'Active' | 'Suspended';
  lastActive: string;
}

@Component({
  selector: 'app-user-roles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-roles.component.html',
  styleUrls: ['./user-roles.component.css']
})
export class UserRolesComponent {

  stats = [
    { label: 'Total Admin Users', value: '18', change: '+2',  positive: true,  icon: 'ri-shield-user-fill',   color: 'blue'   },
    { label: 'Active Roles',      value: '6',  change: '+0%', positive: true,  icon: 'ri-government-fill',    color: 'purple' },
    { label: 'Super Admins',      value: '2',  change: '+0%', positive: true,  icon: 'ri-vip-crown-fill',     color: 'orange' },
    { label: 'Suspended Users',   value: '1',  change: '+0',  positive: true,  icon: 'ri-forbid-line',        color: 'red'    },
  ];

  allPermissions: Permission[] = [
    { key: 'fleet',     label: 'Fleet & GPS Tracking' },
    { key: 'riders',    label: 'Rider Management' },
    { key: 'orders',    label: 'Order Management' },
    { key: 'dashcam',   label: 'Dashcam Access' },
    { key: 'dispatch',  label: 'Manual Dispatch' },
    { key: 'customers', label: 'Customer Accounts' },
    { key: 'refunds',   label: 'Refunds & Disputes' },
    { key: 'finance',   label: 'Revenue & Payouts' },
    { key: 'bundles',   label: 'Bundle Management' },
    { key: 'reports',   label: 'Reports & Analytics' },
    { key: 'config',    label: 'System Configuration' },
    { key: 'ai',        label: 'AI Model Settings' },
  ];

  roles: Role[] = [
    {
      id: 'super-admin', name: 'Super Admin', accessLevel: 'Full access',
      description: 'All features, system config, financial reports, AI settings',
      permissions: ['fleet','riders','orders','dashcam','dispatch','customers','refunds','finance','bundles','reports','config','ai'],
      userCount: 2, color: '#8b5cf6'
    },
    {
      id: 'ops-manager', name: 'Operations Manager', accessLevel: 'High access',
      description: 'Fleet, riders, orders, dashcam, dispatch management',
      permissions: ['fleet','riders','orders','dashcam','dispatch','reports'],
      userCount: 4, color: '#3b82f6'
    },
    {
      id: 'fleet-manager', name: 'Fleet Manager', accessLevel: 'Medium access',
      description: 'Vehicle status, GPS tracking, maintenance scheduling',
      permissions: ['fleet','reports'],
      userCount: 3, color: '#22c55e'
    },
    {
      id: 'cust-support', name: 'Customer Support', accessLevel: 'Limited access',
      description: 'Customer accounts, delivery issues, refunds',
      permissions: ['customers','refunds','orders'],
      userCount: 5, color: '#f97316'
    },
    {
      id: 'finance-admin', name: 'Finance Admin', accessLevel: 'Financial access',
      description: 'Revenue, payouts, invoices, bundle management',
      permissions: ['finance','bundles','reports'],
      userCount: 2, color: '#06b6d4'
    },
    {
      id: 'auditor', name: 'Auditor', accessLevel: 'Read-only',
      description: 'Reports, logs, analytics — no write access',
      permissions: ['reports'],
      userCount: 2, color: '#9ca3af'
    },
  ];

  adminUsers: AdminUser[] = [
    { id: 'AU-001', name: 'Cephas',          avatar: 'https://i.pravatar.cc/40?img=3',  email: 'cephas@voltgo.com',      roleId: 'super-admin',  status: 'Active',    lastActive: 'Just now' },
    { id: 'AU-002', name: 'Akosua Frimpong', avatar: 'https://i.pravatar.cc/40?img=44', email: 'akosua@voltgo.com',      roleId: 'super-admin',  status: 'Active',    lastActive: '2h ago' },
    { id: 'AU-003', name: 'Michael Asare',   avatar: 'https://i.pravatar.cc/40?img=51', email: 'masare@voltgo.com',      roleId: 'ops-manager',  status: 'Active',    lastActive: '14m ago' },
    { id: 'AU-004', name: 'Gloria Owusu',    avatar: 'https://i.pravatar.cc/40?img=47', email: 'gowusu@voltgo.com',      roleId: 'ops-manager',  status: 'Active',    lastActive: '38m ago' },
    { id: 'AU-005', name: 'Samuel Kufuor',   avatar: 'https://i.pravatar.cc/40?img=53', email: 'skufuor@voltgo.com',     roleId: 'fleet-manager', status: 'Active',   lastActive: '1h ago' },
    { id: 'AU-006', name: 'Patience Addo',   avatar: 'https://i.pravatar.cc/40?img=48', email: 'paddo@voltgo.com',       roleId: 'cust-support',  status: 'Active',   lastActive: '5m ago' },
    { id: 'AU-007', name: 'Joseph Mensah',   avatar: 'https://i.pravatar.cc/40?img=56', email: 'jmensah@voltgo.com',     roleId: 'finance-admin', status: 'Active',   lastActive: '3h ago' },
    { id: 'AU-008', name: 'Abena Sarpong',   avatar: 'https://i.pravatar.cc/40?img=45', email: 'asarpong@voltgo.com',    roleId: 'auditor',       status: 'Suspended', lastActive: '6d ago' },
  ];

  searchTerm = '';
  roleFilter = 'All';

  selectedRole: Role | null = null;
  showRoleModal = false;
  showInviteModal = false;

  inviteEmail = '';
  inviteRoleId = '';

  get filteredUsers(): AdminUser[] {
    return this.adminUsers.filter(u => {
      const matchesSearch = u.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                             u.email.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesRole = this.roleFilter === 'All' || u.roleId === this.roleFilter;
      return matchesSearch && matchesRole;
    });
  }

  roleName(roleId: string): string {
    return this.roles.find(r => r.id === roleId)?.name || roleId;
  }

  roleColor(roleId: string): string {
    return this.roles.find(r => r.id === roleId)?.color || '#999';
  }

  viewRole(role: Role) {
    this.selectedRole = { ...role, permissions: [...role.permissions] };
    this.showRoleModal = true;
  }

  closeRoleModal() {
    this.showRoleModal = false;
    this.selectedRole = null;
  }

  togglePermission(key: string) {
    if (!this.selectedRole) return;
    const idx = this.selectedRole.permissions.indexOf(key);
    if (idx >= 0) {
      this.selectedRole.permissions.splice(idx, 1);
    } else {
      this.selectedRole.permissions.push(key);
    }
  }

  saveRolePermissions() {
    if (!this.selectedRole) return;
    const original = this.roles.find(r => r.id === this.selectedRole!.id);
    if (original) {
      original.permissions = [...this.selectedRole.permissions];
    }
    this.closeRoleModal();
  }

  openInviteModal() {
    this.inviteEmail = '';
    this.inviteRoleId = this.roles[0].id;
    this.showInviteModal = true;
  }

  closeInviteModal() {
    this.showInviteModal = false;
  }

  sendInvite() {
    if (!this.inviteEmail.trim() || !this.inviteRoleId) return;
    this.adminUsers.unshift({
      id: 'AU-' + (100 + this.adminUsers.length),
      name: this.inviteEmail.split('@')[0],
      avatar: 'https://i.pravatar.cc/40?img=' + (20 + this.adminUsers.length),
      email: this.inviteEmail,
      roleId: this.inviteRoleId,
      status: 'Active',
      lastActive: 'Invited just now'
    });
    this.closeInviteModal();
  }

  toggleUserStatus(u: AdminUser) {
    u.status = u.status === 'Active' ? 'Suspended' : 'Active';
  }
}