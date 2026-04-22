import { api } from "@/shared/api/httpClient";

export const enterpriseService = {
  // Compensation
  upsertCompProfile: async (employeeId: string | number, data: any) => {
    const response = await api.put(`/enterprise/compensation/employee/${employeeId}`, data);
    return response.data;
  },
  addRetroAdjustment: async (data: any) => {
    const response = await api.post('/enterprise/compensation/retro-adjustments', data);
    return response.data;
  },
  getBankExportPreview: async (data: any) => {
    const response = await api.post('/enterprise/compensation/bank-export-preview', data);
    return response.data;
  },

  // Notifications & Policies
  createNotificationTemplate: async (data: any) => {
    const response = await api.post('/enterprise/notifications/templates', data);
    return response.data;
  },
  createRetentionPolicy: async (data: any) => {
    const response = await api.post('/enterprise/compliance/retention-policies', data);
    return response.data;
  },
  createComplianceTask: async (data: any) => {
    const response = await api.post('/enterprise/compliance/tasks', data);
    return response.data;
  },
};
