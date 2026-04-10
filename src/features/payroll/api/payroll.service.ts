import { api } from "@/shared/api/httpClient";
import type {
  PayrollCreatePayload,
  PayrollDetailBulkUpdatePayload,
  PayrollDetailsBulkCreatePayload,
  PayrollDetailUpdatePayload,
  PayrollGenerateMonthlyPayload,
  PayrollItem,
  PayrollUpdatePayload,
} from "../types/payroll.types";

type UnknownRecord = Record<string, unknown>;

const toRecord = (value: unknown): UnknownRecord =>
  value && typeof value === "object" ? (value as UnknownRecord) : {};

const extractPayload = (raw: unknown) => {
  const root = toRecord(raw);
  return root.data ?? raw;
};

const extractArrayPayload = (raw: unknown): PayrollItem[] => {
  const payload = extractPayload(raw);

  if (Array.isArray(payload)) {
    return payload.filter((item): item is PayrollItem => !!item && typeof item === "object");
  }

  const payloadRecord = toRecord(payload);
  const candidates = [payloadRecord.items, payloadRecord.rows, payloadRecord.data, payloadRecord.results];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate.filter((item): item is PayrollItem => !!item && typeof item === "object");
    }
  }

  return [];
};

export const getAllPayroll = async () => {
  const response = await api.get("/payroll");
  return {
    items: extractArrayPayload(response.data),
    raw: response.data,
  };
};

export const createPayroll = async (payload: PayrollCreatePayload) => {
  const response = await api.post("/payroll", payload);
  return { raw: response.data };
};

export const generateMonthlyPayroll = async (payload: PayrollGenerateMonthlyPayload) => {
  const response = await api.post("/payroll/generate/monthly", payload);
  return { raw: response.data };
};

export const getPayrollDetail = async (id: string) => {
  const response = await api.get(`/payroll/${id}`);
  return {
    payload: extractPayload(response.data),
    raw: response.data,
  };
};

export const updatePayroll = async (id: string, payload: PayrollUpdatePayload) => {
  const response = await api.put(`/payroll/${id}`, payload);
  return { raw: response.data };
};

export const deletePayroll = async (id: string) => {
  const response = await api.delete(`/payroll/${id}`);
  return { raw: response.data };
};

export const approvePayroll = async (id: string) => {
  const response = await api.post(`/payroll/${id}/approve`);
  return { raw: response.data };
};

export const markPayrollAsPaid = async (id: string) => {
  const response = await api.post(`/payroll/${id}/pay`);
  return { raw: response.data };
};

export const getPayrollDetails = async (payrollId: string) => {
  const response = await api.get(`/payroll-details/${payrollId}`);
  return {
    items: extractArrayPayload(response.data),
    payload: extractPayload(response.data),
    raw: response.data,
  };
};

export const addPayrollDetailsBulk = async (payload: PayrollDetailsBulkCreatePayload) => {
  const response = await api.post("/payroll-details", payload);
  return { raw: response.data };
};

export const updatePayrollDetailSingle = async (id: string, payload: PayrollDetailUpdatePayload) => {
  const response = await api.put(`/payroll-details/${id}`, payload);
  return { raw: response.data };
};

export const bulkUpdatePayrollDetails = async (payload: PayrollDetailBulkUpdatePayload) => {
  const response = await api.post("/payroll-details/bulk-update", payload);
  return { raw: response.data };
};

export const deletePayrollDetail = async (id: string) => {
  const response = await api.delete(`/payroll-details/${id}`);
  return { raw: response.data };
};
