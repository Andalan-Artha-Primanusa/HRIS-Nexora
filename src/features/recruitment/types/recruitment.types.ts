export type JobOpening = {
  id?: string | number;
  title?: string;
  department?: string;
};

export type Candidate = {
  id: string | number;
  full_name?: string;
  email?: string;
  phone?: string;
  source?: string;
  stage?: string;
  rating?: number;
  created_at: string;
  job_opening?: JobOpening | null;
};
