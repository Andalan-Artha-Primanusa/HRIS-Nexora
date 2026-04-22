import { api } from "@/shared/api/httpClient";
import type { GenericApiItem, MyReimbursementPayload } from "../types/ess.types";

type UnknownRecord = Record<string, unknown>;

const toRecord = (value: unknown): UnknownRecord =>
  value && typeof value === "object" ? (value as UnknownRecord) : {};

const extractPayload = (raw: unknown) => {
  const root = toRecord(raw);
  return root.data ?? raw;
};

const extractArrayPayload = (raw: unknown): GenericApiItem[] => {
  const payload = extractPayload(raw);

  if (Array.isArray(payload)) {
    return payload.filter((item): item is GenericApiItem => !!item && typeof item === "object");
  }

  const payloadRecord = toRecord(payload);
  const candidates = [payloadRecord.items, payloadRecord.rows, payloadRecord.data, payloadRecord.results];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate.filter((item): item is GenericApiItem => !!item && typeof item === "object");
    }
  }

  return [];
};

export const getMyKpi = async () => {
  const token = sessionStorage.getItem("token");
  
  const response = await api.get("/my/kpi", {
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    validateStatus: (status) => (status >= 200 && status < 300) || status === 500
  });
  
  return {
    items: extractArrayPayload(response.data),
    raw: response.data,
  };
};

export const submitMyKpi = async (id: string) => {
  const response = await api.post(`/my/kpi/${id}/submit`);
  return {
    raw: response.data,
  };
};

export const getMyReimbursements = async (status?: string) => {
  const response = await api.get("/my/reimbursements", {
    params: status ? { status } : undefined,
  });

  return {
    items: extractArrayPayload(response.data),
    raw: response.data,
  };
};

export const createMyReimbursement = async (payload: MyReimbursementPayload) => {
  // Backend: POST /my/reimbursements → createMyReimbursement() controller
  const response = await api.post("/my/reimbursements", payload);
  return {
    raw: response.data,
  };
};

export const submitMyReimbursement = async (id: string) => {
  // Backend: POST /my/reimbursements/{id}/submit → submit() controller
  const response = await api.post(`/my/reimbursements/${id}/submit`);
  return {
    raw: response.data,
  };
};

export const getMyPayroll = async () => {
  const response = await api.get("/my/payroll");
  return {
    items: extractArrayPayload(response.data),
    raw: response.data,
  };
};

export const getMyLeaves = async () => {
  const response = await api.get("/leaves/my");
  return {
    items: extractArrayPayload(response.data),
    raw: response.data,
  };
};

export const getMyLeaveBalance = async () => {
  const response = await api.get("/leaves/balance");
  return {
    payload: extractPayload(response.data),
    raw: response.data,
  };
};

export const checkInAttendance = async (latitude: number, longitude: number) => {
  const response = await api.post("/attendance/check-in", { latitude, longitude });
  return { raw: response.data };
};

export const checkOutAttendance = async () => {
  const response = await api.post("/attendance/check-out");
  return { raw: response.data };
};

export const getAttendanceHistory = async () => {
  const response = await api.get("/attendance/history");
  return { items: extractArrayPayload(response.data), raw: response.data };
};

export const getTodayAttendance = async () => {
  const response = await api.get("/attendance/today");
  return { payload: extractPayload(response.data), raw: response.data };
};
