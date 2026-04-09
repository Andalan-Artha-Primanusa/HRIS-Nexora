import { api } from "@/shared/api/httpClient";
import type { LocationCreatePayload, LocationItem, LocationUpdatePayload } from "../types/location.types";

type UnknownRecord = Record<string, unknown>;

const toRecord = (value: unknown): UnknownRecord =>
  value && typeof value === "object" ? (value as UnknownRecord) : {};

const extractPayload = (raw: unknown) => {
  const root = toRecord(raw);
  return root.data ?? raw;
};

const extractArrayPayload = (raw: unknown): LocationItem[] => {
  const payload = extractPayload(raw);

  if (Array.isArray(payload)) {
    return payload.filter((item): item is LocationItem => !!item && typeof item === "object");
  }

  const payloadRecord = toRecord(payload);
  const candidates = [payloadRecord.items, payloadRecord.rows, payloadRecord.data, payloadRecord.results];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate.filter((item): item is LocationItem => !!item && typeof item === "object");
    }
  }

  return [];
};

export const getAllLocations = async () => {
  const response = await api.get("/locations");
  return {
    items: extractArrayPayload(response.data),
    raw: response.data,
  };
};

export const createLocation = async (payload: LocationCreatePayload) => {
  const response = await api.post("/locations", payload);
  return { raw: response.data };
};

export const getLocationDetail = async (id: string) => {
  const response = await api.get(`/locations/${id}`);
  return {
    payload: extractPayload(response.data),
    raw: response.data,
  };
};

export const updateLocation = async (id: string, payload: LocationUpdatePayload) => {
  const response = await api.put(`/locations/${id}`, payload);
  return { raw: response.data };
};

export const deleteLocation = async (id: string) => {
  const response = await api.delete(`/locations/${id}`);
  return { raw: response.data };
};
