  // Download template User CSV
  const handleDownloadUserTemplate = () => {
    const link = document.createElement("a");
    link.href = "/template_users_final.csv";
    link.download = "template_users_final.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
  };
import { useMemo, useState } from "react";
import { useAuthStore } from "@/app/store/auth.store";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { Alert } from "@/shared/ui/Alert";
import { getErrorMessage } from "@/shared/api/errorHandler";
import { ROLES } from "@/shared/types/rbac.types";
import { Download, FileSpreadsheet, RefreshCw, ShieldAlert, Upload, Users } from "lucide-react";
import {
  importEmployees,
  importUsers,
} from "@/features/admin/api/admin-batch1.service";

import "@/shared/styles/CrudPage.css";
import "./AdminCrudPages.css";

type AlertType = "success" | "error" | "info";

const hasAdminAccess = (user: any) => {
  const roles = Array.isArray(user?.roles) ? user.roles : [];
  return roles.some((role: any) => {
    const roleName = String(role?.name || role || "").toLowerCase();
    return roleName === ROLES.ADMIN || roleName === ROLES.SUPER_ADMIN;
  });
};

const AdminImportPage = () => {
  const user = useAuthStore((state) => state.user);
  const canAccess = hasAdminAccess(user);

  if (!canAccess) {
    return (
      <div className="crud-page">
        <div className="page-header">
          <div className="page-header-title">
            <span className="page-badge">Admin Center</span>
            <h1><ShieldAlert size={22} style={{ display: "inline", verticalAlign: "middle", marginRight: 8 }} />Akses Ditolak</h1>
            <p>Anda tidak memiliki izin untuk mengakses halaman ini.</p>
          </div>
          <a
            href={(import.meta.env.VITE_BASE_URL ? import.meta.env.VITE_BASE_URL : "") + "/import_user_employee_template.txt"}
            download
            style={{ marginLeft: 8, color: '#6366f1', textDecoration: 'underline', fontSize: 14 }}
          >
            Download Template Gabungan (TXT)
          </a>
        </div>
        <Card className="table-card" glass>
          <div className="table-card-inner">
            <p>Silakan hubungi Administrator untuk mendapatkan akses.</p>
          </div>
        </Card>
      </div>
    );
  }

  const [userFile, setUserFile] = useState<File | null>(null);
  const [userRole, setUserRole] = useState<string>("employee");
  const [employeeFile, setEmployeeFile] = useState<File | null>(null);
  // const [downloadingTemplate, setDownloadingTemplate] = useState(false);
  const [submittingUsers, setSubmittingUsers] = useState(false);
  const [submittingEmployees, setSubmittingEmployees] = useState(false);
  const [userImportResult, setUserImportResult] = useState<string | null>(null);
  const [employeeImportResult, setEmployeeImportResult] = useState<string | null>(null);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<AlertType>("info");

  const summaryCards = useMemo(() => {
    const uploadedCount = [userFile, employeeFile].filter(Boolean).length;
    return [
      {
        label: "Template",
        subtitle: "Unduh format import terbaru",
        value: "1",
        change: "Siapkan file sesuai contoh",
        tone: "blue" as const,
        icon: Download,
      },
      {
        label: "File Dipilih",
        subtitle: "Upload users dan employees",
        value: String(uploadedCount),
        change: "Pastikan kolom sesuai template",
        tone: "green" as const,
        icon: FileSpreadsheet,
      },
      {
        label: "Form Aktif",
        subtitle: "Users dan employees import",
        value: "2",
        change: "Keduanya siap diproses",
        tone: "purple" as const,
        icon: Upload,
      },
    ];
  }, [userFile, employeeFile]);

  // (removed handleDownloadTemplate, no longer needed)

  // Download template Employee CSV
  const handleDownloadEmployeeTemplate = () => {
    const link = document.createElement("a");
    link.href = "/template_employee_final.csv";
    link.download = "template_employee_final.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleImportUsers = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!userFile) {
      setAlertMessage("Silakan pilih file users terlebih dahulu.");
      setAlertType("error");
      return;
    }

    setSubmittingUsers(true);
    setAlertMessage("");

    try {
      const result = await importUsers(userFile, userRole);
      setUserImportResult(JSON.stringify(result, null, 2));
      setAlertMessage("Import users berhasil diproses.");
      setAlertType("success");
      setUserFile(null);
      setUserRole("employee");
    } catch (error: unknown) {
      setAlertMessage(getErrorMessage(error as any));
      setAlertType("error");
                       // onClick={handleDownloadTemplate}
      setSubmittingUsers(false);
    }
  };

  const handleImportEmployees = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!employeeFile) {
      setAlertMessage("Silakan pilih file employees terlebih dahulu.");
      setAlertType("error");
      return;
    }

    setSubmittingEmployees(true);
    setAlertMessage("");

    try {
      const formData = new FormData();
      formData.append("file", employeeFile);

      const result = await importEmployees(formData);
      setEmployeeImportResult(JSON.stringify(result, null, 2));
      setAlertMessage("Import employees berhasil diproses.");
      setAlertType("success");
      setEmployeeFile(null);
    } catch (error: unknown) {
      setAlertMessage(getErrorMessage(error as any));
      setAlertType("error");
    } finally {
      setSubmittingEmployees(false);
    }
  };

  return (
    <div className="crud-page">
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-badge">Admin Center</span>
          <h1>Import Center</h1>
          <p>Unduh template, unggah file users maupun employees, dan tinjau hasil proses import langsung dari halaman admin.</p>
        </div>
      </div>

      {/* Improved Template Download Section */}
      <Card className="template-download-card" glass style={{ marginBottom: 24, padding: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: "#374151" }}>Download Template Import</h2>
          <p style={{ margin: 0, color: "#6b7280", fontSize: 15 }}>
            Silakan unduh template berikut sesuai kebutuhan. Pastikan file yang diupload sudah mengikuti struktur kolom pada template.
          </p>
          <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
            <Button
              variant="outline"
              size="md"
              onClick={handleDownloadUserTemplate}
              style={{ borderColor: "#2563eb", color: "#2563eb", fontWeight: 500, minWidth: 200, boxShadow: "0 2px 8px 0 #2563eb22" }}
            >
              <Download size={18} style={{ marginRight: 8 }} />
              Template User
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={handleDownloadEmployeeTemplate}
              style={{ borderColor: "#059669", color: "#059669", fontWeight: 500, minWidth: 200, boxShadow: "0 2px 8px 0 #05966922" }}
            >
              <Download size={18} style={{ marginRight: 8 }} />
              Template Employee
            </Button>
          </div>
        </div>
      </Card>

      <div className="summary-grid">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} className="summary-card" glass>
              <div className="summary-card__header">
                <div>
                  <span className="summary-card__label">{card.label}</span>
                  <p className="summary-card__subtitle">{card.subtitle}</p>
                </div>
                <span className={`summary-card__icon summary-card__icon--${card.tone}`}>
                  <Icon size={20} />
                </span>
              </div>
              <div className={`summary-card__value summary-card__value--${card.tone}`}>{card.value}</div>
              <div className="summary-card__change">{card.change}</div>
            </Card>
          );
        })}
      </div>

      {alertMessage && (
        <Alert
          type={alertType}
          message={alertMessage}
          onClose={() => setAlertMessage("")}
          dismissible
        />
      )}

      {/* Side-by-side import forms */}
      <div style={{ display: "flex", gap: 24, marginTop: 24, flexWrap: "wrap" }}>
        <Card className="table-card" glass style={{ flex: 1, minWidth: 340 }}>
          <div className="table-header-bar">
            <h3>Import Users</h3>
            <span className="table-count">{userFile ? userFile.name : "Belum ada file dipilih"}</span>
          </div>
          <div className="table-card-inner">
            <form className="crud-form" onSubmit={handleImportUsers}>
              <div className="crud-form-grid">
                <label className="crud-form-full">
                  File Users
                  <input
                    className="crud-input"
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={(event) => setUserFile(event.target.files?.[0] || null)}
                  />
                  <span className="crud-note">Gunakan template resmi agar struktur kolom sesuai dengan backend.</span>
                </label>
                <label className="crud-form-full">
                  Role Users
                  <select
                    className="crud-input"
                    value={userRole}
                    onChange={e => setUserRole(e.target.value)}
                  >
                    <option value="employee">employee</option>
                    <option value="admin">admin</option>
                    <option value="super_admin">super_admin</option>
                  </select>
                  <span className="crud-note">Pilih role user yang akan diimport.</span>
                </label>
              </div>
              <div className="crud-actions">
                <Button type="submit" variant="primary" size="md" disabled={submittingUsers}>
                  <Users size={16} />
                  {submittingUsers ? "Mengimpor..." : "Import Users"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="md"
                  onClick={() => {
                    setUserFile(null);
                    setUserImportResult(null);
                  }}
                  disabled={submittingUsers}
                >
                  <RefreshCw size={16} />
                  Reset
                </Button>
              </div>
              {userImportResult !== null && (
                <pre className="crud-response">{userImportResult}</pre>
              )}
            </form>
          </div>
        </Card>
        <Card className="table-card" glass style={{ flex: 1, minWidth: 340 }}>
          <div className="table-header-bar">
            <h3>Import Employees</h3>
            <span className="table-count">{employeeFile ? employeeFile.name : "Belum ada file dipilih"}</span>
          </div>
          <div className="table-card-inner">
            <form className="crud-form" onSubmit={handleImportEmployees}>
              <div className="crud-form-grid">
                <label className="crud-form-full">
                  File Employees
                  <input
                    className="crud-input"
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={(event) => setEmployeeFile(event.target.files?.[0] || null)}
                  />
                  <span className="crud-note">Pastikan data employee sudah mengikuti format field pada template import.</span>
                </label>
              </div>
              <div className="crud-actions">
                <Button type="submit" variant="primary" size="md" disabled={submittingEmployees}>
                  <Upload size={16} />
                  {submittingEmployees ? "Mengimpor..." : "Import Employees"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="md"
                  onClick={() => {
                    setEmployeeFile(null);
                    setEmployeeImportResult(null);
                  }}
                  disabled={submittingEmployees}
                >
                  <RefreshCw size={16} />
                  Reset
                </Button>
              </div>
              {employeeImportResult !== null && (
                <pre className="crud-response">{employeeImportResult}</pre>
              )}
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminImportPage;