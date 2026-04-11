import { useEffect, useState } from "react";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { Modal } from "@/shared/ui/Modal";
import {
  approvePayroll,
  getAllPayroll,
} from "@/features/payroll/api/payroll.service";
import { getAllEmployees } from "@/features/employee/api/employee.service";
import type { PayrollItem } from "@/features/payroll/types/payroll.types";
import type { EmployeeItem } from "@/features/employee/types/employee.types";
import "../admin/AdminCrudPages.css";

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
      const [payrollData, employeeData] = await Promise.all([getAllPayroll(), getAllEmployees()]);
      setPayrolls(payrollData);
      setEmployees(employeeData);
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
        "⚠️ Sudah Disetujui",
        `Payroll ini sudah memiliki status: ${selectedPayroll.status}\n\nTidak perlu disetujui lagi.`
      );
      return;
    }

    if (selectedPayroll.status === "rejected") {
      showErrorModal(
        "⚠️ Ditolak",
        `Payroll ini memiliki status "rejected". Hubungi admin untuk reset status sebelum approve.`
      );
      return;
    }

    setLoading(true);
    try {
      console.log("📋 Approving payroll ID:", selectedPayroll.id);
      // Extract numeric ID if prefixed (e.g., "P003" -> "3")
      const payrollId = String(selectedPayroll.id).replace(/^[A-Z]+/, "").replace(/^0+/, "") || selectedPayroll.id;
      await approvePayroll(payrollId);
      
      setMessage({ type: "success", text: `✓ Payroll ID ${selectedPayroll.id} berhasil disetujui` });
      setSelectedPayrollId("");
      setSelectedPayroll(null);
      
      // Refresh from server - this will update the list in real-time
      await loadData();
    } catch (error) {
      const errorText = error instanceof Error ? error.message : "Gagal menyetujui payroll";
      showErrorModal("❌ Error Approve", errorText);
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

  // Filter payrolls that are pending approval
  const pendingPayrolls = payrolls.filter((p) => p.status === "draft" || p.status === "pending");
  const otherPayrolls = payrolls.filter((p) => p.status === "approved" || p.status === "paid");

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

      <div className="crud-header" style={{ borderBottom: "2px solid #0284c7", paddingBottom: "20px" }}>
        <div>
          <h1 style={{ color: "#0284c7", marginBottom: "4px" }}>✓ Persetujuan Payroll</h1>
          <p style={{ color: "#666", fontSize: "0.9rem" }}>Setujui data payroll karyawan sebelum diproses untuk pembayaran</p>
        </div>
        <Button variant="primary" size="md" onClick={() => void loadData()} disabled={loading} style={{ backgroundColor: "#0284c7" }}>
          🔄 Segarkan Data
        </Button>
      </div>

      {/* Success Message */}
      {message && message.type === "success" && (
        <Card
          className="crud-card"
          glass
          style={{
            backgroundColor: "#f0f9ff",
            borderLeft: "4px solid #0284c7",
            marginBottom: "20px",
          }}
        >
          <p style={{ color: "#0284c7", margin: 0, fontWeight: "500" }}>
            {message.text}
          </p>
        </Card>
      )}

      {/* Payroll Yang Perlu Disetujui */}
      <Card className="crud-card" glass style={{ borderTop: "4px solid #0284c7" }}>
        <h2 style={{ color: "#0284c7", marginTop: 0 }}>📋 Menunggu Persetujuan ({pendingPayrolls.length})</h2>
        {pendingPayrolls.length > 0 ? (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ backgroundColor: "#f0f9ff" }}>
                <tr>
                  <th style={{ padding: "12px", textAlign: "left", color: "#0284c7", fontWeight: "600" }}>Karyawan</th>
                  <th style={{ padding: "12px", textAlign: "left", color: "#0284c7", fontWeight: "600" }}>Periode</th>
                  <th style={{ padding: "12px", textAlign: "right", color: "#0284c7", fontWeight: "600" }}>Gaji Pokok</th>
                  <th style={{ padding: "12px", textAlign: "right", color: "#0284c7", fontWeight: "600" }}>Gaji Bersih</th>
                  <th style={{ padding: "12px", textAlign: "center", color: "#0284c7", fontWeight: "600" }}>Status</th>
                  <th style={{ padding: "12px", textAlign: "center", color: "#0284c7", fontWeight: "600" }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {pendingPayrolls.map((p) => (
                  <tr
                    key={p.id}
                    style={{
                      borderBottom: "1px solid #e5e7eb",
                      backgroundColor: selectedPayrollId === String(p.id) ? "#fef3c7" : "transparent",
                    }}
                  >
                    <td style={{ padding: "12px" }}>
                      <strong>{getEmployeeName(p.employee_id)}</strong>
                    </td>
                    <td style={{ padding: "12px" }}>{p.period}</td>
                    <td style={{ padding: "12px", textAlign: "right" }}>
                      Rp {Number(p.basic_salary || 0).toLocaleString("id-ID")}
                    </td>
                    <td style={{ padding: "12px", textAlign: "right", fontWeight: "bold", color: "#059669" }}>
                      Rp {Number(p.take_home_pay || p.net_salary || 0).toLocaleString("id-ID")}
                    </td>
                    <td style={{ padding: "12px", textAlign: "center" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "4px 8px",
                          backgroundColor: getStatusColor(p.status),
                          color: "white",
                          borderRadius: "12px",
                          fontSize: "0.75rem",
                          fontWeight: "bold",
                        }}
                      >
                        {getStatusLabel(p.status)}
                      </span>
                    </td>
                    <td style={{ padding: "12px", textAlign: "center" }}>
                      <button
                        onClick={() => handleSelectPayroll(p)}
                        style={{
                          padding: "6px 12px",
                          backgroundColor: selectedPayrollId === String(p.id) ? "#0284c7" : "#0ea5e9",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "0.85rem",
                          fontWeight: "bold",
                          transition: "background-color 0.2s",
                        }}
                        disabled={loading}
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
          <p style={{ color: "#999", margin: 0 }}>Tidak ada payroll yang menunggu persetujuan</p>
        )}
      </Card>

      {/* Approval Form */}
      {selectedPayroll && (
        <Card className="crud-card" glass style={{ borderTop: "4px solid #10b981" }}>
          <h2 style={{ color: "#0284c7", marginTop: 0 }}>✅ Konfirmasi Persetujuan Payroll ID {selectedPayroll.id}</h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
            <div>
              <p style={{ margin: "0 0 4px 0", fontSize: "0.85rem", fontWeight: "600", color: "#0284c7" }}>
                ID Karyawan
              </p>
              <p style={{ margin: "0 0 16px 0", fontSize: "1rem", fontWeight: "bold", color: "#0284c7" }}>
                {selectedPayroll.employee_id}
              </p>

              <p style={{ margin: "0 0 4px 0", fontSize: "0.85rem", fontWeight: "600", color: "#0284c7" }}>
                Nama Karyawan
              </p>
              <p style={{ margin: "0 0 16px 0", fontSize: "1rem" }}>
                {getEmployeeName(selectedPayroll.employee_id)}
              </p>

              <p style={{ margin: "0 0 4px 0", fontSize: "0.85rem", fontWeight: "600", color: "#0284c7" }}>
                Periode Payroll
              </p>
              <p style={{ margin: "0 0 16px 0", fontSize: "1rem" }}>{selectedPayroll.period}</p>

              <p style={{ margin: "0 0 4px 0", fontSize: "0.85rem", fontWeight: "600", color: "#0284c7" }}>
                Status Saat Ini
              </p>
              <p style={{ margin: 0, fontSize: "1rem" }}>
                <span
                  style={{
                    display: "inline-block",
                    padding: "4px 8px",
                    backgroundColor: getStatusColor(selectedPayroll.status),
                    color: "white",
                    borderRadius: "12px",
                    fontSize: "0.85rem",
                    fontWeight: "bold",
                  }}
                >
                  {getStatusLabel(selectedPayroll.status)}
                </span>
              </p>
            </div>

            <div>
              <p style={{ margin: "0 0 4px 0", fontSize: "0.85rem", fontWeight: "600", color: "#0284c7" }}>
                Gaji Pokok
              </p>
              <p style={{ margin: "0 0 16px 0", fontSize: "1rem", fontWeight: "bold", color: "#10b981" }}>
                Rp {Number(selectedPayroll.basic_salary || 0).toLocaleString("id-ID")}
              </p>

              <p style={{ margin: "0 0 4px 0", fontSize: "0.85rem", fontWeight: "600", color: "#0284c7" }}>
                Gaji Bersih (Take Home)
              </p>
              <p style={{ margin: "0 0 16px 0", fontSize: "1.2rem", fontWeight: "bold", color: "#10b981" }}>
                Rp {Number(selectedPayroll.take_home_pay || selectedPayroll.net_salary || 0).toLocaleString("id-ID")}
              </p>
            </div>
          </div>

          {/* Approval Button */}
          <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
            <Button
              variant="primary"
              size="lg"
              onClick={() => void handleApprove()}
              disabled={loading || selectedPayroll.status !== "draft" && selectedPayroll.status !== "pending"}
              style={{ flex: 1, backgroundColor: "#10b981", border: "none" }}
            >
              ✓ Setujui Payroll
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                setSelectedPayroll(null);
                setSelectedPayrollId("");
              }}
              disabled={loading}
              style={{ flex: 1, color: "#0284c7", borderColor: "#0284c7" }}
            >
              Batal
            </Button>
          </div>
        </Card>
      )}

      {/* Payroll Sudah Disetujui */}
      {otherPayrolls.length > 0 && (
        <Card className="crud-card" glass style={{ backgroundColor: "#f0f9ff", borderTop: "4px solid #10b981" }}>
          <h2 style={{ color: "#0284c7", marginTop: 0 }}>✅ Telah Disetujui ({otherPayrolls.length})</h2>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", opacity: 0.85 }}>
              <thead style={{ backgroundColor: "#e0f2fe" }}>
                <tr>
                  <th style={{ padding: "8px", textAlign: "left", fontSize: "0.85rem", color: "#0284c7", fontWeight: "600" }}>Karyawan</th>
                  <th style={{ padding: "8px", textAlign: "left", fontSize: "0.85rem", color: "#0284c7", fontWeight: "600" }}>Periode</th>
                  <th style={{ padding: "8px", textAlign: "right", fontSize: "0.85rem", color: "#0284c7", fontWeight: "600" }}>Gaji Bersih</th>
                  <th style={{ padding: "8px", textAlign: "center", fontSize: "0.85rem", color: "#0284c7", fontWeight: "600" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {otherPayrolls.slice(0, 5).map((p) => (
                  <tr key={p.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                    <td style={{ padding: "8px", fontSize: "0.85rem" }}>
                      {getEmployeeName(p.employee_id)}
                    </td>
                    <td style={{ padding: "8px", fontSize: "0.85rem" }}>{p.period}</td>
                    <td style={{ padding: "8px", textAlign: "right", fontSize: "0.85rem" }}>
                      Rp {Number(p.take_home_pay || p.net_salary || 0).toLocaleString("id-ID")}
                    </td>
                    <td style={{ padding: "8px", textAlign: "center" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "2px 6px",
                          backgroundColor: getStatusColor(p.status),
                          color: "white",
                          borderRadius: "10px",
                          fontSize: "0.7rem",
                          fontWeight: "bold",
                        }}
                      >
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
