/**
 * Payroll Item - Core payroll record
 */
export interface PayrollItem {
  id: string | number;
  employee_id: string | number;
  period: string; // Format: "2026-04"
  basic_salary?: string | number;
  allowance?: number | string;
  bonus?: number | string;
  deduction?: number | string;
  tax?: number | string;
  bpjs_kesehatan?: string | number;
  bpjs_ketenagakerjaan?: string | number;
  pph21?: string | number;
  total_deduction?: string | number;
  net_salary?: string | number;
  take_home_pay?: string | number;
  status: PayrollStatus;
  created_at?: string;
  updated_at?: string;
  approved_at?: string;
  paid_at?: string;
  notes?: string;
  employee?: EmployeeItemExpanded;
  details?: PayrollDetail[];
}

/**
 * Payroll Detail Item
 */
export interface PayrollDetail {
  id?: string | number;
  payroll_id?: string | number;
  description?: string;
  amount?: string | number;
  type?: "deduction" | "allowance" | "benefit";
  created_at?: string;
  updated_at?: string;
}

/**
 * Employee Item (expanded with user data)
 */
export interface EmployeeItemExpanded {
  id: string | number;
  user_id?: string | number;
  employee_code?: string;
  position?: string;
  department?: string;
  hire_date?: string;
  salary?: string | number;
  manager_id?: string | number | null;
  created_at?: string;
  updated_at?: string;
  user?: UserItem;
  manager?: EmployeeItemExpanded | null;
}

/**
 * User Item
 */
export interface UserItem {
  id: string | number;
  name?: string;
  email?: string;
  email_verified_at?: string | null;
  location_id?: string | number | null;
  created_at?: string;
  updated_at?: string;
  profile?: unknown;
}

export type PayrollStatus = "draft" | "pending" | "approved" | "paid" | "rejected";

/**
 * Payroll with enriched employee data
 */
export interface PayrollWithEmployee extends PayrollItem {
  employeeName: string;
  employee?: any; // Full employee object if needed
}

/**
 * Create Payroll Payload
 */
export interface PayrollCreatePayload {
  employee_id: number;
  period: string;
  allowance: number;
  bonus: number;
  deduction?: number;
  tax?: number;
  notes?: string;
}
/**
 * Update Payroll Payload
 */
export interface PayrollUpdatePayload {
  allowance?: number;
  bonus?: number;
  deduction?: number;
  tax?: number;
  notes?: string;
}

/**
 * Generate Monthly Payroll Payload
 */
export interface PayrollGenerateMonthlyPayload {
  period: string;
  employee_ids?: number[];
  force_regenerate?: boolean;
}

export interface PayrollDetailEntryPayload {
  type: string;
  name: string;
  amount: number;
}

export interface PayrollDetailsBulkCreatePayload {
  payroll_id: number;
  details: PayrollDetailEntryPayload[];
}

export interface PayrollDetailUpdatePayload {
  type: string;
  name: string;
  amount: number;
}

export interface PayrollDetailBulkUpdatePayload {
  details: Array<{
    id: number;
    amount: number;
  }>;
}
