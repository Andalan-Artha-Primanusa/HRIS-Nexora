import { api } from "@/shared/api/httpClient";

type AssignmentLetterDecisionAction = "approve" | "reject";

type AssignmentLetterDecisionPayload = {
  note?: string;
  approval_note?: string;
  rejection_note?: string;
};

const isSuccessStatus = (status: number) => status >= 200 && status < 300;
const shouldFallbackToPost = (status: number) => status === 404 || status === 405;

const getResponseMessage = (data: any, fallback: string) => {
  if (typeof data?.message === "string" && data.message.trim()) return data.message;
  if (typeof data?.error === "string" && data.error.trim()) return data.error;
  return fallback;
};

const buildDecisionPayload = (action: AssignmentLetterDecisionAction, note?: string): AssignmentLetterDecisionPayload => {
  const normalizedNote = note || (action === "approve" ? "Approved" : "Rejected");
  return action === "approve"
    ? { note: normalizedNote, approval_note: normalizedNote }
    : { note: normalizedNote, rejection_note: normalizedNote };
};

const requestAssignmentLetterDecision = async (
  id: string | number,
  action: AssignmentLetterDecisionAction,
  note?: string
) => {
  const url = `/assignment-letters/${id}/${action}`;
  const payload = buildDecisionPayload(action, note);
  const config = { validateStatus: () => true, skipToast: true } as any;
  const methodLabel = action === "approve" ? "menyetujui" : "menolak";

  const putResponse = await api.put(url, payload, config);

  if (isSuccessStatus(putResponse.status)) {
    return putResponse.data;
  }

  if (shouldFallbackToPost(putResponse.status)) {
    const postResponse = await api.post(url, payload, config);
    if (isSuccessStatus(postResponse.status)) {
      return postResponse.data;
    }
    throw new Error(getResponseMessage(postResponse.data, `Gagal ${methodLabel} surat tugas`));
  }

  throw new Error(getResponseMessage(putResponse.data, `Gagal ${methodLabel} surat tugas`));
};

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
  approveAssignmentLetter: async (id: string | number, note?: string) => {
    return requestAssignmentLetterDecision(id, "approve", note);
  },
  generateAssignmentLetterPdf: async (id: string | number) => {
    const response = await api.get(`/assignment-letters/${id}/pdf`);
    return response.data;
  },
  rejectAssignmentLetter: async (id: string | number, note?: string) => {
    return requestAssignmentLetterDecision(id, "reject", note);
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
