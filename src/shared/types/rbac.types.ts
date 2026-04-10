/**
 * RBAC Types Definition
 * Defines all types for Role-Based Access Control
 */

export type RoleType = 'super_admin' | 'admin' | 'hr' | 'manager' | 'employee';

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  HR: 'hr',
  MANAGER: 'manager',
  EMPLOYEE: 'employee',
} as const;

export type PermissionType = 
  | 'user.view'
  | 'user.assign_role'
  | 'role.view'
  | 'role.assign_permission'
  | 'permission.view';

export const PERMISSIONS = {
  USER_VIEW: 'user.view',
  USER_ASSIGN_ROLE: 'user.assign_role',
  ROLE_VIEW: 'role.view',
  ROLE_ASSIGN_PERMISSION: 'role.assign_permission',
  PERMISSION_VIEW: 'permission.view',
} as const;

// Role hierarchy and default permissions
export const ROLE_PERMISSIONS: Record<RoleType, PermissionType[]> = {
  super_admin: [
    PERMISSIONS.USER_VIEW,
    PERMISSIONS.USER_ASSIGN_ROLE,
    PERMISSIONS.ROLE_VIEW,
    PERMISSIONS.ROLE_ASSIGN_PERMISSION,
    PERMISSIONS.PERMISSION_VIEW,
  ],
  admin: [
    PERMISSIONS.USER_VIEW,
    PERMISSIONS.USER_ASSIGN_ROLE,
    PERMISSIONS.ROLE_VIEW,
    PERMISSIONS.ROLE_ASSIGN_PERMISSION,
    PERMISSIONS.PERMISSION_VIEW,
  ],
  hr: [
    PERMISSIONS.USER_VIEW,
    PERMISSIONS.ROLE_VIEW,
    PERMISSIONS.PERMISSION_VIEW,
  ],
  manager: [
    PERMISSIONS.USER_VIEW,
  ],
  employee: [],
};

export interface Role {
  id: number;
  name: RoleType;
  display_name: string;
  description?: string;
  permissions_count?: number;
  permissions?: Permission[];
  created_at?: string;
  updated_at?: string;
}

export interface Permission {
  id: number;
  name: PermissionType;
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
  roles?: Role[];
  permissions?: Permission[];
  role_ids?: number[];
  created_at?: string;
  updated_at?: string;
}

export interface AuthUser extends User {
  roles: Role[];
  permissions: Permission[];
}

export interface RBACContext {
  user: AuthUser | null;
  roles: Role[];
  permissions: Permission[];
  hasPermission: (permission: PermissionType | PermissionType[]) => boolean;
  hasRole: (role: RoleType | RoleType[]) => boolean;
  isSuperAdmin: () => boolean;
  isAdmin: () => boolean;
  canManageUsers: () => boolean;
  canManageRoles: () => boolean;
  canManagePermissions: () => boolean;
}

export interface PermissionCheckOptions {
  requireAll?: boolean; // If true, require ALL permissions. If false, require ANY
  allowSuperAdmin?: boolean; // If true, super admin can always access (default: true)
}
