import { api } from "@/shared/api/httpClient";

export const documentService = {
  getMyDocuments: async (params?: { per_page?: number; page?: number; search?: string; status?: string }) => {
    const response = await api.get('/documents', { params });
    return response.data;
  },
  
  uploadDocument: async (formData: FormData) => {
    const response = await api.post('/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  getDocumentDetail: async (id: number) => {
    const response = await api.get(`/documents/${id}`);
    return response.data;
  }
};
