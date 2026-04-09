import { api } from "@/shared/api/httpClient";
import type { EmployeeCreatePayload, EmployeeItem, EmployeeUpdatePayload } from "../types/employee.types";

type UnknownRecord = Record<string, unknown>;

const toRecord = (value: unknown): UnknownRecord =>
  value && typeof value === "object" ? (value as UnknownRecord) : {};

const extractPayload = (raw: unknown) => {
  const root = toRecord(raw);
  return root.data ?? raw;
};

const extractArrayPayload = (raw: unknown): EmployeeItem[] => {
  const payload = extractPayload(raw);

  if (Array.isArray(payload)) {
    return payload.filter((item): item is EmployeeItem => !!item && typeof item === "object");
  }

  const payloadRecord = toRecord(payload);
  const candidates = [payloadRecord.items, payloadRecord.rows, payloadRecord.data, payloadRecord.results];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate.filter((item): item is EmployeeItem => !!item && typeof item === "object");
    }
  }

  return [];
};

export const getAllEmployees = async () => {
  const response = await api.get("/employees");
  return {
    items: extractArrayPayload(response.data),
    raw: response.data,
  };
};

export const createEmployee = async (payload: EmployeeCreatePayload) => {
  const response = await api.post("/employees", payload);
  return { raw: response.data };
};

export const getEmployeeDetail = async (id: string) => {
  const response = await api.get(`/employees/${id}`);
  return {
    payload: extractPayload(response.data),
    raw: response.data,
  };
};

export const updateEmployee = async (id: string, payload: EmployeeUpdatePayload) => {
  const response = await api.put(`/employees/${id}`, payload);
  return { raw: response.data };
};

export const deleteEmployee = async (id: string) => {
  const response = await api.delete(`/employees/${id}`);
  return { raw: response.data };
};
