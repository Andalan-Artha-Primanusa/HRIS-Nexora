export interface LocationItem {
  id: string | number;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  department?: string;
  created_at?: string;
  updated_at?: string;
}

export interface LocationCreatePayload {
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  department: string;
}

export interface LocationUpdatePayload {
  name: string;
  radius: number;
  department: string;
}
