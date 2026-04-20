import axios from "axios";
import { parseApiError } from "./errorHandler";
import { showToast } from "../ui/toast";

// 🔒 SECURITY: API URL from environment, with fallback for development
const defaultBaseUrl = "https://moccasin-crab-693879.hostingersite.com/api";
const baseURL = import.meta.env.VITE_API_URL || defaultBaseUrl;

// Log warning jika using default URL (tidak ideal untuk production)
if (!import.meta.env.VITE_API_URL && import.meta.env.PROD) {
  console.warn("[SECURITY] VITE_API_URL environment variable not set. Using default URL. This should not happen in production!");
}

export const api = axios.create({
  baseURL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    // 🔒 SECURITY: Add security headers
    "X-Requested-With": "XMLHttpRequest",
  },
  // 🔒 SECURITY: Set timeout to prevent hanging requests
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || "30000", 10),
  // 🔒 SECURITY: Don't send credentials unless explicitly configured per endpoint
  withCredentials: false,
});

// 🔥 Inject token otomatis
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token && typeof token === "string" && token.length > 0) {
    config.headers = config.headers ?? {};

    if (typeof (config.headers as any).set === 'function') {
      (config.headers as any).set('Authorization', `Bearer ${token}`);
    } else {
      (config.headers as any).Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

// 🚀 Global Response Interceptor (Error Handling & Toast)
api.interceptors.response.use(
  (response) => {
    const method = response.config.method?.toUpperCase();
    const url = response.config.url || "";
    
    // Tampilkan toast sukses otomatis untuk mutasi (POST, PUT, DELETE)
    const isMutation = ["POST", "PUT", "DELETE", "PATCH"].includes(method || "");
    const isSilentUrl = url.includes("/me") || url.includes("/logout"); // Biarkan /me dan /logout tetap senyap di sini

    if (isMutation && !isSilentUrl) {
      const message = response.data?.message || (url.includes("/login") ? "Login Berhasil" : "Aksi berhasil dilakukan");
      showToast(message, "success");
    }


    
    return response;
  },
  (error) => {
    // Standardize the error using our global parser
    const parsedError = parseApiError(error);

    // 1. Handle Unauthorized (401)
    if (parsedError.type === "unauthorized") {
      showToast(parsedError.message, "error");
      
      // 🔒 SECURITY: Clear sensitive data on auth failure
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      
      // Redirect to login after a short delay
      setTimeout(() => {
        window.location.href = "/login";
      }, 1000);
    }

    // 2. Handle General Errors (NOT validation errors)
    if (parsedError.type === "general") {
      showToast(parsedError.message, "error");
    }

    // Return the standard parsed error object
    return Promise.reject(parsedError);
  }
);