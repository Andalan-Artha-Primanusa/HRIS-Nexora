export interface EmployeeCreatePayload {
  user_id: number;
  employee_code: string;
  position: string;
  department: string;
  hire_date: string;
  salary: number;
}

export interface EmployeeUpdatePayload {
  position: string;
  department: string;
  salary: number;
}

export type EmployeeItem = Record<string, unknown>;
