/**
 * Role-Based Access Control (RBAC) Configuration
 * Defines permissions for different user roles in the SmileSync system
 */

// Define all available permissions in the system
const PERMISSIONS = {
  // Patient Management
  PATIENTS_VIEW: 'patients:view',
  PATIENTS_CREATE: 'patients:create',
  PATIENTS_EDIT: 'patients:edit',
  PATIENTS_DELETE: 'patients:delete',
  PATIENTS_EXPORT: 'patients:export',

  // Appointment Management
  APPOINTMENTS_VIEW: 'appointments:view',
  APPOINTMENTS_CREATE: 'appointments:create',
  APPOINTMENTS_EDIT: 'appointments:edit',
  APPOINTMENTS_DELETE: 'appointments:delete',
  APPOINTMENTS_VIEW_ALL: 'appointments:view_all', // View all appointments vs own only

  // Service Management
  SERVICES_VIEW: 'services:view',
  SERVICES_CREATE: 'services:create',
  SERVICES_EDIT: 'services:edit',
  SERVICES_DELETE: 'services:delete',
  SERVICES_MANAGE_PRICING: 'services:manage_pricing',

  // Product Management
  PRODUCTS_VIEW: 'products:view',
  PRODUCTS_CREATE: 'products:create',
  PRODUCTS_EDIT: 'products:edit',
  PRODUCTS_DELETE: 'products:delete',
  PRODUCTS_MANAGE_INVENTORY: 'products:manage_inventory',
  PRODUCTS_VIEW_COSTS: 'products:view_costs',

  // Invoice & Billing
  INVOICES_VIEW: 'invoices:view',
  INVOICES_CREATE: 'invoices:create',
  INVOICES_EDIT: 'invoices:edit',
  INVOICES_DELETE: 'invoices:delete',
  INVOICES_SEND: 'invoices:send',
  INVOICES_VIEW_ALL: 'invoices:view_all', // View all vs own only

  // Payment Management
  PAYMENTS_VIEW: 'payments:view',
  PAYMENTS_PROCESS: 'payments:process',
  PAYMENTS_REFUND: 'payments:refund',

  // User Management
  USERS_VIEW: 'users:view',
  USERS_CREATE: 'users:create',
  USERS_EDIT: 'users:edit',
  USERS_DELETE: 'users:delete',
  USERS_MANAGE_ROLES: 'users:manage_roles',

  // Analytics & Reports
  ANALYTICS_VIEW: 'analytics:view',
  ANALYTICS_FINANCIAL: 'analytics:financial',
  ANALYTICS_EXPORT: 'analytics:export',

  // System Administration
  SYSTEM_CONFIG: 'system:config',
  SYSTEM_BACKUP: 'system:backup',
  SYSTEM_LOGS: 'system:logs',

  // Clinic Configuration
  CLINIC_CONFIG: 'clinic:config',
  CLINIC_SETTINGS: 'clinic:settings'
};

