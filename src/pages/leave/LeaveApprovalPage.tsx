import { useEffect, useMemo, useState } from "react";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { approveLeave, getPendingLeaves, rejectLeave } from "@/features/leave/api/leave.service";
import type { LeaveItem } from "@/features/leave/types/leave.types";
import "./LeavePages.css";

const asDisplay = (value: unknown) => {
  if (value === null || value === undefined) return "-";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

const getColumns = (items: LeaveItem[]) => {
  if (items.length === 0) {
    return ["id", "employee", "type", "start_date", "end_date", "status"];
  }

  const keys = Object.keys(items[0]);
  const preferred = ["id", "employee", "type", "start_date", "end_date", "total_days", "status"];
  const merged = [...preferred, ...keys.filter((key) => !preferred.includes(key))];
  return merged.filter((key, index) => merged.indexOf(key) === index);
};

const LeaveApprovalPage = () => {
  const [items, setItems] = useState<LeaveItem[]>([]);
  const [decisionId, setDecisionId] = useState("");
  const [decisionNote, setDecisionNote] = useState("Approved");
  const [responseText, setResponseText] = useState("");
  const [statusMessage, setStatusMessage] = useState("Ready to call leave approval API");
  const [loading, setLoading] = useState(false);

  const columns = useMemo(() => getColumns(items), [items]);

  const formatResponse = (payload: unknown) => {
    setResponseText(typeof payload === "string" ? payload : JSON.stringify(payload, null, 2));
  };

  const loadPending = async () => {
    setLoading(true);
    setStatusMessage("Memuat pending leaves...");
    setResponseText("");

    try {
      const result = await getPendingLeaves();
      setItems(result.items);
      formatResponse(result.raw);
      setStatusMessage("Pending leaves berhasil dimuat.");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Gagal memuat pending leaves.";
      formatResponse(message);
      setStatusMessage("Gagal memuat pending leaves.");
    } finally {
      setLoading(false);
    }
  };

  const requireId = () => {
    const id = decisionId.trim();
    if (!id) {
      setStatusMessage("Leave ID wajib diisi untuk approve/reject.");
      return null;
    }
    return id;
  };

  const runApprove = async () => {
    const id = requireId();
    if (!id) return;

    setLoading(true);
    setStatusMessage("Mengapprove leave...");
    setResponseText("");

    try {
      const result = await approveLeave(id, { note: decisionNote });
      formatResponse(result.raw);
      setStatusMessage("Leave berhasil diapprove.");
      await loadPending();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Gagal approve leave.";
      formatResponse(message);
      setStatusMessage("Gagal approve leave.");
    } finally {
      setLoading(false);
    }
  };

  const runReject = async () => {
    const id = requireId();
    if (!id) return;

    setLoading(true);
    setStatusMessage("Mereject leave...");
    setResponseText("");

    try {
      const result = await rejectLeave(id, { note: decisionNote });
      formatResponse(result.raw);
      setStatusMessage("Leave berhasil direject.");
      await loadPending();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Gagal reject leave.";
      formatResponse(message);
      setStatusMessage("Gagal reject leave.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPending();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="leave-page">
      <div className="leave-header">
        <div>
          <h1>Leave Approval</h1>
          <p>Pending leaves + approve/reject (Manager/HR/Admin).</p>
        </div>
        <Button variant="outline" size="md" onClick={() => void loadPending()} disabled={loading}>
          Refresh Pending
        </Button>
      </div>

      <Card className="leave-card" glass>
        <h2>Approve / Reject Action</h2>
        <div className="leave-form-grid">
          <label>
            Leave ID
            <input
              className="leave-input"
              value={decisionId}
              onChange={(event) => setDecisionId(event.target.value)}
              placeholder="leave id"
            />
          </label>
          <label className="leave-form-full">
            Note
            <input
              className="leave-input"
              value={decisionNote}
              onChange={(event) => setDecisionNote(event.target.value)}
              placeholder="Approved / Cannot approve at this time"
            />
          </label>
        </div>
        <div className="leave-actions">
          <Button variant="primary" size="md" onClick={() => void runApprove()} disabled={loading}>
            Approve Leave
          </Button>
          <Button variant="secondary" size="md" onClick={() => void runReject()} disabled={loading}>
            Reject Leave
          </Button>
        </div>
      </Card>

      <Card className="leave-card" glass>
        <h2>Pending Leaves Table</h2>
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
                  <td colSpan={columns.length}>No pending leaves data.</td>
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

export default LeaveApprovalPage;
