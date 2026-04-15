import { useEffect, useMemo, useState } from "react";
import { BarChart3, FileText, ReceiptText, RefreshCw, Settings2 } from "lucide-react";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import {
  approveReimbursement,
  createReimbursement,
  deleteReimbursement,
  getAllReimbursements,
  getPendingReimbursements,
  getReimbursementDetail,
  getReimbursementStatistics,
  getReimbursementsByEmployee,
  markReimbursementAsPaid,
  rejectReimbursement,
  updateReimbursement,
} from "@/features/reimbursement/api/reimbursement.service";
import type {
  ReimbursementCreatePayload,
  ReimbursementItem,
  ReimbursementRejectPayload,
  ReimbursementUpdatePayload,
} from "@/features/reimbursement/types/reimbursement.types";
import "@/shared/styles/CrudPage.css";

type ReimbursementFormState = {
  id: string;
  employee_id: string;
  title: string;
  description: string;
  amount: string;
  category: string;
  expense_date: string;
  receipt_path: string;
  note: string;
};

const DEFAULT_FORM: ReimbursementFormState = {
  id: "",
  employee_id: "1",
  title: "Office Supplies",
  description: "Monthly office supplies",
  amount: "1000000",
  category: "office_supplies",
  expense_date: "2026-04-09",
  receipt_path: "/receipts/office_001.pdf",
  note: "Approved",
};

