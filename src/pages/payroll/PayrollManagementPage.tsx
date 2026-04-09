import { useEffect, useMemo, useState } from "react";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import {
  approvePayroll,
  createPayroll,
  deletePayroll,
  generateMonthlyPayroll,
  getAllPayroll,
  getPayrollDetail,
  markPayrollAsPaid,
  updatePayroll,
} from "@/features/payroll/api/payroll.service";
import type { PayrollCreatePayload, PayrollItem, PayrollUpdatePayload } from "@/features/payroll/types/payroll.types";
import "../admin/AdminCrudPages.css";

type PayrollFormState = {
  id: string;
  employee_id: string;
  period: string;
  allowance: string;
  bonus: string;
};

const DEFAULT_FORM: PayrollFormState = {
  id: "",
  employee_id: "1",
  period: "2026-04",
  allowance: "2000000",
  bonus: "500000",
};

const asDisplay = (value: unknown) => {
  if (value === null || value === undefined) return "-";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

const getColumns = (items: PayrollItem[]) => {
  if (items.length === 0) {
    return ["id", "employee_id", "period", "allowance", "bonus", "status"];
  }

  const keys = Object.keys(items[0]);
  const preferred = ["id", "employee_id", "period", "allowance", "bonus", "status"];
  const merged = [...preferred, ...keys.filter((key) => !preferred.includes(key))];
  return merged.filter((key, index) => merged.indexOf(key) === index);
};

const PayrollManagementPage = () => {
  const [items, setItems] = useState<PayrollItem[]>([]);
  const [selectedDetail, setSelectedDetail] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<PayrollFormState>(DEFAULT_FORM);
  const [responseText, setResponseText] = useState("");
  const [statusMessage, setStatusMessage] = useState("Ready to call payroll management API");
  const [loading, setLoading] = useState(false);

  const columns = useMemo(() => getColumns(items), [items]);

  const formatResponse = (payload: unknown) => {
    setResponseText(typeof payload === "string" ? payload : JSON.stringify(payload, null, 2));
  };

  const requireId = () => {
    const id = form.id.trim();
    if (!id) {
      setStatusMessage("Payroll ID wajib diisi.");
      return null;
    }
    return id;
  };

  const loadPayroll = async () => {
    setLoading(true);
    setStatusMessage("Memuat payroll...");
    setResponseText("");

    try {
      const result = await getAllPayroll();
      setItems(result.items);
      formatResponse(result.raw);
      setStatusMessage("Data payroll berhasil dimuat.");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Gagal memuat payroll.";
      formatResponse(message);
      setStatusMessage("Gagal memuat payroll.");
    } finally {
      setLoading(false);
    }
  };

  const createPayrollItem = async () => {
    setLoading(true);
    setStatusMessage("Membuat payroll...");
    setResponseText("");

    try {
      const payload: PayrollCreatePayload = {
        employee_id: Number(form.employee_id) || 0,
        period: form.period,
        allowance: Number(form.allowance) || 0,
        bonus: Number(form.bonus) || 0,
      };
      const result = await createPayroll(payload);
      formatResponse(result.raw);
      setStatusMessage("Payroll berhasil dibuat.");
      await loadPayroll();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Gagal membuat payroll.";
      formatResponse(message);
      setStatusMessage("Gagal membuat payroll.");
    } finally {
      setLoading(false);
    }
  };

  const generateMonthly = async () => {
    setLoading(true);
    setStatusMessage("Generate monthly payroll...");
    setResponseText("");

    try {
      const result = await generateMonthlyPayroll({ period: form.period });
      formatResponse(result.raw);
      setStatusMessage("Generate monthly payroll berhasil.");
      await loadPayroll();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Gagal generate monthly payroll.";
      formatResponse(message);
      setStatusMessage("Gagal generate monthly payroll.");
    } finally {
      setLoading(false);
    }
  };

  const getDetail = async () => {
    const id = requireId();
    if (!id) return;

    setLoading(true);
    setStatusMessage("Memuat detail payroll...");
    setResponseText("");

    try {
      const result = await getPayrollDetail(id);
      const payload =
        result.payload && typeof result.payload === "object"
          ? (result.payload as Record<string, unknown>)
          : null;
      setSelectedDetail(payload);
      formatResponse(result.raw);
      setStatusMessage("Detail payroll berhasil dimuat.");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Gagal memuat detail payroll.";
      formatResponse(message);
      setStatusMessage("Gagal memuat detail payroll.");
    } finally {
      setLoading(false);
    }
  };

  const updateItem = async () => {
    const id = requireId();
    if (!id) return;

    setLoading(true);
    setStatusMessage("Mengupdate payroll...");
    setResponseText("");

    try {
      const payload: PayrollUpdatePayload = {
        allowance: Number(form.allowance) || 0,
        bonus: Number(form.bonus) || 0,
      };

      const result = await updatePayroll(id, payload);
      formatResponse(result.raw);
      setStatusMessage("Payroll berhasil diupdate.");
      await loadPayroll();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Gagal update payroll.";
      formatResponse(message);
      setStatusMessage("Gagal update payroll.");
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async () => {
    const id = requireId();
    if (!id) return;

    setLoading(true);
    setStatusMessage("Menghapus payroll...");
    setResponseText("");

    try {
      const result = await deletePayroll(id);
      formatResponse(result.raw);
      setStatusMessage("Payroll berhasil dihapus.");
      await loadPayroll();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Gagal menghapus payroll.";
      formatResponse(message);
      setStatusMessage("Gagal menghapus payroll.");
    } finally {
      setLoading(false);
    }
  };

  const approveItem = async () => {
    const id = requireId();
    if (!id) return;

    setLoading(true);
    setStatusMessage("Approve payroll...");
    setResponseText("");

    try {
      const result = await approvePayroll(id);
      formatResponse(result.raw);
      setStatusMessage("Payroll berhasil di-approve.");
      await loadPayroll();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Gagal approve payroll.";
      formatResponse(message);
      setStatusMessage("Gagal approve payroll.");
    } finally {
      setLoading(false);
    }
  };

  const markPaid = async () => {
    const id = requireId();
    if (!id) return;

    setLoading(true);
    setStatusMessage("Menandai payroll sebagai paid...");
    setResponseText("");

    try {
      const result = await markPayrollAsPaid(id);
      formatResponse(result.raw);
      setStatusMessage("Payroll berhasil ditandai paid.");
      await loadPayroll();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Gagal mark payroll as paid.";
      formatResponse(message);
      setStatusMessage("Gagal mark payroll as paid.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPayroll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="crud-page">
      <div className="crud-header">
        <div>
          <h1>Payroll Management</h1>
          <p>
            Endpoint: /payroll, /payroll/{"{id}"}, /payroll/generate/monthly, /payroll/{"{id}"}
            /approve, /payroll/{"{id}"}/pay
          </p>
        </div>
        <Button variant="outline" size="md" onClick={() => void loadPayroll()} disabled={loading}>
          Refresh
        </Button>
      </div>

      <Card className="crud-card" glass>
        <h2>Payroll Form</h2>
        <div className="crud-form-grid">
          <label>
            Payroll ID
            <input
              className="crud-input"
              value={form.id}
              onChange={(event) => setForm((prev) => ({ ...prev, id: event.target.value }))}
              placeholder="payroll id"
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
            Period (YYYY-MM)
            <input
              className="crud-input"
              value={form.period}
              onChange={(event) => setForm((prev) => ({ ...prev, period: event.target.value }))}
            />
          </label>
          <label>
            Allowance
            <input
              className="crud-input"
              value={form.allowance}
              onChange={(event) => setForm((prev) => ({ ...prev, allowance: event.target.value }))}
            />
          </label>
          <label>
            Bonus
            <input
              className="crud-input"
              value={form.bonus}
              onChange={(event) => setForm((prev) => ({ ...prev, bonus: event.target.value }))}
            />
          </label>
        </div>

        <div className="crud-actions">
          <Button variant="primary" size="md" onClick={() => void createPayrollItem()} disabled={loading}>
            Create Payroll
          </Button>
          <Button variant="secondary" size="md" onClick={() => void generateMonthly()} disabled={loading}>
            Generate Monthly
          </Button>
          <Button variant="outline" size="md" onClick={() => void getDetail()} disabled={loading}>
            Get Detail
          </Button>
          <Button variant="secondary" size="md" onClick={() => void updateItem()} disabled={loading}>
            Update Payroll
          </Button>
          <Button variant="secondary" size="md" onClick={() => void approveItem()} disabled={loading}>
            Approve Payroll
          </Button>
          <Button variant="secondary" size="md" onClick={() => void markPaid()} disabled={loading}>
            Mark as Paid
          </Button>
          <Button variant="ghost" size="md" onClick={() => void deleteItem()} disabled={loading}>
            Delete Payroll
          </Button>
        </div>
      </Card>

      <Card className="crud-card" glass>
        <h2>Payroll Detail</h2>
        <pre className="crud-response">
          {selectedDetail ? JSON.stringify(selectedDetail, null, 2) : "Belum ada detail payroll dipilih."}
        </pre>
      </Card>

      <Card className="crud-card" glass>
        <h2>Payroll Table</h2>
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
                  <td colSpan={columns.length}>No payroll data available.</td>
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

export default PayrollManagementPage;
