import type { Role, Permission, User } from '@/shared/types/rbac.types';

export type AdminEntityItem = Record<string, unknown>;

export interface AssignRolesPayload {
  role_ids: number[];
}

export interface AssignPermissionsPayload {
  permission_ids: number[];
}

export interface AdminUser extends User {
  role_names?: string[];
  permission_count?: number;
}

export interface AdminRole extends Role {
  user_count?: number;
  is_super_admin?: boolean;
  can_modify?: boolean;
}

export interface AdminPermission extends Permission {
  role_count?: number;
}

export interface AdminResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  total?: number;
  page?: number;
  per_page?: number;
}

export interface AdminListResponse<T> {
  items: T[];
  total?: number;
  page?: number;
  per_page?: number;
}

