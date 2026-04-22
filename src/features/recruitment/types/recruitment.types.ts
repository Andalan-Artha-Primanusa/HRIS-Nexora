export interface JobOpening {
  id: string | number;
  title: string;
  department: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'remote';
  status: 'open' | 'closed' | 'draft' | 'on-hold';
  description: string;
  requirements: string;
  salary_range?: string;
  created_at: string;
  updated_at: string;
}

export interface Candidate {
  id: string | number;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string;
  stage: string;
  status: 'active' | 'hired' | 'rejected' | 'withdrawn';
  source: string;
  resume_url?: string;
  job_opening_id: string | number;
  job_opening?: JobOpening;
  rating?: number;
  created_at: string;
}

export interface Interview {
  id: string | number;
  candidate_id: string | number;
  interviewer_id: string | number;
  scheduled_at: string;
  location?: string;
  type: 'initial' | 'technical' | 'hr' | 'culture' | 'final';
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  feedback?: string;
  score?: number;
}

export interface Offer {
  id: string | number;
  candidate_id: string | number;
  salary: number;
  start_date: string;
  status: 'draft' | 'sent' | 'accepted' | 'declined' | 'expired';
  expiry_date: string;
  content: string;
}

export interface RecruitmentSummary {
  total_openings: number;
  active_candidates: number;
  interviews_today: number;
  hired_this_month: number;
}
