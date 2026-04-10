export type ReimbursementItem = Record<string, unknown>;

export interface ReimbursementFilters {
  status?: string;
  category?: string;
  employee_id?: number;
}

export interface ReimbursementCreatePayload {
  employee_id: number;
  title: string;
  description: string;
  amount: number;
  category: string;
  expense_date: string;
  receipt_path: string;
}

export interface ReimbursementUpdatePayload {
  title: string;
  amount: number;
  category: string;
}

export interface ReimbursementDecisionPayload {
  note: string;
}
