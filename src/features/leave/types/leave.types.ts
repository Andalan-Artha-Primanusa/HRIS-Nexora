export interface LeaveCreatePayload {
  type: string;
  start_date: string;
  end_date: string;
  total_days: number;
  reason: string;
}

export interface LeaveUpdatePayload {
  start_date: string;
  end_date: string;
  total_days: number;
  reason: string;
}

export interface LeaveDecisionPayload {
  note: string;
}

export type LeaveItem = Record<string, unknown>;
