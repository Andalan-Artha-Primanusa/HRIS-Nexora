import axios from "axios";

const defaultBaseUrl = "https://moccasin-crab-693879.hostingersite.com/api";
const baseURL = import.meta.env.VITE_API_URL || defaultBaseUrl;

export const api = axios.create({
  baseURL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// 🔥 Inject token otomatis
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers = config.headers ?? {};

    if (typeof (config.headers as any).set === 'function') {
      (config.headers as any).set('Authorization', `Bearer ${token}`);
    } else {
      (config.headers as any).Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // keep the current page and let the UI show the error instead of forcing a redirect.
    }
    
    // Handle 403 Forbidden errors with user-friendly message
    if (error.response?.status === 403) {
      error.userMessage = "Fitur ini kamu tidak ada akses. Silahkan hubungi Admin untuk mendapatkan akses.";
    }
    
    return Promise.reject(error);
  }
);