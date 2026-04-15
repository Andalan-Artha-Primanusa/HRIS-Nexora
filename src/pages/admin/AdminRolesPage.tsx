import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/app/store/auth.store";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { Alert } from "@/shared/ui/Alert";
import { getAllRoles } from "@/features/admin/api/admin.service";
import { getErrorMessage } from "@/shared/api/errorHandler";
import { RBACUtils } from "@/shared/hooks/rbac";
import { KeyRound, RefreshCw, ShieldAlert, ShieldPlus } from "lucide-react";
import "@/shared/styles/CrudPage.css";
import "./AdminRolesPage.css";

interface RoleData {
  id: number;
  name: string;
  display_name: string;
  permissions_count?: number;
}

const AdminRolesPage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const canViewRoles = RBACUtils.canViewRoles(user);
  const permissionChipClass = (count: number) => {
    if (count === 0) return "admin-roles-perm-chip admin-roles-perm-chip--empty";
    return "admin-roles-perm-chip admin-roles-perm-chip--active";
  };
  
  if (!canViewRoles) {
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
  
  const [roles, setRoles] = useState<RoleData[]>([]);
  const [statusMessage, setStatusMessage] = useState("");
  const [alertType, setAlertType] = useState<'success' | 'error' | 'info'>('info');
  const [loading, setLoading] = useState(false);

  const loadRoles = async () => {
    setLoading(true);
    setStatusMessage("Memuat data roles...");

    try {
      const result = await getAllRoles();
      const formattedRoles = result.items.map((item: any) => {
        const displayName = item.display_name || item.name || `Role ${item.id}`;
        const name = item.name || '';
        const permCount = item.permissions_count || (Array.isArray(item.permissions) ? item.permissions.length : 0);
        
        return {
          id: item.id,
          name: name,
          display_name: displayName,
          permissions_count: permCount,
        };
      });
      
      setRoles(formattedRoles);
      setStatusMessage(`${formattedRoles.length} role berhasil dimuat.`);
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
    void loadRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="crud-page">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-badge">Admin Center</span>
          <h1>Role Management</h1>
          <p>Kelola dan tampilkan daftar role beserta jumlah permission yang terhubung.</p>
        </div>
        <div className="page-header-actions">
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate("/admin/roles/assign-permissions")}
          >
            <ShieldPlus size={16} />
            Assign Permission
          </Button>
          <Button
            variant="outline"
            size="md"
            onClick={() => void loadRoles()}
            disabled={loading}
            style={{ borderColor: "#2563eb", color: "#2563eb" }}
          >
            <RefreshCw size={16} />
            {loading ? "Memuat..." : "Segarkan"}
          </Button>
        </div>
      </div>

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
          <h3>Daftar Roles</h3>
          <span className="table-count">{roles.length} roles</span>
        </div>

        {roles.length === 0 ? (
          <div className="table-card-inner">
            <div className="empty-state">
              <KeyRound size={32} style={{ opacity: 0.4 }} />
              <p>Tidak ada data role</p>
            </div>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Role</th>
                  <th className="th-center">Permissions</th>
                </tr>
              </thead>
              <tbody>
                {roles.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <span className="cell-id">{r.id}</span>
                    </td>
                    <td>
                      <div className="cell-name-text" style={{ fontWeight: 600 }}>{r.display_name || r.name || `Role ${r.id}`}</div>
                      <div className="cell-sub">{r.name || "—"}</div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={permissionChipClass(r.permissions_count || 0)}>
                        {r.permissions_count || 0}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminRolesPage;
