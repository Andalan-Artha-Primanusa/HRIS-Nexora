import { useEffect, useState } from "react";
import { BarChart3, Plus, Pencil, Trash2, ArrowLeft, RefreshCw, AlertCircle, Info, UserCircle } from "lucide-react";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { Modal } from "@/shared/ui/Modal";
import { payrollService, toSafeArray } from "@/features/payroll/api/payroll.service";
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
  const [view, setView] = useState<"list" | "form">("list");
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
      const [employeesData, payrollsData] = await Promise.all([
        getAllEmployees(),
        payrollService.getPayrollList()
      ]);
      setEmployees(toSafeArray(employeesData));
      setPayrolls(toSafeArray(payrollsData));
      setMessage(null);
    } catch (error) {
      const errorText = error instanceof Error ? error.message : "Gagal memuat data";
      setMessage({ type: "error", text: errorText });
    } finally {
      setLoading(false);
    }
  };

  const openCreateForm = () => {
    setForm(DEFAULT_FORM);
    setMode("create");
    setView("form");
    setMessage(null);
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
    setView("form");
  };

  const showErrorModal = (title: string, messageText: string) => {
    setErrorModal({ isOpen: true, title, message: messageText });
  };

  const handleSave = async () => {
    if (mode === "create") await handleCreate();
    else if (mode === "edit") await handleUpdate();
    else if (mode === "delete") await handleDelete();
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

    setLoading(true);
    try {
      const payload: PayrollCreatePayload = {
        employee_id: Number(form.employee_id),
        period: form.period,
        allowance: Number(form.allowance) || 0,
        bonus: Number(form.bonus) || 0,
      };

      await payrollService.createPayroll(payload);
      setMessage({ type: "success", text: "Payroll berhasil dibuat" });
      setView("list");
      await loadData();
    } catch (error) {
      const errorText = error instanceof Error ? error.message : "Gagal membuat payroll";
      showErrorModal("Error Membuat Payroll", errorText);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const payload: PayrollUpdatePayload = {
        allowance: Number(form.allowance) || 0,
        bonus: Number(form.bonus) || 0,
      };
      const payrollId = String(form.id).replace(/^[A-Z]+/, "").replace(/^0+/, "") || form.id;
      await payrollService.updatePayroll(payrollId, payload);
      setMessage({ type: "success", text: "Payroll berhasil diupdate" });
      setView("list");
      await loadData();
    } catch (error) {
      const errorText = error instanceof Error ? error.message : "Gagal update payroll";
      showErrorModal("Error Update Payroll", errorText);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const payrollId = String(form.id).replace(/^[A-Z]+/, "").replace(/^0+/, "") || form.id;
      await payrollService.deletePayroll(payrollId);
      setMessage({ type: "success", text: "Payroll berhasil dihapus" });
      setView("list");
      await loadData();
    } catch (error) {
      const errorText = error instanceof Error ? error.message : "Gagal hapus payroll";
      showErrorModal("Error Hapus Payroll", errorText);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setView("list");
    setForm(DEFAULT_FORM);
    setSelectedPayrollId("");
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

      <div className="page-header">
        <div className="page-header-title">
          <span className="page-badge">Payroll Operations</span>
          <h1>Kelola Payroll</h1>
          <p>Administer employee payroll records with precision. Create, update, or remove entries with a streamlined workflow.</p>
        </div>
        <div className="page-header-actions">
          <Button variant="outline" size="md" onClick={() => void loadData()} disabled={loading}>
            <RefreshCw className={loading ? "animate-spin" : ""} size={16} />
            Sync
          </Button>
          {view === 'list' && (
            <Button variant="primary" size="md" onClick={openCreateForm}>
              <Plus size={16} />
              Tambah Payroll
            </Button>
          )}
        </div>
      </div>

      {message && message.type === "success" && (
        <Card className="crud-card" glass style={{ borderLeft: '4px solid #10b981', background: 'rgba(16, 185, 129, 0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertCircle color="#10b981" size={20} />
            <p style={{ color: "#065f46", margin: 0, fontWeight: "600" }}>{message.text}</p>
          </div>
        </Card>
      )}

      {view === "list" ? (
        <div className="white-unified-wrapper">
          <div className="wuw-header">
            <div className="wuw-header-top">
              <div className="wuw-title-area">
                <h3>Daftar Payroll Karyawan</h3>
                <span className="wuw-count-badge">{payrolls.length} Total</span>
              </div>
            </div>
          </div>

          <div className="wuw-table-area">
            <div className="crud-table-wrap">
              <table className="crud-table">
                <thead>
                  <tr>
                    <th>Karyawan</th>
                    <th>Periode</th>
                    <th>Gaji Pokok</th>
                    <th>Tunjangan</th>
                    <th>Bonus</th>
                    <th>Take Home Pay</th>
                    <th style={{ textAlign: 'center' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {payrolls.length > 0 ? (
                    payrolls.map((payroll) => (
                      <tr key={payroll.id} className={selectedPayrollId === String(payroll.id) ? "is-selected" : ""}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <UserCircle size={32} color="#94a3b8" />
                            <div style={{ fontWeight: '700' }}>{getEmployeeName(String(payroll.employee_id))}</div>
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: '500', color: '#64748b' }}>
                            {new Date(payroll.period + '-01').toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                          </div>
                        </td>
                        <td>Rp {Number(payroll.basic_salary || 0).toLocaleString("id-ID")}</td>
                        <td>Rp {Number(payroll.allowance || 0).toLocaleString("id-ID")}</td>
                        <td style={{ color: '#10b981', fontWeight: '600' }}>Rp {Number(payroll.bonus || 0).toLocaleString("id-ID")}</td>
                        <td style={{ fontWeight: '800', color: 'var(--primary)' }}>Rp {Number(payroll.take_home_pay || 0).toLocaleString("id-ID")}</td>
                        <td style={{ textAlign: 'center' }}>
                          <div className="action-btn-group" style={{ justifyContent: 'center' }}>
                            <button onClick={() => selectPayroll(payroll, "edit")} className="action-btn action-btn-edit" title="Edit">
                              <Pencil size={16} />
                            </button>
                            <button onClick={() => selectPayroll(payroll, "delete")} className="action-btn action-btn-delete" title="Delete">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="crud-empty-row">Belum ada data payroll. Klik "Tambah Payroll" untuk memulai.</td>
                  </tr>
                )}
              </tbody>
            </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="form-view-container">
          <Card className="crud-card" glass>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
              <button onClick={handleBack} className="action-btn" style={{ background: '#f1f5f9', color: '#64748b' }}>
                <ArrowLeft size={18} />
              </button>
              <h2 style={{ marginBottom: 0 }}>
                {mode === "create" && "Entri Payroll Baru"}
                {mode === "edit" && "Perbarui Data Payroll"}
                {mode === "delete" && "Konfirmasi Penghapusan"}
              </h2>
            </div>

            {mode !== "delete" ? (
              <div className="crud-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <label style={{ gridColumn: '1 / -1' }}>
                  <strong>Karyawan *</strong>
                  <select
                    className="crud-input"
                    value={form.employee_id}
                    onChange={(e) => setForm((prev) => ({ ...prev, employee_id: e.target.value }))}
                    disabled={mode === "edit"}
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
                  <strong>Periode Pembayaran *</strong>
                  <input
                    type="month"
                    className="crud-input"
                    value={form.period}
                    onChange={(e) => setForm((prev) => ({ ...prev, period: e.target.value }))}
                    disabled={mode === "edit"}
                  />
                </label>

                <label>
                  <strong>Tunjangan Tambahan</strong>
                  <input
                    type="number"
                    className="crud-input"
                    value={form.allowance}
                    onChange={(e) => setForm((prev) => ({ ...prev, allowance: e.target.value }))}
                    placeholder="Contoh: 1500000"
                  />
                </label>

                <label>
                  <strong>Bonus / Insentif</strong>
                  <input
                    type="number"
                    className="crud-input"
                    value={form.bonus}
                    onChange={(e) => setForm((prev) => ({ ...prev, bonus: e.target.value }))}
                    placeholder="Contoh: 500000"
                  />
                </label>

                <div style={{ gridColumn: '1 / -1' }}>
                  <Card glass className="crud-info-card">
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <Info size={20} />
                      <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.5' }}>
                        Gaji pokok akan otomatis diambil dari profil karyawan saat payroll di-generate. 
                        Tunjangan dan bonus di sini adalah nilai tambahan manual.
                      </p>
                    </div>
                  </Card>
                </div>
              </div>
            ) : (
              <div className="crud-warning-card">
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <Trash2 size={24} color="#f43f5e" />
                  <div>
                    <p style={{ fontWeight: '700', fontSize: '1.1rem', color: '#991b1b', marginBottom: '0.5rem' }}>Hapus data payroll ini?</p>
                    <p style={{ margin: 0, color: '#b91c1c' }}>
                      Anda akan menghapus payroll untuk <strong>{getEmployeeName(form.employee_id)}</strong> periode <strong>{form.period}</strong>. 
                      Tindakan ini permanen dan tidak dapat dibatalkan.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="crud-actions" style={{ marginTop: '3rem', borderTop: '1px solid #f1f5f9', paddingTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <Button variant="outline" size="lg" onClick={handleBack} disabled={loading} style={{ borderRadius: '12px' }}>
                Batal
              </Button>
              <Button 
                variant={mode === "delete" ? "ghost" : "primary"} 
                size="lg" 
                onClick={() => void handleSave()} 
                disabled={loading}
                style={{ 
                  borderRadius: '12px', 
                  minWidth: '200px', 
                  fontWeight: '700',
                  background: mode === 'delete' ? '#ef4444' : 'var(--primary)',
                  color: 'white',
                  border: 'none'
                }}
              >
                {loading ? "Memproses..." : mode === "create" ? "Buat Payroll" : mode === "edit" ? "Simpan Perubahan" : "Hapus Permanen"}
              </Button>
            </div>
          </Card>
        </div>
        </div>
      )}
    </div>
  );
};

export default PayrollCrudPage;
