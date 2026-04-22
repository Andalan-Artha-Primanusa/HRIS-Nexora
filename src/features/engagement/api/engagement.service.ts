import { api } from "@/shared/api/httpClient";
import type { 
  IDP, 
  SuccessionMatrix, 
  EngagementSurvey 
} from "../types/engagement.types";

export const engagementService = {
  // IDPs
  getIdps: async () => {
    const response = await api.get('/career/idps');
    return response.data;
  },
  
  // Succession
  getSuccessionMatrix: async () => {
    const response = await api.get('/career/succession');
    return response.data;
  },

  // Engagement Surveys
  getSurveys: async () => {
    const response = await api.get('/engagement/surveys');
    return response.data;
  },
  getSurvey: async (id: string | number) => {
    const response = await api.get(`/engagement/surveys/${id}`);
    return response.data;
  },
  createSurvey: async (data: any) => {
    const response = await api.post('/engagement/surveys', data);
    return response.data;
  },
  updateSurvey: async (id: string | number, data: any) => {
    const response = await api.put(`/engagement/surveys/${id}`, data);
    return response.data;
  },
  getSurveyAnalytics: async (id: string | number) => {
    const response = await api.get(`/engagement/surveys/${id}/analytics`);
    return response.data;
  },
};
