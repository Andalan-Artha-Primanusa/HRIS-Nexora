import { api } from '@/shared/api/httpClient';

type AttendanceRecord = Record<string, any>;

// Helper function to extract array from various response formats
const extractArrayPayload = (raw: any): AttendanceRecord[] => {
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

const extractPayload = (raw: unknown) => {
  const root = typeof raw === 'object' && raw ? (raw as Record<string, any>) : {};
  return root.data ?? raw;
};

export const attendanceService = {
  /**
   * Employee: Check in
   * POST /attendance/check-in
   */
  checkIn: async (latitude: number, longitude: number) => {
    const response = await api.post('/attendance/check-in', { latitude, longitude });
    return { raw: response.data };
  },

  /**
   * Employee: Check out
   * POST /attendance/check-out
   */
  checkOut: async () => {
    const response = await api.post('/attendance/check-out');
    return { raw: response.data };
  },

  /**
   * Employee: Get attendance history
   * GET /attendance/history
   */
  getHistory: async (page = 1, perPage = 10) => {
    const response = await api.get('/attendance/history', { params: { page, per_page: perPage } });
    const raw = response.data;
    return {
      items: extractArrayPayload(raw),
      totalPages: raw?.data?.last_page ?? 1,
      raw,
    };
  },

  /**
   * Employee: Get today's attendance
   * GET /attendance/today
   */
  getToday: async () => {
    const response = await api.get('/attendance/today');
    return {
      payload: extractPayload(response.data),
      raw: response.data,
    };
  },

  /**
   * Employee: Get overtime summary derived from attendance history
   * GET /attendance/overtime
   */
  getOvertimeSummary: async (days: number = 30) => {
    const response = await api.get('/attendance/overtime', {
      params: { days },
    });

    return {
      payload: extractPayload(response.data),
      raw: response.data,
    };
  },

  /**
   * Employee: Get available locations
   * GET /attendance/locations
   */
  getLocations: async () => {
    const response = await api.get('/attendance/locations');
    return {
      items: extractArrayPayload(response.data),
      raw: response.data,
    };
  },

  /**
   * Admin: Get all attendance records
   * GET /attendance/all
   */
  getAll: async (params?: Record<string, any>) => {
    const response = await api.get('/attendance/all', { params });
    return {
      items: extractArrayPayload(response.data),
      raw: response.data,
    };
  },

  /**
   * Admin: Get attendance by ID
   * GET /attendance/{id}
   */
  getById: async (id: string | number) => {
    const response = await api.get(`/attendance/${id}`);
    return {
      payload: extractPayload(response.data),
      raw: response.data,
    };
  },

  /**
   * Admin: Delete attendance record
   * DELETE /attendance/{id}
   */
  delete: async (id: string | number) => {
    const response = await api.delete(`/attendance/${id}`);
    return { raw: response.data };
  },
};

export default attendanceService;
