import { api } from "@/shared/api/httpClient";

type UnknownRecord = Record<string, unknown>;

const toRecord = (value: unknown): UnknownRecord =>
  value && typeof value === "object" ? (value as UnknownRecord) : {};

const extractPayload = (raw: unknown) => {
  const root = toRecord(raw);
  return root.data ?? raw;
};

const extractArrayPayload = <T>(raw: unknown): T[] => {
  const payload = extractPayload(raw);

  if (Array.isArray(payload)) {
    return payload as T[];
  }

  const payloadRecord = toRecord(payload);
  const candidates = [payloadRecord.items, payloadRecord.rows, payloadRecord.data, payloadRecord.results];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate as T[];
    }
  }

  return [];
};

export const getAdminKpis = async () => {
  const response = await api.get("/kpis");
  return {
    items: extractArrayPayload<any>(response.data),
    raw: response.data,
  };
};

export const getKpiDetail = async (id: string | number) => {
  const response = await api.get(`/kpis/${id}`);
  return {
    data: extractPayload(response.data),
    raw: response.data,
  };
};

export const createKpi = async (payload: {
  employee_id: number;
  title: string;
  target: number;
  period: string;
  description?: string;
}) => {
  const response = await api.post("/kpis", payload);
  return extractPayload(response.data);
};

export const updateKpi = async (id: string | number, payload: {
  title?: string;
  description?: string;
  target?: number;
  achievement?: number;
}) => {
  const response = await api.put(`/kpis/${id}`, payload);
  return extractPayload(response.data);
};

export const deleteKpi = async (id: string | number) => {
  const response = await api.delete(`/kpis/${id}`);
  return response.data;
};

export const getKpisByEmployee = async (employeeId: string | number) => {
  const response = await api.get(`/kpis/employee/${employeeId}`);
  return {
    items: extractArrayPayload<any>(response.data),
    raw: response.data,
  };
};

export const approveKpi = async (id: string | number) => {
  const response = await api.put(`/kpis/${id}/approve`);
  return extractPayload(response.data);
};
