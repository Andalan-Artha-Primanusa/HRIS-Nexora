import { useEffect, useState } from "react";
import { BarChart3, CheckCircle2, Clock3, CreditCard, ShieldCheck } from "lucide-react";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { Modal } from "@/shared/ui/Modal";
import { payrollService, toSafeArray } from "@/features/payroll/api/payroll.service";
import { getAllEmployees } from "@/features/employee/api/employee.service";
import type { PayrollItem } from "@/features/payroll/types/payroll.types";
import type { EmployeeItem } from "@/features/employee/types/employee.types";
import "../admin/AdminCrudPages.css";
import "./PayrollApprovePage.css";

const PayrollApprovePage = () => {
  const [payrolls, setPayrolls] = useState<PayrollItem[]>([]);
  const [employees, setEmployees] = useState<EmployeeItem[]>([]);
  const [selectedPayrollId, setSelectedPayrollId] = useState<string>("");
  const [selectedPayroll, setSelectedPayroll] = useState<PayrollItem | null>(null);
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



  // Load data
  const loadData = async () => {
    setLoading(true);
    try {
      const [payrollData, employeeData] = await Promise.all([
        payrollService.getPayrollList(),
        getAllEmployees()
      ]);
      setPayrolls(toSafeArray(payrollData));
      setEmployees(toSafeArray(employeeData));
      setMessage(null);
    } catch (error) {
      const errorText = error instanceof Error ? error.message : "Gagal memuat data";
      showErrorModal("Error", errorText);
    } finally {
      setLoading(false);
    }
  };

  // Select payroll
  const handleSelectPayroll = (payroll: PayrollItem) => {
    setSelectedPayrollId(String(payroll.id));
    setSelectedPayroll(payroll);
  };

  // Approve payroll
  const handleApprove = async () => {
    if (!selectedPayroll) {
      showErrorModal("Validasi", "Pilih payroll untuk disetujui terlebih dahulu");
      return;
    }

    if (selectedPayroll.status === "approved" || selectedPayroll.status === "paid") {
      showErrorModal(
        "Sudah Disetujui",
        `Payroll ini sudah memiliki status: ${selectedPayroll.status}\n\nTidak perlu disetujui lagi.`
      );
      return;
    }

    if (selectedPayroll.status === "rejected") {
      showErrorModal(
        "Ditolak",
        `Payroll ini memiliki status "rejected". Hubungi admin untuk reset status sebelum approve.`
      );
      return;
    }

    setLoading(true);
    try {
      console.log("Approving payroll ID:", selectedPayroll.id);
      // Extract numeric ID if prefixed (e.g., "P003" -> "3")
      const payrollId = String(selectedPayroll.id).replace(/^[A-Z]+/, "").replace(/^0+/, "") || selectedPayroll.id;
      await payrollService.approvePayroll(payrollId);
      
      setMessage({ type: "success", text: `Payroll ID ${selectedPayroll.id} berhasil disetujui` });
      setSelectedPayrollId("");
      setSelectedPayroll(null);
      
      // Refresh from server - this will update the list in real-time
      await loadData();
    } catch (error) {
      const errorText = error instanceof Error ? error.message : "Gagal menyetujui payroll";
      showErrorModal("Error Approve", errorText);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const getEmployeeName = (empId: string | number) => {
    const emp = employees.find((e) => e.id === empId || String(e.id) === String(empId));
    return emp ? `${emp.employee_code} - ${emp.user?.name || "Unknown"}` : "Unknown";
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: "#999",
      pending: "#f59e0b",
      approved: "#10b981",
      paid: "#06b6d4",
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

  // Ensure payrolls is always an array before filtering
  const safePayrolls = Array.isArray(payrolls) ? payrolls : [];
  
  // Filter payrolls that are pending approval
  const pendingPayrolls = safePayrolls.filter((p) => p.status === "draft" || p.status === "pending");
  const otherPayrolls = safePayrolls.filter((p) => p.status === "approved" || p.status === "paid");

  const summaryCards = [
    {
      label: "Pending Review",
      subtitle: "Menunggu aksi approval",
      value: String(pendingPayrolls.length),
      change: "Prioritas proses hari ini",
      tone: "orange" as const,
      icon: Clock3,
    },
    {
      label: "Ready Selected",
      subtitle: "Payroll yang dipilih",
      value: selectedPayroll ? "1" : "0",
      change: selectedPayroll ? "Siap ditinjau" : "Belum ada pilihan",
      tone: "blue" as const,
      icon: BarChart3,
    },
    {
      label: "Approved",
      subtitle: "Payroll yang sudah disetujui",
      value: String(otherPayrolls.filter((item) => item.status === "approved").length),
      change: "Status final approval",
      tone: "green" as const,
      icon: CheckCircle2,
    },
    {
      label: "Paid",
      subtitle: "Payroll yang sudah dibayar",
      value: String(otherPayrolls.filter((item) => item.status === "paid").length),
      change: "Sudah masuk proses pembayaran",
      tone: "purple" as const,
      icon: CreditCard,
    },
  ];

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

      <Card className="payroll-approve-hero" glass>
        <div className="crud-header payroll-approve-header">
          <div className="crud-header-copy">
            <p className="crud-page-badge">Payroll Center</p>
            <div className="crud-header-title-row">
              <span className="crud-header-icon"><ShieldCheck size={18} /></span>
              <h1>Persetujuan Payroll</h1>
            </div>
            <p>Setujui data payroll karyawan sebelum diproses untuk pembayaran dengan tampilan yang rapi, konsisten, dan mudah dipindai.</p>
          </div>
          <Button variant="outline" size="md" onClick={() => void loadData()} disabled={loading}>
            Segarkan Data
          </Button>
        </div>
      </Card>

      <div className="payroll-approve-summary-grid">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <Card key={card.label} className="payroll-approve-summary-card" glass>
              <div className="payroll-approve-summary-header">
                <div>
                  <span className="payroll-approve-summary-label">{card.label}</span>
                  <p className="payroll-approve-summary-subtitle">{card.subtitle}</p>
                </div>
                <span className={`payroll-approve-summary-icon payroll-approve-summary-icon--${card.tone}`}>
                  <Icon size={18} />
                </span>
              </div>
              <div className="payroll-approve-summary-value">{card.value}</div>
              <div className="payroll-approve-summary-change">{card.change}</div>
            </Card>
          );
        })}
      </div>

      {/* Success Message */}
      {message && message.type === "success" && (
        <Card className="crud-card payroll-approve-message" glass>
          <p>
            {message.text}
          </p>
        </Card>
      )}

      {/* Payroll Yang Perlu Disetujui */}
      <Card className="crud-card payroll-approve-card" glass>
        <h2>Menunggu Persetujuan ({pendingPayrolls.length})</h2>
        {pendingPayrolls.length > 0 ? (
          <div className="crud-table-wrap">
            <table className="crud-table payroll-approve-table">
              <thead>
                <tr>
                  <th>Karyawan</th>
                  <th>Periode</th>
                  <th className="text-right">Gaji Pokok</th>
                  <th className="text-right">Gaji Bersih</th>
                  <th className="text-center">Status</th>
                  <th className="text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {pendingPayrolls.map((p) => (
                  <tr
                    key={p.id}
                    className={selectedPayrollId === String(p.id) ? "is-selected" : ""}
                  >
                    <td>
                      <strong>{getEmployeeName(p.employee_id)}</strong>
                    </td>
                    <td>{p.period}</td>
                    <td className="text-right">
                      Rp {Number(p.basic_salary || 0).toLocaleString("id-ID")}
                    </td>
                    <td className="text-right payroll-approve-total">
                      Rp {Number(p.take_home_pay || p.net_salary || 0).toLocaleString("id-ID")}
                    </td>
                    <td className="text-center">
                      <span className="payroll-status-pill" style={{ backgroundColor: getStatusColor(p.status) }}>
                        {getStatusLabel(p.status)}
                      </span>
                    </td>
                    <td className="text-center">
                      <button
                        type="button"
                        onClick={() => handleSelectPayroll(p)}
                        className={`action-btn ${selectedPayrollId === String(p.id) ? "action-btn-edit" : ""}`}
                        disabled={loading}
                        style={{ background: selectedPayrollId === String(p.id) ? '#eff6ff' : '#f1f5f9', color: selectedPayrollId === String(p.id) ? '#2563eb' : '#64748b' }}
                      >
                        Pilih
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
            <p className="payroll-approve-empty">Tidak ada payroll yang menunggu persetujuan</p>
        )}
      </Card>

      {/* Approval Modal */}
      <Modal
        isOpen={!!selectedPayroll}
        onClose={() => {
          setSelectedPayroll(null);
          setSelectedPayrollId("");
        }}
        title={`Konfirmasi Persetujuan Payroll ID ${selectedPayroll?.id}`}
        size="lg"
      >
        {selectedPayroll && (
          <div className="payroll-approve-modal-container">
            <div className="payroll-approve-detail-grid">
              <div className="payroll-approve-detail-column">
                <p className="payroll-approve-detail-label">ID Karyawan</p>
                <p className="payroll-approve-detail-value payroll-approve-detail-value--accent">
                  {selectedPayroll.employee_id}
                </p>

                <p className="payroll-approve-detail-label">Nama Karyawan</p>
                <p className="payroll-approve-detail-value">
                  {getEmployeeName(selectedPayroll.employee_id)}
                </p>

                <p className="payroll-approve-detail-label">Periode Payroll</p>
                <p className="payroll-approve-detail-value">{selectedPayroll.period}</p>

                <p className="payroll-approve-detail-label">Status Saat Ini</p>
                <p className="payroll-approve-detail-value">
                  <span className="payroll-status-pill" style={{ backgroundColor: getStatusColor(selectedPayroll.status) }}>
                    {getStatusLabel(selectedPayroll.status)}
                  </span>
                </p>
              </div>

              <div className="payroll-approve-detail-column">
                <p className="payroll-approve-detail-label">Gaji Pokok</p>
                <p className="payroll-approve-detail-value payroll-approve-detail-value--success">
                  Rp {Number(selectedPayroll.basic_salary || 0).toLocaleString("id-ID")}
                </p>

                <p className="payroll-approve-detail-label">Gaji Bersih (Take Home)</p>
                <p className="payroll-approve-detail-value payroll-approve-detail-value--success payroll-approve-detail-value--large">
                  Rp {Number(selectedPayroll.take_home_pay || selectedPayroll.net_salary || 0).toLocaleString("id-ID")}
                </p>
              </div>
            </div>

            <div className="payroll-approve-actions" style={{ marginTop: '2rem', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <Button
                variant="outline"
                size="md"
                onClick={() => {
                  setSelectedPayroll(null);
                  setSelectedPayrollId("");
                }}
                disabled={loading}
              >
                Batal
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => void handleApprove()}
                disabled={loading || (selectedPayroll.status !== "draft" && selectedPayroll.status !== "pending")}
              >
                Setujui Payroll
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Payroll Sudah Disetujui */}
      {otherPayrolls.length > 0 && (
          <Card className="crud-card payroll-approve-card payroll-approve-card--approved" glass>
            <h2>Telah Disetujui ({otherPayrolls.length})</h2>
            <div className="crud-table-wrap payroll-approve-table-wrap">
              <table className="crud-table payroll-approve-table payroll-approve-table--compact">
                <thead>
                <tr>
                    <th>Karyawan</th>
                    <th>Periode</th>
                    <th className="text-right">Gaji Bersih</th>
                    <th className="text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {otherPayrolls.slice(0, 5).map((p) => (
                    <tr key={p.id}>
                      <td>
                      {getEmployeeName(p.employee_id)}
                    </td>
                      <td>{p.period}</td>
                      <td className="text-right">
                      Rp {Number(p.take_home_pay || p.net_salary || 0).toLocaleString("id-ID")}
                    </td>
                      <td className="text-center">
                        <span className="payroll-status-pill payroll-status-pill--compact" style={{ backgroundColor: getStatusColor(p.status) }}>
                        {getStatusLabel(p.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default PayrollApprovePage;
