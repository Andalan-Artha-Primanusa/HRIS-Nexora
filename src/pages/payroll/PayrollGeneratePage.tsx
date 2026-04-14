import { useEffect, useMemo, useState } from "react";
import { BarChart3, CalendarDays, CheckCircle2, RefreshCw } from "lucide-react";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { Modal } from "@/shared/ui/Modal";
import {
  generateMonthlyPayroll,
  getAllPayroll,
} from "@/features/payroll/api/payroll.service";
import type { PayrollItem } from "@/features/payroll/types/payroll.types";
import "../admin/AdminCrudPages.css";
import "./PayrollGeneratePage.css";

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
  const summaryCards = useMemo(() => {
    const paidCount = items.filter((item) => String(item.status).toLowerCase() === "paid").length;
    const pendingCount = items.filter((item) => String(item.status).toLowerCase() === "pending").length;

    return [
      {
        label: "Total Payroll",
        subtitle: "Semua data payroll tersedia",
        value: String(items.length),
        change: "Data payroll saat ini",
        tone: "blue" as const,
        icon: BarChart3,
      },
      {
        label: "Pending",
        subtitle: "Belum selesai diproses",
        value: String(pendingCount),
        change: "Butuh tindak lanjut",
        tone: "orange" as const,
        icon: RefreshCw,
      },
      {
        label: "Paid",
        subtitle: "Payroll sudah dibayar",
        value: String(paidCount),
        change: "Status selesai",
        tone: "green" as const,
        icon: CheckCircle2,
      },
      {
        label: "Periode Aktif",
        subtitle: "Periode generate saat ini",
        value: period,
        change: "Target batch bulanan",
        tone: "purple" as const,
        icon: CalendarDays,
      },
    ];
  }, [items, period]);

  const loadPayroll = async () => {
    setLoading(true);

    try {
      const result = await getAllPayroll();
      setItems(result);
    } catch (error: unknown) {
      const errorText = error instanceof Error ? error.message : "Gagal memuat payroll";
      showErrorModal("Error Muat Data", errorText);
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
      setMessage({ type: "success", text: `Payroll berhasil di-generate untuk periode ${period}` });
      await loadPayroll();
    } catch (error: unknown) {
      const errorText = error instanceof Error ? error.message : "Gagal generate payroll";
      showErrorModal("Error Generate", errorText);
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
        <div className="payroll-generate-modal-content">
          <p>{errorModal.message}</p>
        </div>
      </Modal>

      <Card className="payroll-generate-hero" glass>
        <div className="crud-header payroll-generate-header">
          <div className="crud-header-copy">
            <p className="crud-page-badge">Payroll Center</p>
            <div className="crud-header-title-row">
              <span className="crud-header-icon"><CalendarDays size={18} /></span>
              <h1>Generate Payroll Bulanan</h1>
            </div>
            <p>Buat payroll otomatis untuk semua karyawan dalam satu periode.</p>
          </div>
          <Button variant="outline" size="md" onClick={() => void loadPayroll()} disabled={loading}>
            Refresh
          </Button>
        </div>
      </Card>

      <div className="payroll-generate-summary-grid">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <Card key={card.label} className="payroll-generate-summary-card" glass>
              <div className="payroll-generate-summary-header">
                <div>
                  <span className="payroll-generate-summary-label">{card.label}</span>
                  <p className="payroll-generate-summary-subtitle">{card.subtitle}</p>
                </div>
                <span className={`payroll-generate-summary-icon payroll-generate-summary-icon--${card.tone}`}>
                  <Icon size={18} />
                </span>
              </div>
              <div className="payroll-generate-summary-value">{card.value}</div>
              <div className="payroll-generate-summary-change">{card.change}</div>
            </Card>
          );
        })}
      </div>

      {/* Success Message - Inline Banner */}
      {message && message.type === "success" && (
        <Card className="crud-card payroll-generate-message" glass>
          <p>{message.text}</p>
        </Card>
      )}

      <Card className="crud-card payroll-generate-card" glass>
        <h2>Generate Payroll Bulanan</h2>
        <div className="crud-form-grid">
          <label>
            <strong>Periode (YYYY-MM)</strong>
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

      <Card className="crud-card payroll-generate-card" glass>
        <h2>Daftar Payroll</h2>
        <div className="crud-table-wrap">
          <table className="crud-table payroll-generate-table">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column}>
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
                  <tr key={String(item.id ?? index)}>
                    {columns.map((column) => {
                      const record = item as unknown as Record<string, unknown>;
                      return <td key={`${String(item.id ?? index)}-${column}`}>{asDisplay(record[column])}</td>;
                    })}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="payroll-generate-empty-row">Belum ada data payroll.</td>
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
