import { api } from "@/shared/api/httpClient";
import type { AdminEntityItem, AssignPermissionsPayload, AssignRolesPayload, AdminUser, AdminRole, AdminPermission } from "../types/admin.types";

type UnknownRecord = Record<string, unknown>;

const toRecord = (value: unknown): UnknownRecord =>
  value && typeof value === "object" ? (value as UnknownRecord) : {};

const extractPayload = (raw: unknown) => {
  const root = toRecord(raw);
  return root.data ?? raw;
};

const extractArrayPayload = (raw: unknown): AdminEntityItem[] => {
  const payload = extractPayload(raw);

  if (Array.isArray(payload)) {
    return payload.filter((item): item is AdminEntityItem => !!item && typeof item === "object");
  }

  const payloadRecord = toRecord(payload);
  const candidates = [payloadRecord.items, payloadRecord.rows, payloadRecord.data, payloadRecord.results];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate.filter((item): item is AdminEntityItem => !!item && typeof item === "object");
    }
  }

  return [];
};

/**
 * Get all users with pagination support
 */
export const getAllUsers = async (page = 1, perPage = 50) => {
  const response = await api.get("/admin/users", {
    params: { page, per_page: perPage }
  });
  return {
    items: extractArrayPayload(response.data) as unknown as AdminUser[],
    raw: response.data,
    total: toRecord(response.data).total,
    page,
    perPage,
  };
};

/**
 * Get user by ID
 */
export const getUserById = async (id: string | number) => {
  const response = await api.get(`/admin/users/${id}`);
  return {
    data: extractPayload(response.data),
    raw: response.data,
  };
};

/**
 * Assign roles to a user
 */
export const assignRolesToUser = async (id: string, payload: AssignRolesPayload) => {
  const response = await api.post(`/admin/users/${id}/assign-role`, payload);
  return { raw: response.data };
};

/**
 * Remove role from a user
 */
export const removeRoleFromUser = async (id: string, roleId: number) => {
  const response = await api.delete(`/admin/users/${id}/remove-role/${roleId}`);
  return { raw: response.data };
};

/**
 * Get all roles with permissions
 */
export const getAllRoles = async (page = 1, perPage = 50) => {
  const response = await api.get("/admin/roles", {
    params: { page, per_page: perPage }
  });
  return {
    items: extractArrayPayload(response.data) as unknown as AdminRole[],
    raw: response.data,
    total: toRecord(response.data).total,
    page,
    perPage,
  };
};

/**
 * Get role by ID
 */
export const getRoleById = async (id: string | number) => {
  const response = await api.get(`/admin/roles/${id}`);
  return {
    data: extractPayload(response.data),
    raw: response.data,
  };
};

/**
 * Assign permissions to a role
 */
export const assignPermissionsToRole = async (id: string, payload: AssignPermissionsPayload) => {
  const response = await api.post(`/admin/roles/${id}/assign-permission`, payload);
  return { raw: response.data };
};

/**
 * Remove permission from a role
 */
export const removePermissionFromRole = async (id: string, permissionId: number) => {
  const response = await api.delete(`/admin/roles/${id}/remove-permission/${permissionId}`);
  return { raw: response.data };
};

/**
 * Create a new role
 */
export const createRole = async (payload: { name: string; description?: string }) => {
  const response = await api.post("/admin/roles", payload);
  return {
    data: extractPayload(response.data),
    raw: response.data,
  };
};

/**
 * Update an existing role
 */
export const updateRole = async (id: string | number, payload: { name: string; description?: string }) => {
  const response = await api.put(`/admin/roles/${id}`, payload);
  return {
    data: extractPayload(response.data),
    raw: response.data,
  };
};

/**
 * Delete a role
 */
export const deleteRole = async (id: string | number) => {
  const response = await api.delete(`/admin/roles/${id}`);
  return { raw: response.data };
};

/**
 * Get all permissions
 */
export const getAllPermissions = async (page = 1, perPage = 50) => {
  const response = await api.get("/admin/permissions", {
    params: { page, per_page: perPage }
  });
  return {
    items: extractArrayPayload(response.data) as unknown as AdminPermission[],
    raw: response.data,
    total: toRecord(response.data).total,
    page,
    perPage,
  };
};

/**
 * Get permission by ID
 */
export const getPermissionById = async (id: string | number) => {
  const response = await api.get(`/admin/permissions/${id}`);
  return {
    data: extractPayload(response.data),
    raw: response.data,
  };
};

/**
 * Check if current user can modify a role
 */
export const canModifyRole = async (roleId: number) => {
  try {
    const response = await api.get(`/admin/roles/${roleId}/can-modify`);
    return toRecord(response.data).can_modify ?? false;
  } catch {
    return false;
  }
};

/**
 * Check if current user can assign a specific role
 */
export const canAssignRole = async (roleId: number) => {
  try {
    const response = await api.get(`/admin/roles/${roleId}/can-assign`);
    return toRecord(response.data).can_assign ?? false;
  } catch {
    return false;
  }
};
