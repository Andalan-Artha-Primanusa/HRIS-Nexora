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
import "@/shared/styles/CrudPage.css";

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
        <div className="page-header">
          <div className="page-header-title">
            <span className="page-badge">Admin Center</span>
            <h1><ShieldAlert size={22} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8 }} />Akses Ditolak</h1>
            <p>Anda tidak memiliki izin untuk mengakses halaman ini.</p>
          </div>
        </div>
        <Card className="table-card" glass>
          <div className="table-card-inner">
            <p>Silakan hubungi Administrator untuk mendapatkan akses.</p>
          </div>
        </Card>
      </div>
    );
  }
  
  const [items, setItems] = useState<AdminEntityItem[]>([]);
  const [statusMessage, setStatusMessage] = useState("Ready to call admin permissions API");
  const [alertType, setAlertType] = useState<'success' | 'error' | 'info'>('info');
  const [loading, setLoading] = useState(false);

  const columns = useMemo(() => getColumns(items), [items]);

  const loadPermissions = async () => {
    if (!canViewPermissions) {
      setStatusMessage("Anda tidak memiliki izin untuk melihat permissions.");
      return;
    }

    setLoading(true);
    setStatusMessage("Memuat permissions...");

    try {
      const result = await getAllPermissions();
      setItems(result.items as unknown as AdminEntityItem[]);
      setStatusMessage("Data permissions berhasil dimuat.");
      setAlertType('success');
    } catch (error: unknown) {
      const message = getErrorMessage(error as any);
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
      {/* Header */}
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-badge">Admin Center</span>
          <h1>Permission Management</h1>
          <p>Kelola dan tampilkan daftar permission yang tersedia untuk pengaturan akses sistem.</p>
        </div>
        <div className="page-header-actions">
          <Button variant="outline" size="md" onClick={() => void loadPermissions()} disabled={loading} style={{ borderColor: "#2563eb", color: "#2563eb" }}>
            <RefreshCw size={16} />
            {loading ? "Memuat..." : "Segarkan"}
          </Button>
        </div>
      </div>

      {/* Status Alert */}
      {statusMessage && (
        <Alert 
          type={alertType} 
          message={statusMessage} 
          onClose={() => setStatusMessage('')}
          dismissible
        />
      )}

      {/* Table */}
      <Card className="table-card" glass>
        <div className="table-header-bar">
          <h3>Tabel Permissions</h3>
          <span className="table-count">{items.length} permissions</span>
        </div>
        <div className="table-wrap">
          <table className="data-table">
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
      </Card>
    </div>
  );
};

export default AdminPermissionsPage;
