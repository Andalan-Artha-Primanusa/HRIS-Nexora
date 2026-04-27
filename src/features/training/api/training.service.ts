import { api } from "@/shared/api/httpClient";
import type { 
  TrainingProgram
} from "../types/training.types";

export const trainingService = {
  // Training Programs
  getPrograms: async () => {
    const response = await api.get('/training/programs');
    return response.data;
  },
  getProgram: async (id: string | number) => {
    const response = await api.get(`/training/programs/${id}`);
    return response.data;
  },
  createProgram: async (data: Partial<TrainingProgram>) => {
    const response = await api.post('/training/programs', data);
    return response.data;
  },
  updateProgram: async (id: string | number, data: Partial<TrainingProgram>) => {
    const response = await api.put(`/training/programs/${id}`, data);
    return response.data;
  },
  deleteProgram: async (id: string | number) => {
    const response = await api.delete(`/training/programs/${id}`);
    return response.data;
  },
  enrollInProgram: async (id: string | number) => {
    const response = await api.post(`/training/programs/${id}/enroll`);
    return response.data;
  },
  completeTraining: async (id: string | number) => {
    const response = await api.put(`/training/enrollments/${id}/complete`);
    return response.data;
  },

  // Competencies
  getCompetencies: async () => {
    const response = await api.get('/competencies');
    return response.data;
  },
  getMyCompetencies: async () => {
    const response = await api.get('/my/competencies');
    return response.data;
  },
  getEmployeeCompetencies: async (employeeId: string | number) => {
    const response = await api.get(`/competencies/employee/${employeeId}`);
    return response.data;
  },
  assignCompetency: async (competencyId: string | number, employeeId: string | number) => {
    const response = await api.post(`/competencies/${competencyId}/assign`, { employee_id: employeeId });
    return response.data;
  },
};
