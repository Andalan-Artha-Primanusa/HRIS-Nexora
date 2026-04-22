import { api } from "@/shared/api/httpClient";
import type { 
  OKR, 
  Review360, 
  CalibrationSession 
} from "../types/performance.types";

export const performanceService = {
  // OKRs
  getOkrs: async () => {
    const response = await api.get('/performance/okrs');
    return response.data;
  },
  getOkr: async (id: string | number) => {
    const response = await api.get(`/performance/okrs/${id}`);
    return response.data;
  },
  createOkr: async (data: Partial<OKR>) => {
    const response = await api.post('/performance/okrs', data);
    return response.data;
  },
  updateOkr: async (id: string | number, data: Partial<OKR>) => {
    const response = await api.put(`/performance/okrs/${id}`, data);
    return response.data;
  },
  updateOkrProgress: async (id: string | number, progress: number) => {
    const response = await api.put(`/performance/okrs/${id}/progress`, { progress });
    return response.data;
  },

  // 360 Reviews
  get360Reviews: async () => {
    const response = await api.get('/performance/360-reviews');
    return response.data;
  },
  get360Review: async (id: string | number) => {
    const response = await api.get(`/performance/360-reviews/${id}`);
    return response.data;
  },
  assignFeeders: async (reviewId: string | number, feederIds: number[]) => {
    const response = await api.post(`/performance/360-reviews/${reviewId}/feeders`, { feeder_ids: feederIds });
    return response.data;
  },

  // Calibration
  getCalibrationSessions: async () => {
    const response = await api.get('/performance/calibration');
    return response.data;
  },
  getCalibrationReport: async (id: string | number) => {
    const response = await api.get(`/performance/calibration/${id}/report`);
    return response.data;
  },
};