const asDisplay = (value: unknown) => {
  if (value === null || value === undefined) return "-";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

const getColumns = (items: ReimbursementItem[]) => {
  if (items.length === 0) {
    return ["id", "employee_id", "title", "amount", "category", "status", "expense_date"];
  }

  const keys = Object.keys(items[0]);
  const preferred = ["id", "employee_id", "title", "amount", "category", "status", "expense_date"];
  const merged = [...preferred, ...keys.filter((key) => !preferred.includes(key))];
  return merged.filter((key, index) => merged.indexOf(key) === index);
};

const ReimbursementsManagementPage = () => {
  const [items, setItems] = useState<ReimbursementItem[]>([]);
  const [selectedDetail, setSelectedDetail] = useState<Record<string, unknown> | null>(null);
  const [statistics, setStatistics] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<ReimbursementFormState>(DEFAULT_FORM);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterEmployeeId, setFilterEmployeeId] = useState("");
  const [statsEmployeeId, setStatsEmployeeId] = useState("");
  const [responseText, setResponseText] = useState("");
  const [statusMessage, setStatusMessage] = useState("Ready to call reimbursement API");
  const [loading, setLoading] = useState(false);

  const columns = useMemo(() => getColumns(items), [items]);
  const summaryCards = useMemo(() => {
    const pendingCount = items.filter((item) => String(item.status).toLowerCase() === "pending").length;
    const approvedCount = items.filter((item) => String(item.status).toLowerCase() === "approved").length;
    const paidCount = items.filter((item) => String(item.status).toLowerCase() === "paid").length;
    const totalAmount = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

    return [
      {
        label: "Total Reimbursement",
        subtitle: "Semua data reimbursement",
        value: String(items.length),
        change: "Data aktif saat ini",
        tone: "blue" as const,
        icon: ReceiptText,
      },
      {
        label: "Pending",
        subtitle: "Menunggu approval",
        value: String(pendingCount),
        change: "Perlu tindak lanjut",
        tone: "orange" as const,
        icon: Settings2,
      },
      {
        label: "Approved + Paid",
        subtitle: "Sudah disetujui/proses akhir",
        value: String(approvedCount + paidCount),
        change: "Siap dibayarkan atau selesai",
        tone: "green" as const,
        icon: BarChart3,
      },
      {
        label: "Total Nominal",
        subtitle: "Akumulasi amount",
        value: `Rp ${totalAmount.toLocaleString("id-ID")}`,
        change: statusMessage,
        tone: "purple" as const,
        icon: FileText,
      },
    ];
  }, [items, statusMessage]);

  const formatResponse = (payload: unknown) => {
    setResponseText(typeof payload === "string" ? payload : JSON.stringify(payload, null, 2));
  };

  const requireId = () => {
    const id = form.id.trim();
    if (!id) {
      setStatusMessage("Reimbursement ID wajib diisi.");
      return null;
    }
    return id;
  };

  const loadAll = async () => {
    setLoading(true);
    setStatusMessage("Memuat reimbursements...");
    setResponseText("");

    try {
      const result = await getAllReimbursements({
        status: filterStatus.trim() || undefined,
        category: filterCategory.trim() || undefined,
        employee_id: filterEmployeeId.trim() ? Number(filterEmployeeId) : undefined,
      });
      setItems(result.items);
      formatResponse(result.raw);
      setStatusMessage("Data reimbursements berhasil dimuat.");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Gagal memuat reimbursements.";
      formatResponse(message);
      setStatusMessage("Gagal memuat reimbursements.");
    } finally {
      setLoading(false);
    }
  };

  const createItem = async () => {
    setLoading(true);
    setStatusMessage("Membuat reimbursement...");
    setResponseText("");

    try {
      const payload: ReimbursementCreatePayload = {
        employee_id: Number(form.employee_id) || 0,
        title: form.title,
        description: form.description,
        amount: Number(form.amount) || 0,
        category: form.category,
        expense_date: form.expense_date,
        receipt_path: form.receipt_path,
      };

      const result = await createReimbursement(payload);
      formatResponse(result.raw);
      setStatusMessage("Reimbursement berhasil dibuat.");
      await loadAll();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Gagal membuat reimbursement.";
      formatResponse(message);
      setStatusMessage("Gagal membuat reimbursement.");
    } finally {
      setLoading(false);
    }
  };

  const getDetail = async () => {
    const id = requireId();
    if (!id) return;

    setLoading(true);
    setStatusMessage("Memuat detail reimbursement...");
    setResponseText("");

    try {
      const result = await getReimbursementDetail(id);
      const payload =
        result.payload && typeof result.payload === "object"
          ? (result.payload as Record<string, unknown>)
          : null;
      setSelectedDetail(payload);
      formatResponse(result.raw);
      setStatusMessage("Detail reimbursement berhasil dimuat.");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Gagal memuat detail reimbursement.";
      formatResponse(message);
      setStatusMessage("Gagal memuat detail reimbursement.");
    } finally {
      setLoading(false);
    }
  };

  const updateItem = async () => {
    const id = requireId();
    if (!id) return;

    setLoading(true);
    setStatusMessage("Mengupdate reimbursement...");
    setResponseText("");

    try {
      const payload: ReimbursementUpdatePayload = {
        title: form.title || undefined,
        description: form.description || undefined,
        amount: form.amount ? Number(form.amount) : undefined,
        category: form.category || undefined,
        expense_date: form.expense_date || undefined,
        receipt_path: form.receipt_path || undefined,
      };
      const result = await updateReimbursement(id, payload);
      formatResponse(result.raw);
      setStatusMessage("Reimbursement berhasil diupdate.");
      await loadAll();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Gagal update reimbursement.";
      formatResponse(message);
      setStatusMessage("Gagal update reimbursement.");
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async () => {
    const id = requireId();
    if (!id) return;

    setLoading(true);
    setStatusMessage("Menghapus reimbursement...");
    setResponseText("");

    try {
      const result = await deleteReimbursement(id);
      formatResponse(result.raw);
      setStatusMessage("Reimbursement berhasil dihapus.");
      await loadAll();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Gagal menghapus reimbursement.";
      formatResponse(message);
      setStatusMessage("Gagal menghapus reimbursement.");
    } finally {
      setLoading(false);
    }
  };

  const approveItem = async () => {
    const id = requireId();
    if (!id) return;

    setLoading(true);
    setStatusMessage("Approve reimbursement...");
    setResponseText("");

    try {
      const result = await approveReimbursement(id, { note: form.note || "Approved" });
      formatResponse(result.raw);
      setStatusMessage("Reimbursement berhasil di-approve.");
      await loadAll();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Gagal approve reimbursement.";
      formatResponse(message);
      setStatusMessage("Gagal approve reimbursement.");
    } finally {
      setLoading(false);
    }
  };

  const rejectItem = async () => {
    const id = requireId();
    if (!id) return;

    setLoading(true);
    setStatusMessage("Reject reimbursement...");
    setResponseText("");

    try {
      if (!form.note.trim()) {
        setStatusMessage("Note wajib diisi untuk reject.");
        return;
      }
      const payload: ReimbursementRejectPayload = { note: form.note };
      const result = await rejectReimbursement(id, payload);
      formatResponse(result.raw);
      setStatusMessage("Reimbursement berhasil di-reject.");
      await loadAll();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Gagal reject reimbursement.";
      formatResponse(message);
      setStatusMessage("Gagal reject reimbursement.");
    } finally {
      setLoading(false);
    }
  };

  const markPaid = async () => {
    const id = requireId();
    if (!id) return;

    setLoading(true);
    setStatusMessage("Menandai reimbursement paid...");
    setResponseText("");

    try {
      const result = await markReimbursementAsPaid(id);
      formatResponse(result.raw);
      setStatusMessage("Reimbursement berhasil ditandai paid.");
      await loadAll();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Gagal mark reimbursement as paid.";
      formatResponse(message);
      setStatusMessage("Gagal mark reimbursement as paid.");
    } finally {
      setLoading(false);
    }
  };

  const loadPending = async () => {
    setLoading(true);
    setStatusMessage("Memuat pending reimbursements...");
    setResponseText("");

    try {
      const result = await getPendingReimbursements();
      setItems(result.items);
      formatResponse(result.raw);
      setStatusMessage("Pending reimbursements berhasil dimuat.");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Gagal memuat pending reimbursements.";
      formatResponse(message);
      setStatusMessage("Gagal memuat pending reimbursements.");
    } finally {
      setLoading(false);
    }
  };

  const loadByEmployee = async () => {
    const employeeId = (filterEmployeeId || form.employee_id).trim();
    if (!employeeId) {
      setStatusMessage("Employee ID wajib diisi untuk endpoint by employee.");
      return;
    }

    setLoading(true);
    setStatusMessage("Memuat reimbursements by employee...");
    setResponseText("");

    try {
      const result = await getReimbursementsByEmployee(employeeId);
      setItems(result.items);
      formatResponse(result.raw);
      setStatusMessage("Reimbursements by employee berhasil dimuat.");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Gagal memuat reimbursements by employee.";
      formatResponse(message);
      setStatusMessage("Gagal memuat reimbursements by employee.");
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    setLoading(true);
    setStatusMessage("Memuat reimbursement statistics...");
    setResponseText("");

    try {
      const result = await getReimbursementStatistics(statsEmployeeId.trim() || undefined);
      const payload =
        result.payload && typeof result.payload === "object"
          ? (result.payload as Record<string, unknown>)
          : null;
      setStatistics(payload);
      formatResponse(result.raw);
      setStatusMessage("Reimbursement statistics berhasil dimuat.");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Gagal memuat reimbursement statistics.";
      formatResponse(message);
      setStatusMessage("Gagal memuat reimbursement statistics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="crud-page">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-badge">Reimbursement Center</span>
          <h1>Reimbursement Management</h1>
          <p>Kelola reimbursement karyawan mulai dari filtering, approval, hingga status paid dalam satu alur yang konsisten.</p>
        </div>
        <div className="page-header-actions">
          <Button variant="outline" size="md" onClick={() => void loadAll()} disabled={loading} style={{ borderColor: "#2563eb", color: "#2563eb" }}>
            <RefreshCw size={16} />
            Segarkan
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-grid">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <Card key={card.label} className="summary-card" glass>
              <div className="summary-card__header">
                <div>
                  <span className="summary-card__label">{card.label}</span>
                  <p className="summary-card__subtitle">{card.subtitle}</p>
                </div>
                <span className={`summary-card__icon summary-card__icon--${card.tone}`}>
                  <Icon size={20} />
                </span>
              </div>
              <div className={`summary-card__value summary-card__value--${card.tone}`}>{card.value}</div>
              <div className="summary-card__change">{card.change}</div>
            </Card>
          );
        })}
      </div>


      {/* Form Card */}
      <Card className="control-card" glass>
        <div style={{ marginBottom: '0.75rem' }}>
          <h3 style={{ margin: 0, color: '#1e3a8a', fontWeight: 700, fontSize: '1rem' }}>Form Reimbursement</h3>
        </div>
        <div className="filter-panel" style={{ marginTop: 0, paddingTop: 0, borderTop: 'none' }}>
          <div className="filter-row">
            <div className="filter-group">
              <label>ID Reimbursement</label>
              <input className="form-input" value={form.id} onChange={(event) => setForm((prev) => ({ ...prev, id: event.target.value }))} placeholder="reimbursement id" />
            </div>
            <div className="filter-group">
              <label>ID Karyawan</label>
              <input className="form-input" value={form.employee_id} onChange={(event) => setForm((prev) => ({ ...prev, employee_id: event.target.value }))} />
            </div>
            <div className="filter-group">
              <label>Judul</label>
              <input className="form-input" value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} />
            </div>
            <div className="filter-group">
              <label>Jumlah</label>
              <input className="form-input" value={form.amount} onChange={(event) => setForm((prev) => ({ ...prev, amount: event.target.value }))} />
            </div>
            <div className="filter-group">
              <label>Kategori</label>
              <input className="form-input" value={form.category} onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))} />
            </div>
            <div className="filter-group">
              <label>Tanggal Pengeluaran</label>
              <input className="form-input" type="date" value={form.expense_date} onChange={(event) => setForm((prev) => ({ ...prev, expense_date: event.target.value }))} />
            </div>
          </div>
          <div className="filter-row">
            <div className="filter-group">
              <label>Deskripsi</label>
              <input className="form-input" value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} />
            </div>
            <div className="filter-group">
              <label>Path Bukti</label>
              <input className="form-input" value={form.receipt_path} onChange={(event) => setForm((prev) => ({ ...prev, receipt_path: event.target.value }))} />
            </div>
            <div className="filter-group">
              <label>Catatan Approve/Reject</label>
              <input className="form-input" value={form.note} onChange={(event) => setForm((prev) => ({ ...prev, note: event.target.value }))} />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1rem' }}>
          <Button variant="primary" size="md" onClick={() => void createItem()} disabled={loading}>
            Buat Reimbursement
          </Button>
          <Button variant="outline" size="md" onClick={() => void getDetail()} disabled={loading} style={{ borderColor: "#2563eb", color: "#2563eb" }}>
            Lihat Detail
          </Button>
          <Button variant="outline" size="md" onClick={() => void updateItem()} disabled={loading} style={{ borderColor: "#2563eb", color: "#2563eb" }}>
            Ubah Reimbursement
          </Button>
          <Button variant="outline" size="md" onClick={() => void approveItem()} disabled={loading} style={{ borderColor: '#10b981', color: '#10b981' }}>
            Approve
          </Button>
          <Button variant="outline" size="md" onClick={() => void rejectItem()} disabled={loading} style={{ borderColor: '#ef4444', color: '#ef4444' }}>
            Reject
          </Button>
          <Button variant="outline" size="md" onClick={() => void markPaid()} disabled={loading} style={{ borderColor: "#2563eb", color: "#2563eb" }}>
            Tandai Paid
          </Button>
          <Button variant="ghost" size="md" onClick={() => void deleteItem()} disabled={loading} style={{ color: '#ef4444' }}>
            Hapus Reimbursement
          </Button>
        </div>
      </Card>

      {/* Detail Panel */}
      {selectedDetail && (
        <Card className="control-card" glass>
          <h3 style={{ margin: "0 0 1rem", color: "#1e3a8a", fontWeight: 700 }}>Detail Reimbursement</h3>
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

      {/* Statistics Panel */}
      {statistics && (
        <Card className="control-card" glass>
          <h3 style={{ margin: "0 0 1rem", color: "#1e3a8a", fontWeight: 700 }}>Statistik Reimbursement</h3>
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
            {JSON.stringify(statistics, null, 2)}
          </pre>
        </Card>
      )}

      {/* Table */}
      <Card className="table-card" glass>
        <div className="table-header-bar">
          <h3>Tabel Reimbursement</h3>
          <span className="table-count">{items.length} data</span>
        </div>

        <div className="table-card-inner" style={{ paddingBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, color: '#1e3a8a', fontWeight: 600, fontSize: '0.95rem' }}>Filter Data</h3>
          </div>
          <div className="filter-panel" style={{ marginTop: 0, paddingTop: 0, borderTop: 'none', background: 'transparent' }}>
            <div className="filter-row">
              <div className="filter-group">
                <label>Status</label>
                <input className="form-input" value={filterStatus} onChange={(event) => setFilterStatus(event.target.value)} placeholder="pending, approved, paid..." />
              </div>
              <div className="filter-group">
                <label>Kategori</label>
                <input className="form-input" value={filterCategory} onChange={(event) => setFilterCategory(event.target.value)} placeholder="office_supplies..." />
              </div>
              <div className="filter-group">
                <label>ID Karyawan</label>
                <input className="form-input" value={filterEmployeeId} onChange={(event) => setFilterEmployeeId(event.target.value)} placeholder="Employee ID" />
              </div>
              <div className="filter-group">
                <label>ID Karyawan untuk Statistik</label>
                <input className="form-input" value={statsEmployeeId} onChange={(event) => setStatsEmployeeId(event.target.value)} placeholder="Employee ID" />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1rem' }}>
              <Button variant="primary" size="md" onClick={() => void loadAll()} disabled={loading}>
                Terapkan Filter
              </Button>
              <Button variant="outline" size="md" onClick={() => void loadPending()} disabled={loading} style={{ borderColor: "#2563eb", color: "#2563eb" }}>
                Ambil Pending
              </Button>
              <Button variant="outline" size="md" onClick={() => void loadByEmployee()} disabled={loading} style={{ borderColor: "#2563eb", color: "#2563eb" }}>
                Ambil per Karyawan
              </Button>
              <Button variant="outline" size="md" onClick={() => void loadStatistics()} disabled={loading} style={{ borderColor: "#2563eb", color: "#2563eb" }}>
                Ambil Statistik
              </Button>
            </div>
          </div>
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column}>
                    {column === "id" && "ID"}
                    {column === "employee_id" && "ID Karyawan"}
                    {column === "title" && "Judul"}
                    {column === "amount" && "Jumlah"}
                    {column === "category" && "Kategori"}
                    {column === "status" && "Status"}
                    {column === "expense_date" && "Tanggal"}
                    {![
                      "id",
                      "employee_id",
                      "title",
                      "amount",
                      "category",
                      "status",
                      "expense_date",
                    ].includes(column) && column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.length > 0 ? (
                items.map((item, index) => (
                  <tr key={String(item.id ?? index)}>
                    {columns.map((column) => (
                      <td key={`${String(item.id ?? index)}-${column}`}>
                        {column === 'id' ? (
                          <span className="cell-id">{asDisplay(item[column])}</span>
                        ) : column === 'status' ? (
                          <span className={`status-badge status-badge--${String(item[column] || 'draft').toLowerCase()}`}>
                            {asDisplay(item[column])}
                          </span>
                        ) : column === 'amount' ? (
                          <span className="cell-amount">Rp {Number(item[column] || 0).toLocaleString('id-ID')}</span>
                        ) : column === 'category' ? (
                          <span className="cell-tag">{asDisplay(item[column])}</span>
                        ) : (
                          asDisplay(item[column])
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="cell-empty">
                    Tidak ada data reimbursement.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Raw Response */}
      {responseText && (
        <Card className="control-card" glass>
          <h3 style={{ margin: "0 0 1rem", color: "#1e3a8a", fontWeight: 700 }}>Raw Response</h3>
          <pre style={{
            margin: 0,
            padding: "1rem",
            background: "linear-gradient(165deg, #1e3a8a 0%, #2563eb 54%, rgba(37, 99, 235, 0.8) 100%)",
            color: "white",
            borderRadius: "12px",
            border: "1px solid rgba(37, 99, 235, 0.14)",
            overflow: "auto",
            fontSize: "0.8rem",
            lineHeight: 1.48,
            maxHeight: "320px",
          }}>
            {responseText}
          </pre>
          <div style={{
            marginTop: '1rem',
            color: '#64748b',
            fontSize: '0.85rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 0.75rem',
            background: '#eff6ff',
            borderLeft: '3px solid #2563eb',
            borderRadius: '8px',
          }}>
            {statusMessage}
          </div>
        </Card>
      )}
    </div>
  );
};

export default ReimbursementsManagementPage;
