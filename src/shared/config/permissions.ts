/**
 * Menu Permissions Configuration
 * Maps menu items and routes to required permissions
 */

import type { PermissionType, RoleType } from '@/shared/types/rbac.types';
import { PERMISSIONS, ROLES } from '@/shared/types/rbac.types';

export interface MenuPermissionConfig {
  path: string;
  requiredPermission?: PermissionType | PermissionType[];
  requiredRole?: RoleType | RoleType[];
  requireAll?: boolean;
  visibleToRoles?: RoleType[];
  visibleToPermissions?: PermissionType[];
}

/**
 * Permission mapping for protected routes
 * If a route is not in this map, it's accessible to authenticated users
 */
export const routePermissions: Record<string, MenuPermissionConfig> = {
  // Admin routes
  '/admin/users': {
    path: '/admin/users',
    requiredPermission: PERMISSIONS.USER_VIEW,
    visibleToRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  },
  '/admin/roles': {
    path: '/admin/roles',
    requiredPermission: PERMISSIONS.ROLE_VIEW,
    visibleToRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  },
  '/admin/permissions': {
    path: '/admin/permissions',
    requiredPermission: PERMISSIONS.PERMISSION_VIEW,
    visibleToRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  },
  
  // Admin management routes
  '/settings/user-role': {
    path: '/settings/user-role',
    requiredPermission: [PERMISSIONS.USER_ASSIGN_ROLE, PERMISSIONS.ROLE_ASSIGN_PERMISSION],
    visibleToRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  },
  '/settings/permissions': {
    path: '/settings/permissions',
    requiredPermission: PERMISSIONS.PERMISSION_VIEW,
    visibleToRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  },
};

/**
 * Check if a user can access a route based on permissions
 */
export const canAccessRoute = (
  userRoles: RoleType[] | undefined,
  userPermissions: PermissionType[] | undefined,
  config: MenuPermissionConfig
): boolean => {
  const roles = userRoles ?? [];
  const permissions = userPermissions ?? [];

  // Check required permission
  if (config.requiredPermission) {
    const requiredPerms = Array.isArray(config.requiredPermission)
      ? config.requiredPermission
      : [config.requiredPermission];

    const hasPermission = config.requireAll
      ? requiredPerms.every((p) => permissions.includes(p))
      : requiredPerms.some((p) => permissions.includes(p));

    if (!hasPermission && !roles.includes(ROLES.SUPER_ADMIN)) {
      return false;
    }
  }

  // Check required role
  if (config.requiredRole) {
    const requiredRoles = Array.isArray(config.requiredRole)
      ? config.requiredRole
      : [config.requiredRole];

    if (!requiredRoles.some((r) => roles.includes(r)) && !roles.includes(ROLES.SUPER_ADMIN)) {
      return false;
    }
  }

  return true;
};

/**
 * Get visible menu items based on user role
 */
export const getVisibleMenuItems = (userRole: RoleType | undefined) => {
  if (!userRole) return [];

  const visiblePaths: string[] = [];

  // All users can see dashboard
  visiblePaths.push(
    '/dashboard',
    '/attendance',
    '/leave',
    '/profiles',
    '/employees'
  );

  // HR and above
  if (['hr', 'admin', 'super_admin'].includes(userRole as string)) {
    visiblePaths.push(
      '/attendance/admin',
      '/payroll'
    );
  }

  // Admin and Super Admin
  if (['admin', 'super_admin'].includes(userRole as string)) {
    visiblePaths.push(
      '/admin/users',
      '/admin/roles',
      '/admin/permissions',
      '/locations'
    );
  }

  // Super Admin only (all features)
  if (userRole === ROLES.SUPER_ADMIN) {
    visiblePaths.push(
      '/settings',
      '/reports'
    );
  }

  return visiblePaths;
};
