import { api } from "@/shared/api/httpClient";
import type {
  PayrollCreatePayload,
  PayrollDetailBulkUpdatePayload,
  PayrollDetailsBulkCreatePayload,
  PayrollDetailUpdatePayload,
  PayrollGenerateMonthlyPayload,
  PayrollItem,
  PayrollUpdatePayload,
} from "../types/payroll.types";
import { MOCK_PAYROLL, USE_MOCK_PAYROLL_DATA } from "./payroll.mock";

/**
 * Type-safe API response wrapper
 */
interface ApiResponse<T = unknown> {
  success?: boolean;
  data?: T;
  items?: T extends any[] ? T : never;
  message?: string;
  error?: string;
}

/**
 * Extract array from various API response formats
 */
function extractArrayFromResponse(response: unknown): PayrollItem[] {
  if (!response || typeof response !== "object") {
    return [];
  }

  const resp = response as Record<string, unknown>;

  // Try direct array
  if (Array.isArray(resp)) {
    return resp.filter((item): item is PayrollItem => item && typeof item === "object");
  }

  // Try common API response paths
  const candidates: unknown[] = [
    (resp.data as any)?.items || (resp.data as any)?.rows || (resp.data as any)?.data,
    resp.items,
    resp.rows,
    resp.results,
    resp.data,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate.filter((item): item is PayrollItem => item && typeof item === "object");
    }
  }

  return [];
}

/**
 * Handle API errors and return user-friendly messages
 */
function handleApiError(error: unknown, contextMessage: string): never {
  let message = "Unknown error occurred";
  let responseData: unknown = null;

  // Extract error message from axios error response
  if (error && typeof error === "object") {
    const err = error as Record<string, unknown>;

    // Try axios error response
    if (err.response && typeof err.response === "object") {
      const response = err.response as Record<string, unknown>;
      responseData = response.data;

      // Try to get error message from response
      if (response.data && typeof response.data === "object") {
        const data = response.data as Record<string, unknown>;
        // Priority: message > error > detail > errors > validation errors
        if (data.message && typeof data.message === "string") {
          message = data.message;
        } else if (data.error && typeof data.error === "string") {
          message = data.error;
        } else if (data.detail && typeof data.detail === "string") {
          message = data.detail;
        } else if (data.errors && typeof data.errors === "object") {
          // Handle validation errors object
          const errors = data.errors as Record<string, unknown>;
          const errorMessages = Object.entries(errors)
            .map(([key, val]) => `${key}: ${Array.isArray(val) ? (val as string[]).join(", ") : String(val)}`)
            .join("; ");
          message = errorMessages || "Validation error";
        } else {
          message = JSON.stringify(data);
        }
      }
    }

    // Fallback to error message
    if (!message || message === "Unknown error occurred") {
      if (err.message && typeof err.message === "string") {
        message = err.message;
      }
    }
  }

  if (typeof error === "string") {
    message = error;
  }

  const fullMessage = `${contextMessage}: ${message}`;
  console.error("🚨 Payroll API Error:", {
    context: contextMessage,
    error,
    responseData,
    timestamp: new Date().toISOString(),
  });

  throw new Error(fullMessage);
}

/**
 * Fetch all payroll records
 */
export async function getAllPayroll(): Promise<PayrollItem[]> {
  try {
    // Use mock data in development if no real API data
    if (USE_MOCK_PAYROLL_DATA) {
      console.log("ℹ️ Using MOCK payroll data (development mode)");
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve([...MOCK_PAYROLL]);
        }, 500); // Simulate network delay
      });
    }

    const response = await api.get<ApiResponse<PayrollItem[]>>("/payroll");

    if (!response?.data) {
      throw new Error("No response data from server");
    }

    const items = extractArrayFromResponse(response.data);

    if (typeof window !== "undefined" && (window as any).__DEBUG__) {
      console.log("📊 Payroll data fetched:", {
        count: items.length,
        data: items,
        timestamp: new Date().toISOString(),
      });
    }

    return items;
  } catch (error) {
    // Fallback to mock data if API fails
    console.warn("⚠️ API failed, falling back to mock data");
    return [...MOCK_PAYROLL];
  }
}

/**
 * Get single payroll record
 */
export async function getPayrollDetail(id: string | number): Promise<PayrollItem> {
  try {
    const response = await api.get<ApiResponse<PayrollItem>>(`/payroll/${id}`);

    if (!response?.data?.data && !response?.data?.items?.[0]) {
      throw new Error("No payroll data found");
    }

    const data = (response.data.data || response.data.items?.[0]) as PayrollItem;
    return data;
  } catch (error) {
    handleApiError(error, `Failed to fetch payroll ${id}`);
  }
}

