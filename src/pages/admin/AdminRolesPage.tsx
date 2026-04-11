import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/app/store/auth.store";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { Alert } from "@/shared/ui/Alert";
import { getAllRoles } from "@/features/admin/api/admin.service";
import { getErrorMessage } from "@/shared/api/errorHandler";
import { RBACUtils } from "@/shared/hooks/rbac";
import "./AdminCrudPages.css";

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
  
  if (!canViewRoles) {
    return (
      <div className="crud-page">
        <div className="crud-header">
          <h1>🚫 Akses Ditolak</h1>
          <p>Anda tidak memiliki izin untuk mengakses halaman ini.</p>
        </div>
        <Card className="crud-card" glass>
          <p>Silahkan hubungi Administrator untuk mendapatkan akses.</p>
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
      <div className="crud-header">
        <div>
          <h1>👮 Role Management</h1>
          <p>Kelola dan tampilkan daftar roles</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <Button 
            variant="primary" 
            size="md" 
            onClick={() => navigate("/admin/roles/assign-permissions")}
          >
            ➕ Assign Permission
          </Button>
          <Button 
            variant="outline" 
            size="md" 
            onClick={() => void loadRoles()} 
            disabled={loading}
          >
            {loading ? "Loading..." : "🔄 Refresh"}
          </Button>
        </div>
      </div>

      {/* Status Message */}
      {statusMessage && (
        <Alert 
          type={alertType} 
          message={statusMessage} 
          onClose={() => setStatusMessage('')}
          dismissible
        />
      )}

      {/* Roles Table */}
      <Card className="crud-card" glass>
        <h2>🔐 Daftar Roles</h2>
        
        {roles.length === 0 ? (
          <div style={{ padding: "40px 20px", textAlign: "center", color: "#888" }}>
            Tidak ada data role
          </div>
        ) : (
          <div className="crud-table-wrap">
            <table className="crud-table">
              <thead>
                <tr>
                  <th style={{ width: "60px" }}>ID</th>
                  <th>Role</th>
                  <th style={{ width: "100px", textAlign: "center" }}>Permissions</th>
                </tr>
              </thead>
              <tbody>
                {roles.map((r) => (
                  <tr key={r.id}>
                    <td>{r.id}</td>
                    <td>
                      <div style={{ fontWeight: "500" }}>{r.display_name || r.name || `Role ${r.id}`}</div>
                      <div style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>{r.name || "—"}</div>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <span style={{
                        display: "inline-block",
                        padding: "6px 12px",
                        borderRadius: "20px",
                        backgroundColor: r.permissions_count === 0 ? "#f3f4f6" : "#dbeafe",
                        color: r.permissions_count === 0 ? "var(--color-text-disabled)" : "#1e40af",
                        fontWeight: "500",
                        fontSize: "13px",
                      }}>
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
