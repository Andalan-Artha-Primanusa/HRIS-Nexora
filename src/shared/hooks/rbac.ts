/**
 * RBAC Utilities
 * Helper functions for checking permissions and roles
 */

import type { AuthUser, PermissionType, RoleType } from "@/shared/types/rbac.types";
import { PERMISSIONS, ROLES } from "@/shared/types/rbac.types";

export class RBACUtils {
  /**
   * Check if user has a specific permission
   */
  static hasPermission(user: AuthUser | null, permission: PermissionType | PermissionType[], requireAll = false): boolean {
    if (!user) return false;

    const permissions = Array.isArray(permission) ? permission : [permission];
    const userPermissions = user.permissions?.map((p) => p.name) ?? [];

    if (requireAll) {
      return permissions.every((p) => userPermissions.includes(p));
    }
    return permissions.some((p) => userPermissions.includes(p));
  }

  /**
   * Check if user has a specific role
   */
  static hasRole(user: AuthUser | null, role: RoleType | RoleType[]): boolean {
    if (!user) return false;

    const roles = Array.isArray(role) ? role : [role];
    const userRoles = user.roles?.map((r) => r.name) ?? [];

    return roles.some((r) => userRoles.includes(r));
  }

  /**
   * Check if user is super admin
   */
  static isSuperAdmin(user: AuthUser | null): boolean {
    return RBACUtils.hasRole(user, ROLES.SUPER_ADMIN);
  }

  /**
   * Check if user is admin or super admin
   */
  static isAdmin(user: AuthUser | null): boolean {
    return RBACUtils.hasRole(user, [ROLES.ADMIN, ROLES.SUPER_ADMIN]);
  }

  /**
   * Check if user is HR
   */
  static isHR(user: AuthUser | null): boolean {
    return RBACUtils.hasRole(user, ROLES.HR);
  }

  /**
   * Check if user is Manager
   */
  static isManager(user: AuthUser | null): boolean {
    return RBACUtils.hasRole(user, ROLES.MANAGER);
  }

  /**
   * Check if user has admin access (can manage users and roles)
   */
  static canManageUsers(user: AuthUser | null): boolean {
    return RBACUtils.hasPermission(user, PERMISSIONS.USER_ASSIGN_ROLE);
  }

  /**
   * Check if user can manage roles
   */
  static canManageRoles(user: AuthUser | null): boolean {
    return RBACUtils.hasPermission(user, PERMISSIONS.ROLE_ASSIGN_PERMISSION);
  }

  /**
   * Check if user can view permissions
   */
  static canViewPermissions(user: AuthUser | null): boolean {
    return RBACUtils.hasPermission(user, PERMISSIONS.PERMISSION_VIEW);
  }

  /**
   * Check if user can view roles
   */
  static canViewRoles(user: AuthUser | null): boolean {
    return RBACUtils.hasPermission(user, PERMISSIONS.ROLE_VIEW);
  }

  /**
   * Check if user can view users
   */
  static canViewUsers(user: AuthUser | null): boolean {
    return RBACUtils.hasPermission(user, PERMISSIONS.USER_VIEW);
  }

  /**
   * Check if user can assign super admin role
   */
  static canAssignSuperAdmin(user: AuthUser | null): boolean {
    return RBACUtils.isSuperAdmin(user);
  }

  /**
   * Get role display name
   */
  static getRoleDisplayName(role: RoleType): string {
    const roleMap: Record<RoleType, string> = {
      super_admin: 'Super Admin',
      admin: 'Administrator',
      hr: 'HR Staff',
      manager: 'Manager',
      employee: 'Employee',
    };
    return roleMap[role];
  }

  /**
   * Get permission display name
   */
  static getPermissionDisplayName(permission: PermissionType): string {
    const permissionMap: Record<PermissionType, string> = {
      'user.view': 'View Users',
      'user.assign_role': 'Assign Roles to Users',
      'role.view': 'View Roles',
      'role.assign_permission': 'Assign Permissions to Roles',
      'permission.view': 'View Permissions',
    };
    return permissionMap[permission];
  }
}

/**
 * Hook-friendly wrapper for RBAC utilities with user from store
 */
export const useRBAC = (user: AuthUser | null) => {
  return {
    hasPermission: (permission: PermissionType | PermissionType[], requireAll?: boolean) =>
      RBACUtils.hasPermission(user, permission, requireAll),
    hasRole: (role: RoleType | RoleType[]) =>
      RBACUtils.hasRole(user, role),
    isSuperAdmin: () => RBACUtils.isSuperAdmin(user),
    isAdmin: () => RBACUtils.isAdmin(user),
    isHR: () => RBACUtils.isHR(user),
    isManager: () => RBACUtils.isManager(user),
    canManageUsers: () => RBACUtils.canManageUsers(user),
    canManageRoles: () => RBACUtils.canManageRoles(user),
    canViewPermissions: () => RBACUtils.canViewPermissions(user),
    canViewRoles: () => RBACUtils.canViewRoles(user),
    canViewUsers: () => RBACUtils.canViewUsers(user),
    canAssignSuperAdmin: () => RBACUtils.canAssignSuperAdmin(user),
  };
};
