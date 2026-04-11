import { useEffect, useState } from "react";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { Modal } from "@/shared/ui/Modal";
import {
  createPayroll,
  deletePayroll,
  getAllPayroll,
  updatePayroll,
} from "@/features/payroll/api/payroll.service";
import { getAllEmployees } from "@/features/employee/api/employee.service";
import type { PayrollCreatePayload, PayrollUpdatePayload, PayrollItem } from "@/features/payroll/types/payroll.types";
import type { EmployeeItem } from "@/features/employee/types/employee.types";
import "../admin/AdminCrudPages.css";

type PayrollFormState = {
  id: string;
  employee_id: string;
  period: string;
  allowance: string;
  bonus: string;
};

const DEFAULT_FORM: PayrollFormState = {
  id: "",
  employee_id: "",
  period: new Date().toISOString().slice(0, 7), // YYYY-MM format
  allowance: "",
  bonus: "",
};

const PayrollCrudPage = () => {
  // States
  const [employees, setEmployees] = useState<EmployeeItem[]>([]);
  const [payrolls, setPayrolls] = useState<PayrollItem[]>([]);
  const [form, setForm] = useState<PayrollFormState>(DEFAULT_FORM);
  const [selectedPayrollId, setSelectedPayrollId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"create" | "edit" | "delete">("create");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [errorModal, setErrorModal] = useState<{ isOpen: boolean; title: string; message: string }>({
    isOpen: false,
    title: "",
    message: "",
  });

  // Load employees and payrolls
  const loadData = async () => {
    setLoading(true);
    try {
      const [employeesData, payrollsData] = await Promise.all([getAllEmployees(), getAllPayroll()]);
      setEmployees(employeesData);
      setPayrolls(payrollsData);
      setMessage(null);
    } catch (error) {
      const errorText = error instanceof Error ? error.message : "Gagal memuat data";
      setMessage({ type: "error", text: errorText });
    } finally {
      setLoading(false);
    }
  };

  // Select payroll for edit/delete
  const selectPayroll = (payroll: PayrollItem, action: "edit" | "delete") => {
    setSelectedPayrollId(String(payroll.id));
    setForm({
      id: String(payroll.id),
      employee_id: String(payroll.employee_id),
      period: payroll.period,
      allowance: String(payroll.allowance || ""),
      bonus: String(payroll.bonus || ""),
    });
    setMode(action);
  };

  const showErrorModal = (title: string, message: string) => {
    setErrorModal({ isOpen: true, title, message });
  };

  // Create payroll
  const handleCreate = async () => {
    if (!form.employee_id) {
      showErrorModal("Validasi", "Pilih karyawan terlebih dahulu");
      return;
    }

    if (!form.period) {
      showErrorModal("Validasi", "Masukkan periode (YYYY-MM)");
      return;
    }

    // Check if payroll for this period already exists
    const existingPayroll = payrolls.find(
      (p: PayrollItem) => String(p.employee_id) === String(form.employee_id) && p.period === form.period
    );
    if (existingPayroll) {
      showErrorModal(
        "⚠️ Payroll Sudah Ada",
        `Payroll untuk periode ${existingPayroll.period} karyawan ini sudah ada (ID: ${existingPayroll.id}).\n\nGaji Pokok: Rp ${Number(
          existingPayroll.basic_salary || 0
        ).toLocaleString("id-ID")}\nStatus: ${existingPayroll.status}\n\nSilakan gunakan Edit di tabel atau pilih periode berbeda.`
      );
      return;
    }

    setLoading(true);
    try {
      const payload: PayrollCreatePayload = {
        employee_id: Number(form.employee_id),
        period: form.period,
        allowance: Number(form.allowance) || 0,
        bonus: Number(form.bonus) || 0,
      };
      console.log("📝 Form data sebelum create:", { form, payload });
      await createPayroll(payload);
      setMessage({ type: "success", text: "✓ Payroll berhasil dibuat" });
      setForm(DEFAULT_FORM);
      setMode("create");
      await loadData();
    } catch (error) {
      const errorText = error instanceof Error ? error.message : "Gagal membuat payroll";
      showErrorModal("❌ Error Membuat Payroll", errorText);
    } finally {
      setLoading(false);
    }
  };

  // Update payroll
  const handleUpdate = async () => {
    const id = form.id.trim();
    if (!id) {
      showErrorModal("Validasi", "Pilih payroll terlebih dahulu untuk di-update");
      return;
    }

    setLoading(true);
    try {
      const payload: PayrollUpdatePayload = {
        allowance: Number(form.allowance) || 0,
        bonus: Number(form.bonus) || 0,
      };
      // Extract numeric ID if prefixed (e.g., "P003" -> "3")
      const payrollId = String(id).replace(/^[A-Z]+/, "").replace(/^0+/, "") || id;
      await updatePayroll(payrollId, payload);
      setMessage({ type: "success", text: "✓ Payroll berhasil diupdate" });
      setForm(DEFAULT_FORM);
      setSelectedPayrollId("");
      setMode("create");
      await loadData();
    } catch (error) {
      const errorText = error instanceof Error ? error.message : "Gagal update payroll";
      showErrorModal("❌ Error Update Payroll", errorText);
    } finally {
      setLoading(false);
    }
  };

  // Delete payroll
  const handleDelete = async () => {
    const id = form.id.trim();
    if (!id) {
      showErrorModal("Validasi", "Pilih payroll terlebih dahulu untuk dihapus");
      return;
    }

    if (!window.confirm("Apakah Anda yakin ingin menghapus payroll ini?")) {
      return;
    }

    setLoading(true);
    try {
      // Extract numeric ID if prefixed (e.g., "P003" -> "3")
      const payrollId = String(id).replace(/^[A-Z]+/, "").replace(/^0+/, "") || id;
      await deletePayroll(payrollId);
      setMessage({ type: "success", text: "✓ Payroll berhasil dihapus" });
      setForm(DEFAULT_FORM);
      setSelectedPayrollId("");
      setMode("create");
      await loadData();
    } catch (error) {
      const errorText = error instanceof Error ? error.message : "Gagal hapus payroll";
      showErrorModal("❌ Error Hapus Payroll", errorText);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm(DEFAULT_FORM);
    setSelectedPayrollId("");
    setMode("create");
    setMessage(null);
  };

  useEffect(() => {
    void loadData();
  }, []);

  const getEmployeeName = (empId: string) => {
    const emp = employees.find((e) => String(e.id) === empId);
    return emp ? `${emp.employee_code} - ${emp.user?.name || "Unknown"}` : "N/A";
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
          <h1>Kelola Payroll</h1>
          <p>Pilih karyawan atau payroll yang ingin dikelola</p>
        </div>
        <Button variant="outline" size="md" onClick={() => void loadData()} disabled={loading}>
          Refresh
        </Button>
      </div>

      {/* Success Message Alert */}
      {message && message.type === "success" && (
        <Card
          className="crud-card"
          glass
          style={{
            backgroundColor: "#dbeafe",
            borderLeft: `4px solid #0284c7`,
          }}
        >
          <p style={{ color: "#0c4a6e", margin: 0 }}>
            {message.text}
          </p>
        </Card>
      )}

      {/* Daftar Payroll Existing */}
      <Card className="crud-card" glass>
        <h2>📋 Daftar Payroll Existing</h2>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ backgroundColor: "#f3f4f6" }}>
              <tr>
                <th style={{ padding: "8px", textAlign: "left", fontSize: "0.85rem" }}>Employee</th>
                <th style={{ padding: "8px", textAlign: "left", fontSize: "0.85rem" }}>Periode</th>
                <th style={{ padding: "8px", textAlign: "right", fontSize: "0.85rem" }}>Tunjangan</th>
                <th style={{ padding: "8px", textAlign: "right", fontSize: "0.85rem" }}>Bonus</th>
                <th style={{ padding: "8px", textAlign: "center", fontSize: "0.85rem" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {payrolls.length > 0 ? (
                payrolls.slice(0, 10).map((p) => (
                  <tr
                    key={p.id}
                    style={{
                      borderBottom: "1px solid #e5e7eb",
                      backgroundColor: selectedPayrollId === String(p.id) ? "#fef3c7" : "transparent",
                    }}
                  >
                    <td style={{ padding: "8px" }}>
                      <strong>{getEmployeeName(String(p.employee_id))}</strong>
                    </td>
                    <td style={{ padding: "8px" }}>{p.period}</td>
                    <td style={{ padding: "8px", textAlign: "right" }}>
                      Rp {Number(p.allowance || 0).toLocaleString("id-ID")}
                    </td>
                    <td style={{ padding: "8px", textAlign: "right" }}>
                      Rp {Number(p.bonus || 0).toLocaleString("id-ID")}
                    </td>
                    <td style={{ padding: "8px", textAlign: "center" }}>
                      <button
                        onClick={() => selectPayroll(p, "edit")}
                        style={{
                          padding: "4px 8px",
                          marginRight: "4px",
                          backgroundColor: "#3b82f6",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "0.8rem",
                        }}
                        disabled={loading}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => selectPayroll(p, "delete")}
                        style={{
                          padding: "4px 8px",
                          backgroundColor: "#ef4444",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "0.8rem",
                        }}
                        disabled={loading}
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ padding: "16px", textAlign: "center", color: "#999" }}>
                    Belum ada payroll
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Form */}
      <Card className="crud-card" glass>
        <h2>
          {mode === "create" && "➕ Tambah Payroll Baru"}
          {mode === "edit" && "✏️ Edit Payroll"}
          {mode === "delete" && "🗑️ Hapus Payroll"}
        </h2>

        {mode === "create" && (
          <div className="crud-form-grid">
            <label>
              <strong>Pilih Karyawan *</strong>
              <select
                className="crud-input"
                value={form.employee_id}
                onChange={(e) => setForm((prev) => ({ ...prev, employee_id: e.target.value }))}
                style={{ cursor: "pointer" }}
              >
                <option value="">-- Pilih Karyawan --</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={String(emp.id)}>
                    {emp.employee_code} - {emp.user?.name || "Unknown"}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <strong>Periode (YYYY-MM) *</strong>
              <input
                type="month"
                className="crud-input"
                value={form.period}
                onChange={(e) => setForm((prev) => ({ ...prev, period: e.target.value }))}
              />
            </label>

            <label>
              <strong>Tunjangan</strong>
              <input
                type="number"
                className="crud-input"
                value={form.allowance}
                onChange={(e) => setForm((prev) => ({ ...prev, allowance: e.target.value }))}
                placeholder="Contoh: 2000000"
              />
            </label>

            <label>
              <strong>Bonus</strong>
              <input
                type="number"
                className="crud-input"
                value={form.bonus}
                onChange={(e) => setForm((prev) => ({ ...prev, bonus: e.target.value }))}
                placeholder="Contoh: 500000"
              />
            </label>

            {/* Show existing payroll for selected employee & period */}
            {form.employee_id && form.period && (
              <div style={{ gridColumn: "1 / -1" }}>
                {(() => {
                  const existingPayroll = payrolls.find(
                    (p: PayrollItem) =>
                      String(p.employee_id) === String(form.employee_id) &&
                      p.period === form.period
                  );
                  if (existingPayroll) {
                    return (
                      <Card
                        glass
                        style={{
                          backgroundColor: "#fef3c7",
                          borderLeft: "4px solid #f59e0b",
                          padding: "12px",
                        }}
                      >
                        <p style={{ margin: "0 0 8px 0", fontSize: "0.85rem", color: "#92400e" }}>
                          <strong>⚠️ Payroll sudah ada untuk periode ini!</strong>
                        </p>
                        <p style={{ margin: "0 0 4px 0", fontSize: "0.8rem", color: "#92400e" }}>
                          ID: {existingPayroll.id} | Periode: {existingPayroll.period}
                        </p>
                        <p style={{ margin: "0 0 4px 0", fontSize: "0.8rem", color: "#92400e" }}>
                          Gaji Pokok: Rp {Number(existingPayroll.basic_salary || 0).toLocaleString("id-ID")}
                        </p>
                        <p style={{ margin: "0 0 4px 0", fontSize: "0.8rem", color: "#92400e" }}>
                          Status: {existingPayroll.status}
                        </p>
                        <p style={{ margin: "8px 0 0 0", fontSize: "0.75rem", color: "#92400e", fontStyle: "italic" }}>
                          Klik Edit di tabel di atas jika ingin mengubah, atau pilih periode lain.
                        </p>
                      </Card>
                    );
                  }
                  return null;
                })()}
              </div>
            )}
          </div>
        )}

        {mode === "edit" && (
          <div className="crud-form-grid">
            <div style={{ gridColumn: "1 / -1" }}>
              <strong>Payroll ID:</strong> {form.id} | <strong>Karyawan:</strong> {getEmployeeName(form.employee_id)}
            </div>

            <label>
              <strong>Periode</strong>
              <input
                type="month"
                className="crud-input"
                value={form.period}
                onChange={(e) => setForm((prev) => ({ ...prev, period: e.target.value }))}
                disabled
              />
            </label>

            <label>
              <strong>Tunjangan</strong>
              <input
                type="number"
                className="crud-input"
                value={form.allowance}
                onChange={(e) => setForm((prev) => ({ ...prev, allowance: e.target.value }))}
              />
            </label>

            <label>
              <strong>Bonus</strong>
              <input
                type="number"
                className="crud-input"
                value={form.bonus}
                onChange={(e) => setForm((prev) => ({ ...prev, bonus: e.target.value }))}
              />
            </label>
          </div>
        )}

        {mode === "delete" && (
          <div style={{ padding: "20px", backgroundColor: "#fef3c7", borderRadius: "8px", marginBottom: "20px" }}>
            <p style={{ margin: 0, color: "#7c2d12" }}>
              <strong>⚠️ Anda akan menghapus payroll ini:</strong>
            </p>
            <p style={{ margin: "8px 0", color: "#7c2d12" }}>
              ID: {form.id} | Karyawan: {getEmployeeName(form.employee_id)} | Periode: {form.period}
            </p>
            <p style={{ margin: 0, color: "#7c2d12" }}>Tindakan ini tidak bisa dibatalkan!</p>
          </div>
        )}

        <div className="crud-actions">
          {mode === "create" && (
            <Button variant="primary" size="md" onClick={() => void handleCreate()} disabled={loading}>
              Buat Payroll
            </Button>
          )}
          {mode === "edit" && (
            <Button variant="secondary" size="md" onClick={() => void handleUpdate()} disabled={loading}>
              Simpan Perubahan
            </Button>
          )}
          {mode === "delete" && (
            <Button
              variant="ghost"
              size="md"
              onClick={() => void handleDelete()}
              disabled={loading}
              style={{ backgroundColor: "#ef4444", color: "white" }}
            >
              ✓ Hapus Permanen
            </Button>
          )}

          <Button variant="outline" size="md" onClick={handleReset} disabled={loading}>
            Reset / Batal
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default PayrollCrudPage;
