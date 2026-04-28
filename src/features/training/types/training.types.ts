export interface TrainingProgram {
  id: string | number;
  nama: string;
  deskripsi: string;
  jadwal: string;
  status: string;
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
