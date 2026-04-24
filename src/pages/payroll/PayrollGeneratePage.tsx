import { useEffect, useMemo, useState } from "react";
import { BarChart3, CalendarDays, CheckCircle2, RefreshCw, Zap, Clock, Wallet, LayoutDashboard } from "lucide-react";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { Modal } from "@/shared/ui/Modal";
import {
  generateMonthlyPayroll,
  getAllPayroll,
  toSafeArray,
} from "@/features/payroll/api/payroll.service";
import type { PayrollItem } from "@/features/payroll/types/payroll.types";
import "../admin/AdminCrudPages.css";
import "./PayrollGeneratePage.css";

const asDisplay = (value: unknown) => {
  if (value === null || value === undefined) return "-";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

const getColumns = () => {
  return [
    "id",
    "employee_id",
    "period",
    "basic_salary",
    "allowance",
    "bonus",
    "bpjs_kesehatan",
    "bpjs_ketenagakerjaan",
    "pph21",
    "total_deduction",
    "take_home_pay",
    "status"
  ];
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

  const columns = useMemo(() => getColumns(), []);
  const summaryCards = useMemo(() => {
    const paidCount = items.filter((item) => String(item.status).toLowerCase() === "paid").length;
    const pendingCount = items.filter((item) => String(item.status).toLowerCase() === "pending").length;

    return [
      {
        label: "Total Payroll",
        subtitle: "Semua data payroll",
        value: String(items.length),
        change: "Entri terdaftar",
        tone: "blue" as const,
        icon: LayoutDashboard,
      },
      {
        label: "Pending",
        subtitle: "Menunggu proses",
        value: String(pendingCount),
        change: "Perlu approval",
        tone: "orange" as const,
        icon: Clock,
      },
      {
        label: "Paid",
        subtitle: "Sudah dibayarkan",
        value: String(paidCount),
        change: "Batch selesai",
        tone: "green" as const,
        icon: Wallet,
      },
      {
        label: "Periode Aktif",
        subtitle: "Target bulan ini",
        value: period,
        change: "Fokus operasional",
        tone: "purple" as const,
        icon: CalendarDays,
      },
    ];
  }, [items, period]);

  const loadPayroll = async () => {
    setLoading(true);

    try {
      const result = await getAllPayroll();
      setItems(toSafeArray(result));
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

      <div className="page-header">
        <div className="page-header-title">
          <span className="page-badge">Payroll Operations</span>
          <h1>Generate Payroll Bulanan</h1>
          <p>Sistem otomatisasi penggajian karyawan secara massal untuk periode tertentu dengan akurasi data real-time.</p>
        </div>
        <div className="page-header-actions">
          <Button variant="outline" size="md" onClick={() => void loadPayroll()} disabled={loading}>
            <RefreshCw className={loading ? "animate-spin" : ""} size={16} />
            Sync Data
          </Button>
        </div>
      </div>

      {message && message.type === "success" && (
        <Card className="crud-card payroll-generate-message" glass>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <CheckCircle2 color="#0ea5e9" size={20} />
            <p>{message.text}</p>
          </div>
        </Card>
      )}

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

      <div className="white-unified-wrapper">
        <div className="wuw-header">
          <div className="wuw-header-top">
            <div className="wuw-title-area">
              <h3>Generate Payroll</h3>
              <span className="wuw-count-badge">{items.length} Total</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', alignItems: 'start' }}>
          <Card className="crud-card" glass>
            <h2>Konfigurasi Batch</h2>
            <div className="crud-form-grid" style={{ gridTemplateColumns: '1fr' }}>
              <label>
                <strong>Periode Pembayaran (YYYY-MM)</strong>
                <input
                  className="crud-input"
                  value={period}
                  onChange={(event) => setPeriod(event.target.value)}
                  placeholder="Contoh: 2026-04"
                />
              </label>
            </div>

            <div className="crud-actions" style={{ marginTop: '2rem' }}>
              <Button variant="primary" size="lg" onClick={() => void generateMonthly()} disabled={loading} style={{ width: '100%', borderRadius: '12px', height: '52px', fontWeight: '700' }}>
                {loading ? "Processing..." : "Generate Payroll Sekarang"}
              </Button>
            </div>
            <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#94a3b8', textAlign: 'center' }}>
              Tindakan ini akan mengalkulasi tunjangan, bonus, dan potongan untuk semua karyawan aktif.
            </p>
          </Card>

          <Card className="crud-card" glass>
            <h2>Daftar Payroll Terbaru</h2>
            <div className="crud-table-wrap" style={{ border: 'none', boxShadow: 'none' }}>
              <table className="crud-table">
                <thead>
                  <tr>
                    {columns.map((column) => (
                      <th key={column}>
                        {column === "id" && "ID"}
                        {column === "employee_id" && "Karyawan"}
                        {column === "period" && "Periode"}
                        {column === "basic_salary" && "Gaji Pokok"}
                        {column === "allowance" && "Tunjangan"}
                        {column === "bonus" && "Bonus"}
                        {column === "bpjs_kesehatan" && "BPJS Kes"}
                        {column === "bpjs_ketenagakerjaan" && "BPJS TK"}
                        {column === "pph21" && "PPH21"}
                        {column === "total_deduction" && "Potongan"}
                        {column === "take_home_pay" && "THP"}
                        {column === "status" && "Status"}
                        {!["id", "employee_id", "period", "basic_salary", "allowance", "bonus", "bpjs_kesehatan", "bpjs_ketenagakerjaan", "pph21", "total_deduction", "take_home_pay", "status"].includes(column) && column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.length > 0 ? (
                    items.slice(0, 10).map((item, index) => (
                      <tr key={String(item.id ?? index)}>
                        {columns.map((column) => {
                          const record = item as unknown as Record<string, unknown>;

                          return (
                            <td key={`${String(item.id ?? index)}-${column}`}>
                              {column === 'id' ? (
                                <span className="cell-id">#{asDisplay(record[column])}</span>

                              ) : column === 'employee_id' ? (
                                <div style={{ fontWeight: '600', whiteSpace: 'nowrap' }}>
                                  {record.employee && typeof record.employee === 'object' && (record.employee as any).user ? (record.employee as any).user.name : `EMP-${String(record[column]).padStart(3, '0')}`}
                                </div>

                              ) : column === 'period' ? (
                                <div style={{ whiteSpace: 'nowrap' }}>
                                  {record[column]
                                    ? new Date(String(record[column]) + '-01').toLocaleDateString('id-ID', {
                                        month: 'short',
                                        year: 'numeric',
                                      })
                                    : '-'}
                                </div>

                              ) : ['basic_salary', 'allowance', 'bonus', 'bpjs_kesehatan', 'bpjs_ketenagakerjaan', 'pph21', 'total_deduction', 'take_home_pay'].includes(column) ? (
                                <span style={{ 
                                  color: column === 'take_home_pay' ? '#6366f1' : column === 'total_deduction' || column.startsWith('bpjs') || column === 'pph21' ? '#f43f5e' : 'inherit', 
                                  fontWeight: column === 'take_home_pay' ? '700' : '500',
                                  whiteSpace: 'nowrap'
                                }}>
                                  {`Rp ${Number(record[column] || 0).toLocaleString('id-ID')}`}
                                </span>

                              ) : column === 'status' ? (
                                <span className={`status-badge status-badge--${String(record[column]).toLowerCase()}`}>
                                  <div className="status-dot" style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }} />
                                  {asDisplay(record[column])}
                                </span>

                              ) : (
                                asDisplay(record[column])
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={columns.length} className="payroll-generate-empty-row">Tidak ada data payroll yang ditemukan.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {items.length > 10 && (
              <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#64748b', textAlign: 'right' }}>
                Menampilkan 10 data terbaru dari total {items.length} records.
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PayrollGeneratePage;
