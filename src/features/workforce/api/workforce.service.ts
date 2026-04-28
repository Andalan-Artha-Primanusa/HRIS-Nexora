import { api } from "@/shared/api/httpClient";

export const workforceService = {
  // Holidays
  getHolidays: async () => {
    const response = await api.get('/workforce/holidays');
    return response.data;
  },
  createHoliday: async (data: any) => {
    const response = await api.post('/workforce/holidays', data);
    return response.data;
  },
  getHoliday: async (id: string | number) => {
    const response = await api.get(`/workforce/holidays/${id}`);
    return response.data;
  },
  updateHoliday: async (id: string | number, data: any) => {
    const response = await api.put(`/workforce/holidays/${id}`, data);
    return response.data;
  },
  deleteHoliday: async (id: string | number) => {
    const response = await api.delete(`/workforce/holidays/${id}`);
    return response.data;
  },

  // Shift Swaps
  getShiftSwaps: async () => {
    const response = await api.get('/workforce/shift-swaps');
    return response.data;
  },
  createShiftSwap: async (data: any) => {
    const response = await api.post('/workforce/shift-swaps', data);
    return response.data;
  },
  approveShiftSwap: async (id: string | number) => {
    const response = await api.put(`/workforce/shift-swaps/${id}`);
    return response.data;
  },

  // Overtime Rules
  getOvertimeRules: async () => {
    const response = await api.get('/workforce/overtime-rules');
    return response.data;
  },
  getOvertimeRule: async (id: string | number) => {
    const response = await api.get(`/workforce/overtime-rules/${id}`);
    return response.data;
  },
  createOvertimeRule: async (data: any) => {
    const response = await api.post('/workforce/overtime-rules', data);
    return response.data;
  },
  updateOvertimeRule: async (id: string | number, data: any) => {
    const response = await api.put(`/workforce/overtime-rules/${id}`, data);
    return response.data;
  },
  deleteOvertimeRule: async (id: string | number) => {
    const response = await api.delete(`/workforce/overtime-rules/${id}`);
    return response.data;
  },

  // Compliance
  getComplianceStats: async () => {
    const response = await api.get('/workforce/compliance/stats');
    return response.data;
  },
  getComplianceDocuments: async () => {
    const response = await api.get('/workforce/compliance/documents');
    return response.data;
  }
};
