import { useEffect, useMemo, useState } from "react";
import { BarChart3, CalendarDays, CheckCircle2, RefreshCw, Zap, Clock, Wallet, LayoutDashboard, FileText, CheckCircle, XCircle } from "lucide-react";
import { Card } from "@/shared/ui/Card";
import { Modal } from "@/shared/ui/Modal";
import {
  generateMonthlyPayroll,
  getAllPayroll,
  toSafeArray,
} from "@/features/payroll/api/payroll.service";
import type { PayrollItem } from "@/features/payroll/types/payroll.types";
import "@/shared/styles/CrudPage.css";
import "@/pages/dashboard/overview/OverviewPage.css";
import "@/pages/payroll/PayrollShared.css";

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

      {/* Header - Same style as Dashboard */}
      <Card className="hero-card">
        <div className="hero-card-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <Zap size={16} />
              <span>Operasi Penggajian</span>
            </div>
            <h1 className="hero-title">Generate Payroll Bulanan</h1>
            <p className="hero-subtitle">
              Sistem otomatisasi penggajian karyawan secara massal untuk periode tertentu dengan akurasi data real-time.
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn-outline" onClick={() => void loadPayroll()} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Sync Data
            </button>
          </div>
        </div>
      </Card>

      {message && message.type === "success" && (
        <Card className="crud-card payroll-generate-message">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <CheckCircle2 color="#0ea5e9" size={20} />
            <p>{message.text}</p>
          </div>
        </Card>
      )}

      {/* Summary Cards - New style */}
      <div className="leave-requests-wrapper">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="leave-summary-card">
              <div className="leave-summary-header">
                <div>
                  <p className="leave-summary-label">{card.label}</p>
                  <p className="leave-summary-subtitle">{card.subtitle}</p>
                </div>
                <div className={`leave-summary-icon-wrapper ${card.tone === 'blue' ? 'leave-icon-blue' : card.tone === 'green' ? 'leave-icon-green' : card.tone === 'orange' ? 'leave-icon-orange' : 'leave-icon-purple'}`}>
                  <Icon size={28} />
                </div>
              </div>
              <div className={`leave-summary-value ${card.tone === 'blue' ? 'leave-value-blue' : card.tone === 'green' ? 'leave-value-green' : card.tone === 'orange' ? 'leave-value-orange' : 'leave-value-purple'}`}>{card.value}</div>
              <p className="leave-summary-trend">{card.change}</p>
            </div>
          );
        })}
      </div>

      {/* Analytics Title Card */}
      <Card className="analytics-title-card">
        <div className="analytics-title-inner">
          <div className="analytics-icon">
            <Zap size={24} />
          </div>
          <div>
            <h2 className="analytics-title">Generate Payroll</h2>
            <p className="analytics-subtitle">{items.length} Total</p>
          </div>
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', alignItems: 'start' }}>
        <Card className="crud-table-card">
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: '700', color: '#1e293b' }}>Konfigurasi Batch</h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <strong style={{ fontSize: '0.85rem', color: '#64748b' }}>Periode Pembayaran (YYYY-MM)</strong>
              <input
                style={{ padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.95rem', fontFamily: "'Poppins', sans-serif" }}
                value={period}
                onChange={(event) => setPeriod(event.target.value)}
                placeholder="Contoh: 2026-04"
              />
            </label>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <button 
              onClick={() => void generateMonthly()} 
              disabled={loading}
              style={{ width: '100%', padding: '0.875rem 1.5rem', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#fff', fontSize: '0.95rem', fontWeight: '700', fontFamily: "'Poppins', sans-serif", cursor: 'pointer' }}
            >
              {loading ? "Processing..." : "Generate Payroll Sekarang"}
            </button>
          </div>
          <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#94a3b8', textAlign: 'center' }}>
            Tindakan ini akan mengalkulasi tunjangan, bonus, dan potongan untuk semua karyawan aktif.
          </p>
        </Card>

        <Card className="crud-table-card">
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: '700', color: '#1e293b' }}>Daftar Payroll Terbaru</h3>
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
                        {!["id", "employee_id", "period", "basic_salary", "allowance", "bonus", "bpjs_kesehatan", "bpjs_ketenagakerjaan", "pph21", "total_deduction", "take_home_pay", "status"].includes(column) ? column : null}
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
                                    ? new Date(String(record[column]) + "-01").toLocaleDateString('id-ID', {
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
  );
};

export default PayrollGeneratePage;
