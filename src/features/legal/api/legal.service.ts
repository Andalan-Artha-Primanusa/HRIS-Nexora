import { api } from "@/shared/api/httpClient";

export const legalService = {
  // Letters
  generateExperienceLetter: async (employeeId: string | number) => {
    const response = await api.post(`/employees/${employeeId}/experience-letter`);
    return response.data;
  },
  generateEmploymentLetter: async (employeeId: string | number) => {
    const response = await api.post(`/employees/${employeeId}/employment-letter`);
    return response.data;
  },

  // Assignment Letters
  getAssignmentLetters: async () => {
    const response = await api.get('/assignment-letters');
    return response.data;
  },
  createAssignmentLetter: async (data: any) => {
    const response = await api.post('/assignment-letters', data);
    return response.data;
  },

  // Severance
  calculateSeverance: async (employeeId: string | number) => {
    const response = await api.get(`/employees/${employeeId}/severance/calculate`);
    return response.data;
  },

  // Tax
  calculateProgressiveTax: async (annualIncome: number) => {
    const response = await api.post('/tax/progressive/calculate', { annual_income: annualIncome });
    return response.data;
  },

  // Promotion
  promoteEmployee: async (employeeId: string | number, data: any) => {
    const response = await api.post(`/employees/${employeeId}/promote`, data);
    return response.data;
  }
};
