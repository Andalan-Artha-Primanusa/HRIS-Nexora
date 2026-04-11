import { useEffect, useMemo, useState } from "react";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { Modal } from "@/shared/ui/Modal";
import {
  generateMonthlyPayroll,
  getAllPayroll,
} from "@/features/payroll/api/payroll.service";
import type { PayrollItem } from "@/features/payroll/types/payroll.types";
import "../admin/AdminCrudPages.css";

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

const PayrollGeneratePage = () => {
  const [items, setItems] = useState<PayrollItem[]>([]);
  const [period, setPeriod] = useState("2026-04");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [errorModal, setErrorModal] = useState<{ isOpen: boolean; title: string; message: string }>({
    isOpen: false,
    title: "",
    message: "",
  });

  const showErrorModal = (title: string, message: string) => {
    setErrorModal({ isOpen: true, title, message });
  };

  const columns = useMemo(() => getColumns(items), [items]);

  const loadPayroll = async () => {
    setLoading(true);

    try {
      const result = await getAllPayroll();
      setItems(result);
    } catch (error: unknown) {
      const errorText = error instanceof Error ? error.message : "Gagal memuat payroll";
      showErrorModal("❌ Error Load Data", errorText);
    } finally {
      setLoading(false);
    }
  };

  const generateMonthly = async () => {
    if (!period.trim()) {
      showErrorModal("Validasi", "Pilih periode terlebih dahulu");
      return;
    }

    setLoading(true);

    try {
      await generateMonthlyPayroll({ period });
      setMessage({ type: "success", text: `✓ Payroll berhasil di-generate untuk periode ${period}` });
      await loadPayroll();
    } catch (error: unknown) {
      const errorText = error instanceof Error ? error.message : "Gagal generate payroll";
      showErrorModal("❌ Error Generate", errorText);
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
          <p style={{ margin: 0, lineHeight: "1.6", color: "#374151" }}>
            {errorModal.message}
          </p>
        </div>
      </Modal>

      <div className="crud-header">
        <div>
          <h1>Generate Payroll Bulanan</h1>
          <p>Buat payroll otomatis untuk semua karyawan dalam satu periode</p>
        </div>
        <Button variant="outline" size="md" onClick={() => void loadPayroll()} disabled={loading}>
          Refresh
        </Button>
      </div>

      {/* Success Message - Inline Banner */}
      {message && message.type === "success" && (
        <Card
          className="crud-card"
          glass
          style={{
            backgroundColor: "#dbeafe",
            borderLeft: "4px solid #0284c7",
          }}
        >
          <p style={{ color: "#0c4a6e", margin: 0 }}>
            {message.text}
          </p>
        </Card>
      )}

      <Card className="crud-card" glass>
        <h2>Generate Payroll Bulanan</h2>
        <div className="crud-form-grid">
          <label>
            Periode (YYYY-MM)
            <input
              className="crud-input"
              value={period}
              onChange={(event) => setPeriod(event.target.value)}
              placeholder="Contoh: 2026-04"
            />
          </label>
        </div>

        <div className="crud-actions">
          <Button variant="primary" size="md" onClick={() => void generateMonthly()} disabled={loading}>
            Generate Payroll
          </Button>
        </div>
      </Card>

      <Card className="crud-card" glass>
        <h2>Daftar Payroll</h2>
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
    </div>
  );
};

export default PayrollGeneratePage;
