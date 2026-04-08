import { api } from "@/shared/api/httpClient";

/* =========================
   TYPES
========================= */
export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

/* =========================
   API CALL
========================= */
export const login = async (payload: LoginPayload) => {
  const response = await api.post("/login", payload);
  return response.data;
};

export const register = async (payload: RegisterPayload) => {
  const response = await api.post("/register", payload);
  return response.data;
};
