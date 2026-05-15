/**
 * RBAC Utilities
 * Dynamic permissions, roles, and capability handlers driven by backend source of truth
 */

import type { AuthUser } from "@/shared/types/rbac.types";
import { PERMISSIONS, ROLES } from "@/shared/types/rbac.types";

const normalizeName = (value: string): string => value.trim().toLowerCase();

const ROLE_PERMISSION_FALLBACKS: Record<string, string[] | "*"> = {
  [ROLES.SUPER_ADMIN]: "*",
  [ROLES.ADMIN]: "*",
  [ROLES.HR]: [
    "employee.view",
    "leave.view",
    "leave.create",
    "leave.approve",
    "reimbursement.view",
    "reimbursement.approve",
    "reimbursement.pay",
    "reporting.dashboard",
    "attendance.view_all",
    "payroll.view",
    "kpi.view",
    "training.view",
    "asset.view",
    "document.view",
  ],
  [ROLES.MANAGER]: [
    "employee.view",
    "leave.view",
    "leave.approve",
    "reimbursement.view",
    "reimbursement.approve",
    "reporting.dashboard",
    "attendance.view_all",
    "payroll.view",
    "kpi.view",
    "training.view",
    "asset.view",
    "document.view",
  ],
};

export class RBACUtils {
  /**
   * Check if user has a specific permission/capability
   */
  static hasPermission(user: AuthUser | null, permission: string | string[], requireAll = false): boolean {
    if (!user) return false;

    // Super admin has absolute access
    const userRoles = user.roles?.map((r) => normalizeName(r.name)) ?? [];
    if (userRoles.includes(ROLES.SUPER_ADMIN)) return true;

    const permissions = (Array.isArray(permission) ? permission : [permission]).map(normalizeName);
    const userPermissions = user.permissions?.map((p) => normalizeName(p.name)) ?? [];

    const hasExplicitPermission = (perm: string) => userPermissions.includes(perm);
    const hasRoleFallbackPermission = (perm: string) =>
      userRoles.some((role) => {
        const fallback = ROLE_PERMISSION_FALLBACKS[role];
        return fallback === "*" || (Array.isArray(fallback) && fallback.includes(perm));
      });

    if (requireAll) {
      return permissions.every((p) => hasExplicitPermission(p) || hasRoleFallbackPermission(p));
    }
    return permissions.some((p) => hasExplicitPermission(p) || hasRoleFallbackPermission(p));
  }

  /**
   * Check if user possesses a specific role string natively
   */
  static hasRole(user: AuthUser | null, role: string | string[]): boolean {
    if (!user) return false;

    const roles = (Array.isArray(role) ? role : [role]).map(normalizeName);
    const userRoles = user.roles?.map((r) => normalizeName(r.name)) ?? [];

    return roles.some((r) => userRoles.includes(r));
  }

  /**
   * Check if user is super admin
   */
  static isSuperAdmin(user: AuthUser | null): boolean {
    return RBACUtils.hasRole(user, ROLES.SUPER_ADMIN);
  }

  /**
   * Capability checks delegated purely to permission constants or backend definitions
   */
  static canManageUsers(user: AuthUser | null): boolean {
    return RBACUtils.hasPermission(user, PERMISSIONS.USER_ASSIGN_ROLE);
  }

  static canManageRoles(user: AuthUser | null): boolean {
    return RBACUtils.hasPermission(user, PERMISSIONS.ROLE_ASSIGN_PERMISSION);
  }

  static canViewPermissions(user: AuthUser | null): boolean {
    return RBACUtils.hasPermission(user, PERMISSIONS.PERMISSION_VIEW);
  }

  static canViewRoles(user: AuthUser | null): boolean {
    return RBACUtils.hasPermission(user, PERMISSIONS.ROLE_VIEW);
  }

  static canViewUsers(user: AuthUser | null): boolean {
    return RBACUtils.hasPermission(user, PERMISSIONS.USER_VIEW);
  }

  /**
   * Dynamic formatter for roles created directly from database
   */
  static getRoleDisplayName(role: string): string {
    if (!role) return '-';
    const roleMap: Record<string, string> = {
      super_admin: 'Super Admin',
      admin: 'Administrator',
      hr: 'HR Staff',
      manager: 'Manager',
      employee: 'Employee',
    };
    if (roleMap[role]) return roleMap[role];

    // Dynamic Title Case fallback
    return role
      .split(/[_-]/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }

  /**
   * Dynamic formatter for permissions
   */
  static getPermissionDisplayName(permission: string): string {
    if (!permission) return '-';
    const permissionMap: Record<string, string> = {
      'employee.view': 'View Employees',
      'employee.create': 'Create Employees',
      'employee.update': 'Update Employees',
      'employee.delete': 'Delete Employees',
      'leave.view': 'View Leave',
      'leave.create': 'Create Leave Requests',
      'leave.approve': 'Approve Leave',
      'attendance.view_all': 'View All Attendance',
      'attendance.delete': 'Delete Attendance',
      'attendance.check_in': 'Check In',
      'attendance.check_out': 'Check Out',
      'attendance.view_own': 'View Own Attendance',
      'location.view': 'View Locations',
      'location.create': 'Create Locations',
      'location.update': 'Update Locations',
      'location.delete': 'Delete Locations',
      'profile.view_all': 'View All Profiles',
      'profile.update': 'Update Profiles',
      'profile.delete': 'Delete Profiles',
      'payroll.view': 'View Payroll',
      'payroll.create': 'Create Payroll',
      'payroll.update': 'Update Payroll',
      'payroll.delete': 'Delete Payroll',
      'user.view': 'View Users',
      'user.assign_role': 'Assign Roles to Users',
      'role.view': 'View Roles',
      'role.assign_permission': 'Assign Permissions to Roles',
      'permission.view': 'View Permissions',
    };
    if (permissionMap[permission]) return permissionMap[permission];

    return permission
      .split(/[._-]/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }
}

/**
 * Hook wrapper with type-safe operations
 */
export const useRBAC = (user: AuthUser | null) => {
  return {
    hasPermission: (permission: string | string[], requireAll?: boolean) =>
      RBACUtils.hasPermission(user, permission, requireAll),
    hasRole: (role: string | string[]) =>
      RBACUtils.hasRole(user, role),
    isSuperAdmin: () => RBACUtils.isSuperAdmin(user),
    canManageUsers: () => RBACUtils.canManageUsers(user),
    canManageRoles: () => RBACUtils.canManageRoles(user),
    canViewPermissions: () => RBACUtils.canViewPermissions(user),
    canViewRoles: () => RBACUtils.canViewRoles(user),
    canViewUsers: () => RBACUtils.canViewUsers(user),
  };
};
