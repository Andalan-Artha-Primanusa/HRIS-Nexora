import { api } from "@/shared/api/httpClient";

export const benefitService = {
  getBenefits: async () => {
    const response = await api.get('/benefits');
    return response.data;
  },
  getEmployeeBenefits: async (employeeId: string | number) => {
    const response = await api.get(`/benefits/employee/${employeeId}`);
    return response.data;
  },
  createBenefit: async (data: any) => {
    const response = await api.post('/benefits', data);
    return response.data;
  },
  assignBenefit: async (benefitId: string | number, employeeId: string | number) => {
    const response = await api.post(`/benefits/${benefitId}/assign`, { employee_id: employeeId });
    return response.data;
  },
  getBenefit: async (id: string | number) => {
    const response = await api.get(`/benefits/${id}`);
    return response.data;
  },
  updateBenefit: async (id: string | number, data: any) => {
    const response = await api.put(`/benefits/${id}`, data);
    return response.data;
  },
  approveBenefitAssignment: async (assignmentId: string | number, note?: string) => {
    const response = await api.put(`/benefits/assignments/${assignmentId}/approve`, { note });
    return response.data;
  },
  rejectBenefitAssignment: async (assignmentId: string | number, note?: string) => {
    const response = await api.put(`/benefits/assignments/${assignmentId}/reject`, { note });
    return response.data;
  },
};
