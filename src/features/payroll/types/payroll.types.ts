export type PayrollItem = Record<string, unknown>;

export interface PayrollCreatePayload {
  employee_id: number;
  period: string;
  allowance: number;
  bonus: number;
}

export interface PayrollUpdatePayload {
  allowance: number;
  bonus: number;
}

export interface PayrollGenerateMonthlyPayload {
  period: string;
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
