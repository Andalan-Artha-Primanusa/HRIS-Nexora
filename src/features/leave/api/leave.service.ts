import { api } from "@/shared/api/httpClient";
import type {
  LeaveCreatePayload,
  LeaveDecisionPayload,
  LeaveItem,
  LeaveUpdatePayload,
} from "../types/leave.types";

type UnknownRecord = Record<string, unknown>;

const toRecord = (value: unknown): UnknownRecord =>
  value && typeof value === "object" ? (value as UnknownRecord) : {};

const extractPayload = (raw: unknown) => {
  const root = toRecord(raw);
  return root.data ?? raw;
};

const extractArrayPayload = (raw: unknown): LeaveItem[] => {
  const payload = extractPayload(raw);

  if (Array.isArray(payload)) {
    return payload.filter((item): item is LeaveItem => !!item && typeof item === "object");
  }

  const payloadRecord = toRecord(payload);
  const candidates = [
    payloadRecord.items,
    payloadRecord.rows,
    payloadRecord.data,
    payloadRecord.results,
    payloadRecord.calendar,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate.filter((item): item is LeaveItem => !!item && typeof item === "object");
    }
  }

  return [];
};

export const getAllLeaves = async () => {
  const response = await api.get("/leaves");
  return {
    items: extractArrayPayload(response.data),
    raw: response.data,
  };
};

export const createLeaveRequest = async (payload: LeaveCreatePayload) => {
  const response = await api.post("/leaves", payload);
  return { raw: response.data };
};

export const getLeaveCalendar = async () => {
  const response = await api.get("/leaves/calendar");
  return {
    items: extractArrayPayload(response.data),
    payload: extractPayload(response.data),
    raw: response.data,
  };
};

export const getLeaveDetail = async (id: string) => {
  const response = await api.get(`/leaves/${id}`);
  return {
    payload: extractPayload(response.data),
    raw: response.data,
  };
};

export const updateLeaveRequest = async (id: string, payload: LeaveUpdatePayload) => {
  const response = await api.put(`/leaves/${id}`, payload);
  return { raw: response.data };
};

export const deleteLeaveRequest = async (id: string) => {
  const response = await api.delete(`/leaves/${id}`);
  return { raw: response.data };
};

export const getPendingLeaves = async () => {
  const response = await api.get("/leaves/pending");
  return {
    items: extractArrayPayload(response.data),
    raw: response.data,
  };
};

export const approveLeave = async (id: string, payload: LeaveDecisionPayload) => {
  const response = await api.put(`/leaves/${id}/approve`, payload);
  return { raw: response.data };
};

export const rejectLeave = async (id: string, payload: LeaveDecisionPayload) => {
  const response = await api.put(`/leaves/${id}/reject`, payload);
  return { raw: response.data };
};
