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
};
