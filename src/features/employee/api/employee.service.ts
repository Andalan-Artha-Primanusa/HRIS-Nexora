import { api } from "@/shared/api/httpClient";
import type { EmployeeCreatePayload, EmployeeItem, EmployeeUpdatePayload } from "../types/employee.types";

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
function extractArrayFromResponse(response: unknown): EmployeeItem[] {
  if (!response || typeof response !== "object") {
    return [];
  }

  const resp = response as Record<string, unknown>;

  // Try direct array
  if (Array.isArray(resp)) {
    return resp.filter((item): item is EmployeeItem => item && typeof item === "object");
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
      return candidate.filter((item): item is EmployeeItem => item && typeof item === "object");
    }
  }

  return [];
}

/**
 * Extract single item from API response
 */
function extractItemFromResponse(response: unknown): EmployeeItem | null {
  if (!response || typeof response !== "object") {
    return null;
  }

  const resp = response as Record<string, unknown>;

  // Try direct item if already correct structure
  if ("id" in resp && "employee_code" in resp) {
    return resp as EmployeeItem;
  }

  // Try common API response paths
  const candidates = [resp.data, resp.payload, resp.item];

  for (const candidate of candidates) {
    if (candidate && typeof candidate === "object" && "id" in candidate) {
      return candidate as EmployeeItem;
    }
  }

  return null;
}

/**
 * Handle API errors and return user-friendly messages
 */
function handleApiError(error: unknown, contextMessage: string): never {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "Unknown error occurred";

  const fullMessage = `${contextMessage}: ${message}`;
  console.error("🚨 Employee API Error:", {
    context: contextMessage,
    error,
    timestamp: new Date().toISOString(),
  });

  throw new Error(fullMessage);
}

/**
 * Fetch all employees
 */
export async function getAllEmployees(): Promise<EmployeeItem[]> {
  try {
    const response = await api.get<ApiResponse<EmployeeItem[]>>("/employees");

    if (!response?.data) {
      throw new Error("No response data from server");
    }

    const items = extractArrayFromResponse(response.data);

    if (typeof window !== "undefined" && (window as any).__DEBUG__) {
      console.log("👥 Employee data fetched:", {
        count: items.length,
        data: items,
        timestamp: new Date().toISOString(),
      });
    }

    return items;
  } catch (error) {
    console.warn("⚠️ Failed to fetch employees:", error);
    return [];
  }
}

/**
 * Get single employee record
 */
export async function getEmployeeDetail(id: string | number): Promise<EmployeeItem> {
  try {
    const response = await api.get<ApiResponse<EmployeeItem>>(`/employees/${id}`);

    if (!response?.data) {
      throw new Error("No employee data found");
    }

    const item = extractItemFromResponse(response.data);
    if (!item) {
      throw new Error(`Invalid employee data structure for ID ${id}`);
    }

    return item;
  } catch (error) {
    handleApiError(error, `Failed to fetch employee ${id}`);
  }
}

/**
 * Create new employee record
 */
export async function createEmployee(payload: EmployeeCreatePayload): Promise<EmployeeItem> {
  try {
    const response = await api.post<ApiResponse<EmployeeItem>>("/employees", payload);

    if (!response?.data) {
      throw new Error("Invalid response after creating employee");
    }

    const item = extractItemFromResponse(response.data);
    if (!item) {
      throw new Error("No employee data in response");
    }

    return item;
  } catch (error) {
    handleApiError(error, "Failed to create employee");
  }
}

/**
 * Update employee record
 */
export async function updateEmployee(id: string | number, payload: EmployeeUpdatePayload): Promise<EmployeeItem> {
  try {
    const response = await api.put<ApiResponse<EmployeeItem>>(`/employees/${id}`, payload);

    if (!response?.data) {
      throw new Error("Invalid response after updating employee");
    }

    const item = extractItemFromResponse(response.data);
    if (!item) {
      throw new Error("No employee data in response");
    }

    return item;
  } catch (error) {
    handleApiError(error, `Failed to update employee ${id}`);
  }
}

/**
 * Delete employee record
 */
export async function deleteEmployee(id: string | number): Promise<void> {
  try {
    await api.delete(`/employees/${id}`);

    if (typeof window !== "undefined" && (window as any).__DEBUG__) {
      console.log(`🗑️ Employee ${id} deleted successfully`);
    }
  } catch (error) {
    handleApiError(error, `Failed to delete employee ${id}`);
  }
}
