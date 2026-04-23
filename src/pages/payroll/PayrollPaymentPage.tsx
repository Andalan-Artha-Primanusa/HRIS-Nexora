import { useEffect, useState } from "react";
import { BarChart3, CreditCard, FileText, ShieldCheck } from "lucide-react";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { Modal } from "@/shared/ui/Modal";
import { payrollService, toSafeArray } from "@/features/payroll/api/payroll.service";
import { getAllEmployees } from "@/features/employee/api/employee.service";
import type { PayrollItem } from "@/features/payroll/types/payroll.types";
import type { EmployeeItem } from "@/features/employee/types/employee.types";
import "../admin/AdminCrudPages.css";
import "./PayrollPaymentPage.css";

const PayrollPaymentPage = () => {
  const [payrollId, setPayrollId] = useState("");
  const [selectedPayroll, setSelectedPayroll] = useState<PayrollItem | null>(null);
  const [employees, setEmployees] = useState<EmployeeItem[]>([]);
  const [allPayrolls, setAllPayrolls] = useState<PayrollItem[]>([]);
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

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: "#999",
      pending: "#f59e0b",
      approved: "#3b82f6",
      paid: "#10b981",
      rejected: "#ef4444",
    };
    return colors[status] || "#999";
  };

  const getStatusLabel = (status: string) => {
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

  const recentPayrolls = safePayrolls.slice(0, 5);

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

      <Card className="payroll-payment-hero" glass>
        <div className="crud-header payroll-payment-header">
          <div className="crud-header-copy">
            <p className="crud-page-badge">Payroll Center</p>
            <div className="crud-header-title-row">
              <span className="crud-header-icon"><CreditCard size={18} /></span>
              <h1>Pembayaran Payroll</h1>
            </div>
            <p>Tandai payroll yang sudah dibayarkan kepada karyawan dengan tampilan yang rapi, konsisten, dan mudah dipindai.</p>
          </div>
        </div>
      </Card>

      <div className="payroll-payment-summary-grid">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <Card key={card.label} className="payroll-payment-summary-card" glass>
              <div className="payroll-payment-summary-header">
                <div>
                  <span className="payroll-payment-summary-label">{card.label}</span>
                  <p className="payroll-payment-summary-subtitle">{card.subtitle}</p>
                </div>
                <span className={`payroll-payment-summary-icon payroll-payment-summary-icon--${card.tone}`}>
                  <Icon size={18} />
                </span>
              </div>
              <div className="payroll-payment-summary-value">{card.value}</div>
              <div className="payroll-payment-summary-change">{card.change}</div>
            </Card>
          );
        })}
      </div>

      {message && message.type === "success" && (
        <Card className="crud-card payroll-payment-message" glass>
          <p>{message.text}</p>
        </Card>
      )}

      <Card className="crud-card payroll-payment-card" glass>
        <h2>Pilih Payroll untuk Tandai Dibayar</h2>
        <div className="payroll-payment-input-grid">
          <div className="payroll-payment-input-panel">
            <label>
              <strong>PAYROLL ID *</strong>
              <input
                type="text"
                className="crud-input"
                value={payrollId}
                onChange={(e) => setPayrollId(e.target.value)}
                placeholder="Contoh: 1, 2, 3, ..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    void handleViewDetail();
                  }
                }}
              />
            </label>
            <Button
              variant="primary"
              size="md"
              onClick={() => void handleViewDetail()}
              disabled={loading || !payrollId.trim()}
            >
              Lihat Detail
            </Button>
          </div>

          <div className="payroll-payment-quick-panel">
            <p className="payroll-payment-quick-title">Payroll Terbaru</p>
            <div className="payroll-payment-quick-list">
              {recentPayrolls.map((payroll) => (
                <button
                  type="button"
                  key={payroll.id}
                  onClick={() => {
                    setPayrollId(String(payroll.id));
                    setSelectedPayroll(payroll);
                  }}
                  className={`payroll-payment-quick-item${selectedPayroll?.id === payroll.id ? " is-selected" : ""}`}
                >
                  <div className="payroll-payment-quick-item-id">ID: {payroll.id}</div>
                  <div className="payroll-payment-quick-item-name">{getEmployeeName(payroll.employee_id)}</div>
                </button>
              ))}
            </div>
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
              <span className="payroll-status-pill" style={{ backgroundColor: getStatusColor(selectedPayroll.status) }}>
                {getStatusLabel(selectedPayroll.status)}
              </span>
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
