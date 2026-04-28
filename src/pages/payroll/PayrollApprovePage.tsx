import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart3, CheckCircle2, Clock3, CreditCard, ShieldCheck, RefreshCw, CheckCircle, Eye, FileCheck } from "lucide-react";
import { Card } from "@/shared/ui/Card";
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
import "./PayrollApprovePage.css";

const PayrollApprovePage = () => {
  const navigate = useNavigate();
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

  // Approve payroll - uses POST /api/payroll/{id}/approve
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
      const payrollId = String(selectedPayroll.id);
      // Use the service directly - POST /api/payroll/{id}/approve
      await payrollService.approvePayroll(payrollId);
      
      setMessage({ type: "success", text: `Payroll ID ${selectedPayroll.id} berhasil disetujui` });
      setSelectedPayrollId("");
      setSelectedPayroll(null);
      
      await loadData();
    } catch (error) {
      const errorText = error instanceof Error ? error.message : "Gagal menyetujui payroll";
      showErrorModal("Error Approve", errorText);
    } finally {
      setLoading(false);
    }
  };

  // Reject payroll - uses POST /api/payroll/{id}/reject
  const handleReject = async () => {
    if (!selectedPayroll) {
      showErrorModal("Validasi", "Pilih payroll untuk ditolak terlebih dahulu");
      return;
    }

    if (selectedPayroll.status === "rejected") {
      showErrorModal("Sudah Ditolak", `Payroll ini sudah memiliki status: ${selectedPayroll.status}`);
      return;
    }

    setLoading(true);
    try {
      const payrollId = String(selectedPayroll.id);
      const reason = prompt("Masukkan alasan penolakan:", "Data tidak valid");
      if (!reason) {
        setLoading(false);
        return;
      }
      await payrollService.rejectPayroll(payrollId, reason);
      
      setMessage({ type: "success", text: `Payroll ID ${selectedPayroll.id} ditolak` });
      setSelectedPayrollId("");
      setSelectedPayroll(null);
      
      await loadData();
    } catch (error) {
      const errorText = error instanceof Error ? error.message : "Gagal menolak payroll";
      showErrorModal("Error Reject", errorText);
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
          <p style={{ margin: 0, lineHeight: "1.6", color: "#1e293b" }}>
            {errorModal.message}
          </p>
        </div>
      </Modal>

      <Card className="hero-card">
        <div className="hero-card-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <ShieldCheck size={16} />
              <span>Pusat Payroll</span>
            </div>
            <h1 className="hero-title">Persetujuan Payroll</h1>
            <p className="hero-subtitle">
              Setujui data payroll karyawan sebelum diproses untuk pembayaran.
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn-outline" onClick={() => void loadData()} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Segarkan
            </button>
            <button className="btn-primary" onClick={() => navigate('/payroll/crud')} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#fff', color: '#2563eb', fontSize: '0.9rem', fontWeight: '600', fontFamily: "'Poppins', sans-serif", cursor: 'pointer' }}>
              Kelola Payroll
            </button>
          </div>
        </div>
      </Card>

      {/* Summary Cards - Same style as Employees Page */}
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

      {/* Success Message */}
      {message && message.type === "success" && (
        <Card className="message-card">
          <CheckCircle size={20} style={{ color: '#10b981', marginRight: '8px' }} />
          <span>{message.text}</span>
        </Card>
      )}

      {/* Data Table */}
      <Card className="data-table-card">
        <div className="data-table-header">
          <h3 className="data-table-title">
            Menunggu Persetujuan
            <span className="data-table-count">{pendingPayrolls.length} payroll</span>
          </h3>
        </div>

        <div className="table-wrap">
          <table className="crud-table">
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
                  <td className="crud-table-name">
                      <div className="crud-table-avatar">
                        {getEmployeeName(p.employee_id).charAt(0).toUpperCase()}
                      </div>
                      <span>{getEmployeeName(p.employee_id)}</span>
                    </td>
                    <td><span className="crud-table-tag">{p.period}</span></td>
                    <td className="crud-table-amount">
                      Rp {Number(p.basic_salary || 0).toLocaleString("id-ID")}
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 'normal', display: 'block' }}>Basic</span>
                    </td>
                    <td className="crud-table-amount crud-table-amount-green">
                      Rp {Number(p.take_home_pay || p.net_salary || 0).toLocaleString("id-ID")}
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 'normal', display: 'block' }}>Net</span>
                    </td>
                    <td>
                      <PayrollStatusBadge status={p.status || 'pending'} size="sm" />
                    </td>
                    <td className="text-center">
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button
                          type="button"
                          onClick={() => handleSelectPayroll(p)}
                          className={selectedPayrollId === String(p.id) ? "action-btn action-btn-edit" : "action-btn"}
                          disabled={loading}
                          title="Pilih untuk approve"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedPayroll(p);
                            setSelectedPayrollId(String(p.id));
                          }}
                          className="action-btn action-btn-success"
                          disabled={loading}
                          title="Approve payroll"
                        >
                          <FileCheck size={14} />
                        </button>
                      </div>
                    </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
                variant="success"
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
        <>
          <Card className="analytics-title-card">
            <div className="analytics-title-inner">
              <div className="analytics-icon">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <h2 className="analytics-title">Telah Disetujui</h2>
                <p className="analytics-subtitle">{otherPayrolls.length} payroll</p>
              </div>
            </div>
          </Card>

          <Card className="crud-table-card">
            <div className="crud-table-wrap">
              <table className="crud-table">
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
<td className="crud-table-name">
                      <div className="crud-table-avatar">
                        {getEmployeeName(p.employee_id).charAt(0).toUpperCase()}
                      </div>
                      <span>{getEmployeeName(p.employee_id)}</span>
                    </td>
                    <td><span className="crud-table-tag">{p.period}</span></td>
                    <td className="crud-table-amount crud-table-amount-green">
                      Rp {Number(p.take_home_pay || p.net_salary || 0).toLocaleString("id-ID")}
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 'normal', display: 'block' }}>Net</span>
                    </td>
<td>
                      <PayrollStatusBadge status={p.status || 'approved'} size="sm" />
                    </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default PayrollApprovePage;
