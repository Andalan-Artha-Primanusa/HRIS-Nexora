import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart3, CreditCard, FileText, ShieldCheck, RefreshCw, CheckCircle, DollarSign } from "lucide-react";
import { Card } from "@/shared/ui/Card";
import { PaginationWithSize } from "@/shared/ui/Pagination";
import { Button } from "@/shared/ui/Button";
import { Modal } from "@/shared/ui/Modal";
import { PayrollStatusBadge } from "@/shared/ui/PayrollStatusBadge";
import { payrollService, toSafeArray } from "@/features/payroll/api/payroll.service";
import { getAllEmployees } from "@/features/employee/api/employee.service";
import type { PayrollItem } from "@/features/payroll/types/payroll.types";
import type { EmployeeItem } from "@/features/employee/types/employee.types";
import "@/shared/styles/CrudPage.css";
import "@/pages/dashboard/overview/OverviewPage.css";
import "./PayrollListPage.css";
import "./PayrollPaymentPage.css";

const PayrollPaymentPage = () => {
  const navigate = useNavigate();
  const [payrollId, setPayrollId] = useState("");
  const [selectedPayroll, setSelectedPayroll] = useState<PayrollItem | null>(null);
  const [employees, setEmployees] = useState<EmployeeItem[]>([]);
  const [allPayrolls, setAllPayrolls] = useState<PayrollItem[]>([]);
  const [currentPageRecent, setCurrentPageRecent] = useState(1);
  const [itemsPerPageRecent, setItemsPerPageRecent] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [periodFilter, setPeriodFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
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



  useEffect(() => {
    const loadData = async () => {
      try {
        const [empsData, payrollsData] = await Promise.all([
          getAllEmployees(),
          payrollService.getPayrollList()
        ]);
        setEmployees(toSafeArray(empsData));
        setAllPayrolls(toSafeArray(payrollsData));
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    void loadData();
  }, []);

  const handleViewDetail = async () => {
    if (!payrollId.trim()) {
      showErrorModal("Validasi", "Masukkan Payroll ID terlebih dahulu");
      return;
    }

    setLoading(true);
    try {
      const cleanId = String(payrollId).replace(/^[A-Z]+/, "").replace(/^0+/, "") || payrollId;
      const payroll = await payrollService.getPayrollDetail(cleanId);
      setSelectedPayroll(payroll);
      setMessage(null);
    } catch (error) {
      const errorText = error instanceof Error ? error.message : "Gagal memuat detail payroll";
      showErrorModal("Error Muat Detail", errorText);
      setSelectedPayroll(null);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaid = async () => {
    if (!selectedPayroll) {
      showErrorModal("Validasi", "Pilih payroll terlebih dahulu");
      return;
    }

    if (selectedPayroll.status === "paid") {
      showErrorModal(
        "Sudah Dibayar",
        `Payroll ini sudah ditandai sebagai dibayar pada ${selectedPayroll.paid_at ? new Date(selectedPayroll.paid_at).toLocaleDateString("id-ID") : "tanggal tidak tersedia"}. Tidak perlu ditandai lagi.`
      );
      return;
    }

    setLoading(true);
    try {
      const payrollIdValue = String(selectedPayroll.id).replace(/^[A-Z]+/, "").replace(/^0+/, "") || selectedPayroll.id;
      const updated = await payrollService.processPayment(payrollIdValue);
      setSelectedPayroll(updated);
      setMessage({ type: "success", text: "Payroll berhasil ditandai sebagai dibayar" });

      const payrollsData = await payrollService.getPayrollList();
      setAllPayrolls(toSafeArray(payrollsData));
    } catch (error) {
      const errorText = error instanceof Error ? error.message : "Gagal menandai payroll sebagai dibayar";
      showErrorModal("Error Tandai Dibayar", errorText);
    } finally {
      setLoading(false);
    }
  };

  const getEmployeeName = (empId: string | number) => {
    const employee = safeEmployees.find((entry) => entry.id === empId || String(entry.id) === String(empId));
    return employee ? `${employee.employee_code} - ${employee.user?.name || "Unknown"}` : "Unknown";
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: "#999",
      pending: "#f59e0b",
      approved: "#3b82f6",
      paid: "#10b981",
      rejected: "#ef4444",
    };
    return colors[status] || "#999";
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: "Draft",
      pending: "Menunggu",
      approved: "Disetujui",
      paid: "Sudah Dibayar",
      rejected: "Ditolak",
    };
    return labels[status] || status;
  };

  // Ensure allPayrolls and employees are always arrays before filtering
  const safePayrolls = Array.isArray(allPayrolls) ? allPayrolls : [];
  const safeEmployees = Array.isArray(employees) ? employees : [];

  const summaryCards = [
    {
      label: "All Payroll",
      subtitle: "Seluruh payroll yang dimuat",
      value: String(safePayrolls.length),
      change: "Ringkasan data payroll",
      tone: "blue" as const,
      icon: FileText,
    },
    {
      label: "Selected",
      subtitle: "Payroll yang sedang dibuka",
      value: selectedPayroll ? "1" : "0",
      change: selectedPayroll ? `ID ${selectedPayroll.id}` : "Belum ada pilihan",
      tone: "green" as const,
      icon: BarChart3,
    },
    {
      label: "Ready to Pay",
      subtitle: "Status yang belum paid",
      value: String(safePayrolls.filter((item) => item.status !== "paid").length),
      change: "Perlu ditinjau atau diproses",
      tone: "orange" as const,
      icon: ShieldCheck,
    },
    {
      label: "Paid",
      subtitle: "Sudah ditandai dibayar",
      value: String(safePayrolls.filter((item) => item.status === "paid").length),
      change: "Status final pembayaran",
      tone: "purple" as const,
      icon: CreditCard,
    },
  ];

  const filteredPayrolls = safePayrolls.filter((p) => {
    if (paymentFilter === 'paid' && String(p.status).toLowerCase() !== 'paid') return false;
    if (paymentFilter === 'unpaid' && String(p.status).toLowerCase() === 'paid') return false;
    if (periodFilter !== 'all' && String(p.period) !== periodFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const emp = safeEmployees.find(e => String(e.id) === String(p.employee_id) || e.employee_code === String(p.employee_id));
      const name = emp?.user?.name || emp?.employee_code || "";
      if (!String(p.id).toLowerCase().includes(q) && !String(p.period || "").toLowerCase().includes(q) && !name.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  const totalPagesRecent = Math.max(1, Math.ceil(filteredPayrolls.length / itemsPerPageRecent));
  const recentPayrolls = filteredPayrolls.slice((currentPageRecent - 1) * itemsPerPageRecent, (currentPageRecent - 1) * itemsPerPageRecent + itemsPerPageRecent);

  return (
    <div className="crud-page">
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

      <Card className="hero-card">
        <div className="hero-card-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <CreditCard size={16} />
              <span>Pusat Payroll</span>
            </div>
            <h1 className="hero-title">Pembayaran Payroll</h1>
            <p className="hero-subtitle">
              Tandai payroll yang sudah dibayarkan kepada karyawan.
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn-outline" onClick={() => window.location.reload()} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Segarkan
            </button>
            <button className="btn-primary" onClick={() => navigate('/payroll/crud')} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#fff', color: '#2563eb', fontSize: '0.9rem', fontWeight: '600', fontFamily: "'Poppins', sans-serif", cursor: 'pointer' }}>
              Kelola Payroll
            </button>
          </div>
        </div>
      </Card>

      <div className="summary-grid">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <Card key={card.label} className="metric-card">
              <div className="metric-header">
                <div>
                  <span className="metric-label">{card.label}</span>
                  <p className="metric-subtitle">{card.subtitle}</p>
                </div>
                <span className={`metric-icon metric-icon--${card.tone}`}>
                  <Icon size={22} />
                </span>
              </div>
              <div className="metric-value" style={{ color: card.tone === 'orange' ? '#f59e0b' : card.tone === 'blue' ? '#2563eb' : card.tone === 'green' ? '#10b981' : '#8b5cf6' }}>{card.value}</div>
              <div className="summary-card-change">{card.change}</div>
            </Card>
          );
        })}
      </div>

      {message && message.type === "success" && (
        <Card className="message-card">
          <CheckCircle size={20} style={{ color: '#10b981', marginRight: '8px' }} />
          <span>{message.text}</span>
        </Card>
      )}

      <Card className="analytics-title-card">
        <div className="analytics-title-inner">
          <div className="analytics-icon">
            <DollarSign size={24} />
          </div>
          <div>
            <h2 className="analytics-title">Pembayaran Payroll</h2>
            <p className="analytics-subtitle">Pilih payroll untuk tandai dibayar</p>
          </div>
        </div>
      </Card>

      <Card className="crud-table-card" style={{ minHeight: 160 }}>
        <div className="payroll-payment-input-grid">
          <div className="payroll-payment-quick-panel" style={{ flex: 1, minHeight: 160 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <p className="payroll-payment-quick-title" style={{ margin: 0 }}>Payroll</p>
                <input
                  placeholder="Cari ID, karyawan, atau periode"
                  className="crud-input crud-input--sm"
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPageRecent(1); }}
                  style={{ minWidth: 220 }}
                />
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <select value={paymentFilter} onChange={(e) => { setPaymentFilter(e.target.value as any); setCurrentPageRecent(1); }} className="sort-select">
                  <option value="all">Semua Status</option>
                  <option value="unpaid">Belum Dibayar</option>
                  <option value="paid">Sudah Dibayar</option>
                </select>
                <select value={periodFilter} onChange={(e) => { setPeriodFilter(e.target.value); setCurrentPageRecent(1); }} className="sort-select">
                  <option value="all">Semua Periode</option>
                  {Array.from(new Set(safePayrolls.map(p => p.period).filter(Boolean))).map((prd) => (
                    <option key={String(prd)} value={String(prd)}>{String(prd)}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="crud-table-wrap" style={{ minHeight: 160 }}>
              <table className="crud-table payroll-payment-table" style={{ width: '100%', fontSize: '0.95rem' }}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Karyawan</th>
                    <th>Periode</th>
                    <th className="numeric">Gaji Pokok</th>
                    <th className="numeric">Take Home Pay</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPayrolls.length > 0 ? (
                    recentPayrolls.map((payroll) => (
                      <tr key={payroll.id} className={selectedPayroll?.id === payroll.id ? 'is-selected-row' : ''}>
                        <td>{payroll.id}</td>
                        <td title={getEmployeeName(payroll.employee_id)}>{getEmployeeName(payroll.employee_id)}</td>
                        <td>{payroll.period}</td>
                        <td className="numeric">Rp {Number(payroll.basic_salary || 0).toLocaleString('id-ID')}</td>
                        <td className="numeric">Rp {Number(payroll.take_home_pay || payroll.net_salary || 0).toLocaleString('id-ID')}</td>
                        <td><PayrollStatusBadge status={payroll.status || 'pending'} size="sm" /></td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                            <Button variant="outline" size="sm" onClick={() => { setPayrollId(String(payroll.id)); setSelectedPayroll(payroll); }}>
                              Lihat
                            </Button>
                            {String(payroll.status).toLowerCase() !== 'paid' && (
                              <Button variant="primary" size="sm" onClick={() => { setPayrollId(String(payroll.id)); setSelectedPayroll(payroll); }}>
                                Tandai Dibayar
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                        Tidak ada payroll untuk kriteria ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {filteredPayrolls.length > itemsPerPageRecent && (
              <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end' }}>
                <PaginationWithSize
                  currentPage={currentPageRecent}
                  totalPages={totalPagesRecent}
                  onPageChange={(p) => setCurrentPageRecent(p)}
                  totalItems={filteredPayrolls.length}
                  itemsPerPage={itemsPerPageRecent}
                  onItemsPerPageChange={(s) => setItemsPerPageRecent(s)}
                />
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Payment Confirmation Modal */}
      <Modal
        isOpen={!!selectedPayroll}
        onClose={() => setSelectedPayroll(null)}
        title={`Konfirmasi Pembayaran Payroll ID ${selectedPayroll?.id}`}
        size="lg"
      >
        {selectedPayroll && (
          <div className="payroll-payment-modal-container">
            <div className="payroll-payment-status-wrap" style={{ marginBottom: '1.5rem' }}>
              <PayrollStatusBadge status={selectedPayroll.status || 'pending'} size="lg" />
            </div>

            <div className="payroll-payment-detail-grid">
              <div className="payroll-payment-detail-column">
                <p className="payroll-payment-detail-label"><strong>Payroll ID</strong></p>
                <p className="payroll-payment-detail-value">{selectedPayroll.id}</p>

                <p className="payroll-payment-detail-label"><strong>Karyawan</strong></p>
                <p className="payroll-payment-detail-value">{getEmployeeName(selectedPayroll.employee_id)}</p>

                <p className="payroll-payment-detail-label"><strong>Periode</strong></p>
                <p className="payroll-payment-detail-value">{selectedPayroll.period}</p>

                <p className="payroll-payment-detail-label"><strong>Gaji Pokok</strong></p>
                <p className="payroll-payment-detail-value payroll-payment-detail-value--success">
                  Rp {Number(selectedPayroll.basic_salary || 0).toLocaleString("id-ID")}
                </p>
              </div>

              <div className="payroll-payment-detail-column">
                <p className="payroll-payment-detail-label"><strong>Tunjangan</strong></p>
                <p className="payroll-payment-detail-value payroll-payment-detail-value--success">
                  Rp {Number(selectedPayroll.allowance || 0).toLocaleString("id-ID")}
                </p>

                <p className="payroll-payment-detail-label"><strong>Bonus</strong></p>
                <p className="payroll-payment-detail-value payroll-payment-detail-value--success">
                  Rp {Number(selectedPayroll.bonus || 0).toLocaleString("id-ID")}
                </p>

                <p className="payroll-payment-detail-label"><strong>Total Potongan</strong></p>
                <p className="payroll-payment-detail-value payroll-payment-detail-value--danger">
                  Rp {Number(selectedPayroll.total_deduction || 0).toLocaleString("id-ID")}
                </p>
              </div>
            </div>

            {(selectedPayroll.take_home_pay || selectedPayroll.net_salary) && (
              <div className="payroll-payment-total-box" style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                <p className="payroll-payment-detail-label payroll-payment-detail-label--success" style={{ margin: 0 }}>
                  <strong>Gaji Bersih (Take Home Pay)</strong>
                </p>
                <p className="payroll-payment-total-value" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10b981', margin: '4px 0 0 0' }}>
                  Rp {Number(selectedPayroll.take_home_pay || selectedPayroll.net_salary || 0).toLocaleString("id-ID")}
                </p>
              </div>
            )}

            <div className="payroll-payment-actions" style={{ marginTop: '2rem', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <Button
                variant="outline"
                size="md"
                onClick={() => setSelectedPayroll(null)}
                disabled={loading}
              >
                Batal
              </Button>
              {selectedPayroll.status === "paid" ? (
                <div className="payroll-payment-paid-note" style={{ color: '#10b981', fontWeight: 500 }}>
                  Payroll ini sudah dibayar
                </div>
              ) : (
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => void handleMarkAsPaid()}
                  disabled={loading}
                >
                  Tandai Sebagai Dibayar
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PayrollPaymentPage;