// Define role-based permission mappings
const ROLE_PERMISSIONS = {
  admin: [
    // Full system access
    ...Object.values(PERMISSIONS)
  ],

  dentist: [
    // Patient Management
    PERMISSIONS.PATIENTS_VIEW,
    PERMISSIONS.PATIENTS_CREATE,
    PERMISSIONS.PATIENTS_EDIT,
    PERMISSIONS.PATIENTS_EXPORT,

    // Appointment Management
    PERMISSIONS.APPOINTMENTS_VIEW,
    PERMISSIONS.APPOINTMENTS_CREATE,
    PERMISSIONS.APPOINTMENTS_EDIT,
    PERMISSIONS.APPOINTMENTS_VIEW_ALL,

    // Service Management
    PERMISSIONS.SERVICES_VIEW,
    PERMISSIONS.SERVICES_CREATE,
    PERMISSIONS.SERVICES_EDIT,
    PERMISSIONS.SERVICES_MANAGE_PRICING,

    // Product Management
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.PRODUCTS_VIEW_COSTS,

    // Invoice & Billing
    PERMISSIONS.INVOICES_VIEW,
    PERMISSIONS.INVOICES_CREATE,
    PERMISSIONS.INVOICES_EDIT,
    PERMISSIONS.INVOICES_SEND,
    PERMISSIONS.INVOICES_VIEW_ALL,

    // Payment Management
    PERMISSIONS.PAYMENTS_VIEW,
    PERMISSIONS.PAYMENTS_PROCESS,

    // Analytics & Reports
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.ANALYTICS_FINANCIAL,
    PERMISSIONS.ANALYTICS_EXPORT
  ],

  assistant: [
    // Patient Management
    PERMISSIONS.PATIENTS_VIEW,
    PERMISSIONS.PATIENTS_CREATE,
    PERMISSIONS.PATIENTS_EDIT,

    // Appointment Management
    PERMISSIONS.APPOINTMENTS_VIEW,
    PERMISSIONS.APPOINTMENTS_CREATE,
    PERMISSIONS.APPOINTMENTS_EDIT,

    // Service Management
    PERMISSIONS.SERVICES_VIEW,

    // Product Management
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.PRODUCTS_MANAGE_INVENTORY,

    // Invoice & Billing (limited)
    PERMISSIONS.INVOICES_VIEW,

    // Analytics (basic)
    PERMISSIONS.ANALYTICS_VIEW
  ],

  receptionist: [
    // Patient Management
    PERMISSIONS.PATIENTS_VIEW,
    PERMISSIONS.PATIENTS_CREATE,
    PERMISSIONS.PATIENTS_EDIT,

    // Appointment Management
    PERMISSIONS.APPOINTMENTS_VIEW,
    PERMISSIONS.APPOINTMENTS_CREATE,
    PERMISSIONS.APPOINTMENTS_EDIT,
    PERMISSIONS.APPOINTMENTS_VIEW_ALL,

    // Service Management
    PERMISSIONS.SERVICES_VIEW,

    // Product Management
    PERMISSIONS.PRODUCTS_VIEW,

    // Invoice & Billing
    PERMISSIONS.INVOICES_VIEW,
    PERMISSIONS.INVOICES_CREATE,
    PERMISSIONS.INVOICES_SEND,
    PERMISSIONS.INVOICES_VIEW_ALL,

    // Payment Management
    PERMISSIONS.PAYMENTS_VIEW,
    PERMISSIONS.PAYMENTS_PROCESS,

    // Analytics (basic)
    PERMISSIONS.ANALYTICS_VIEW
  ],

  staff: [
    // Patient Management (limited)
    PERMISSIONS.PATIENTS_VIEW,

    // Appointment Management (limited)
    PERMISSIONS.APPOINTMENTS_VIEW,

    // Service Management (view only)
    PERMISSIONS.SERVICES_VIEW,

    // Product Management (view only)
    PERMISSIONS.PRODUCTS_VIEW
  ]
};

/**
 * Check if a user role has a specific permission
 * @param {string} role - User role
 * @param {string} permission - Permission to check
 * @returns {boolean} - Whether the role has the permission
 */
function hasPermission(role, permission) {
  if (!role || !permission) return false;
  
  const rolePermissions = ROLE_PERMISSIONS[role] || [];
  return rolePermissions.includes(permission);
}

/**
 * Get all permissions for a specific role
 * @param {string} role - User role
 * @returns {Array} - Array of permissions
 */
function getRolePermissions(role) {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Check if a user role has any of the specified permissions
 * @param {string} role - User role
 * @param {Array} permissions - Array of permissions to check
 * @returns {boolean} - Whether the role has any of the permissions
 */
function hasAnyPermission(role, permissions) {
  if (!role || !Array.isArray(permissions)) return false;
  
  const rolePermissions = ROLE_PERMISSIONS[role] || [];
  return permissions.some(permission => rolePermissions.includes(permission));
}

/**
 * Check if a user role has all of the specified permissions
 * @param {string} role - User role
 * @param {Array} permissions - Array of permissions to check
 * @returns {boolean} - Whether the role has all of the permissions
 */
function hasAllPermissions(role, permissions) {
  if (!role || !Array.isArray(permissions)) return false;
  
  const rolePermissions = ROLE_PERMISSIONS[role] || [];
  return permissions.every(permission => rolePermissions.includes(permission));
}

module.exports = {
  PERMISSIONS,
  ROLE_PERMISSIONS,
  hasPermission,
  getRolePermissions,
  hasAnyPermission,
  hasAllPermissions
};