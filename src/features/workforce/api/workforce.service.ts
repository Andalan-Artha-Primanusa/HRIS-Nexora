import { api } from "@/shared/api/httpClient";
import { extractArrayPayload, extractPayload, parsePaginatedResponse } from "@/shared/api/pagination";

type UnknownRecord = Record<string, unknown>;

const isUnknownRecord = (item: unknown): item is UnknownRecord =>
  item !== null && typeof item === "object" && !Array.isArray(item);

export const workforceService = {
  // Holidays
  getHolidays: async (page = 1, perPage = 10) => {
    const response = await api.get('/workforce/holidays', { params: { page, per_page: perPage } });
    const raw: unknown = response.data;
    const parsed = parsePaginatedResponse(raw, isUnknownRecord);
    return {
      items: parsed.items,
      totalPages: parsed.totalPages,
      raw,
    };
  },
  createHoliday: async (data: any) => {
    const response = await api.post('/workforce/holidays', data);
    return {
      payload: extractPayload(response.data),
      raw: response.data,
    };
  },
  getHoliday: async (id: string | number) => {
    const response = await api.get(`/workforce/holidays/${id}`);
    return {
      payload: extractPayload(response.data),
      raw: response.data,
    };
  },
  updateHoliday: async (id: string | number, data: any) => {
    const response = await api.put(`/workforce/holidays/${id}`, data);
    return {
      payload: extractPayload(response.data),
      raw: response.data,
    };
  },
  deleteHoliday: async (id: string | number) => {
    const response = await api.delete(`/workforce/holidays/${id}`);
    return {
      raw: response.data,
    };
  },

  // Shift Swaps
  getShiftSwaps: async (page = 1, perPage = 10) => {
    const response = await api.get('/workforce/shift-swaps', { params: { page, per_page: perPage } });
    const raw: unknown = response.data;
    const parsed = parsePaginatedResponse(raw, isUnknownRecord);
    return {
      items: parsed.items,
      totalPages: parsed.totalPages,
      raw,
    };
  },
  createShiftSwap: async (data: any) => {
    const response = await api.post('/workforce/shift-swaps', data);
    return {
      payload: extractPayload(response.data),
      raw: response.data,
    };
  },
  approveShiftSwap: async (id: string | number) => {
    const response = await api.put(`/workforce/shift-swaps/${id}`, { status: 'approved' });
    return {
      payload: extractPayload(response.data),
      raw: response.data,
    };
  },
  approveShiftSwapFlow: async (id: string | number, note?: string) => {
    const response = await api.put(`/workforce/shift-swaps/${id}/approve`, { note });
    return {
      payload: extractPayload(response.data),
      raw: response.data,
    };
  },
  rejectShiftSwap: async (id: string | number, note?: string) => {
    const response = await api.put(`/workforce/shift-swaps/${id}/reject`, { note });
    return {
      payload: extractPayload(response.data),
      raw: response.data,
    };
  },

  // Overtime Rules
  getOvertimeRules: async (page = 1, perPage = 10) => {
    const response = await api.get('/workforce/overtime-rules', { params: { page, per_page: perPage } });
    const raw: unknown = response.data;
    const parsed = parsePaginatedResponse(raw, isUnknownRecord);
    return {
      items: parsed.items,
      totalPages: parsed.totalPages,
      raw,
    };
  },
  getOvertimeRule: async (id: string | number) => {
    const response = await api.get(`/workforce/overtime-rules/${id}`);
    return {
      payload: extractPayload(response.data),
      raw: response.data,
    };
  },
  createOvertimeRule: async (data: any) => {
    const response = await api.post('/workforce/overtime-rules', data);
    return {
      payload: extractPayload(response.data),
      raw: response.data,
    };
  },
  updateOvertimeRule: async (id: string | number, data: any) => {
    const response = await api.put(`/workforce/overtime-rules/${id}`, data);
    return {
      payload: extractPayload(response.data),
      raw: response.data,
    };
  },
  deleteOvertimeRule: async (id: string | number) => {
    const response = await api.delete(`/workforce/overtime-rules/${id}`);
    return {
      raw: response.data,
    };
  },

  // Compliance
  getComplianceStats: async () => {
    const response = await api.get('/workforce/compliance/stats');
    return {
      payload: extractPayload(response.data),
      raw: response.data,
    };
  },
  getComplianceDocuments: async (page = 1, perPage = 10) => {
    const response = await api.get('/workforce/compliance/documents', { params: { page, per_page: perPage } });
    const raw: unknown = response.data;
    const parsed = parsePaginatedResponse(raw, isUnknownRecord);
    return {
      items: parsed.items,
      totalPages: parsed.totalPages,
      raw,
    };
  }
};
