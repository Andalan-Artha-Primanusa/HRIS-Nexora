import { api } from "@/shared/api/httpClient";

export const requestService = {
  getRequests: async () => {
    const response = await api.get('/requests');
    return response.data;
  },
  getMyRequests: async () => {
    const response = await api.get('/my/requests');
    return response.data;
  },
  createRequest: async (data: any) => {
    const response = await api.post('/requests', data);
    return response.data;
  },
  getRequestSlaSummary: async () => {
    const response = await api.get('/requests/sla-summary');
    return response.data;
  },
  updateStatus: async (id: string | number, status: string) => {
    const response = await api.put(`/requests/${id}/status`, { status });
    return response.data;
  },
  assignRequest: async (id: string | number, adminId: string | number) => {
    const response = await api.put(`/requests/${id}/assign`, { admin_id: adminId });
    return response.data;
  }
};
