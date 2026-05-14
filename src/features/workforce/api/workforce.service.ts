import { api } from "@/shared/api/httpClient";

type UnknownRecord = Record<string, unknown>;

const toRecord = (value: unknown): UnknownRecord =>
  value && typeof value === "object" ? (value as UnknownRecord) : {};

const extractArrayPayload = (raw: unknown) => {
  if (Array.isArray(raw)) return raw;

  const root = toRecord(raw);
  for (const key of ["data", "items", "rows", "results"]) {
    const level1 = root[key];
    if (Array.isArray(level1)) return level1;

    if (level1 && typeof level1 === "object") {
      const nested = toRecord(level1);
      for (const key2 of ["data", "items", "rows", "results"]) {
        if (Array.isArray(nested[key2])) return nested[key2];
      }
    }
  }

  return [];
};

const extractPayload = (raw: unknown) => {
  const root = toRecord(raw);
  return root.data ?? raw;
};

export const workforceService = {
  // Holidays
  getHolidays: async (page = 1, perPage = 10) => {
    const response = await api.get('/workforce/holidays', { params: { page, per_page: perPage } });
    const raw = response.data;
    return {
      items: extractArrayPayload(raw),
      totalPages: raw?.data?.last_page ?? 1,
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
    const raw = response.data;
    return {
      items: extractArrayPayload(raw),
      totalPages: raw?.data?.last_page ?? 1,
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
    const raw = response.data;
    return {
      items: extractArrayPayload(raw),
      totalPages: raw?.data?.last_page ?? 1,
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
    const raw = response.data;
    return {
      items: extractArrayPayload(raw),
      totalPages: raw?.data?.last_page ?? 1,
      raw,
    };
  }
};
