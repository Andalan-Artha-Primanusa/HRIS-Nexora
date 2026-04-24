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

  // Compliance
  getComplianceStats: async () => {
    try {
      const response = await api.get('/workforce/compliance/stats');
      return response.data;
    } catch (e) {
      // Mock fallback if endpoint doesn't exist yet
      return [
        { label: 'Compliance Score', value: '98.5%', color: '#10b981' },
        { label: 'Expiring Docs', value: '12', color: '#f59e0b' },
        { label: 'Critical Gap', value: '02', color: '#ef4444' },
        { label: 'Audit Readiness', value: '92%', color: '#6366f1' },
      ];
    }
  },
  getComplianceDocuments: async () => {
    try {
      const response = await api.get('/workforce/compliance/documents');
      return response.data;
    } catch (e) {
      // Mock fallback if endpoint doesn't exist yet
      return [
        { id: 1, name: 'Ahmad Subarjo', emp_id: 'EMP-001', doc: 'Sertifikasi K3', date: '12 Mei 2026', risk: 'LOW' },
        { id: 2, name: 'Siti Aminah', emp_id: 'EMP-002', doc: 'Lisensi Operasional', date: '01 Jun 2026', risk: 'MEDIUM' },
        { id: 3, name: 'Budi Santoso', emp_id: 'EMP-003', doc: 'Kontrak Kerja', date: 'Expired', risk: 'CRITICAL' },
      ];
    }
  }
};
