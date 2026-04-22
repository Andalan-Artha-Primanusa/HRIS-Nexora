import { api } from "@/shared/api/httpClient";

export const assetService = {
  getAssets: async () => {
    const response = await api.get('/assets');
    return response.data;
  },
  getAsset: async (id: string | number) => {
    const response = await api.get(`/assets/${id}`);
    return response.data;
  },
  createAsset: async (data: any) => {
    const response = await api.post('/assets', data);
    return response.data;
  },
  updateAsset: async (id: string | number, data: any) => {
    const response = await api.put(`/assets/${id}`, data);
    return response.data;
  },
  getAssignments: async () => {
    const response = await api.get('/assets/assignments');
    return response.data;
  },
  assignAsset: async (assetId: string | number, employeeId: string | number) => {
    const response = await api.post(`/assets/${assetId}/assign`, { employee_id: employeeId });
    return response.data;
  },
  returnAsset: async (assignmentId: string | number) => {
    const response = await api.put(`/assets/assignments/${assignmentId}/return`);
    return response.data;
  },
};
