import { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/app/store/auth.store";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { Alert } from "@/shared/ui/Alert";
import { RBACUtils } from "@/shared/hooks/rbac";
import { getAllPermissions } from "@/features/admin/api/admin.service";
import { getErrorMessage } from "@/shared/api/errorHandler";
import type { AdminEntityItem } from "@/features/admin/types/admin.types";
import { KeyRound, RefreshCw, ShieldAlert } from "lucide-react";
import "./AdminCrudPages.css";
import "./AdminPermissionsPage.css";

const asDisplay = (value: unknown) => {
  if (value === null || value === undefined) return "-";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

const getColumns = (items: AdminEntityItem[]) => {
  if (items.length === 0) {
    return ["id", "name", "guard_name"];
  }

  const keys = Object.keys(items[0]);
  const preferred = ["id", "name", "guard_name"];
  const merged = [...preferred, ...keys.filter((key) => !preferred.includes(key))];
  return merged.filter((key, index) => merged.indexOf(key) === index);
};

const AdminPermissionsPage = () => {
  const user = useAuthStore((state) => state.user);
  const canViewPermissions = RBACUtils.canViewPermissions(user);
  
  if (!canViewPermissions) {
    return (
      <div className="crud-page">
        <Card className="admin-permissions-hero" glass>
          <div className="crud-header admin-permissions-header">
            <div className="crud-header-copy">
              <p className="crud-page-badge">Admin Center</p>
              <div className="crud-header-title-row">
                <span className="crud-header-icon"><ShieldAlert size={18} /></span>
                <h1>Akses Ditolak</h1>
              </div>
              <p>Anda tidak memiliki izin untuk mengakses halaman ini.</p>
            </div>
          </div>
        </Card>
        <Card className="crud-card admin-permissions-card" glass>
          <p>Silakan hubungi Administrator untuk mendapatkan akses.</p>
        </Card>
      </div>
    );
  }
  
  const [items, setItems] = useState<AdminEntityItem[]>([]);
  const [responseText, setResponseText] = useState("");
  const [statusMessage, setStatusMessage] = useState("Ready to call admin permissions API");
  const [alertType, setAlertType] = useState<'success' | 'error' | 'info'>('info');
  const [loading, setLoading] = useState(false);

  const columns = useMemo(() => getColumns(items), [items]);

  const formatResponse = (payload: unknown) => {
    setResponseText(typeof payload === "string" ? payload : JSON.stringify(payload, null, 2));
  };

  const loadPermissions = async () => {
    if (!canViewPermissions) {
      setStatusMessage("Anda tidak memiliki izin untuk melihat permissions.");
      return;
    }

    setLoading(true);
    setStatusMessage("Memuat permissions...");
    setResponseText("");

    try {
      const result = await getAllPermissions();
      setItems(result.items as unknown as AdminEntityItem[]);
      formatResponse(result.raw);
      setStatusMessage("Data permissions berhasil dimuat.");
      setAlertType('success');
    } catch (error: unknown) {
      const message = getErrorMessage(error as any);
      formatResponse(message);
      setStatusMessage(message);
      setAlertType('error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPermissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="crud-page">
      <Card className="admin-permissions-hero" glass>
        <div className="crud-header admin-permissions-header">
          <div className="crud-header-copy">
            <p className="crud-page-badge">Admin Center</p>
            <div className="crud-header-title-row">
              <span className="crud-header-icon"><KeyRound size={18} /></span>
              <h1>Permission Management</h1>
            </div>
            <p>Kelola dan tampilkan daftar permission yang tersedia untuk pengaturan akses sistem.</p>
          </div>
          <Button variant="outline" size="md" onClick={() => void loadPermissions()} disabled={loading}>
            <RefreshCw size={16} />
            {loading ? "Memuat..." : "Segarkan"}
          </Button>
        </div>
      </Card>

      {/* Status Alert */}
      {statusMessage && (
        <Alert 
          type={alertType} 
          message={statusMessage} 
          onClose={() => setStatusMessage('')}
          dismissible
        />
      )}

      <Card className="crud-card admin-permissions-card" glass>
        <h2>Tabel Permissions</h2>
        <div className="crud-table-wrap">
          <table className="crud-table admin-permissions-table">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column}>
                    {column === "id" && "ID"}
                    {column === "name" && "Permission"}
                    {column === "guard_name" && "Guard"}
                    {!['id', 'name', 'guard_name'].includes(column) && column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.length > 0 ? (
                items.map((item, index) => (
                  <tr key={String(item.id ?? index)}>
                    {columns.map((column) => (
                      <td key={`${String(item.id ?? index)}-${column}`}>{asDisplay(item[column])}</td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length}>Tidak ada data permission.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="crud-card admin-permissions-card" glass>
        <h2>Raw Response</h2>
        <pre className="crud-response">{responseText || "Response API akan tampil di sini."}</pre>
      </Card>
    </div>
  );
};

export default AdminPermissionsPage;
