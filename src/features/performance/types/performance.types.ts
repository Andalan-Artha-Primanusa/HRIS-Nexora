export interface OKR {
  id: string | number;
  title: string;
  description?: string;
  owner_id: string | number;
  period: string;
  status: 'draft' | 'in-progress' | 'completed' | 'cancelled';
  progress: number;
  key_results: KeyResult[];
  created_at: string;
}

export interface KeyResult {
  id: string | number;
  title: string;
  target_value: number;
  current_value: number;
  unit: string;
  weight: number;
}

export interface Review360 {
  id: string | number;
  employee_id: string | number;
  period: string;
  status: 'draft' | 'active' | 'completed';
  feeders: Feeder[];
  self_assessment?: string;
  manager_assessment?: string;
}

export interface Feeder {
  id: string | number;
  feeder_id: string | number;
  relationship: 'peer' | 'subordinate' | 'manager';
  status: 'pending' | 'submitted';
  feedback?: string;
}

export interface CalibrationSession {
  id: string | number;
  title: string;
  date: string;
  status: 'scheduled' | 'in-progress' | 'completed';
  participants: number[];
  reviews: number[];
}
