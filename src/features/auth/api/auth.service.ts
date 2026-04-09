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

export interface GoogleAuthCallbackPayload {
  code: string;
  state?: string;
  scope?: string;
  authuser?: string;
  prompt?: string;
}

/* =========================
   API CALL
========================= */
export const login = async (payload: LoginPayload) => {
  const response = await api.post("/login", payload);
  return response;
};

export const register = async (payload: RegisterPayload) => {
  const response = await api.post("/register", payload);
  return response;
};

export const getGoogleAuthRedirect = async () => {
  const response = await api.get("/auth/google");
  return response;
};

export const handleGoogleAuthCallback = async (payload: GoogleAuthCallbackPayload) => {
  const response = await api.get("/auth/google/callback", { params: payload });
  return response;
};

export const logout = async () => {
  const response = await api.post("/logout");
  return response;
};
