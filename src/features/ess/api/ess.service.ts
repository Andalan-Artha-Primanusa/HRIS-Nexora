import { api } from "@/shared/api/httpClient";
import type { GenericApiItem, MyReimbursementPayload } from "../types/ess.types";

type UnknownRecord = Record<string, unknown>;

const toRecord = (value: unknown): UnknownRecord =>
  value && typeof value === "object" ? (value as UnknownRecord) : {};

const extractPayload = (raw: unknown) => {
  const root = toRecord(raw);
  return root.data ?? raw;
};

const extractArrayPayload = (raw: any): GenericApiItem[] => {
  if (!raw) return [];
  
  // Pattern 1: Direct Array
  if (Array.isArray(raw)) return raw;

  // Pattern 2: Laravel standard { data: [...] } or { items: [...] }
  const root = typeof raw === 'object' ? raw : {};
  for (const key of ['data', 'items', 'rows', 'results']) {
    const level1 = root[key];
    if (Array.isArray(level1)) return level1;
    
    // Pattern 3: Laravel Paginated { data: { data: [...] } }
    if (level1 && typeof level1 === 'object' && !Array.isArray(level1)) {
      for (const key2 of ['data', 'items', 'rows']) {
        if (Array.isArray(level1[key2])) return level1[key2];
      }
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
  // API returns { success, message, data: [...] }
  return {
    items: extractArrayPayload(response.data),
    raw: response.data,
  };
};

export const getMyPayrollDetail = async (id: string) => {
  const response = await api.get(`/my/payroll/${id}`);
  return {
    payload: extractPayload(response.data),
    raw: response.data,
  };
};

export const getMyPayrollSlip = async (id: string) => {
  // API returns { success, message, data: { id, period, status, employee, summary, earnings, deductions } }
  const response = await api.get(`/my/payroll/${id}/slip`);
  return {
    payload: extractPayload(response.data),
    raw: response.data,
  };
};

export const exportMyPayrollCsv = async (id: string) => {
  const response = await api.get(`/my/payroll/${id}/export`, {
    responseType: 'blob'
  });
  return response.data;
};

export const exportMyPayrollPdf = async (id: string) => {
  const response = await api.get(`/my/payroll/${id}/export-pdf`, {
    responseType: 'blob'
  });
  return response.data;
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
