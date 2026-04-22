export interface TrainingProgram {
  id: string | number;
  title: string;
  description: string;
  category: string;
  provider: string;
  start_date: string;
  end_date: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  capacity: number;
  enrolled_count: number;
  image_url?: string;
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
