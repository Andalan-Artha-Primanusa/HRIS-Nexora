import { useEffect, useMemo, useState } from "react";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import {
  createLeaveRequest,
  deleteLeaveRequest,
  getAllLeaves,
  getLeaveDetail,
  updateLeaveRequest,
} from "@/features/leave/api/leave.service";
import type { LeaveCreatePayload, LeaveItem, LeaveUpdatePayload } from "@/features/leave/types/leave.types";
import "./LeavePages.css";

type LeaveFormState = LeaveCreatePayload & { id: string };

const DEFAULT_FORM: LeaveFormState = {
  id: "",
  type: "annual",
  start_date: "2026-05-01",
  end_date: "2026-05-05",
  total_days: 5,
  reason: "Family vacation",
};

const asDisplay = (value: unknown) => {
  if (value === null || value === undefined) return "-";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

const getColumns = (items: LeaveItem[]) => {
  if (items.length === 0) {
    return ["id", "type", "start_date", "end_date", "total_days", "status"];
  }

  const keys = Object.keys(items[0]);
  const preferred = ["id", "type", "start_date", "end_date", "total_days", "reason", "status"];
  const merged = [...preferred, ...keys.filter((key) => !preferred.includes(key))];
  return merged.filter((key, index) => merged.indexOf(key) === index);
};

const LeaveRequestsPage = () => {
  const [items, setItems] = useState<LeaveItem[]>([]);
  const [selectedDetail, setSelectedDetail] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<LeaveFormState>(DEFAULT_FORM);
  const [responseText, setResponseText] = useState("");
  const [statusMessage, setStatusMessage] = useState("Ready to call leave requests API");
  const [loading, setLoading] = useState(false);

  const columns = useMemo(() => getColumns(items), [items]);

  const formatResponse = (payload: unknown) => {
    setResponseText(typeof payload === "string" ? payload : JSON.stringify(payload, null, 2));
  };

  const requireId = () => {
    const id = form.id.trim();
    if (!id) {
      setStatusMessage("Leave ID wajib diisi untuk detail/update/delete.");
      return null;
    }
    return id;
  };

  const loadLeaves = async () => {
    setLoading(true);
    setStatusMessage("Memuat semua leaves...");
    setResponseText("");

    try {
      const result = await getAllLeaves();
      setItems(result.items);
      formatResponse(result.raw);
      setStatusMessage("Semua leaves berhasil dimuat.");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Gagal memuat leaves.";
      formatResponse(message);
      setStatusMessage("Gagal memuat leaves.");
    } finally {
      setLoading(false);
    }
  };

  const createLeave = async () => {
    setLoading(true);
    setStatusMessage("Membuat leave request...");
    setResponseText("");

    try {
      const payload: LeaveCreatePayload = {
        type: form.type,
        start_date: form.start_date,
        end_date: form.end_date,
        total_days: Number(form.total_days) || 0,
        reason: form.reason,
      };

      const result = await createLeaveRequest(payload);
      formatResponse(result.raw);
      setStatusMessage("Leave request berhasil dibuat.");
      await loadLeaves();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Gagal membuat leave request.";
      formatResponse(message);
      setStatusMessage("Gagal membuat leave request.");
    } finally {
      setLoading(false);
    }
  };

  const getDetail = async () => {
    const id = requireId();
    if (!id) return;

    setLoading(true);
    setStatusMessage("Memuat detail leave...");
    setResponseText("");

    try {
      const result = await getLeaveDetail(id);
      const payload =
        result.payload && typeof result.payload === "object"
          ? (result.payload as Record<string, unknown>)
          : null;

      setSelectedDetail(payload);
      formatResponse(result.raw);
      setStatusMessage("Detail leave berhasil dimuat.");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Gagal memuat detail leave.";
      formatResponse(message);
      setStatusMessage("Gagal memuat detail leave.");
    } finally {
      setLoading(false);
    }
  };

  const updateLeave = async () => {
    const id = requireId();
    if (!id) return;

    setLoading(true);
    setStatusMessage("Mengupdate leave request...");
    setResponseText("");

    try {
      const payload: LeaveUpdatePayload = {
        start_date: form.start_date,
        end_date: form.end_date,
        total_days: Number(form.total_days) || 0,
        reason: form.reason,
      };

      const result = await updateLeaveRequest(id, payload);
      formatResponse(result.raw);
      setStatusMessage("Leave request berhasil diupdate.");
      await loadLeaves();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Gagal update leave request.";
      formatResponse(message);
      setStatusMessage("Gagal update leave request.");
    } finally {
      setLoading(false);
    }
  };

  const deleteLeave = async () => {
    const id = requireId();
    if (!id) return;

    setLoading(true);
    setStatusMessage("Menghapus leave request...");
    setResponseText("");

    try {
      const result = await deleteLeaveRequest(id);
      formatResponse(result.raw);
      setStatusMessage("Leave request berhasil dihapus.");
      await loadLeaves();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Gagal menghapus leave request.";
      formatResponse(message);
      setStatusMessage("Gagal menghapus leave request.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadLeaves();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="leave-page">
      <div className="leave-header">
        <div>
          <h1>Leave Requests</h1>
          <p>Get all, create, detail, update, dan delete leave request.</p>
        </div>
        <Button variant="outline" size="md" onClick={() => void loadLeaves()} disabled={loading}>
          Refresh
        </Button>
      </div>

      <Card className="leave-card" glass>
        <h2>Leave Request Form</h2>
        <div className="leave-form-grid">
          <label>
            ID
            <input
              className="leave-input"
              value={form.id}
              onChange={(event) => setForm((prev) => ({ ...prev, id: event.target.value }))}
              placeholder="leave id"
            />
          </label>
          <label>
            Type
            <input
              className="leave-input"
              value={form.type}
              onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value }))}
            />
          </label>
          <label>
            Start Date
            <input
              className="leave-input"
              type="date"
              value={form.start_date}
              onChange={(event) => setForm((prev) => ({ ...prev, start_date: event.target.value }))}
            />
          </label>
          <label>
            End Date
            <input
              className="leave-input"
              type="date"
              value={form.end_date}
              onChange={(event) => setForm((prev) => ({ ...prev, end_date: event.target.value }))}
            />
          </label>
          <label>
            Total Days
            <input
              className="leave-input"
              value={String(form.total_days)}
              onChange={(event) => setForm((prev) => ({ ...prev, total_days: Number(event.target.value) || 0 }))}
            />
          </label>
          <label className="leave-form-full">
            Reason
            <input
              className="leave-input"
              value={form.reason}
              onChange={(event) => setForm((prev) => ({ ...prev, reason: event.target.value }))}
            />
          </label>
        </div>
        <div className="leave-actions">
          <Button variant="primary" size="md" onClick={() => void createLeave()} disabled={loading}>
            Create Leave
          </Button>
          <Button variant="outline" size="md" onClick={() => void getDetail()} disabled={loading}>
            Get Detail
          </Button>
          <Button variant="secondary" size="md" onClick={() => void updateLeave()} disabled={loading}>
            Update Leave
          </Button>
          <Button variant="ghost" size="md" onClick={() => void deleteLeave()} disabled={loading}>
            Delete Leave
          </Button>
        </div>
      </Card>

      <Card className="leave-card" glass>
        <h2>Leave Detail</h2>
        <pre className="leave-response">
          {selectedDetail ? JSON.stringify(selectedDetail, null, 2) : "Belum ada leave detail dipilih."}
        </pre>
      </Card>

      <Card className="leave-card" glass>
        <h2>Leaves Table</h2>
        <div className="leave-table-wrap">
          <table className="leave-table">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column}>{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.length > 0 ? (
                items.map((item, index) => (
                  <tr key={String(item.id ?? index)}>
                    {columns.map((column) => (
                      <td key={`${String(item.id ?? index)}-${column}`}>{asDisplay(item[column])}</td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length}>No leave data available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="leave-card" glass>
        <h2>Raw Response</h2>
        <pre className="leave-response">{responseText || "Response API akan tampil di sini."}</pre>
        <p className="leave-status">{statusMessage}</p>
      </Card>
    </div>
  );
};

export default LeaveRequestsPage;
