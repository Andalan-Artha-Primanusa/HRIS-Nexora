import type { AxiosError } from "axios";

export type ApiErrorType = "validation" | "general" | "unauthorized";

export interface ApiError {
  type: ApiErrorType;
  message: string;
  errors?: Record<string, string>;
}

/**
 * Standardize error response from Axios
 */
export const parseApiError = (error: unknown): ApiError => {
  const axiosError = error as AxiosError<any>;
  const status = axiosError.response?.status;
  const data = axiosError.response?.data;

  // 1. Unauthorized
  if (status === 401) {
    return {
      type: "unauthorized",
      message: data?.message || "Sesi anda telah berakhir. Silahkan login kembali.",
    };
  }

  // 2. Validation Error
  if (status === 422) {
    return {
      type: "validation",
      message: data?.message || "Data yang dinput tidak valid.",
      errors: data?.errors || {},
    };
  }

  if (status === 403) {
    return {
      type: "general",
      message: data?.message && data.message !== "Forbidden"
        ? data.message
        : "Anda tidak memiliki izin untuk melakukan aksi ini.",
    };
  }

  // 3. General Error
  return {
    type: "general",
    message: data?.message || axiosError.message || "Terjadi kesalahan pada server.",
  };
};

/**
 * Helper to get only the message string from an error
 * 💡 Digunakan oleh banyak komponen untuk menampilakan pesan error singkat
 */
export const getErrorMessage = (error: unknown): string => {
  return parseApiError(error).message;
};

