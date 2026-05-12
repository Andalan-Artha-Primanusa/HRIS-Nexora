import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart3, CalendarDays, CheckCircle2, RefreshCw, Zap, Clock, Wallet, LayoutDashboard, ChevronLeft, ChevronRight, AlertCircle, X, ShieldCheck, CreditCard, Eye, FileCheck, DollarSign, FileText, Search } from "lucide-react";
import { Card } from "@/shared/ui/Card";
import { Modal } from "@/shared/ui/Modal";

import { Button } from "@/shared/ui/Button";
import { PayrollStatusBadge } from "@/shared/ui/PayrollStatusBadge";
import { payrollService, toSafeArray } from "@/features/payroll/api/payroll.service";
import { getAllEmployees } from "@/features/employee/api/employee.service";
import type { PayrollItem } from "@/features/payroll/types/payroll.types";
import type { EmployeeItem } from "@/features/employee/types/employee.types";
import "@/shared/styles/CrudPage.css";
import "@/pages/dashboard/overview/OverviewPage.css";
import "./PayrollListPage.css";
import "./PayrollApprovePage.css";
import "./PayrollProcessPage.css";

const formatCurrency = (v: unknown) => {
  const num = typeof v === "string" ? parseFloat(v) : Number(v);
  if (isNaN(num)) return "Rp 0";
  return `Rp ${num.toLocaleString("id-ID")}`;
};

const MONTHS = [
  { value: "01", label: "Januari" }, { value: "02", label: "Februari" },
  { value: "03", label: "Maret" }, { value: "04", label: "April" },
  { value: "05", label: "Mei" }, { value: "06", label: "Juni" },
  { value: "07", label: "Juli" }, { value: "08", label: "Agustus" },
  { value: "09", label: "September" }, { value: "10", label: "Oktober" },
  { value: "11", label: "November" }, { value: "12", label: "Desember" },
];
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i);

const TABS = [
  { key: "generate", label: "Generate Payroll", icon: Zap },
  { key: "approve", label: "Persetujuan", icon: ShieldCheck },
  { key: "payment", label: "Pembayaran", icon: CreditCard },
];

type TabKey = "generate" | "approve" | "payment";

const PayrollProcessPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>("generate");

  return (
    <div className="crud-page" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <Card className="hero-card">
        <div className="hero-card-inner">
          <div className="hero-content">
            <div className="hero-badge"><Zap size={16} /><span>Operasi Penggajian</span></div>
            <h1 className="hero-title">Proses Payroll</h1>
            <p className="hero-subtitle">Generate, setujui, dan tandai pembayaran payroll dalam satu tampilan terpadu.</p>
          </div>
        </div>
      </Card>

      <div className="payroll-tabs">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as TabKey)}
              className={`payroll-tab ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "generate" && <GenerateTab />}
      {activeTab === "approve" && <ApproveTab />}
      {activeTab === "payment" && <PaymentTab />}
    </div>
  );
};

/* ═══════════════════════════════ GENERATE TAB ═══════════════════════════ */
const GenerateTab = () => {
  const now = new Date();
  const [items, setItems] = useState<PayrollItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [errorModal, setErrorModal] = useState({ isOpen: false, title: "", message: "" });
  const [selectedYear, setSelectedYear] = useState(String(now.getFullYear()));
  const [selectedMonth, setSelectedMonth] = useState(String(now.getMonth() + 1).padStart(2, "0"));
  const [paymentFilter, setPaymentFilter] = useState<"all" | "paid" | "unpaid">("all");
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const period = `${selectedYear}-${selectedMonth}`;

  const showErrorModal = (title: string, msg: string) => setErrorModal({ isOpen: true, title, message: msg });
  const loadPayroll = async () => {
    setLoading(true);
    try { setItems(toSafeArray(await payrollService.getPayrollList())); }
    catch (err) { showErrorModal("Error", err instanceof Error ? err.message : "Gagal memuat"); }
    finally { setLoading(false); }
  };
  const generateMonthly = async () => {
    if (!period.trim()) { showErrorModal("Validasi", "Pilih periode"); return; }
    setLoading(true);
    try {
      await payrollService.generatePayroll({ period });
      setMessage({ type: "success", text: `Payroll berhasil di-generate untuk ${period}` });
      await loadPayroll();
    } catch (err) { showErrorModal("Error Generate", err instanceof Error ? err.message : "Gagal"); }
    finally { setLoading(false); }
  };
  useEffect(() => { void loadPayroll(); }, []);

  const summaryCards = useMemo(() => {
    const paid = items.filter(i => String(i.status).toLowerCase() === "paid").length;
    const pending = items.filter(i => ["pending", "draft"].includes(String(i.status).toLowerCase())).length;
    const total = items.reduce((s, i) => s + (Number(i.take_home_pay) || 0), 0);
    return [
      { label: "Total Payroll", subtitle: "Semua data", value: String(items.length), change: `${formatCurrency(total)} total`, tone: "blue", icon: LayoutDashboard },
      { label: "Draft / Pending", subtitle: "Menunggu proses", value: String(pending), change: "Perlu approval", tone: "orange", icon: Clock },
      { label: "Sudah Dibayar", subtitle: "Batch selesai", value: String(paid), change: "Pembayaran selesai", tone: "green", icon: Wallet },
      { label: "Periode Aktif", subtitle: "Target", value: period, change: "Fokus operasional", tone: "purple", icon: CalendarDays },
    ];
  }, [items, period]);

  const filtered = useMemo(() => items.filter(it => {
    const s = String(it.status).toLowerCase();
    return (paymentFilter === "all" ? true : paymentFilter === "paid" ? s === "paid" : s !== "paid") &&
      (yearFilter === "all" || String(it.period ?? "").startsWith(yearFilter));
  }), [items, paymentFilter, yearFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const columns = [
    { key: "id", label: "ID" }, { key: "employee_id", label: "Karyawan" }, { key: "period", label: "Periode" },
    { key: "basic_salary", label: "Gaji Pokok" }, { key: "allowance", label: "Tunjangan" },
    { key: "bonus", label: "Bonus" }, { key: "total_deduction", label: "Potongan" },
    { key: "take_home_pay", label: "Gaji Bersih" }, { key: "status", label: "Status" },
  ];

  return (
    <>
      <Modal isOpen={errorModal.isOpen} onClose={() => setErrorModal({ ...errorModal, isOpen: false })} title={errorModal.title} size="md">
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "4px 0" }}>
          <AlertCircle size={20} color="#f43f5e" style={{ flexShrink: 0, marginTop: 2 }} />
          <p style={{ fontSize: "14px", color: "#475569", lineHeight: 1.6 }}>{errorModal.message}</p>
        </div>
      </Modal>

      {message?.type === "success" && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12, marginBottom: "1rem" }}>
          <CheckCircle2 size={18} color="#22c55e" />
          <span style={{ fontSize: "13px", color: "#15803d", fontWeight: 500, flex: 1 }}>{message.text}</span>
          <button onClick={() => setMessage(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#86efac" }}><X size={16} /></button>
        </div>
      )}

      <div className="payroll-summary-grid">
        {summaryCards.map((c) => {
          const Icon = c.icon;
          const colors: Record<string, string> = { blue: "#3b82f6", orange: "#f97316", green: "#22c55e", purple: "#8b5cf6" };
          return (
            <div key={c.label} className="payroll-summary-card" style={{ borderTopColor: colors[c.tone] }}>
              <p className="label">{c.label}</p>
              <p className="subtitle">{c.subtitle}</p>
              <div className="value-row">
                <div className="value" style={{ color: colors[c.tone] }}>{c.value}</div>
                <div className="icon-box" style={{ background: `rgba(${c.tone === "blue" ? "59,130,246" : c.tone === "orange" ? "249,115,22" : c.tone === "green" ? "34,197,94" : "139,92,246"},0.08)`, color: colors[c.tone] }}>
                  <Icon size={22} />
                </div>
              </div>
              <p className="change-text">{c.change}</p>
            </div>
          );
        })}
      </div>

      <div className="payroll-config-grid">
        <Card className="payroll-table-card">
          <p className="payroll-section-title">
            <Zap size={15} color="#6366f1" /> Konfigurasi Batch
          </p>
          <label style={{ display: "block", marginBottom: "1rem" }}>
            <span style={{ fontSize: "0.7rem", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6, display: "block" }}>Tahun</span>
            <select style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13, fontFamily: "'Poppins', sans-serif", color: "#1e293b" }} value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
              {YEARS.map((y) => <option key={y} value={String(y)}>{y}</option>)}
            </select>
          </label>
          <label style={{ display: "block", marginBottom: "1rem" }}>
            <span style={{ fontSize: "0.7rem", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6, display: "block" }}>Bulan</span>
            <select style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13, fontFamily: "'Poppins', sans-serif", color: "#1e293b" }} value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
              {MONTHS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </label>
          <span style={{ fontSize: "0.7rem", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>Periode terpilih</span>
          <div style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #e0e7ff", background: "#eef2ff", fontSize: 15, fontWeight: 800, color: "#6366f1", textAlign: "center", marginBottom: "1rem" }}>{period}</div>
          <hr style={{ border: "none", borderTop: "1px solid #f1f5f9", margin: "1.25rem 0" }} />
          <div style={{ display: "flex", gap: 10, background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 10, padding: 12, marginBottom: "1.25rem" }}>
            <AlertCircle size={15} color="#0369a1" style={{ flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 12, color: "#0369a1", lineHeight: 1.6, margin: 0 }}>Kalkulasi tunjangan, bonus, dan potongan untuk <strong>semua karyawan aktif</strong> di periode {period}.</p>
          </div>
          <button onClick={() => void generateMonthly()} disabled={loading}
            style={{ width: "100%", padding: 12, borderRadius: 12, border: "none", background: "linear-gradient(135deg, #2563eb, #1d4ed8)", color: "#fff", fontSize: 14, fontWeight: 700, fontFamily: "'Poppins', sans-serif", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            {loading ? <RefreshCw size={15} className="animate-spin" /> : <Zap size={15} />}
            {loading ? "Memproses..." : "Generate Payroll Sekarang"}
          </button>
        </Card>

        <Card className="crud-table-card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: "1rem", flexWrap: "wrap" }}>
            <p style={{ fontSize: "1.25rem", fontWeight: 700, color: "#1e293b", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
              <BarChart3 size={15} color="#6366f1" /> Daftar Payroll <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 400, marginLeft: 4 }}>({filtered.length} records)</span>
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <select style={{ padding: "5px 10px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 12, color: "#64748b", fontFamily: "'Poppins', sans-serif" }} value={yearFilter} onChange={(e) => { setYearFilter(e.target.value); setCurrentPage(1); }}>
                <option value="all">Semua Tahun</option>
                {YEARS.map(y => <option key={y} value={String(y)}>{y}</option>)}
              </select>
              {(["all", "paid", "unpaid"] as const).map(f => (
                <button key={f} onClick={() => { setPaymentFilter(f); setCurrentPage(1); }}
                  style={{ padding: "5px 14px", borderRadius: 16, border: paymentFilter === f ? "1.5px solid #6366f1" : "1.5px solid #e2e8f0", background: paymentFilter === f ? "#eef2ff" : "#fff", color: paymentFilter === f ? "#6366f1" : "#94a3b8", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'Poppins', sans-serif" }}>
                  {f === "all" ? "Semua" : f === "paid" ? "Dibayar" : "Tertunda"}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div style={{ padding: "3rem 1rem", textAlign: "center", color: "#cbd5e1", fontSize: 13 }}>
              <RefreshCw size={20} className="animate-spin" style={{ display: "block", margin: "0 auto 8px", color: "#6366f1" }} />
              Memuat data...
            </div>
          ) : paginated.length === 0 ? (
            <div style={{ padding: "3rem 1rem", textAlign: "center", color: "#cbd5e1", fontSize: 13 }}>Tidak ada data payroll.</div>
          ) : (
            <div style={{ border: "1px solid #e2e8f0", borderRadius: 12, overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 720 }}>
                <thead>
                  <tr>
                    {columns.map(col => (
                      <th key={col.key} style={{ padding: "10px 12px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1px solid #e2e8f0", background: "#f8fafc" }}>{col.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((item, idx) => {
                    const emp = (item as any).employee as Record<string, any> | undefined;
                    return (
                      <tr key={String(item.id ?? idx)} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        {columns.map(col => {
                          const val = (item as any)[col.key];
                          if (col.key === "id") return <td key={col.key} style={{ padding: "11px 12px", verticalAlign: "middle" }}><span style={{ fontSize: 12, color: "#cbd5e1" }}>#{String(val ?? "").padStart(3, "0")}</span></td>;
                          if (col.key === "employee_id") return <td key={col.key} style={{ padding: "11px 12px", verticalAlign: "middle" }}><span style={{ fontWeight: 600, fontSize: 13, color: "#1e293b", whiteSpace: "nowrap" }}>{emp?.user?.name ?? `EMP-${String(val).padStart(3, "0")}`}</span></td>;
                          if (col.key === "period") return <td key={col.key} style={{ padding: "11px 12px", verticalAlign: "middle" }}><span style={{ display: "inline-block", padding: "3px 9px", borderRadius: 6, background: "#f1f5f9", border: "1px solid #e2e8f0", fontSize: 11, color: "#64748b", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>{String(val ?? "-")}</span></td>;
                          if (["basic_salary", "allowance", "bonus", "total_deduction", "take_home_pay"].includes(col.key)) {
                            const c = col.key === "take_home_pay" ? "#6366f1" : col.key === "total_deduction" ? "#f43f5e" : "#334155";
                            return <td key={col.key} style={{ padding: "11px 12px", verticalAlign: "middle" }}><span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, whiteSpace: "nowrap", color: c, fontWeight: col.key === "take_home_pay" ? 700 : 500 }}>{formatCurrency(val)}</span></td>;
                          }
                          if (col.key === "status") return <td key={col.key} style={{ padding: "11px 12px", verticalAlign: "middle" }}><PayrollStatusBadge status={String(val) as any} size="sm" /></td>;
                          return <td key={col.key} style={{ padding: "11px 12px", verticalAlign: "middle" }}><span>{String(val ?? "-")}</span></td>;
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {filtered.length > 0 && (
            <div className="table-pagination">
              <div className="pagination-info">
                Menampilkan <strong>{paginated.length}</strong> dari <strong>{filtered.length}</strong> data
              </div>
              <div className="pagination-controls">
                <button className="pagination-btn" onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>‹</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button key={page} className={`pagination-btn ${currentPage === page ? 'active' : ''}`} onClick={() => setCurrentPage(page)}>{page}</button>
                ))}
                <button className="pagination-btn" onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}>›</button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </>
  );
};

/* ═══════════════════════════════ APPROVE TAB ═══════════════════════════ */
const ApproveTab = () => {
  const [payrolls, setPayrolls] = useState<PayrollItem[]>([]);
  const [employees, setEmployees] = useState<EmployeeItem[]>([]);
  const [currentPagePending, setCurrentPagePending] = useState(1);
  const pageSizePending = 10;
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [selectedPayroll, setSelectedPayroll] = useState<PayrollItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [errorModal, setErrorModal] = useState<{ isOpen: boolean; title: string; message: string }>({ isOpen: false, title: "", message: "" });

  const showErrorModal = (title: string, msg: string) => setErrorModal({ isOpen: true, title, message: msg });
  const loadData = async () => {
    setLoading(true);
    try {
      const [payrollData, employeeData] = await Promise.all([payrollService.getPayrollList(), getAllEmployees()]);
      setPayrolls(toSafeArray(payrollData));
      setEmployees(toSafeArray(employeeData));
    } catch (err) {
      showErrorModal("Error", err instanceof Error ? err.message : "Gagal memuat");
    } finally { setLoading(false); }
  };
  useEffect(() => { void loadData(); }, []);

  const getEmpName = (empId: string | number) => {
    const emp = employees.find((e) => e.id === empId || String(e.id) === String(empId));
    return emp ? `${emp.employee_code} - ${emp.user?.name || "Unknown"}` : "Unknown";
  };

  const handleApprove = async () => {
    if (!selectedPayroll) { showErrorModal("Validasi", "Pilih payroll terlebih dahulu"); return; }
    if (selectedPayroll.status === "approved" || selectedPayroll.status === "paid") {
      showErrorModal("Sudah Disetujui", `Status: ${selectedPayroll.status}`); return;
    }
    if (selectedPayroll.status === "rejected") { showErrorModal("Ditolak", "Hubungi admin untuk reset"); return; }
    setLoading(true);
    try {
      await payrollService.approvePayroll(String(selectedPayroll.id));
      setMessage({ type: "success", text: `Payroll ID ${selectedPayroll.id} berhasil disetujui` });
      setSelectedPayroll(null);
      await loadData();
    } catch (err) { showErrorModal("Error", err instanceof Error ? err.message : "Gagal approve"); }
    finally { setLoading(false); }
  };

  const handleReject = async () => {
    if (!selectedPayroll) { showErrorModal("Validasi", "Pilih payroll"); return; }
    setLoading(true);
    try {
      const reason = prompt("Alasan penolakan:", "Data tidak valid");
      if (!reason) { setLoading(false); return; }
      await payrollService.rejectPayroll(String(selectedPayroll.id), reason);
      setMessage({ type: "success", text: `Payroll ID ${selectedPayroll.id} ditolak` });
      setSelectedPayroll(null);
      await loadData();
    } catch (err) { showErrorModal("Error", err instanceof Error ? err.message : "Gagal"); }
    finally { setLoading(false); }
  };

  const safePayrolls = Array.isArray(payrolls) ? payrolls : [];
  const filteredPayrolls = safePayrolls.filter(p => {
    if (paymentFilter === 'all') return true;
    if (paymentFilter === 'paid') return String(p.status).toLowerCase() === 'paid';
    return String(p.status).toLowerCase() !== 'paid';
  });
  const pendingPayrolls = filteredPayrolls.filter(p => p.status === "draft" || p.status === "pending");
  const otherPayrolls = filteredPayrolls.filter(p => p.status === "approved" || p.status === "paid");
  const paginatedPending = pendingPayrolls.slice((currentPagePending - 1) * pageSizePending, currentPagePending * pageSizePending);
  const totalPagesPending = Math.max(1, Math.ceil(pendingPayrolls.length / pageSizePending));

  const summaryCards = [
    { label: "Pending Review", subtitle: "Menunggu approval", value: String(pendingPayrolls.length), change: "Prioritas hari ini", tone: "orange" as const, icon: Clock },
    { label: "Approved", subtitle: "Sudah disetujui", value: String(otherPayrolls.filter(p => p.status === "approved").length), change: "Final approval", tone: "green" as const, icon: CheckCircle2 },
    { label: "Paid", subtitle: "Sudah dibayar", value: String(otherPayrolls.filter(p => p.status === "paid").length), change: "Selesai", tone: "purple" as const, icon: CreditCard },
  ];

  return (
    <>
      <Modal isOpen={errorModal.isOpen} onClose={() => setErrorModal({ ...errorModal, isOpen: false })} title={errorModal.title} size="md">
        <div style={{ padding: "16px 0", whiteSpace: "pre-wrap" }}><p style={{ margin: 0, lineHeight: 1.6, color: "#1e293b" }}>{errorModal.message}</p></div>
      </Modal>

      {message && message.type === "success" && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12, marginBottom: "1rem" }}>
          <CheckCircle2 size={18} color="#22c55e" />
          <span style={{ fontSize: "13px", color: "#15803d", fontWeight: 500, flex: 1 }}>{message.text}</span>
          <button onClick={() => setMessage(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#86efac" }}><X size={16} /></button>
        </div>
      )}

      <div className="payroll-summary-wrapper">
        {summaryCards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="payroll-summary-card">
              <div className="payroll-summary-header">
                <div><p className="payroll-summary-label">{c.label}</p></div>
                <div className={`payroll-summary-icon-wrapper payroll-icon-${c.tone}`}><Icon size={28} /></div>
              </div>
              <div className={`payroll-summary-value payroll-value-${c.tone}`}>{c.value}</div>
            </div>
          );
        })}
      </div>

      <Card className="data-table-card">
        <div className="data-table-header">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <h3 className="data-table-title">Menunggu Persetujuan <span className="data-table-count">{pendingPayrolls.length} payroll</span></h3>
            <select value={paymentFilter} onChange={(e) => { setPaymentFilter(e.target.value as any); setCurrentPagePending(1); }} className="sort-select">
              <option value="all">Semua Status</option>
              <option value="unpaid">Belum Dibayar</option>
              <option value="paid">Sudah Dibayar</option>
            </select>
          </div>
        </div>
        <div className="table-wrap">
          <table className="crud-table">
            <thead>
              <tr>
                <th>Karyawan</th><th>Periode</th><th className="text-right">Gaji Pokok</th>
                <th className="text-right">Gaji Bersih</th><th className="text-center">Status</th><th className="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginatedPending.map((p) => (
                <tr key={p.id} className={selectedPayroll?.id === p.id ? "is-selected" : ""}>
                  <td className="crud-table-name">
                    <div className="crud-table-avatar">{getEmpName(p.employee_id).charAt(0)}</div>
                    <span>{getEmpName(p.employee_id)}</span>
                  </td>
                  <td><span className="crud-table-tag">{p.period}</span></td>
                  <td className="crud-table-amount">Rp {Number(p.basic_salary || 0).toLocaleString("id-ID")}</td>
                  <td className="crud-table-amount crud-table-amount-green">Rp {Number(p.take_home_pay || p.net_salary || 0).toLocaleString("id-ID")}</td>
                  <td><PayrollStatusBadge status={p.status || 'pending'} size="sm" /></td>
                  <td className="text-center">
                    <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                      <button onClick={() => setSelectedPayroll(p)} className="action-btn action-btn-edit" title="Lihat"><Eye size={14} /></button>
                      <button onClick={() => setSelectedPayroll(p)} className="action-btn action-btn-success" title="Approve"><FileCheck size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {pendingPayrolls.length > pageSizePending && (
          <div className="table-pagination">
            <div className="pagination-info">
              Menampilkan <strong>{paginatedPending.length}</strong> dari <strong>{pendingPayrolls.length}</strong> data
            </div>
            <div className="pagination-controls">
              <button className="pagination-btn" onClick={() => setCurrentPagePending(Math.max(1, currentPagePending - 1))} disabled={currentPagePending === 1}>‹</button>
              {Array.from({ length: totalPagesPending }, (_, i) => i + 1).map((page) => (
                <button key={page} className={`pagination-btn ${currentPagePending === page ? 'active' : ''}`} onClick={() => setCurrentPagePending(page)}>{page}</button>
              ))}
              <button className="pagination-btn" onClick={() => setCurrentPagePending(Math.min(totalPagesPending, currentPagePending + 1))} disabled={currentPagePending === totalPagesPending}>›</button>
            </div>
          </div>
        )}
      </Card>

      {otherPayrolls.length > 0 && (
        <>
          <Card className="analytics-title-card" style={{ marginTop: "1.5rem" }}>
            <div className="analytics-title-inner">
              <div className="analytics-icon"><CheckCircle2 size={24} /></div>
              <div><h2 className="analytics-title">Telah Disetujui</h2><p className="analytics-subtitle">{otherPayrolls.length} payroll</p></div>
            </div>
          </Card>
          <Card className="crud-table-card">
            <div className="crud-table-wrap">
              <table className="crud-table">
                <thead>
                  <tr>
                    <th>Karyawan</th><th>Periode</th><th className="text-right">Gaji Bersih</th><th className="text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {otherPayrolls.map((p) => (
                    <tr key={p.id}>
                      <td className="crud-table-name"><div className="crud-table-avatar">{getEmpName(p.employee_id).charAt(0)}</div><span>{getEmpName(p.employee_id)}</span></td>
                      <td><span className="crud-table-tag">{p.period}</span></td>
                      <td className="crud-table-amount crud-table-amount-green">Rp {Number(p.take_home_pay || p.net_salary || 0).toLocaleString("id-ID")}</td>
                      <td><PayrollStatusBadge status={p.status || 'approved'} size="sm" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      <Modal isOpen={!!selectedPayroll} onClose={() => setSelectedPayroll(null)} title={`Konfirmasi Payroll ID ${selectedPayroll?.id}`} size="lg">
        {selectedPayroll && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
              <div>
                <p style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: 4 }}>Karyawan</p>
                <p style={{ fontWeight: 600, color: "#1e293b", margin: "0 0 1rem" }}>{getEmpName(selectedPayroll.employee_id)}</p>
                <p style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: 4 }}>Periode</p>
                <p style={{ fontWeight: 600, color: "#1e293b", margin: "0 0 1rem" }}>{selectedPayroll.period}</p>
                <p style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: 4 }}>Status</p>
                <p style={{ margin: "0 0 1rem" }}><PayrollStatusBadge status={selectedPayroll.status} size="sm" /></p>
              </div>
              <div>
                <p style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: 4 }}>Gaji Pokok</p>
                <p style={{ fontWeight: 600, color: "#10b981", margin: "0 0 1rem" }}>Rp {Number(selectedPayroll.basic_salary || 0).toLocaleString("id-ID")}</p>
                <p style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: 4 }}>Gaji Bersih</p>
                <p style={{ fontSize: "1.25rem", fontWeight: 700, color: "#10b981", margin: 0 }}>Rp {Number(selectedPayroll.take_home_pay || selectedPayroll.net_salary || 0).toLocaleString("id-ID")}</p>
              </div>
            </div>
            <div style={{ marginTop: "2rem", display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <Button variant="outline" size="md" onClick={() => setSelectedPayroll(null)} disabled={loading}>Batal</Button>
              <Button variant="danger" size="md" onClick={() => void handleReject()} disabled={loading}>Tolak</Button>
              <Button variant="success" size="md" onClick={() => void handleApprove()} disabled={loading || (selectedPayroll.status !== "draft" && selectedPayroll.status !== "pending")}>Setujui Payroll</Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

/* ═══════════════════════════════ PAYMENT TAB ═══════════════════════════ */
const PaymentTab = () => {
  const [payrollId, setPayrollId] = useState("");
  const [selectedPayroll, setSelectedPayroll] = useState<PayrollItem | null>(null);
  const [employees, setEmployees] = useState<EmployeeItem[]>([]);
  const [allPayrolls, setAllPayrolls] = useState<PayrollItem[]>([]);
  const [currentPageRecent, setCurrentPageRecent] = useState(1);
  const pageSizeRecent = 10;
  const [searchTerm, setSearchTerm] = useState("");
  const [periodFilter, setPeriodFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [errorModal, setErrorModal] = useState<{ isOpen: boolean; title: string; message: string }>({ isOpen: false, title: "", message: "" });

  const showErrorModal = (title: string, msg: string) => setErrorModal({ isOpen: true, title, message: msg });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [emps, pays] = await Promise.all([getAllEmployees(), payrollService.getPayrollList()]);
        setEmployees(toSafeArray(emps));
        setAllPayrolls(toSafeArray(pays));
      } catch (err) { console.error(err); }
    };
    void loadData();
  }, []);

  const handleMarkAsPaid = async () => {
    if (!selectedPayroll) { showErrorModal("Validasi", "Pilih payroll"); return; }
    if (selectedPayroll.status === "paid") { showErrorModal("Sudah Dibayar", "Payroll ini sudah dibayar."); return; }
    setLoading(true);
    try {
      const updated = await payrollService.processPayment(String(selectedPayroll.id));
      setSelectedPayroll(updated);
      setMessage({ type: "success", text: "Payroll berhasil ditandai sebagai dibayar" });
      setAllPayrolls(toSafeArray(await payrollService.getPayrollList()));
    } catch (err) { showErrorModal("Error", err instanceof Error ? err.message : "Gagal"); }
    finally { setLoading(false); }
  };

  const safePayrolls = Array.isArray(allPayrolls) ? allPayrolls : [];
  const safeEmployees = Array.isArray(employees) ? employees : [];
  const getEmpName = (empId: string | number) => {
    const e = safeEmployees.find(entry => entry.id === empId || String(entry.id) === String(empId));
    return e ? `${e.employee_code} - ${e.user?.name || "Unknown"}` : "Unknown";
  };

  const filteredPayrolls = safePayrolls.filter(p => {
    if (paymentFilter === 'paid' && String(p.status).toLowerCase() !== 'paid') return false;
    if (paymentFilter === 'unpaid' && String(p.status).toLowerCase() === 'paid') return false;
    if (periodFilter !== 'all' && String(p.period) !== periodFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const emp = safeEmployees.find(e => String(e.id) === String(p.employee_id) || e.employee_code === String(p.employee_id));
      const name = emp?.user?.name || emp?.employee_code || "";
      if (!String(p.id).toLowerCase().includes(q) && !String(p.period || "").toLowerCase().includes(q) && !name.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const totalPagesRecent = Math.max(1, Math.ceil(filteredPayrolls.length / pageSizeRecent));
  const recentPayrolls = filteredPayrolls.slice((currentPageRecent - 1) * pageSizeRecent, currentPageRecent * pageSizeRecent);

  const summaryCards = [
    { label: "All Payroll", subtitle: "Total", value: String(safePayrolls.length), tone: "blue" as const, icon: FileText },
    { label: "Ready to Pay", subtitle: "Belum paid", value: String(safePayrolls.filter(i => i.status !== "paid").length), tone: "orange" as const, icon: ShieldCheck },
    { label: "Paid", subtitle: "Sudah dibayar", value: String(safePayrolls.filter(i => i.status === "paid").length), tone: "purple" as const, icon: CreditCard },
  ];

  return (
    <>
      <Modal isOpen={errorModal.isOpen} onClose={() => setErrorModal({ ...errorModal, isOpen: false })} title={errorModal.title} size="md">
        <div style={{ padding: "16px 0", whiteSpace: "pre-wrap" }}><p style={{ color: "#475569", lineHeight: 1.6 }}>{errorModal.message}</p></div>
      </Modal>

      {message && message.type === "success" && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12, marginBottom: "1rem" }}>
          <CheckCircle2 size={18} color="#22c55e" /><span style={{ fontSize: 13, color: "#15803d", fontWeight: 500, flex: 1 }}>{message.text}</span>
          <button onClick={() => setMessage(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#86efac" }}><X size={16} /></button>
        </div>
      )}

      <div className="payroll-summary-wrapper">
        {summaryCards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="payroll-summary-card">
              <div className="payroll-summary-header">
                <div><p className="payroll-summary-label">{c.label}</p></div>
                <div className={`payroll-summary-icon-wrapper payroll-icon-${c.tone}`}><Icon size={28} /></div>
              </div>
              <div className={`payroll-summary-value payroll-value-${c.tone}`}>{c.value}</div>
            </div>
          );
        })}
      </div>

      <Card className="crud-table-card">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <p style={{ fontWeight: 600, color: "#1e293b", margin: 0, fontSize: "0.9rem" }}>Payroll</p>
            <input placeholder="Cari ID, karyawan, atau periode" style={{ minWidth: 220, padding: "8px 12px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13, fontFamily: "'Poppins', sans-serif" }} value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPageRecent(1); }} />
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <select value={paymentFilter} onChange={(e) => { setPaymentFilter(e.target.value as any); setCurrentPageRecent(1); }} className="sort-select">
              <option value="all">Semua Status</option><option value="unpaid">Belum Dibayar</option><option value="paid">Sudah Dibayar</option>
            </select>
            <select value={periodFilter} onChange={(e) => { setPeriodFilter(e.target.value); setCurrentPageRecent(1); }} className="sort-select">
              <option value="all">Semua Periode</option>
              {Array.from(new Set(safePayrolls.map(p => p.period).filter(Boolean))).map(prd => <option key={String(prd)} value={String(prd)}>{String(prd)}</option>)}
            </select>
          </div>
        </div>

        <div className="crud-table-wrap">
          <table className="crud-table" style={{ width: "100%", fontSize: "0.9rem" }}>
            <thead>
              <tr>
                <th>ID</th><th>Karyawan</th><th>Periode</th><th className="numeric">Gaji Pokok</th>
                <th className="numeric">Take Home Pay</th><th>Status</th><th style={{ textAlign: "right" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {recentPayrolls.length > 0 ? recentPayrolls.map((payroll) => (
                <tr key={payroll.id} className={selectedPayroll?.id === payroll.id ? "is-selected-row" : ""}>
                  <td>{payroll.id}</td>
                  <td title={getEmpName(payroll.employee_id)}>{getEmpName(payroll.employee_id)}</td>
                  <td>{payroll.period}</td>
                  <td className="numeric">Rp {Number(payroll.basic_salary || 0).toLocaleString("id-ID")}</td>
                  <td className="numeric">Rp {Number(payroll.take_home_pay || payroll.net_salary || 0).toLocaleString("id-ID")}</td>
                  <td><PayrollStatusBadge status={payroll.status || 'pending'} size="sm" /></td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                      <Button variant="outline" size="sm" onClick={() => { setPayrollId(String(payroll.id)); setSelectedPayroll(payroll); }}>Lihat</Button>
                      {String(payroll.status).toLowerCase() !== 'paid' && (
                        <Button variant="primary" size="sm" onClick={() => { setPayrollId(String(payroll.id)); setSelectedPayroll(payroll); }}>Tandai Dibayar</Button>
                      )}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={7} style={{ textAlign: "center", padding: "2rem", color: "#94a3b8" }}>Tidak ada payroll untuk kriteria ini.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {filteredPayrolls.length > pageSizeRecent && (
          <div className="table-pagination">
            <div className="pagination-info">
              Menampilkan <strong>{recentPayrolls.length}</strong> dari <strong>{filteredPayrolls.length}</strong> data
            </div>
            <div className="pagination-controls">
              <button className="pagination-btn" onClick={() => setCurrentPageRecent(Math.max(1, currentPageRecent - 1))} disabled={currentPageRecent === 1}>‹</button>
              {Array.from({ length: totalPagesRecent }, (_, i) => i + 1).map((page) => (
                <button key={page} className={`pagination-btn ${currentPageRecent === page ? 'active' : ''}`} onClick={() => setCurrentPageRecent(page)}>{page}</button>
              ))}
              <button className="pagination-btn" onClick={() => setCurrentPageRecent(Math.min(totalPagesRecent, currentPageRecent + 1))} disabled={currentPageRecent === totalPagesRecent}>›</button>
            </div>
          </div>
        )}
      </Card>

      <Modal isOpen={!!selectedPayroll} onClose={() => setSelectedPayroll(null)} title={`Konfirmasi Pembayaran ID ${selectedPayroll?.id}`} size="lg">
        {selectedPayroll && (
          <div>
            <div className="payroll-payment-status-wrap" style={{ marginBottom: "1.5rem" }}>
              <PayrollStatusBadge status={selectedPayroll.status || 'pending'} size="lg" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
              <div>
                <p style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: 4 }}>Payroll ID</p>
                <p style={{ fontWeight: 600, color: "#1e293b", margin: "0 0 1rem" }}>{selectedPayroll.id}</p>
                <p style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: 4 }}>Karyawan</p>
                <p style={{ fontWeight: 600, color: "#1e293b", margin: "0 0 1rem" }}>{getEmpName(selectedPayroll.employee_id)}</p>
                <p style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: 4 }}>Periode</p>
                <p style={{ fontWeight: 600, color: "#1e293b", margin: "0 0 1rem" }}>{selectedPayroll.period}</p>
              </div>
              <div>
                <p style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: 4 }}>Gaji Pokok</p>
                <p style={{ fontWeight: 600, color: "#10b981", margin: "0 0 1rem" }}>Rp {Number(selectedPayroll.basic_salary || 0).toLocaleString("id-ID")}</p>
                <p style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: 4 }}>Tunjangan</p>
                <p style={{ fontWeight: 600, color: "#10b981", margin: "0 0 1rem" }}>Rp {Number(selectedPayroll.allowance || 0).toLocaleString("id-ID")}</p>
                <p style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: 4 }}>Bonus</p>
                <p style={{ fontWeight: 600, color: "#10b981", margin: "0 0 1rem" }}>Rp {Number(selectedPayroll.bonus || 0).toLocaleString("id-ID")}</p>
                <p style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: 4 }}>Total Potongan</p>
                <p style={{ fontWeight: 600, color: "#dc2626", margin: "0 0 1rem" }}>Rp {Number(selectedPayroll.total_deduction || 0).toLocaleString("id-ID")}</p>
              </div>
            </div>
            {(selectedPayroll.take_home_pay || selectedPayroll.net_salary) && (
              <div style={{ padding: "1rem", background: "rgba(16, 185, 129, 0.05)", borderRadius: 8, border: "1px solid rgba(16, 185, 129, 0.1)", textAlign: "center", marginTop: "1rem" }}>
                <p style={{ fontSize: "0.75rem", color: "#166534", margin: 0 }}>Gaji Bersih (Take Home Pay)</p>
                <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "#059669", margin: "4px 0 0" }}>Rp {Number(selectedPayroll.take_home_pay || selectedPayroll.net_salary || 0).toLocaleString("id-ID")}</p>
              </div>
            )}
            <div style={{ marginTop: "2rem", display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <Button variant="outline" size="md" onClick={() => setSelectedPayroll(null)} disabled={loading}>Batal</Button>
              {selectedPayroll.status === "paid" ? (
                <div style={{ color: "#10b981", fontWeight: 500 }}>Payroll ini sudah dibayar</div>
              ) : (
                <Button variant="primary" size="md" onClick={() => void handleMarkAsPaid()} disabled={loading}>Tandai Sebagai Dibayar</Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default PayrollProcessPage;