/**
 * Create new payroll record
 */
export async function createPayroll(payload: PayrollCreatePayload): Promise<PayrollItem> {
  try {
    console.log("📤 Creating payroll with payload:", payload);
    const response = await api.post<ApiResponse<PayrollItem>>("/payroll", payload);

    if (!response?.data?.data) {
      throw new Error("Invalid response after creating payroll");
    }

    console.log("✅ Payroll created successfully:", response.data.data);
    return response.data.data;
  } catch (error) {
    handleApiError(error, "Failed to create payroll");
  }
}

/**
 * Update payroll record
 */
export async function updatePayroll(
  id: string | number,
  payload: PayrollUpdatePayload
): Promise<PayrollItem> {
  try {
    const response = await api.put<ApiResponse<PayrollItem>>(`/payroll/${id}`, payload);

    if (!response?.data?.data) {
      throw new Error("Invalid response after updating payroll");
    }

    return response.data.data;
  } catch (error) {
    handleApiError(error, `Failed to update payroll ${id}`);
  }
}

/**
 * Delete payroll record
 */
export async function deletePayroll(id: string | number): Promise<void> {
  try {
    await api.delete(`/payroll/${id}`);
  } catch (error) {
    handleApiError(error, `Failed to delete payroll ${id}`);
  }
}

/**
 * Approve payroll record
 */
export async function approvePayroll(id: string | number): Promise<PayrollItem> {
  try {
    const response = await api.post<ApiResponse<PayrollItem>>(`/payroll/${id}/approve`);

    if (!response?.data?.data) {
      throw new Error("Invalid response after approving payroll");
    }

    return response.data.data;
  } catch (error) {
    handleApiError(error, `Failed to approve payroll ${id}`);
  }
}

/**
 * Mark payroll as paid
 */
export async function markPayrollAsPaid(id: string | number): Promise<PayrollItem> {
  try {
    const response = await api.post<ApiResponse<PayrollItem>>(`/payroll/${id}/pay`);

    if (!response?.data?.data) {
      throw new Error("Invalid response after marking as paid");
    }

    return response.data.data;
  } catch (error) {
    handleApiError(error, `Failed to mark payroll ${id} as paid`);
  }
}

/**
 * Generate monthly payroll
 */
export async function generateMonthlyPayroll(
  payload: PayrollGenerateMonthlyPayload
): Promise<{ message: string; created_count: number }> {
  try {
    const response = await api.post<ApiResponse>("/payroll/generate/monthly", payload);

    if (!response?.data?.message) {
      throw new Error("Invalid response after generating payroll");
    }

    return {
      message: response.data.message,
      created_count: (response.data as any).created_count || 0,
    };
  } catch (error) {
    handleApiError(error, "Failed to generate monthly payroll");
  }
}

/**
 * Get payroll details (line items)
 */
export async function getPayrollDetails(payrollId: string | number): Promise<unknown[]> {
  try {
    const response = await api.get(`/payroll-details/${payrollId}`);
    return extractArrayFromResponse(response.data);
  } catch (error) {
    handleApiError(error, `Failed to fetch payroll details for ${payrollId}`);
  }
}

/**
 * Add payroll details (line items)
 */
export async function addPayrollDetailsBulk(
  payload: PayrollDetailsBulkCreatePayload
): Promise<unknown[]> {
  try {
    const response = await api.post(`/payroll-details`, payload);
    return extractArrayFromResponse(response.data);
  } catch (error) {
    handleApiError(error, "Failed to add payroll details");
  }
}

/**
 * Update payroll details
 */
export async function updatePayrollDetails(
  payrollId: string | number,
  payload: PayrollDetailBulkUpdatePayload
): Promise<unknown[]> {
  try {
    const response = await api.put(`/payroll-details/${payrollId}`, payload);
    return extractArrayFromResponse(response.data);
  } catch (error) {
    handleApiError(error, "Failed to update payroll details");
  }
}

export const updatePayrollDetailSingle = async (id: string, payload: PayrollDetailUpdatePayload) => {
  const response = await api.put(`/payroll-details/${id}`, payload);
  return { raw: response.data };
};

export const bulkUpdatePayrollDetails = async (payload: PayrollDetailBulkUpdatePayload) => {
  const response = await api.post("/payroll-details/bulk-update", payload);
  return { raw: response.data };
};

export const deletePayrollDetail = async (id: string) => {
  const response = await api.delete(`/payroll-details/${id}`);
  return { raw: response.data };
};
