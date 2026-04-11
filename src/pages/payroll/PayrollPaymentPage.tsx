import { useEffect, useState } from "react";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { Modal } from "@/shared/ui/Modal";
import { getPayrollDetail, markPayrollAsPaid, getAllPayroll } from "@/features/payroll/api/payroll.service";
import { getAllEmployees } from "@/features/employee/api/employee.service";
import type { PayrollItem } from "@/features/payroll/types/payroll.types";
import type { EmployeeItem } from "@/features/employee/types/employee.types";
import "../admin/AdminCrudPages.css";

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

  // Load employees and payrolls on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [empsData, payrollsData] = await Promise.all([getAllEmployees(), getAllPayroll()]);
        setEmployees(empsData);
        setAllPayrolls(payrollsData);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };
    void loadData();
  }, []);

  // Load payroll details
  const handleViewDetail = async () => {
    if (!payrollId.trim()) {
      showErrorModal("Validasi", "Masukkan Payroll ID terlebih dahulu");
      return;
    }

    setLoading(true);
    try {
      // Extract numeric ID if prefixed (e.g., "P003" -> "3")
      const cleanId = String(payrollId).replace(/^[A-Z]+/, "").replace(/^0+/, "") || payrollId;
      const payroll = await getPayrollDetail(cleanId);
      setSelectedPayroll(payroll);
      setMessage(null);
    } catch (error) {
      const errorText = error instanceof Error ? error.message : "Gagal memuat detail payroll";
      showErrorModal("❌ Error Muat Detail", errorText);
      setSelectedPayroll(null);
    } finally {
      setLoading(false);
    }
  };

  // Mark as paid
  const handleMarkAsPaid = async () => {
    if (!selectedPayroll) {
      showErrorModal("Validasi", "Pilih payroll terlebih dahulu");
      return;
    }

    if (selectedPayroll.status === "paid") {
      showErrorModal("⚠️ Sudah Dibayar", `Payroll ini sudah ditandai sebagai dibayar pada ${selectedPayroll.paid_at ? new Date(selectedPayroll.paid_at).toLocaleDateString("id-ID") : "tanggal tidak tersedia"}. Tidak perlu ditandai lagi.`);
      return;
    }

    setLoading(true);
    try {
      // Extract numeric ID if prefixed (e.g., "P003" -> "3")
      const payrollId = String(selectedPayroll.id).replace(/^[A-Z]+/, "").replace(/^0+/, "") || selectedPayroll.id;
      const updated = await markPayrollAsPaid(payrollId);
      setSelectedPayroll(updated);
      setMessage({ type: "success", text: "✓ Payroll berhasil ditandai sebagai dibayar" });

      // Refresh list
      const payrollsData = await getAllPayroll();
      setAllPayrolls(payrollsData);
    } catch (error) {
      const errorText = error instanceof Error ? error.message : "Gagal menandai payroll sebagai dibayar";
      showErrorModal("❌ Error Tandai Dibayar", errorText);
    } finally {
      setLoading(false);
    }
  };

  const getEmployeeName = (empId: string | number) => {
    const emp = employees.find((e) => e.id === empId || String(e.id) === String(empId));
    return emp ? `${emp.employee_code} - ${emp.user?.name || "Unknown"}` : "Unknown";
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

      <div className="crud-header">
        <div>
          <h1>Pembayaran Payroll</h1>
          <p>Tandai payroll yang sudah dibayarkan kepada karyawan</p>
        </div>
      </div>

      {/* Success Message - Inline Banner */}
      {message && message.type === "success" && (
        <Card
          className="crud-card"
          glass
          style={{
            backgroundColor: "#dbeafe",
            borderLeft: "4px solid #0284c7",
          }}
        >
          <p style={{ color: "#0c4a6e", margin: 0 }}>
            {message.text}
          </p>
        </Card>
      )}

      {/* Input Section */}
      <Card className="crud-card" glass>
        <h2>● Pilih Payroll untuk Tandai Dibayar</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "20px", alignItems: "start" }}>
          <div>
            <label>
              <strong>PAYROLL ID *</strong>
              <input
                type="text"
                className="crud-input"
                value={payrollId}
                onChange={(e) => setPayrollId(e.target.value)}
                placeholder="Contoh: 1, 2, 3, ..."
                onKeyPress={(e) => {
                  if (e.key === "Enter") void handleViewDetail();
                }}
              />
            </label>
            <Button
              variant="primary"
              size="md"
              onClick={() => void handleViewDetail()}
              disabled={loading || !payrollId.trim()}
              style={{ marginTop: "12px" }}
            >
              Lihat Detail
            </Button>
          </div>

          {/* Quick List Panel */}
          <div style={{ backgroundColor: "#f9fafb", padding: "12px", borderRadius: "8px" }}>
            <p style={{ margin: "0 0 8px 0", fontSize: "0.85rem", fontWeight: "bold", color: "#666" }}>
              📋 Payroll Terbaru
            </p>
            <div style={{ maxHeight: "200px", overflowY: "auto", fontSize: "0.8rem" }}>
              {allPayrolls.slice(0, 5).map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setPayrollId(String(p.id));
                    setSelectedPayroll(p);
                  }}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "6px",
                    marginBottom: "4px",
                    backgroundColor: selectedPayroll?.id === p.id ? "#dbeafe" : "#fff",
                    border: `1px solid ${selectedPayroll?.id === p.id ? "#0284c7" : "#e5e7eb"}`,
                    borderRadius: "4px",
                    cursor: "pointer",
                    textAlign: "left",
                    fontSize: "0.8rem",
                  }}
                >
                  <div style={{ fontWeight: "bold" }}>ID: {p.id}</div>
                  <div style={{ color: "#666" }}>{getEmployeeName(p.employee_id)}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Detail Section */}
      {selectedPayroll ? (
        <>
          <Card className="crud-card" glass>
            <h2>● Detail Payroll</h2>

            {/* Status Badge */}
            <div style={{ marginBottom: "20px" }}>
              <span
                style={{
                  display: "inline-block",
                  padding: "6px 12px",
                  backgroundColor: getStatusColor(selectedPayroll.status),
                  color: "white",
                  borderRadius: "20px",
                  fontSize: "0.85rem",
                  fontWeight: "bold",
                }}
              >
                {getStatusLabel(selectedPayroll.status)}
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
              {/* Left Column */}
              <div>
                <p style={{ margin: "0 0 4px 0", fontSize: "0.85rem", color: "#666" }}>
                  <strong>Payroll ID</strong>
                </p>
                <p style={{ margin: "0 0 16px 0", fontSize: "1rem" }}>{selectedPayroll.id}</p>

                <p style={{ margin: "0 0 4px 0", fontSize: "0.85rem", color: "#666" }}>
                  <strong>Karyawan</strong>
                </p>
                <p style={{ margin: "0 0 16px 0", fontSize: "1rem" }}>
                  {getEmployeeName(selectedPayroll.employee_id)}
                </p>

                <p style={{ margin: "0 0 4px 0", fontSize: "0.85rem", color: "#666" }}>
                  <strong>Periode</strong>
                </p>
                <p style={{ margin: "0 0 16px 0", fontSize: "1rem" }}>{selectedPayroll.period}</p>

                <p style={{ margin: "0 0 4px 0", fontSize: "0.85rem", color: "#666" }}>
                  <strong>Gaji Pokok</strong>
                </p>
                <p style={{ margin: "0 0 16px 0", fontSize: "1rem", fontWeight: "bold", color: "#059669" }}>
                  Rp {Number(selectedPayroll.basic_salary || 0).toLocaleString("id-ID")}
                </p>
              </div>

              {/* Right Column */}
              <div>
                <p style={{ margin: "0 0 4px 0", fontSize: "0.85rem", color: "#666" }}>
                  <strong>Tunjangan</strong>
                </p>
                <p style={{ margin: "0 0 16px 0", fontSize: "1rem", fontWeight: "bold", color: "#059669" }}>
                  Rp {Number(selectedPayroll.allowance || 0).toLocaleString("id-ID")}
                </p>

                <p style={{ margin: "0 0 4px 0", fontSize: "0.85rem", color: "#666" }}>
                  <strong>Bonus</strong>
                </p>
                <p style={{ margin: "0 0 16px 0", fontSize: "1rem", fontWeight: "bold", color: "#059669" }}>
                  Rp {Number(selectedPayroll.bonus || 0).toLocaleString("id-ID")}
                </p>

                <p style={{ margin: "0 0 4px 0", fontSize: "0.85rem", color: "#666" }}>
                  <strong>Total Potongan</strong>
                </p>
                <p style={{ margin: "0 0 16px 0", fontSize: "1rem", fontWeight: "bold", color: "#dc2626" }}>
                  Rp {Number(selectedPayroll.total_deduction || 0).toLocaleString("id-ID")}
                </p>
              </div>
            </div>

            {/* Gaji Bersih */}
            {(selectedPayroll.take_home_pay || selectedPayroll.net_salary) && (
              <div
                style={{
                  padding: "12px",
                  backgroundColor: "#f0fdf4",
                  border: "2px solid #10b981",
                  borderRadius: "8px",
                  marginBottom: "20px",
                }}
              >
                <p style={{ margin: "0 0 4px 0", fontSize: "0.85rem", color: "#166534" }}>
                  <strong>Gaji Bersih (Take Home Pay)</strong>
                </p>
                <p style={{ margin: 0, fontSize: "1.4rem", fontWeight: "bold", color: "#059669" }}>
                  Rp {Number(selectedPayroll.take_home_pay || selectedPayroll.net_salary || 0).toLocaleString("id-ID")}
                </p>
              </div>
            )}

            {/* Action Button */}
            <div style={{ marginTop: "24px" }}>
              {selectedPayroll.status === "paid" ? (
                <div style={{ padding: "12px", backgroundColor: "#d1fae5", borderRadius: "8px" }}>
                  <p style={{ margin: 0, color: "#065f46", fontWeight: "bold" }}>
                    ✓ Payroll ini sudah ditandai sebagai dibayar pada{" "}
                    {selectedPayroll.paid_at
                      ? new Date(selectedPayroll.paid_at).toLocaleDateString("id-ID")
                      : "tanggal tidak tersedia"}
                  </p>
                </div>
              ) : (
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => void handleMarkAsPaid()}
                  disabled={loading}
                  style={{ width: "100%" }}
                >
                  ✓ Tandai Sebagai Dibayar
                </Button>
              )}
            </div>
          </Card>
        </>
      ) : (
        <Card
          className="crud-card"
          glass
          style={{ backgroundColor: "#eff6ff", borderLeft: "4px solid #0284c7" }}
        >
          <h2>● Detail Payroll</h2>
          <p style={{ color: "#0c4a6e", margin: 0 }}>
            Masukkan Payroll ID dan klik "Lihat Detail" untuk menampilkan informasi payroll
          </p>
        </Card>
      )}
    </div>
  );
};

export default PayrollPaymentPage;
