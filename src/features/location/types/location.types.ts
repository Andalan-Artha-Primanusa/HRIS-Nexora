export type LocationItem = Record<string, unknown>;

export interface LocationCreatePayload {
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
}

export interface LocationUpdatePayload {
  name: string;
  radius: number;
}
