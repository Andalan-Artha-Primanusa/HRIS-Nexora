/**
 * Employee core data structure
 */
export interface EmployeeItem {
  id: string | number;
  user_id: string | number;
  user?: {
    id: string | number;
    name: string;
    email: string;
  };
  employee_code: string;
  position: string;
  department: string;
  hire_date: string;
  salary: number;
  status?: "active" | "inactive" | "pending";
  created_at?: string;
  updated_at?: string;
}

/**
 * Employee for payroll enrichment (with computed employee name)
 */
export interface EmployeeWithName extends EmployeeItem {
  employeeName: string;
}

/**
 * Payload for creating new employee
 */
export interface EmployeeCreatePayload {
  user_id: number;
  employee_code: string;
  position: string;
  department: string;
  hire_date: string;
  salary: number;
}

/**
 * Payload for updating employee
 */
export interface EmployeeUpdatePayload {
  position?: string;
  department?: string;
  salary?: number;
  status?: "active" | "inactive" | "pending";
}

/**
 * API response types
 */
export interface EmployeeListResponse {
  success: boolean;
  data: EmployeeItem[];
  total?: number;
  message?: string;
}

export interface EmployeeDetailResponse {
  success: boolean;
  data: EmployeeItem;
  message?: string;
}
