export interface IDP {
  id: string | number;
  employee_id: string | number;
  year: number;
  goals: IDPGoal[];
  status: 'active' | 'completed';
  created_at: string;
}

export interface IDPGoal {
  id: string | number;
  title: string;
  action_plan: string;
  timeline: string;
  status: 'pending' | 'in-progress' | 'completed';
}

export interface SuccessionMatrix {
  id: string | number;
  position_id: string | number;
  position_name: string;
  incumbent_id: string | number;
  successors: Successor[];
}

export interface Successor {
  employee_id: string | number;
  readiness: 'ready-now' | 'ready-1-2-years' | 'ready-2-plus-years';
  risk_of_loss: 'high' | 'medium' | 'low';
}

export interface EngagementSurvey {
  id: string | number;
  title: string;
  description?: string;
  status: 'draft' | 'active' | 'closed';
  start_date: string;
  end_date: string;
  total_responses: number;
}
