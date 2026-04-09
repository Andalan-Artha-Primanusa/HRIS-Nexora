export interface ProfilePayload {
  phone: string;
  address: string;
  city: string;
  province: string;
  postal_code: string;
}

export type Profile = {
  id: string | number;
} & Partial<ProfilePayload> &
  Record<string, unknown>;
