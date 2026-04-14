import { useEffect, useState } from "react";
import { BarChart3 } from "lucide-react";
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
import "./PayrollCrudPage.css";

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
  period: new Date().toISOString().slice(0, 7),
  allowance: "",
  bonus: "",
};

const PayrollCrudPage = () => {
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

  const showErrorModal = (title: string, messageText: string) => {
    setErrorModal({ isOpen: true, title, message: messageText });
  };

  const handleCreate = async () => {
    if (!form.employee_id) {
      showErrorModal("Validasi", "Pilih karyawan terlebih dahulu");
      return;
    }

    if (!form.period) {
      showErrorModal("Validasi", "Masukkan periode (YYYY-MM)");
      return;
    }

    const existingPayroll = payrolls.find(
      (payroll: PayrollItem) => String(payroll.employee_id) === String(form.employee_id) && payroll.period === form.period
    );

    if (existingPayroll) {
      showErrorModal(
        "Payroll Sudah Ada",
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

      await createPayroll(payload);
      setMessage({ type: "success", text: "Payroll berhasil dibuat" });
      setForm(DEFAULT_FORM);
      setMode("create");
      await loadData();
    } catch (error) {
      const errorText = error instanceof Error ? error.message : "Gagal membuat payroll";
      showErrorModal("Error Membuat Payroll", errorText);
    } finally {
      setLoading(false);
    }
  };

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
      const payrollId = String(id).replace(/^[A-Z]+/, "").replace(/^0+/, "") || id;
      await updatePayroll(payrollId, payload);
      setMessage({ type: "success", text: "Payroll berhasil diupdate" });
      setForm(DEFAULT_FORM);
      setSelectedPayrollId("");
      setMode("create");
      await loadData();
    } catch (error) {
      const errorText = error instanceof Error ? error.message : "Gagal update payroll";
      showErrorModal("Error Update Payroll", errorText);
    } finally {
      setLoading(false);
    }
  };

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
      const payrollId = String(id).replace(/^[A-Z]+/, "").replace(/^0+/, "") || id;
      await deletePayroll(payrollId);
      setMessage({ type: "success", text: "Payroll berhasil dihapus" });
      setForm(DEFAULT_FORM);
      setSelectedPayrollId("");
      setMode("create");
      await loadData();
    } catch (error) {
      const errorText = error instanceof Error ? error.message : "Gagal hapus payroll";
      showErrorModal("Error Hapus Payroll", errorText);
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
    const employee = employees.find((entry) => String(entry.id) === empId);
    return employee ? `${employee.employee_code} - ${employee.user?.name || "Unknown"}` : "N/A";
  };

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

      <Card className="crud-header-card" glass>
        <div className="crud-header">
          <div className="crud-header-copy">
            <p className="crud-page-badge">Payroll Center</p>
            <div className="crud-header-title-row">
              <span className="crud-header-icon">
                <BarChart3 size={18} />
              </span>
              <h1>Kelola Payroll</h1>
            </div>
            <p>
              Buat, edit, dan hapus data payroll karyawan dengan tampilan yang rapi, konsisten, dan mudah dipindai.
            </p>
          </div>
          <Button variant="outline" size="md" onClick={() => void loadData()} disabled={loading}>
            Segarkan
          </Button>
        </div>
      </Card>

      {message && message.type === "success" && (
        <Card
          className="crud-card"
          glass
          style={{
            backgroundColor: "#f0fdf4",
            borderLeft: "4px solid #10b981",
            marginBottom: "20px",
          }}
        >
          <p style={{ color: "#065f46", margin: 0, fontWeight: "500" }}>{message.text}</p>
        </Card>
      )}

      <Card className="crud-card" glass>
        <h2>Daftar Payroll</h2>
        <div className="crud-table-wrap">
          <table className="crud-table">
            <thead>
              <tr>
                <th>Karyawan</th>
                <th>Periode</th>
                <th className="text-right">Tunjangan</th>
                <th className="text-right">Bonus</th>
                <th className="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {payrolls.length > 0 ? (
                payrolls.slice(0, 10).map((payroll) => (
                  <tr
                    key={payroll.id}
                    className={selectedPayrollId === String(payroll.id) ? "is-selected" : ""}
                  >
                    <td>
                      <strong>{getEmployeeName(String(payroll.employee_id))}</strong>
                    </td>
                    <td>{payroll.period}</td>
                    <td className="text-right">Rp {Number(payroll.allowance || 0).toLocaleString("id-ID")}</td>
                    <td className="text-right">Rp {Number(payroll.bonus || 0).toLocaleString("id-ID")}</td>
                    <td className="text-center">
                      <button
                        type="button"
                        onClick={() => selectPayroll(payroll, "edit")}
                        className="crud-inline-button crud-inline-button--primary"
                        disabled={loading}
                      >
                        Ubah
                      </button>
                      <button
                        type="button"
                        onClick={() => selectPayroll(payroll, "delete")}
                        className="crud-inline-button crud-inline-button--danger"
                        disabled={loading}
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="crud-empty-row">
                    Belum ada payroll
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="crud-card" glass>
        <h2>
          {mode === "create" && "Tambah Payroll Baru"}
          {mode === "edit" && "Edit Payroll"}
          {mode === "delete" && "Hapus Payroll"}
        </h2>

        {mode === "create" && (
          <div className="crud-form-grid">
            <label>
              <strong>Pilih Karyawan *</strong>
              <select
                className="crud-input"
                value={form.employee_id}
                onChange={(e) => setForm((prev) => ({ ...prev, employee_id: e.target.value }))}
              >
                <option value="">-- Pilih Karyawan --</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={String(employee.id)}>
                    {employee.employee_code} - {employee.user?.name || "Unknown"}
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

            {form.employee_id && form.period && (() => {
              const existingPayroll = payrolls.find(
                (payroll: PayrollItem) =>
                  String(payroll.employee_id) === String(form.employee_id) && payroll.period === form.period
              );

              if (!existingPayroll) {
                return null;
              }

              return (
                <Card glass className="crud-warning-card crud-form-full">
                  <p className="crud-warning-title">Payroll sudah ada untuk periode ini!</p>
                  <p className="crud-warning-text">
                    ID: {existingPayroll.id} | Periode: {existingPayroll.period}
                  </p>
                  <p className="crud-warning-text">
                    Gaji Pokok: Rp {Number(existingPayroll.basic_salary || 0).toLocaleString("id-ID")}
                  </p>
                  <p className="crud-warning-text">Status: {existingPayroll.status}</p>
                  <p className="crud-warning-note">
                    Klik Ubah di tabel di atas jika ingin mengubah, atau pilih periode lain.
                  </p>
                </Card>
              );
            })()}
          </div>
        )}

        {mode === "edit" && (
          <div className="crud-form-grid">
            <div className="crud-info-card crud-form-full">
              <strong>ID Payroll:</strong> {form.id} | <strong>Karyawan:</strong> {getEmployeeName(form.employee_id)}
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
          <div className="crud-warning-card crud-warning-card--danger">
            <p className="crud-warning-title">Anda akan menghapus payroll ini:</p>
            <p className="crud-warning-text">
              ID: {form.id} | Karyawan: {getEmployeeName(form.employee_id)} | Periode: {form.period}
            </p>
            <p className="crud-warning-note">Tindakan ini tidak bisa dibatalkan!</p>
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
            <Button variant="ghost" size="md" onClick={() => void handleDelete()} disabled={loading}>
              Hapus Permanen
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
