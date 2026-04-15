import { api } from "@/shared/api/httpClient";
import { useAuthStore } from "@/app/store/auth.store";
import { forceLogout } from "@/shared/utils/auth";

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
  try {
    const response = await api.post("/login", payload);
    return response;
  } catch (error: any) {
    // 🔒 SECURITY: Log validation errors untuk debugging (development only)
    if (error.response?.status === 422) {
      console.error("[LOGIN] 422 Validation Error:", {
        payload: payload,
        errors: error.response?.data?.errors,
        message: error.response?.data?.message,
      });
    }
    throw error;
  }
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
  try {
    await api.post("/logout");
  } finally {
    forceLogout(); 
  }
};

export const verifyToken = async () => {
  try {
    const response = await api.get("/me");
    return response;
  } catch (error: any) {
    if (error.response?.status === 401) {
      forceLogout(); 
    }
    throw error;
  }
};
