import { api } from "@/shared/api/httpClient";
import type {
  ReimbursementCreatePayload,
  ReimbursementDecisionPayload,
  ReimbursementFilters,
  ReimbursementItem,
  ReimbursementRejectPayload,
  ReimbursementUpdatePayload,
} from "../types/reimbursement.types";

type UnknownRecord = Record<string, unknown>;

const toRecord = (value: unknown): UnknownRecord =>
  value && typeof value === "object" ? (value as UnknownRecord) : {};

const extractPayload = (raw: unknown) => {
  const root = toRecord(raw);
  return root.data ?? raw;
};

const extractArrayPayload = (raw: unknown): ReimbursementItem[] => {
  const payload = extractPayload(raw);

  if (Array.isArray(payload)) {
    return payload.filter((item): item is ReimbursementItem => !!item && typeof item === "object");
  }

  const payloadRecord = toRecord(payload);
  const candidates = [payloadRecord.items, payloadRecord.rows, payloadRecord.data, payloadRecord.results];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate.filter((item): item is ReimbursementItem => !!item && typeof item === "object");
    }
  }

  return [];
};

// ─── HR / ADMIN / MANAGER endpoints ─────────────────────────────────────────

/** GET /reimbursements → index() */
export const getAllReimbursements = async (filters?: ReimbursementFilters) => {
  const response = await api.get("/reimbursements", { params: filters });
  return {
    items: extractArrayPayload(response.data),
    raw: response.data,
  };
};

/** POST /reimbursements → store() */
export const createReimbursement = async (payload: ReimbursementCreatePayload) => {
  const response = await api.post("/reimbursements", payload);
  return { raw: response.data };
};

/** GET /reimbursements/{id} → show() */
export const getReimbursementDetail = async (id: string) => {
  const response = await api.get(`/reimbursements/${id}`);
  return {
    payload: extractPayload(response.data),
    raw: response.data,
  };
};

/** PUT /reimbursements/{id} → update() — hanya bisa jika masih draft */
export const updateReimbursement = async (id: string, payload: ReimbursementUpdatePayload) => {
  const response = await api.put(`/reimbursements/${id}`, payload);
  return { raw: response.data };
};

/** DELETE /reimbursements/{id} → destroy() — hanya bisa jika masih draft */
export const deleteReimbursement = async (id: string) => {
  const response = await api.delete(`/reimbursements/${id}`);
  return { raw: response.data };
};

/** POST /reimbursements/{id}/approve → approve() */
export const approveReimbursement = async (id: string, payload?: ReimbursementDecisionPayload) => {
  const response = await api.put(`/reimbursements/${id}/approve`, payload ?? {});
  return { raw: response.data };
};

/** POST /reimbursements/{id}/reject → reject() — note wajib */
export const rejectReimbursement = async (id: string, payload: ReimbursementRejectPayload) => {
  const response = await api.put(`/reimbursements/${id}/reject`, payload);
  return { raw: response.data };
};

/** POST /reimbursements/{id}/mark-paid → markAsPaid() — hanya admin/HR */
export const markReimbursementAsPaid = async (id: string) => {
  const response = await api.put(`/reimbursements/${id}/mark-paid`);
  return { raw: response.data };
};

/** GET /reimbursements/pending → pending() */
export const getPendingReimbursements = async () => {
  const response = await api.get("/reimbursements/pending");
  return {
    items: extractArrayPayload(response.data),
    raw: response.data,
  };
};

/** GET /reimbursements/employee/{employee_id} → byEmployee() */
export const getReimbursementsByEmployee = async (employeeId: string) => {
  const response = await api.get(`/reimbursements/employee/${employeeId}`);
  return {
    items: extractArrayPayload(response.data),
    raw: response.data,
  };
};

/** GET /reimbursements/statistics → statistics() */
export const getReimbursementStatistics = async (employeeId?: string) => {
  const response = await api.get("/reimbursements/statistics", {
    params: employeeId ? { employee_id: employeeId } : undefined,
  });
  return {
    payload: extractPayload(response.data),
    raw: response.data,
  };
};

// ─── ESS (Employee Self-Service) endpoints ───────────────────────────────────

/** GET /my/reimbursements → myReimbursements() */
export const getMyReimbursements = async (status?: string) => {
  const response = await api.get("/my/reimbursements", {
    params: status ? { status } : undefined,
  });
  return {
    items: extractArrayPayload(response.data),
    raw: response.data,
  };
};

/** POST /my/reimbursements → createMyReimbursement() */
export const createMyReimbursement = async (payload: Omit<ReimbursementCreatePayload, "employee_id">) => {
  const response = await api.post("/my/reimbursements", payload);
  return { raw: response.data };
};

/** Employee draft updates use the shared reimbursement update route. */
export const updateMyReimbursement = async (id: string, payload: ReimbursementUpdatePayload) => {
  return updateReimbursement(id, payload);
};

/** Employee draft deletes use the shared reimbursement delete route. */
export const deleteMyReimbursement = async (id: string) => {
  return deleteReimbursement(id);
};

/** POST /reimbursements/{id}/submit → submit() */
export const submitMyReimbursement = async (id: string) => {
  const response = await api.post(`/my/reimbursements/${id}/submit`);
  return { raw: response.data };
};
