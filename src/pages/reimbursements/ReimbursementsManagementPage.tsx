import { useEffect, useMemo, useState } from "react";
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
import "../admin/AdminCrudPages.css";

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
      <div className="crud-header">
        <div>
          <h1>Reimbursement Management</h1>
          <p>Get/filter/create/detail/update/delete/approve/reject/mark-paid/pending/statistics reimbursements.</p>
        </div>
        <Button variant="outline" size="md" onClick={() => void loadAll()} disabled={loading}>
          Refresh
        </Button>
      </div>

      <Card className="crud-card" glass>
        <h2>Filters</h2>
        <div className="crud-form-grid">
          <label>
            Status
            <input className="crud-input" value={filterStatus} onChange={(event) => setFilterStatus(event.target.value)} />
          </label>
          <label>
            Category
            <input className="crud-input" value={filterCategory} onChange={(event) => setFilterCategory(event.target.value)} />
          </label>
          <label>
            Employee ID
            <input
              className="crud-input"
              value={filterEmployeeId}
              onChange={(event) => setFilterEmployeeId(event.target.value)}
            />
          </label>
          <label>
            Statistics Employee ID
            <input
              className="crud-input"
              value={statsEmployeeId}
              onChange={(event) => setStatsEmployeeId(event.target.value)}
            />
          </label>
        </div>
        <div className="crud-actions">
          <Button variant="primary" size="md" onClick={() => void loadAll()} disabled={loading}>
            Apply Filters
          </Button>
          <Button variant="secondary" size="md" onClick={() => void loadPending()} disabled={loading}>
            Get Pending
          </Button>
          <Button variant="secondary" size="md" onClick={() => void loadByEmployee()} disabled={loading}>
            Get by Employee
          </Button>
          <Button variant="secondary" size="md" onClick={() => void loadStatistics()} disabled={loading}>
            Get Statistics
          </Button>
        </div>
      </Card>

      <Card className="crud-card" glass>
        <h2>Reimbursement Form</h2>
        <div className="crud-form-grid">
          <label>
            Reimbursement ID
            <input
              className="crud-input"
              value={form.id}
              onChange={(event) => setForm((prev) => ({ ...prev, id: event.target.value }))}
              placeholder="reimbursement id"
            />
          </label>
          <label>
            Employee ID
            <input
              className="crud-input"
              value={form.employee_id}
              onChange={(event) => setForm((prev) => ({ ...prev, employee_id: event.target.value }))}
            />
          </label>
          <label>
            Title
            <input
              className="crud-input"
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
            />
          </label>
          <label>
            Amount
            <input
              className="crud-input"
              value={form.amount}
              onChange={(event) => setForm((prev) => ({ ...prev, amount: event.target.value }))}
            />
          </label>
          <label>
            Category
            <input
              className="crud-input"
              value={form.category}
              onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
            />
          </label>
          <label>
            Expense Date
            <input
              className="crud-input"
              type="date"
              value={form.expense_date}
              onChange={(event) => setForm((prev) => ({ ...prev, expense_date: event.target.value }))}
            />
          </label>
          <label className="crud-form-full">
            Description
            <input
              className="crud-input"
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
            />
          </label>
          <label className="crud-form-full">
            Receipt Path
            <input
              className="crud-input"
              value={form.receipt_path}
              onChange={(event) => setForm((prev) => ({ ...prev, receipt_path: event.target.value }))}
            />
          </label>
          <label className="crud-form-full">
            Approval/Reject Note
            <input
              className="crud-input"
              value={form.note}
              onChange={(event) => setForm((prev) => ({ ...prev, note: event.target.value }))}
            />
          </label>
        </div>

        <div className="crud-actions">
          <Button variant="primary" size="md" onClick={() => void createItem()} disabled={loading}>
            Create Reimbursement
          </Button>
          <Button variant="outline" size="md" onClick={() => void getDetail()} disabled={loading}>
            Get Detail
          </Button>
          <Button variant="secondary" size="md" onClick={() => void updateItem()} disabled={loading}>
            Update Reimbursement
          </Button>
          <Button variant="secondary" size="md" onClick={() => void approveItem()} disabled={loading}>
            Approve
          </Button>
          <Button variant="secondary" size="md" onClick={() => void rejectItem()} disabled={loading}>
            Reject
          </Button>
          <Button variant="secondary" size="md" onClick={() => void markPaid()} disabled={loading}>
            Mark Paid
          </Button>
          <Button variant="ghost" size="md" onClick={() => void deleteItem()} disabled={loading}>
            Delete Reimbursement
          </Button>
        </div>
      </Card>

      <Card className="crud-card" glass>
        <h2>Reimbursement Detail</h2>
        <pre className="crud-response">
          {selectedDetail ? JSON.stringify(selectedDetail, null, 2) : "Belum ada detail reimbursement dipilih."}
        </pre>
      </Card>

      <Card className="crud-card" glass>
        <h2>Reimbursement Statistics</h2>
        <pre className="crud-response">{statistics ? JSON.stringify(statistics, null, 2) : "Belum ada statistik."}</pre>
      </Card>

      <Card className="crud-card" glass>
        <h2>Reimbursements Table</h2>
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
                  <td colSpan={columns.length}>No reimbursement data available.</td>
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

export default ReimbursementsManagementPage;
