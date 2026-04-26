import { useMemo, useState } from "react";
import { useAuthStore } from "@/app/store/auth.store";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { Alert } from "@/shared/ui/Alert";
import { getErrorMessage } from "@/shared/api/errorHandler";
import { ROLES } from "@/shared/types/rbac.types";
import { Download, FileSpreadsheet, RefreshCw, ShieldAlert, Upload, Users, UploadCloud } from "lucide-react";
import {
  importEmployees,
  importUsers,
} from "@/features/admin/api/admin-batch1.service";

import "@/shared/styles/CrudPage.css";
import "@/pages/dashboard/overview/OverviewPage.css";
import "@/pages/payroll/PayrollShared.css";
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
        <Card className="hero-card">
          <div className="hero-card-inner">
            <div className="hero-content">
              <div className="hero-badge">
                <ShieldAlert size={16} />
                <span>Admin Center</span>
              </div>
              <h1 className="hero-title">Akses Ditolak</h1>
              <p className="hero-subtitle">
                Anda tidak memiliki izin untuk mengakses halaman ini.
              </p>
            </div>
          </div>
        </Card>
        <div className="white-unified-wrapper">
          <Card glass style={{ padding: '2rem', textAlign: 'center' }}>
            <p style={{ color: '#64748b' }}>Silakan hubungi Administrator untuk mendapatkan akses.</p>
            <a
              href={(import.meta.env.VITE_BASE_URL ? import.meta.env.VITE_BASE_URL : "") + "/import_user_employee_template.txt"}
              download
              style={{ marginTop: '1rem', color: '#6366f1', textDecoration: 'underline', fontSize: 14, display: 'inline-block' }}
            >
              Download Template Gabungan (TXT)
            </a>
          </Card>
        </div>
      </div>
    );
  }

  const [userFile, setUserFile] = useState<File | null>(null);
  const [userRole, setUserRole] = useState<string>("employee");
  const [employeeFile, setEmployeeFile] = useState<File | null>(null);
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

  const handleDownloadUserTemplate = () => {
    const link = document.createElement("a");
    link.href = "/template_users_final.csv";
    link.download = "template_users_final.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

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
      <Card className="hero-card">
        <div className="hero-card-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <UploadCloud size={16} />
              <span>Admin Center</span>
            </div>
            <h1 className="hero-title">Import Data</h1>
            <p className="hero-subtitle">
              Unduh template, unsubgah file users maupun employees, dan tinjau hasil proses import langsung dari halaman admin.
            </p>
          </div>
        </div>
      </Card>

      <div className="white-unified-wrapper">
        <Card glass style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#374151' }}>Download Template Import</h3>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
              Silakan unduh template berikut sesuai kebutuhan. Pastikan file yang diupload sudah mengikuti struktur kolom pada template.
            </p>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem' }}>
              <Button
                variant="outline"
                size="md"
                onClick={handleDownloadUserTemplate}
                style={{ borderColor: '#2563eb', color: '#2563eb', fontWeight: 500 }}
              >
                <Download size={16} style={{ marginRight: 8 }} />
                Template User
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={handleDownloadEmployeeTemplate}
                style={{ borderColor: '#059669', color: '#059669', fontWeight: 500 }}
              >
                <Download size={16} style={{ marginRight: 8 }} />
                Template Employee
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <div className="leave-requests-wrapper">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="leave-summary-card">
              <div className="leave-summary-header">
                <div>
                  <p className="leave-summary-label">{card.label}</p>
                  <p className="leave-summary-subtitle">{card.subtitle}</p>
                </div>
                <div className={`leave-summary-icon-wrapper leave-icon-${card.tone === 'blue' ? 'blue' : card.tone === 'green' ? 'green' : 'purple'}`}>
                  <Icon size={28} />
                </div>
              </div>
              <div className={`leave-summary-value leave-value-${card.tone === 'blue' ? 'blue' : card.tone === 'green' ? 'green' : 'purple'}`}>{card.value}</div>
              <p className="leave-summary-trend">{card.change}</p>
            </div>
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

      <div className="white-unified-wrapper">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
          <Card glass style={{ padding: 0 }}>
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>Import Users</h3>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{userFile ? userFile.name : "Belum ada file dipilih"}</span>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <form onSubmit={handleImportUsers}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>File Users</label>
                    <input
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={(event) => setUserFile(event.target.files?.[0] || null)}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                    />
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: '#64748b' }}>Gunakan template resmi agar struktur kolom sesuai dengan backend.</p>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Role Users</label>
                    <select
                      value={userRole}
                      onChange={e => setUserRole(e.target.value)}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                    >
                      <option value="employee">employee</option>
                      <option value="admin">admin</option>
                      <option value="super_admin">super_admin</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
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
                    <pre style={{ margin: 0, padding: '1rem', background: '#f8fafc', borderRadius: '12px', fontSize: '0.8rem', overflow: 'auto' }}>{userImportResult}</pre>
                  )}
                </div>
              </form>
            </div>
          </Card>

          <Card glass style={{ padding: 0 }}>
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>Import Employees</h3>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{employeeFile ? employeeFile.name : "Belum ada file dipilih"}</span>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <form onSubmit={handleImportEmployees}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>File Employees</label>
                    <input
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={(event) => setEmployeeFile(event.target.files?.[0] || null)}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                    />
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: '#64748b' }}>Pastikan data employee sudah mengikuti format field pada template import.</p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
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
                    <pre style={{ margin: 0, padding: '1rem', background: '#f8fafc', borderRadius: '12px', fontSize: '0.8rem', overflow: 'auto' }}>{employeeImportResult}</pre>
                  )}
                </div>
              </form>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminImportPage;