/**
 * RBAC Types Definition
 * Defines all types for Role-Based Access Control dynamic architecture
 */

export type RoleType = string;
export type PermissionType = string;

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
} as const;

export const PERMISSIONS = {
  EMPLOYEE_VIEW: 'employee.view',
  EMPLOYEE_CREATE: 'employee.create',
  EMPLOYEE_UPDATE: 'employee.update',
  EMPLOYEE_DELETE: 'employee.delete',
  LEAVE_VIEW: 'leave.view',
  LEAVE_CREATE: 'leave.create',
  LEAVE_APPROVE: 'leave.approve',
  ATTENDANCE_VIEW_ALL: 'attendance.view_all',
  ATTENDANCE_DELETE: 'attendance.delete',
  ATTENDANCE_CHECK_IN: 'attendance.check_in',
  ATTENDANCE_CHECK_OUT: 'attendance.check_out',
  ATTENDANCE_VIEW_OWN: 'attendance.view_own',
  LOCATION_VIEW: 'location.view',
  LOCATION_CREATE: 'location.create',
  LOCATION_UPDATE: 'location.update',
  LOCATION_DELETE: 'location.delete',
  PROFILE_VIEW_ALL: 'profile.view_all',
  PROFILE_UPDATE: 'profile.update',
  PROFILE_DELETE: 'profile.delete',
  PAYROLL_VIEW: 'payroll.view',
  PAYROLL_CREATE: 'payroll.create',
  PAYROLL_UPDATE: 'payroll.update',
  PAYROLL_DELETE: 'payroll.delete',
  KPI_VIEW: 'kpi.view',
  REPORTING_DASHBOARD: 'reporting.dashboard',
  ADMIN_EMAIL_MANAGE: 'admin.email.manage',
  OVERTIME_VIEW: 'overtime.view',
  USER_VIEW: 'user.view',
  USER_ASSIGN_ROLE: 'user.assign_role',
  ROLE_VIEW: 'role.view',
  ROLE_ASSIGN_PERMISSION: 'role.assign_permission',
  PERMISSION_VIEW: 'permission.view',
} as const;

export interface Role {
  id: number;
  name: string;
  display_name: string;
  description?: string;
  permissions_count?: number;
  permissions?: Permission[];
  created_at?: string;
  updated_at?: string;
}

export interface Permission {
  id: number;
  name: string;
  display_name: string;
  description?: string;
  guard_name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  profile?: {
    avatar?: string;
    avatar_url?: string;
  } | null;
  employee?: unknown;
  roles?: Role[];
  permissions?: Permission[];
  role_ids?: number[];
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

export interface AuthUser extends User {
  roles: Role[];
  permissions: Permission[];
}

export interface RBACContext {
  user: AuthUser | null;
  roles: Role[];
  permissions: Permission[];
  hasPermission: (permission: string | string[]) => boolean;
  hasRole: (role: string | string[]) => boolean;
  isSuperAdmin: () => boolean;
  canManageUsers: () => boolean;
  canManageRoles: () => boolean;
  canManagePermissions: () => boolean;
}

export interface PermissionCheckOptions {
  requireAll?: boolean;
  allowSuperAdmin?: boolean;
}
