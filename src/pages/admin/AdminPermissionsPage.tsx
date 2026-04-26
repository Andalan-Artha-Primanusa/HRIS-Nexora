import { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/app/store/auth.store";
import { Card } from "@/shared/ui/Card";
import { Alert } from "@/shared/ui/Alert";
import { RBACUtils } from "@/shared/hooks/rbac";
import { getAllPermissions } from "@/features/admin/api/admin.service";
import { getErrorMessage } from "@/shared/api/errorHandler";
import type { AdminEntityItem } from "@/features/admin/types/admin.types";
import { KeyRound, RefreshCw, ShieldAlert, Shield } from "lucide-react";
import "@/shared/styles/CrudPage.css";
import "@/pages/dashboard/overview/OverviewPage.css";
import "@/pages/payroll/PayrollShared.css";

const asDisplay = (value: unknown) => {
  if (value === null || value === undefined) return "-";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

const getColumns = (perms: AdminEntityItem[]) => {
  if (perms.length === 0) {
    return ["id", "name", "guard_name"];
  }

  const keys = Object.keys(perms[0]);
  const preferred = ["id", "name", "guard_name"];
  const merged = [...preferred, ...keys.filter((key) => !preferred.includes(key))];
  return merged.filter((key, index) => merged.indexOf(key) === index);
};

const AdminPermissionsPage = () => {
  const user = useAuthStore((state) => state.user);
  const canViewPermissions = RBACUtils.canViewPermissions(user);
  const [permissions, setPermissions] = useState<AdminEntityItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error" | "info">("info");

  const columns = useMemo(() => getColumns(permissions), [permissions]);

  const loadPermissions = async () => {
    setLoading(true);
    try {
      const data = await getAllPermissions();
      const permsArray = Array.isArray(data) ? data : data.data || [];
      setPermissions(permsArray);
    } catch (error: unknown) {
      setStatusMessage(getErrorMessage(error as never));
      setAlertType("error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPermissions();
  }, []);

  if (!canViewPermissions) {
    return (
      <div className="crud-page">
        <Card className="hero-card">
          <div className="hero-card-inner">
            <div className="hero-content">
              <div className="hero-badge">
                <Shield size={16} />
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
            <p>Silakan hubungi Administrator untuk mendapatkan akses.</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="crud-page">
      <Card className="hero-card">
        <div className="hero-card-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <Shield size={16} />
              <span>Admin Center</span>
            </div>
            <h1 className="hero-title">Permission Management</h1>
            <p className="hero-subtitle">
              Kelola dan tampilkan daftar permission yang tersedia untuk pengaturan akses sistem.
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn-outline" onClick={() => void loadPermissions()} disabled={loading}>
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              {loading ? "Memuat..." : "Segarkan"}
            </button>
          </div>
        </div>
      </Card>

      {statusMessage && (
        <Alert 
          type={alertType} 
          message={statusMessage} 
          onClose={() => setStatusMessage('')}
          dismissible
        />
)}

      <div className="white-unified-wrapper">
        <div className="wuw-header">
          <div className="wuw-header-top">
            <div className="wuw-title-area">
              <h3>Tabel Permissions</h3>
              <span className="wuw-count-badge">{permissions.length} permissions</span>
            </div>
          </div>
        </div>

        <div className="wuw-table-area">
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  {columns.map((column) => (
                    <th key={column}>
                      {column === "id" && "ID"}
                      {column === "name" && "Permission"}
                      {column === "guard_name" && "Guard"}
                      {column !== "id" && column !== "name" && column !== "guard_name" && column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {permissions.length > 0 ? (
                  permissions.map((item, index) => (
                    <tr key={String(item.id ?? index)}>
                      {columns.map((column) => (
                        <td key={`${String(item.id ?? index)}-${column}`}>
                          {column === 'id' ? (
                            <span className="cell-id">{asDisplay(item[column])}</span>
                          ) : column === 'name' ? (
                            <span className="cell-tag">{asDisplay(item[column])}</span>
                          ) : (
                            asDisplay(item[column])
                          )}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length} className="cell-empty">
                      <KeyRound size={32} style={{ opacity: 0.4, display: 'block', margin: '0 auto 0.75rem' }} />
                      Tidak ada data permission.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPermissionsPage;
