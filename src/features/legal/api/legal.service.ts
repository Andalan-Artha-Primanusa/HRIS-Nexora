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
  getAssignmentLetter: async (id: string | number) => {
    const response = await api.get(`/assignment-letters/${id}`);
    return response.data;
  },
  createAssignmentLetter: async (data: any) => {
    const response = await api.post('/assignment-letters', data);
    return response.data;
  },
  approveAssignmentLetter: async (id: string | number) => {
    const response = await api.post(`/assignment-letters/${id}/approve`);
    return response.data;
  },
  generateAssignmentLetterPdf: async (id: string | number) => {
    const response = await api.get(`/assignment-letters/${id}/pdf`);
    return response.data;
  },
  rejectAssignmentLetter: async (id: string | number) => {
    const response = await api.post(`/assignment-letters/${id}/reject`);
    return response.data;
  },

  // Severance
  calculateSeverance: async (employeeId: string | number, params?: { join_date?: string, termination_date?: string }) => {
    const query = params ? `?join_date=${params.join_date}&termination_date=${params.termination_date}` : '';
    const response = await api.get(`/employees/${employeeId}/severance/calculate${query}`);
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
