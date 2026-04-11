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
      // Extract numeric ID if prefixed (e.g., "P003" -> "3")
      const payrollId = String(id).replace(/^[A-Z]+/, "").replace(/^0+/, "") || id;
      const result = await getPayrollDetail(payrollId);
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

      // Extract numeric ID if prefixed (e.g., "P003" -> "3")
      const payrollId = String(id).replace(/^[A-Z]+/, "").replace(/^0+/, "") || id;
      await updatePayroll(payrollId, payload);
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
      // Extract numeric ID if prefixed (e.g., "P003" -> "3")
      const payrollId = String(id).replace(/^[A-Z]+/, "").replace(/^0+/, "") || id;
      await deletePayroll(payrollId);
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
      // Extract numeric ID if prefixed (e.g., "P003" -> "3")
      const payrollId = String(id).replace(/^[A-Z]+/, "").replace(/^0+/, "") || id;
      await approvePayroll(payrollId);
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
      // Extract numeric ID if prefixed (e.g., "P003" -> "3")
      const payrollId = String(id).replace(/^[A-Z]+/, "").replace(/^0+/, "") || id;
      await markPayrollAsPaid(payrollId);
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
      {/* Error Modal */}
      <Modal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ ...errorModal, isOpen: false })}
        title={errorModal.title}
        size="md"
      >
        <div style={{ padding: "16px 0", whiteSpace: "pre-wrap" }}>
          <p style={{ margin: 0, lineHeight: "1.6", color: "var(--color-text-primary)" }}>
            {errorModal.message}
          </p>
        </div>
      </Modal>

      <div className="crud-header" style={{ borderBottom: "2px solid #2563eb", paddingBottom: "20px" }}>
        <div>
          <h1 style={{ color: "#2563eb", marginBottom: "4px" }}>⚙️ Kelola Payroll</h1>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9rem" }}>Buat, edit, setujui, dan kelola pembayaran gaji karyawan</p>
        </div>
        <Button 
          variant="outline" 
          size="md" 
          onClick={() => void loadPayroll()} 
          disabled={loading}
          style={{ borderColor: "#2563eb", color: "#2563eb" }}
        >
          🔄 Segarkan Data
        </Button>
      </div>

      <Card className="crud-card" glass style={{ borderTop: "4px solid #2563eb" }}>
        <h2 style={{ color: "#2563eb", marginTop: 0 }}>📝 Form Payroll</h2>
        <div className="crud-form-grid">
          <label>
            <strong style={{ color: "#2563eb" }}>ID Payroll</strong>
            <input
              className="crud-input"
              value={form.id}
              onChange={(event) => setForm((prev) => ({ ...prev, id: event.target.value }))}
              placeholder="Opsional - otomatis jika kosongan"
            />
          </label>
          <label>
            <strong style={{ color: "#2563eb" }}>ID Karyawan</strong>
            <input
              className="crud-input"
              value={form.employee_id}
              onChange={(event) => setForm((prev) => ({ ...prev, employee_id: event.target.value }))}
            />
          </label>
          <label>
            <strong style={{ color: "#2563eb" }}>Periode (YYYY-MM)</strong>
            <input
              className="crud-input"
              value={form.period}
              onChange={(event) => setForm((prev) => ({ ...prev, period: event.target.value }))}
            />
          </label>
          <label>
            <strong style={{ color: "#2563eb" }}>Tunjangan</strong>
            <input
              className="crud-input"
              value={form.allowance}
              onChange={(event) => setForm((prev) => ({ ...prev, allowance: event.target.value }))}
            />
          </label>
          <label>
            <strong style={{ color: "#2563eb" }}>Bonus</strong>
            <input
              className="crud-input"
              value={form.bonus}
              onChange={(event) => setForm((prev) => ({ ...prev, bonus: event.target.value }))}
            />
          </label>
        </div>

        <div className="crud-actions">
          <Button 
            variant="primary" 
            size="md" 
            onClick={() => void createPayrollItem()} 
            disabled={loading}
            style={{ backgroundColor: "#2563eb" }}
          >
            ➕ Buat Payroll
          </Button>
          <Button 
            variant="secondary" 
            size="md" 
            onClick={() => void generateMonthly()} 
            disabled={loading}
            style={{ backgroundColor: "#0ea5e9" }}
          >
            🔄 Buat Bulanan
          </Button>
          <Button 
            variant="outline" 
            size="md" 
            onClick={() => void getDetail()} 
            disabled={loading}
            style={{ borderColor: "#2563eb", color: "#2563eb" }}
          >
            👁️ Lihat Detail
          </Button>
          <Button 
            variant="secondary" 
            size="md" 
            onClick={() => void updateItem()} 
            disabled={loading}
            style={{ backgroundColor: "#0ea5e9" }}
          >
            ✏️ Perbarui
          </Button>
          <Button 
            variant="secondary" 
            size="md" 
            onClick={() => void approveItem()} 
            disabled={loading}
            style={{ backgroundColor: "#10b981" }}
          >
            ✅ Setujui
          </Button>
          <Button 
            variant="secondary" 
            size="md" 
            onClick={() => void markPaid()} 
            disabled={loading}
            style={{ backgroundColor: "#10b981" }}
          >
            💳 Tandai Dibayar
          </Button>
          <Button 
            variant="ghost" 
            size="md" 
            onClick={() => void deleteItem()} 
            disabled={loading}
            style={{ color: "#ef4444" }}
          >
            🗑️ Hapus
          </Button>
        </div>
      </Card>

      <Card className="crud-card" glass style={{ borderTop: "4px solid #2563eb" }}>
        <h2 style={{ color: "#2563eb", marginTop: 0 }}>📋 Detail Payroll</h2>
        <pre className="crud-response">
          {selectedDetail ? JSON.stringify(selectedDetail, null, 2) : "Belum ada detail payroll dipilih."}
        </pre>
      </Card>

      <Card className="crud-card" glass style={{ borderTop: "4px solid #2563eb" }}>
        <h2 style={{ color: "#2563eb", marginTop: 0 }}>📊 Daftar Payroll</h2>
        <div className="crud-table-wrap">
          <table className="crud-table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#eff6ff" }}>
                {columns.map((column) => (
                  <th 
                    key={column}
                    style={{ 
                      padding: "12px", 
                      backgroundColor: "#dbeafe",
                      color: "#2563eb",
                      fontWeight: "600",
                      textAlign: "left",
                      borderBottom: "2px solid #2563eb"
                    }}
                  >
                    {column === "id" && "ID"}
                    {column === "employee_id" && "ID Karyawan"}
                    {column === "period" && "Periode"}
                    {column === "allowance" && "Tunjangan"}
                    {column === "bonus" && "Bonus"}
                    {column === "status" && "Status"}
                    {!["id", "employee_id", "period", "allowance", "bonus", "status"].includes(column) && column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.length > 0 ? (
                items.map((item, index) => (
                  <tr 
                    key={String(item.id ?? index)}
                    style={{ borderBottom: "1px solid #eff6ff" }}
                  >
                    {columns.map((column) => (
                      <td 
                        key={`${String(item.id ?? index)}-${column}`}
                        style={{ padding: "12px", color: "#1f2937" }}
                      >
                        {asDisplay((item as unknown as Record<string, unknown>)[column])}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} style={{ padding: "16px", textAlign: "center", color: "#999" }}>
                    Tidak ada data payroll tersedia.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default PayrollManagementPage;
