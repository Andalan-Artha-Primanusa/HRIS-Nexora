export interface TrainingProgram {
  id: string | number;
  title: string;
  description: string;
  provider: string;
  mode: string;
  start_date: string;
  end_date: string;
  budget: number;
  status: string;
  category?: string;
  duration?: string;
  enrolled_count?: number;
  completion_rate?: number;
}

export interface Competency {
  id: string | number;
  name: string;
  description: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface EmployeeCompetency extends Competency {
  employee_id: string | number;
  assigned_at: string;
  score?: number;
}
