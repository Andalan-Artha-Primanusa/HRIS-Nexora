import { api } from "@/shared/api/httpClient";
import type {
  ReimbursementCreatePayload,
  ReimbursementDecisionPayload,
  ReimbursementFilters,
  ReimbursementItem,
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

export const getAllReimbursements = async (filters?: ReimbursementFilters) => {
  const response = await api.get("/reimbursements", {
    params: filters,
  });

  return {
    items: extractArrayPayload(response.data),
    raw: response.data,
  };
};

export const createReimbursement = async (payload: ReimbursementCreatePayload) => {
  const response = await api.post("/reimbursements", payload);
  return { raw: response.data };
};

export const getReimbursementDetail = async (id: string) => {
  const response = await api.get(`/reimbursements/${id}`);
  return {
    payload: extractPayload(response.data),
    raw: response.data,
  };
};

export const updateReimbursement = async (id: string, payload: ReimbursementUpdatePayload) => {
  const response = await api.put(`/reimbursements/${id}`, payload);
  return { raw: response.data };
};

export const deleteReimbursement = async (id: string) => {
  const response = await api.delete(`/reimbursements/${id}`);
  return { raw: response.data };
};

export const approveReimbursement = async (id: string, payload: ReimbursementDecisionPayload) => {
  const response = await api.put(`/reimbursements/${id}/approve`, payload);
  return { raw: response.data };
};

export const rejectReimbursement = async (id: string, payload: ReimbursementDecisionPayload) => {
  const response = await api.put(`/reimbursements/${id}/reject`, payload);
  return { raw: response.data };
};

export const markReimbursementAsPaid = async (id: string) => {
  const response = await api.put(`/reimbursements/${id}/mark-paid`);
  return { raw: response.data };
};

export const getPendingReimbursements = async () => {
  const response = await api.get("/reimbursements/pending");
  return {
    items: extractArrayPayload(response.data),
    raw: response.data,
  };
};

export const getReimbursementsByEmployee = async (employeeId: string) => {
  const response = await api.get(`/reimbursements/employee/${employeeId}`);
  return {
    items: extractArrayPayload(response.data),
    raw: response.data,
  };
};

export const getReimbursementStatistics = async (employeeId?: string) => {
  const response = await api.get("/reimbursements/statistics", {
    params: employeeId ? { employee_id: employeeId } : undefined,
  });

  return {
    payload: extractPayload(response.data),
    raw: response.data,
  };
};
