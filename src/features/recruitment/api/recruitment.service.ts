import { api } from "@/shared/api/httpClient";
import type { 
  JobOpening, 
  Candidate, 
  Interview, 
  Offer, 
  RecruitmentSummary 
} from "../types/recruitment.types";

export const recruitmentService = {
  getSummary: async () => {
    const response = await api.get('/recruitment/summary');
    return response.data;
  },

  // Job Openings
  getJobOpenings: async () => {
    const response = await api.get('/recruitment/openings');
    return response.data;
  },
  getJobOpening: async (id: string | number) => {
    const response = await api.get(`/recruitment/openings/${id}`);
    return response.data;
  },
  createJobOpening: async (data: Partial<JobOpening>) => {
    const response = await api.post('/recruitment/openings', data);
    return response.data;
  },
  updateJobOpening: async (id: string | number, data: Partial<JobOpening>) => {
    const response = await api.put(`/recruitment/openings/${id}`, data);
    return response.data;
  },
  deleteJobOpening: async (id: string | number) => {
    const response = await api.delete(`/recruitment/openings/${id}`);
    return response.data;
  },

  // Candidates
  getCandidates: async () => {
    const response = await api.get('/recruitment/candidates');
    return response.data;
  },
  getCandidate: async (id: string | number) => {
    const response = await api.get(`/recruitment/candidates/${id}`);
    return response.data;
  },
  createCandidate: async (data: Partial<Candidate>) => {
    const response = await api.post('/recruitment/candidates', data);
    return response.data;
  },
  updateCandidate: async (id: string | number, data: Partial<Candidate>) => {
    const response = await api.put(`/recruitment/candidates/${id}`, data);
    return response.data;
  },
  moveCandidateStage: async (id: string | number, stage: string) => {
    const response = await api.put(`/recruitment/candidates/${id}/stage`, { stage });
    return response.data;
  },
  deleteCandidate: async (id: string | number) => {
    const response = await api.delete(`/recruitment/candidates/${id}`);
    return response.data;
  },

  // Interviews
  scheduleInterview: async (candidateId: string | number, data: Partial<Interview>) => {
    const response = await api.post(`/recruitment/candidates/${candidateId}/interviews`, data);
    return response.data;
  },
  evaluateInterview: async (interviewId: string | number, data: { feedback: string, score: number }) => {
    const response = await api.post(`/recruitment/interviews/${interviewId}/evaluate`, data);
    return response.data;
  },

  // Offers
  createOffer: async (candidateId: string | number, data: Partial<Offer>) => {
    const response = await api.post(`/recruitment/candidates/${candidateId}/offer`, data);
    return response.data;
  },
  updateOfferStatus: async (offerId: string | number, status: string) => {
    const response = await api.put(`/recruitment/offers/${offerId}/status`, { status });
    return response.data;
  },

  // Talent Pool
  getTalentPool: async () => {
    const response = await api.get('/recruitment/talent-pool');
    return response.data;
  }
};
