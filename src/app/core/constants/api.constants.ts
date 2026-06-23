/**
 * Centralized API endpoint paths for the VoltGo Admin Portal.
 *
 * All paths are relative to `environment.apiBaseUrl`
 * (e.g. https://api.voltgoapp.com/api/v1).
 *
 * Keeping every path in one place means a backend route change
 * only needs to be updated here, not hunted down across services.
 */
export const API_ENDPOINTS = {
  // ---------------------------------------------------------------
  // Admin / Auth
  // ---------------------------------------------------------------
  adminAuth: {
    login: '/admin/auth/login',
    me: '/admin/auth/me',
    logout: '/admin/auth/logout',
    changePassword: '/admin/auth/change-password',
  },

  // ---------------------------------------------------------------
  // Admin / User Management
  // ---------------------------------------------------------------
  adminUsers: {
    list: '/admin/users',
    create: '/admin/users',
    detail: (id: string) => `/admin/users/${id}`,
    update: (id: string) => `/admin/users/${id}`,
    deactivate: (id: string) => `/admin/users/${id}/deactivate`,
    resetPassword: (id: string) => `/admin/users/${id}/reset-password`,
  },

  // ---------------------------------------------------------------
  // Admin / Roles & Permissions
  // ---------------------------------------------------------------
  adminRoles: {
    permissions: '/admin/permissions',
    list: '/admin/roles',
    create: '/admin/roles',
    detail: (id: string) => `/admin/roles/${id}`,
    update: (id: string) => `/admin/roles/${id}`,
    delete: (id: string) => `/admin/roles/${id}`,
    setPermissions: (id: string) => `/admin/roles/${id}/permissions`,
  },

  // ---------------------------------------------------------------
  // Admin / Rider Management
  // ---------------------------------------------------------------
  adminRiders: {
    list: '/admin/riders',
    detail: (id: string) => `/admin/riders/${id}`,
    approve: (id: string) => `/admin/riders/${id}/approve`,
    reject: (id: string) => `/admin/riders/${id}/reject`,
    activate: (id: string) => `/admin/riders/${id}/activate`,
    suspend: (id: string) => `/admin/riders/${id}/suspend`,
    deactivate: (id: string) => `/admin/riders/${id}/deactivate`,
    assignVehicle: (id: string) => `/admin/riders/${id}/assign-vehicle`,
    unassignVehicle: (id: string) => `/admin/riders/${id}/unassign-vehicle`,
    resetStatus: (id: string) => `/admin/riders/${id}/reset-status`,
  },

  // ---------------------------------------------------------------
  // Admin / Order Management
  // ---------------------------------------------------------------
  adminOrders: {
    list: '/admin/orders',
    detail: (id: string) => `/admin/orders/${id}`,
    assignRider: (id: string) => `/admin/orders/${id}/assign-rider`,
    reassignRider: (id: string) => `/admin/orders/${id}/reassign-rider`,
    cancel: (id: string) => `/admin/orders/${id}/cancel`,
  },

  // ---------------------------------------------------------------
  // Admin / Fleet & Vehicles
  // ---------------------------------------------------------------
  adminVehicles: {
    list: '/admin/fleet/vehicles',
    create: '/admin/fleet/vehicles',
    detail: (id: string) => `/admin/fleet/vehicles/${id}`,
    update: (id: string) => `/admin/fleet/vehicles/${id}`,
    setStatus: (id: string) => `/admin/fleet/vehicles/${id}/status`,
    deactivate: (id: string) => `/admin/fleet/vehicles/${id}/deactivate`,
    reactivate: (id: string) => `/admin/fleet/vehicles/${id}/reactivate`,
  },

  // ---------------------------------------------------------------
  // Admin / Bundles & Pricing
  // ---------------------------------------------------------------
  adminBundles: {
    list: '/admin/bundles/products',
    create: '/admin/bundles/products',
    detail: (id: string) => `/admin/bundles/products/${id}`,
    update: (id: string) => `/admin/bundles/products/${id}`,
    deprecate: (id: string) => `/admin/bundles/products/${id}/deprecate`,
    restore: (id: string) => `/admin/bundles/products/${id}/restore`,
  },

  // ---------------------------------------------------------------
  // Admin / Settings
  // ---------------------------------------------------------------
  adminSettings: {
    list: '/admin/settings',
    update: (key: string) => `/admin/settings/${key}`,
  },

  // ---------------------------------------------------------------
  // Admin / Payments
  // ---------------------------------------------------------------
  adminPayments: {
    list: '/payments/admin/list',
    activate: '/payments/admin/activate',
  },
} as const;
