import { useEffect, useMemo, useState } from "react";
import { BarChart3, CalendarDays, CheckCircle2, RefreshCw, Zap, Clock, Wallet, LayoutDashboard, FileText } from "lucide-react";
import { Card } from "@/shared/ui/Card";
import { Modal } from "@/shared/ui/Modal";
import { PayrollStatusBadge } from "@/shared/ui/PayrollStatusBadge";
import {
  generateMonthlyPayroll,
  getAllPayroll,
  toSafeArray,
} from "@/features/payroll/api/payroll.service";
import type { PayrollItem } from "@/features/payroll/types/payroll.types";
import "@/shared/styles/CrudPage.css";
import "@/pages/dashboard/overview/OverviewPage.css";
import "./PayrollListPage.css";

const formatCurrency = (value: unknown): string => {
  const num = typeof value === 'string' ? parseFloat(value) : Number(value);
  if (isNaN(num)) return "Rp 0";
  return `Rp ${num.toLocaleString('id-ID')}`;
};

const PayrollGeneratePage = () => {
  const [items, setItems] = useState<PayrollItem[]>([]);
  const [period, setPeriod] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
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

  const columns = useMemo(() => [
    { key: "id", label: "ID" },
    { key: "employee_id", label: "Karyawan" },
      { key: "period", label: "Period" },
    { key: "basic_salary", label: "Gaji Pokok" },
    { key: "allowance", label: "Tunjangan" },
    { key: "bonus", label: "Bonus" },
    { key: "total_deduction", label: "Potongan" },
    { key: "take_home_pay", label: "Gaji Bersih" },
    { key: "status", label: "Status" },
  ], []);

  const summaryCards = useMemo(() => {
    const paidCount = items.filter((item) => String(item.status).toLowerCase() === "paid").length;
    const pendingCount = items.filter((item) => ["pending", "draft"].includes(String(item.status).toLowerCase())).length;
    const totalPayroll = items.reduce((sum, item) => sum + (Number(item.take_home_pay) || 0), 0);

    return [
      {
        label: "Total Payroll",
        subtitle: "Semua data payroll",
        value: String(items.length),
        change: `${formatCurrency(totalPayroll)} total`,
        tone: "blue" as const,
        icon: LayoutDashboard,
      },
      {
        label: "Draft/Pending",
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
      const normalized = toSafeArray(result);
      setItems(normalized);
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
  }, []);

  const renderCell = (item: any, columnKey: string) => {
    const value = item[columnKey];
    
    switch (columnKey) {
      case "id":
        return <span className="cell-id">#{value}</span>;
      
      case "employee_id":
        return (
          <div style={{ fontWeight: '600', whiteSpace: 'nowrap' }}>
            {item.employee?.user?.name || `EMP-${String(value).padStart(3, '0')}`}
          </div>
        );
      
      case "period":
        return (
          <span className="crud-table-tag">{value || '-'}</span>
        );
      
      case "basic_salary":
      case "allowance":
      case "bonus":
      case "total_deduction":
      case "take_home_pay":
        return (
          <span style={{ 
            color: columnKey === 'take_home_pay' ? '#6366f1' : columnKey === 'total_deduction' ? '#f43f5e' : 'inherit',
            fontWeight: columnKey === 'take_home_pay' ? '700' : '500',
            whiteSpace: 'nowrap'
          }}>
            {formatCurrency(value)}
          </span>
        );
      
      case "status":
        return <PayrollStatusBadge status={value} size="sm" />;
      
      default:
        return <span>{String(value ?? '-')}</span>;
    }
  };

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

      {/* Header */}
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

      {/* Summary Cards */}
      <div className="payroll-summary-wrapper">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="payroll-summary-card">
              <div className="payroll-summary-header">
                <div>
                  <p className="payroll-summary-label">{card.label}</p>
                  <p className="payroll-summary-subtitle">{card.subtitle}</p>
                </div>
                <div className={`payroll-summary-icon-wrapper payroll-icon-${card.tone}`}>
                  <Icon size={28} />
                </div>
              </div>
              <div className={`payroll-summary-value payroll-value-${card.tone}`}>{card.value}</div>
              <p className="payroll-summary-trend">{card.change}</p>
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
            <p className="analytics-subtitle">{items.length} Total Records</p>
          </div>
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Configuration Card */}
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

        {/* Payroll List Card */}
        <Card className="crud-table-card">
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: '700', color: '#1e293b' }}>Daftar Payroll Terbaru</h3>
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Memuat data...</div>
          ) : items.length > 0 ? (
            <>
              <div className="crud-table-wrap" style={{ border: 'none', boxShadow: 'none', overflowX: 'auto' }}>
                <table className="crud-table">
                  <thead>
                    <tr>
                      {columns.map((col) => (
                        <th key={col.key}>{col.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {items.slice(0, 10).map((item, index) => (
                      <tr key={String(item.id ?? index)}>
                        {columns.map((col) => (
                          <td key={`${String(item.id ?? index)}-${col.key}`}>
                            {renderCell(item, col.key)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {items.length > 10 && (
                <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#64748b', textAlign: 'right' }}>
                  Menampilkan 10 data terbaru dari total {items.length} records.
                </p>
              )}
            </>
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
              Tidak ada data payroll yang ditemukan.
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default PayrollGeneratePage;
