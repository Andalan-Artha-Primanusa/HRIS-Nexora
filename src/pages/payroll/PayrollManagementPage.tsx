import { useEffect, useMemo, useState } from "react";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { Modal } from "@/shared/ui/Modal";
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
  const [loading, setLoading] = useState(false);
  const [errorModal, setErrorModal] = useState<{ isOpen: boolean; title: string; message: string }>({
    isOpen: false,
    title: "",
    message: "",
  });

  const showErrorModal = (title: string, message: string) => {
    setErrorModal({ isOpen: true, title, message });
  };

  const columns = useMemo(() => getColumns(items), [items]);

  const requireId = () => {
    const id = form.id.trim();
    if (!id) {
      return null;
    }
    return id;
  };

  const loadPayroll = async () => {
    setLoading(true);

    try {
      const result = await getAllPayroll();
      setItems(result);
    } catch (error: unknown) {
      const errorText = error instanceof Error ? error.message : "Gagal muat payroll";
      showErrorModal("❌ Error Load Data", errorText);
    } finally {
      setLoading(false);
    }
  };

  const createPayrollItem = async () => {
    setLoading(true);

    try {
      const payload: PayrollCreatePayload = {
        employee_id: Number(form.employee_id) || 0,
        period: form.period,
        allowance: Number(form.allowance) || 0,
        bonus: Number(form.bonus) || 0,
      };
      await createPayroll(payload);
      await loadPayroll();
    } catch (error: unknown) {
      const errorText = error instanceof Error ? error.message : "Gagal buat payroll";
      showErrorModal("❌ Error Buat Payroll", errorText);
    } finally {
      setLoading(false);
    }
  };

  const generateMonthly = async () => {
    setLoading(true);

    try {
      await generateMonthlyPayroll({ period: form.period });
      await loadPayroll();
    } catch (error: unknown) {
      const errorText = error instanceof Error ? error.message : "Gagal generate payroll";
      showErrorModal("❌ Error Generate", errorText);
    } finally {
      setLoading(false);
    }
  };

  const getDetail = async () => {
    const id = requireId();
    if (!id) {
      showErrorModal("Validasi", "Masukkan Payroll ID terlebih dahulu");
      return;
    }

    setLoading(true);

    try {
      const result = await getPayrollDetail(id);
      setSelectedDetail(result as unknown as Record<string, unknown>);
    } catch (error: unknown) {
      const errorText = error instanceof Error ? error.message : "Gagal muat detail";
      showErrorModal("❌ Error Muat Detail", errorText);
    } finally {
      setLoading(false);
    }
  };

  const updateItem = async () => {
    const id = requireId();
    if (!id) {
      showErrorModal("Validasi", "Masukkan Payroll ID terlebih dahulu");
      return;
    }

    setLoading(true);

    try {
      const payload: PayrollUpdatePayload = {
        allowance: Number(form.allowance) || 0,
        bonus: Number(form.bonus) || 0,
      };

      await updatePayroll(id, payload);
      await loadPayroll();
    } catch (error: unknown) {
      const errorText = error instanceof Error ? error.message : "Gagal update payroll";
      showErrorModal("❌ Error Update", errorText);
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async () => {
    const id = requireId();
    if (!id) {
      showErrorModal("Validasi", "Masukkan Payroll ID terlebih dahulu");
      return;
    }

    setLoading(true);

    try {
      await deletePayroll(id);
      await loadPayroll();
    } catch (error: unknown) {
      const errorText = error instanceof Error ? error.message : "Gagal hapus payroll";
      showErrorModal("❌ Error Hapus", errorText);
    } finally {
      setLoading(false);
    }
  };

  const approveItem = async () => {
    const id = requireId();
    if (!id) {
      showErrorModal("Validasi", "Masukkan Payroll ID terlebih dahulu");
      return;
    }

    setLoading(true);

    try {
      await approvePayroll(id);
      await loadPayroll();
    } catch (error: unknown) {
      const errorText = error instanceof Error ? error.message : "Gagal approve payroll";
      showErrorModal("❌ Error Approve", errorText);
    } finally {
      setLoading(false);
    }
  };

  const markPaid = async () => {
    const id = requireId();
    if (!id) {
      showErrorModal("Validasi", "Masukkan Payroll ID terlebih dahulu");
      return;
    }

    setLoading(true);

    try {
      await markPayrollAsPaid(id);
      await loadPayroll();
    } catch (error: unknown) {
      const errorText = error instanceof Error ? error.message : "Gagal mark as paid";
      showErrorModal("❌ Error Mark Paid", errorText);
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
                      <td key={`${String(item.id ?? index)}-${column}`}>{asDisplay((item as unknown as Record<string, unknown>)[column])}</td>
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

      {/* Error Modal */}
      <Modal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ ...errorModal, isOpen: false })}
        title={errorModal.title}
        size="md"
      >
        <div style={{ padding: "16px 0", whiteSpace: "pre-wrap" }}>
          <p style={{ margin: 0, lineHeight: "1.6", color: "#374151" }}>
            {errorModal.message}
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default PayrollManagementPage;
