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
import "./AdminCrudPages.css";
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
        <Card className="admin-roles-hero" glass>
          <div className="crud-header admin-roles-header">
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
        <Card className="crud-card admin-roles-card" glass>
          <p>Silakan hubungi Administrator untuk mendapatkan akses.</p>
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
      <Card className="admin-roles-hero" glass>
        <div className="crud-header admin-roles-header">
          <div className="crud-header-copy">
            <p className="crud-page-badge">Admin Center</p>
            <div className="crud-header-title-row">
              <span className="crud-header-icon"><KeyRound size={18} /></span>
              <h1>Role Management</h1>
            </div>
            <p>Kelola dan tampilkan daftar role beserta jumlah permission yang terhubung.</p>
          </div>
          <div className="admin-roles-toolbar">
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
            >
              <RefreshCw size={16} />
              {loading ? "Memuat..." : "Segarkan"}
            </Button>
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

      <Card className="crud-card admin-roles-card" glass>
        <h2>Daftar Roles</h2>
        
        {roles.length === 0 ? (
          <div className="admin-roles-empty-state">
            Tidak ada data role
          </div>
        ) : (
          <div className="crud-table-wrap">
            <table className="crud-table admin-roles-table">
              <thead>
                <tr>
                  <th className="admin-roles-col-id">ID</th>
                  <th>Role</th>
                  <th className="admin-roles-col-perm">Permissions</th>
                </tr>
              </thead>
              <tbody>
                {roles.map((r) => (
                  <tr key={r.id}>
                    <td>{r.id}</td>
                    <td>
                      <div className="admin-roles-name">{r.display_name || r.name || `Role ${r.id}`}</div>
                      <div className="admin-roles-slug">{r.name || "—"}</div>
                    </td>
                    <td className="admin-roles-col-perm">
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
