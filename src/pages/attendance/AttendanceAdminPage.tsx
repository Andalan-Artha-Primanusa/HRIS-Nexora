import { useEffect, useMemo, useState } from "react";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import {
  deleteAttendanceRecord,
  getAllAttendanceRecords,
  getAttendanceDetail,
  type AttendanceItem,
} from "@/features/attendance/api/attendance-admin.service";
import "../admin/AdminCrudPages.css";

const asDisplay = (value: unknown) => {
  if (value === null || value === undefined) return "-";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

const getColumns = (items: AttendanceItem[]) => {
  if (items.length === 0) {
    return ["id", "employee_id", "date", "check_in", "check_out", "status"];
  }

  const keys = Object.keys(items[0]);
  const preferred = ["id", "employee_id", "date", "check_in", "check_out", "status"];
  const merged = [...preferred, ...keys.filter((key) => !preferred.includes(key))];
  return merged.filter((key, index) => merged.indexOf(key) === index);
};

const AttendanceAdminPage = () => {
  const [items, setItems] = useState<AttendanceItem[]>([]);
  const [recordId, setRecordId] = useState("");
  const [selectedDetail, setSelectedDetail] = useState<Record<string, unknown> | null>(null);
  const [responseText, setResponseText] = useState("");
  const [statusMessage, setStatusMessage] = useState("Ready to call attendance admin API");
  const [loading, setLoading] = useState(false);

  const columns = useMemo(() => getColumns(items), [items]);

  const formatResponse = (payload: unknown) => {
    setResponseText(typeof payload === "string" ? payload : JSON.stringify(payload, null, 2));
  };

  const requireId = () => {
    const id = recordId.trim();
    if (!id) {
      setStatusMessage("Attendance ID wajib diisi untuk detail/delete.");
      return null;
    }
    return id;
  };

  const loadAttendanceRecords = async () => {
    setLoading(true);
    setStatusMessage("Memuat semua attendance records...");
    setResponseText("");

    try {
      const result = await getAllAttendanceRecords();
      setItems(result.items);
      formatResponse(result.raw);
      setStatusMessage("Semua attendance records berhasil dimuat.");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Gagal memuat attendance records.";
      formatResponse(message);
      setStatusMessage("Gagal memuat attendance records.");
    } finally {
      setLoading(false);
    }
  };

  const loadDetail = async () => {
    const id = requireId();
    if (!id) return;

    setLoading(true);
    setStatusMessage("Memuat detail attendance...");
    setResponseText("");

    try {
      const result = await getAttendanceDetail(id);
      const payload =
        result.payload && typeof result.payload === "object"
          ? (result.payload as Record<string, unknown>)
          : null;
      setSelectedDetail(payload);
      formatResponse(result.raw);
      setStatusMessage("Detail attendance berhasil dimuat.");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Gagal memuat detail attendance.";
      formatResponse(message);
      setStatusMessage("Gagal memuat detail attendance.");
    } finally {
      setLoading(false);
    }
  };

  const deleteRecord = async () => {
    const id = requireId();
    if (!id) return;

    setLoading(true);
    setStatusMessage("Menghapus attendance record...");
    setResponseText("");

    try {
      const result = await deleteAttendanceRecord(id);
      formatResponse(result.raw);
      setStatusMessage("Attendance record berhasil dihapus.");
      await loadAttendanceRecords();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Gagal menghapus attendance record.";
      formatResponse(message);
      setStatusMessage("Gagal menghapus attendance record.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAttendanceRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="crud-page">
      <div className="crud-header">
        <div>
          <h1>Attendance Management</h1>
          <p>Endpoint: GET /attendance/all, GET /attendance/{"{id}"}, DELETE /attendance/{"{id}"}</p>
        </div>
        <Button variant="outline" size="md" onClick={() => void loadAttendanceRecords()} disabled={loading}>
          Refresh
        </Button>
      </div>

      <Card className="crud-card" glass>
        <h2>Attendance Actions</h2>
        <div className="crud-form-grid">
          <label>
            Attendance ID
            <input
              className="crud-input"
              value={recordId}
              onChange={(event) => setRecordId(event.target.value)}
              placeholder="attendance id"
            />
          </label>
        </div>

        <div className="crud-actions">
          <Button variant="primary" size="md" onClick={() => void loadDetail()} disabled={loading}>
            Get Detail
          </Button>
          <Button variant="ghost" size="md" onClick={() => void deleteRecord()} disabled={loading}>
            Delete Record
          </Button>
        </div>
      </Card>

      <Card className="crud-card" glass>
        <h2>Attendance Detail</h2>
        <pre className="crud-response">
          {selectedDetail ? JSON.stringify(selectedDetail, null, 2) : "Belum ada detail attendance dipilih."}
        </pre>
      </Card>

      <Card className="crud-card" glass>
        <h2>Attendance Table</h2>
        <div className="crud-table-wrap">
          <table className="crud-table">
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
                  <td colSpan={columns.length}>No attendance data available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="crud-card" glass>
        <h2>Raw Response</h2>
        <pre className="crud-response">{responseText || "Response API akan tampil di sini."}</pre>
        <p className="crud-status">{statusMessage}</p>
      </Card>
    </div>
  );
};

export default AttendanceAdminPage;
