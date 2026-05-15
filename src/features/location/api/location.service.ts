import { api } from "@/shared/api/httpClient";
import { extractArrayPayload, extractPayload, parsePaginatedResponse, type PaginationParams } from "@/shared/api/pagination";
import type { LocationCreatePayload, LocationItem, LocationUpdatePayload } from "../types/location.types";

const isLocationItem = (item: unknown): item is LocationItem =>
  item !== null && typeof item === "object";

export const getLocationsPage = async (page = 1, perPage = 10, params: PaginationParams = {}) => {
  const response = await api.get("/locations", { params: { ...params, page, per_page: perPage } });
  const parsed = parsePaginatedResponse(response.data, isLocationItem);
  return {
    items: parsed.items,
    totalPages: parsed.totalPages,
    total: parsed.total,
    currentPage: parsed.currentPage,
    raw: response.data,
  };
};

export const getAllLocations = async () => {
  let page = 1;
  const perPage = 100;
  const items: LocationItem[] = [];

  while (page <= 50) {
    const result = await getLocationsPage(page, perPage);
    items.push(...result.items);
    if (page >= result.totalPages) break;
    page += 1;
  }

  return { items, raw: items };
};

export const getActiveLocations = async () => {
  const response = await api.get("/attendance/locations");
  return {
    items: extractArrayPayload(response.data, isLocationItem),
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
