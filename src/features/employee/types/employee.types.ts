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
  location_id?: number | null;
  manager_id?: number | null;
  work_schedule_id?: number | null;
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
  user_id: string | number | null;
  employee_code: string;
  position: string;
  department: string;
  hire_date: string;
  salary: string | number | null;
  location_id?: string | number | null;
  manager_id?: string | number | null;
  work_schedule_id?: string | number | null;
  status: string;
  probation_end_date?: string | null;
}

/**
 * Payload for updating employee
 */
export interface EmployeeUpdatePayload {
  name?: string;
  user_id?: string | number | null;
  employee_code?: string;
  hire_date?: string;
  position?: string;
  department?: string;
  salary?: string | number | null;
  location_id?: string | number | null;
  manager_id?: string | number | null;
  work_schedule_id?: string | number | null;
  status?: string;
  probation_end_date?: string | null;
}


/**
 * Payload for start onboarding
 */
export interface EmployeeOnboardingPayload {
  probation_end_date: string;
}

/**
 * Payload for start offboarding
 */
export interface EmployeeOffboardingPayload {
  termination_date: string;
  termination_reason: string;
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
