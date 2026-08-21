import axios from "axios";
import { parseApiError } from "./errorHandler";
import { showToast } from "../ui/toast";

// ðŸ”’ SECURITY: API URL from environment, with fallback for development
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
    // ðŸ”’ SECURITY: Add security headers
    "X-Requested-With": "XMLHttpRequest",
  },
  // ðŸ”’ SECURITY: Set timeout to prevent hanging requests
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || "30000", 10),
  // ðŸ”’ SECURITY: Don't send credentials unless explicitly configured per endpoint
  withCredentials: false,
});

// ðŸ”¥ Inject token otomatis
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");

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

// ðŸš€ Global Response Interceptor (Error Handling Only â€” auth level)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Standardize the error using our global parser
    const parsedError = parseApiError(error);

    // 1. Handle Unauthorized (401)
    if (parsedError.type === "unauthorized") {
      showToast(parsedError.message, "error");
      
      // ðŸ”’ SECURITY: Clear sensitive data on auth failure
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      
      // Redirect to login after a short delay
      setTimeout(() => {
        window.location.href = "/login";
      }, 1000);
    }

    // Note: General errors are NOT shown here to avoid double toasts.
    // Each page handles its own error display in try-catch blocks.

    // Return the standard parsed error object
    return Promise.reject(parsedError);
  }
);

