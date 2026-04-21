import { useEffect, useMemo, useState } from "react";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { LoadingState, EmptyState } from "@/shared/ui/DataStateDisplay";
import {
  deleteAttendanceRecord,
  getAllAttendanceRecords,
  getAttendanceDetail,
  type AttendanceItem,
} from "@/features/attendance/api/attendance-admin.service";
import { RefreshCw, Trash2, Eye, Search } from "lucide-react";
import "@/shared/styles/CrudPage.css";

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
  const [, setStatusMessage] = useState("Ready to call attendance admin API");
  const [loading, setLoading] = useState(false);

  const columns = useMemo(() => getColumns(items), [items]);

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
    try {
      const result = await getAllAttendanceRecords();
      setItems(result.items);
      setStatusMessage("Semua attendance records berhasil dimuat.");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Gagal memuat attendance records.";
      setStatusMessage(message);
    } finally {
      setLoading(false);
    }
  };

  const loadDetail = async () => {
    const id = requireId();
    if (!id) return;
    setLoading(true);
    setStatusMessage("Memuat detail attendance...");
    try {
      const result = await getAttendanceDetail(id);
      const payload = result.payload && typeof result.payload === "object"
        ? (result.payload as Record<string, unknown>)
        : null;
      setSelectedDetail(payload);
      setStatusMessage("Detail attendance berhasil dimuat.");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Gagal memuat detail attendance.";
      setStatusMessage(message);
    } finally {
      setLoading(false);
    }
  };

  const deleteRecord = async () => {
    const id = requireId();
    if (!id) return;
    setLoading(true);
    setStatusMessage("Menghapus attendance record...");
    try {
      await deleteAttendanceRecord(id);
      setStatusMessage("Attendance record berhasil dihapus.");
      await loadAttendanceRecords();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Gagal menghapus attendance record.";
      setStatusMessage(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAttendanceRecords();
  }, []);

  return (
    <div className="crud-page">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-badge">Admin Panel</span>
          <h1>Attendance Management</h1>
          <p>Kelola semua data kehadiran karyawan, termasuk detail dan penghapusan record.</p>
        </div>
        <div className="page-header-actions">
          <Button variant="outline" size="md" onClick={() => void loadAttendanceRecords()} disabled={loading} style={{ borderColor: "#2563eb", color: "#2563eb" }}>
            <RefreshCw size={16} />
            Segarkan
          </Button>
        </div>
      </div>

      {/* Detail Panel */}
      {selectedDetail && (
        <Card className="control-card" glass>
          <h3 style={{ margin: "0 0 1rem", color: "#1e3a8a", fontWeight: 700 }}>Attendance Detail</h3>
          <pre style={{
            margin: 0,
            padding: "1rem",
            background: "#eff6ff",
            borderRadius: "12px",
            border: "1px solid rgba(37, 99, 235, 0.14)",
            overflow: "auto",
            fontSize: "0.9rem",
            lineHeight: 1.5,
          }}>
            {JSON.stringify(selectedDetail, null, 2)}
          </pre>
        </Card>
      )}

      {/* Table */}
      <Card className="table-card" glass>
        <div className="table-header-bar">
          <h3>Attendance Records</h3>
          <span className="table-count">{items.length} records</span>
        </div>

        <div className="table-card-inner" style={{ paddingBottom: '1.5rem' }}>
          <div className="control-bar">
            <div className="search-box">
              <Search size={18} />
              <input
                className="search-input"
                value={recordId}
                onChange={(event) => setRecordId(event.target.value)}
                placeholder="Masukkan Attendance ID..."
              />
            </div>
            <div className="quick-controls">
              <Button variant="primary" size="md" onClick={() => void loadDetail()} disabled={loading}>
                <Eye size={16} />
                Get Detail
              </Button>
              <Button variant="ghost" size="md" onClick={() => void deleteRecord()} disabled={loading} style={{ color: "#ef4444" }}>
                <Trash2 size={16} />
                Delete Record
              </Button>
            </div>
          </div>
        </div>

        {loading && <div className="table-card-inner"><LoadingState message="Memuat data attendance..." /></div>}
        {!loading && items.length === 0 && (
          <div className="table-card-inner">
            <EmptyState
              icon=""
              title="Tidak ada data"
              message="Tidak ada data attendance tersedia."
            />
          </div>
        )}

        {!loading && items.length > 0 && (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  {columns.map((column) => (
                    <th key={column}>{column.replace(/_/g, ' ')}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={String(item.id ?? index)}>
                    {columns.map((column) => (
                      <td key={`${String(item.id ?? index)}-${column}`}>
                        {column === 'id' ? (
  <span className="cell-id">{asDisplay(item[column])}</span>

) : column === 'employee_id' ? (
  <span className="cell-id">
    EMP-{String(item[column]).padStart(3, '0')}
  </span>

) : (column.includes('date') || column.endsWith('_at')) ? (
  item[column]
    ? new Date(String(item[column])).toLocaleDateString('id-ID', {
        timeZone: 'Asia/Jakarta',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : '-'

) : (column.includes('time') || column.includes('check_in') || column.includes('check_out')) ? (
  item[column]
    ? new Date(String(item[column])).toLocaleTimeString('id-ID', {
        timeZone: 'Asia/Jakarta',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '-'

) : (
  asDisplay(item[column])
)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AttendanceAdminPage;
