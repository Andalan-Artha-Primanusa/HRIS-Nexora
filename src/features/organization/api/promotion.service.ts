import { api } from '@/shared/api/httpClient';

export const promotionService = {
  getPromotions: (params?: Record<string, string>) => {
    return api.get('/promotions', { params });
  },

  createPromotion: (data: any) => {
    return api.post('/promotions', data);
  },

  approvePromotion: (id: string | number) => {
    return api.post(`/promotions/${id}/approve`);
  },

  rejectPromotion: (id: string | number, remarks?: string) => {
    return api.post(`/promotions/${id}/reject`, { remarks });
  },

  deletePromotion: (id: string | number) => {
    return api.delete(`/promotions/${id}`);
  },
};
