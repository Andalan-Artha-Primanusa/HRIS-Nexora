import { api } from "@/shared/api/httpClient";
import { extractArrayPayload, extractPayload, parsePaginatedResponse } from "@/shared/api/pagination";
import type {
  ReimbursementCreatePayload,
  ReimbursementDecisionPayload,
  ReimbursementFilters,
  ReimbursementItem,
  ReimbursementRejectPayload,
  ReimbursementUpdatePayload,
} from "../types/reimbursement.types";

const isReimbursementItem = (item: unknown): item is ReimbursementItem =>
  item !== null && typeof item === "object";

const normalizeReimbursementItem = (item: ReimbursementItem): ReimbursementItem => {
  if (!item.employee) return item;
  const department =
    typeof item.employee.department === "object" && item.employee.department !== null
      ? item.employee.department
      : item.employee.departmentRel ?? item.employee.department ?? null;
  const position =
    typeof item.employee.position === "object" && item.employee.position !== null
      ? item.employee.position
      : item.employee.positionRel ?? item.employee.position ?? null;

  return {
    ...item,
    employee: {
      ...item.employee,
      department,
      position,
    },
  };
};

const normalizeReimbursementItems = (items: ReimbursementItem[]): ReimbursementItem[] =>
  items.map(normalizeReimbursementItem);

// ─── HR / ADMIN / MANAGER endpoints ─────────────────────────────────────────

/** GET /reimbursements → index() */
export const getAllReimbursements = async (filters?: ReimbursementFilters) => {
  const response = await api.get("reimbursements", { params: filters });
  const raw = response.data;
  const parsed = parsePaginatedResponse(raw, isReimbursementItem);
  return {
    items: normalizeReimbursementItems(parsed.items),
    totalPages: parsed.totalPages,
    total: parsed.total,
    raw,
  };
};

/** POST /reimbursements → store() */
export const createReimbursement = async (payload: ReimbursementCreatePayload) => {
  const response = await api.post("reimbursements", payload);
  return { raw: response.data };
};

/** GET /reimbursements/{id} → show() */
export const getReimbursementDetail = async (id: string) => {
  const response = await api.get(`reimbursements/${id}`);
  return {
    payload: isReimbursementItem(extractPayload(response.data))
      ? normalizeReimbursementItem(extractPayload(response.data))
      : extractPayload(response.data),
    raw: response.data,
  };
};

/** PUT /reimbursements/{id} → update() — hanya bisa jika masih draft */
export const updateReimbursement = async (id: string, payload: ReimbursementUpdatePayload) => {
  const response = await api.put(`reimbursements/${id}`, payload);
  return { raw: response.data };
};

/** DELETE /reimbursements/{id} → destroy() — hanya bisa jika masih draft */
export const deleteReimbursement = async (id: string) => {
  const response = await api.delete(`reimbursements/${id}`);
  return { raw: response.data };
};

/** POST /reimbursements/{id}/approve → approve() */
export const approveReimbursement = async (id: string, payload?: ReimbursementDecisionPayload) => {
  const response = await api.put(`reimbursements/${id}/approve`, payload ?? {});
  return { raw: response.data };
};

/** POST /reimbursements/{id}/reject → reject() — note wajib */
export const rejectReimbursement = async (id: string, payload: ReimbursementRejectPayload) => {
  const response = await api.put(`reimbursements/${id}/reject`, payload);
  return { raw: response.data };
};

/** POST /reimbursements/{id}/mark-paid → markAsPaid() — hanya admin/HR */
export const markReimbursementAsPaid = async (id: string) => {
  const response = await api.put(`reimbursements/${id}/mark-paid`);
  return { raw: response.data };
};

/** GET /reimbursements/pending → pending() */
export const getPendingReimbursements = async (page = 1, perPage = 10) => {
  const response = await api.get("reimbursements/pending", { params: { page, per_page: perPage } });
  const raw = response.data;
  const parsed = parsePaginatedResponse(raw, isReimbursementItem);
  return {
    items: normalizeReimbursementItems(parsed.items),
    totalPages: parsed.totalPages,
    total: parsed.total,
    raw,
  };
};

/** GET /reimbursements/employee/{employee_id} → byEmployee() */
export const getReimbursementsByEmployee = async (employeeId: string) => {
  const response = await api.get(`reimbursements/employee/${employeeId}`);
  return {
    items: normalizeReimbursementItems(extractArrayPayload(response.data, isReimbursementItem)),
    raw: response.data,
  };
};

/** GET /reimbursements/statistics → statistics() */
export const getReimbursementStatistics = async (employeeId?: string) => {
  const response = await api.get("reimbursements/statistics", {
    params: employeeId ? { employee_id: employeeId } : undefined,
  });
  return {
    payload: extractPayload(response.data),
    raw: response.data,
  };
};

// ─── ESS (Employee Self-Service) endpoints ───────────────────────────────────

/** GET /my/reimbursements → myReimbursements() */
export const getMyReimbursements = async (status?: string, page = 1, perPage = 10) => {
  const response = await api.get("my/reimbursements", {
    params: { ...(status ? { status } : {}), page, per_page: perPage },
  });
  const raw = response.data;
  const parsed = parsePaginatedResponse(raw, isReimbursementItem);
  return {
    items: normalizeReimbursementItems(parsed.items),
    totalPages: parsed.totalPages,
    total: parsed.total,
    raw,
  };
};

/** POST /my/reimbursements → createMyReimbursement() */
export const createMyReimbursement = async (payload: Omit<ReimbursementCreatePayload, "employee_id">) => {
  const response = await api.post("my/reimbursements", payload);
  return { raw: response.data };
};

/** PUT /my/reimbursements/{id} → updateMyReimbursement() */
export const updateMyReimbursement = async (id: string, payload: ReimbursementUpdatePayload) => {
  const response = await api.put(`my/reimbursements/${id}`, payload);
  return { raw: response.data };
};

/** Employee draft deletes use the shared reimbursement delete route. */
export const deleteMyReimbursement = async (id: string) => {
  return deleteReimbursement(id);
};

/** POST /reimbursements/{id}/submit → submit() */
export const submitMyReimbursement = async (id: string) => {
  const response = await api.post(`my/reimbursements/${id}/submit`);
  return { raw: response.data };
};
