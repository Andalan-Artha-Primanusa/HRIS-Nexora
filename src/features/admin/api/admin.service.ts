import { api } from "@/shared/api/httpClient";
import type { AdminEntityItem, AssignPermissionsPayload, AssignRolesPayload } from "../types/admin.types";

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

export const getAllUsers = async () => {
  const response = await api.get("/admin/users");
  return {
    items: extractArrayPayload(response.data),
    raw: response.data,
  };
};

export const assignRolesToUser = async (id: string, payload: AssignRolesPayload) => {
  const response = await api.post(`/admin/users/${id}/assign-role`, payload);
  return { raw: response.data };
};

export const getAllRoles = async () => {
  const response = await api.get("/admin/roles");
  return {
    items: extractArrayPayload(response.data),
    raw: response.data,
  };
};

export const assignPermissionsToRole = async (id: string, payload: AssignPermissionsPayload) => {
  const response = await api.post(`/admin/roles/${id}/assign-permission`, payload);
  return { raw: response.data };
};

export const getAllPermissions = async () => {
  const response = await api.get("/admin/permissions");
  return {
    items: extractArrayPayload(response.data),
    raw: response.data,
  };
};
