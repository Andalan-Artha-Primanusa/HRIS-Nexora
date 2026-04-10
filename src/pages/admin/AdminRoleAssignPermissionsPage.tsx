import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/app/store/auth.store";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { Alert } from "@/shared/ui/Alert";
import { assignPermissionsToRole, getAllRoles, getAllPermissions } from "@/features/admin/api/admin.service";
import { getErrorMessage } from "@/shared/api/errorHandler";
import { RBACUtils } from "@/shared/hooks/rbac";
import type { Permission } from "@/shared/types/rbac.types";
import "./AdminCrudPages.css";

interface RoleData {
  id: number;
  name: string;
  display_name: string;
  permissions_count?: number;
}

const AdminRoleAssignPermissionsPage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const canManageRoles = RBACUtils.canManageRoles(user);
  
  if (!canManageRoles) {
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
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>([]);
  const [statusMessage, setStatusMessage] = useState("");
  const [alertType, setAlertType] = useState<'success' | 'error' | 'info' | 'warning'>('info');
  const [loading, setLoading] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

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

  const loadPermissions = async () => {
    try {
      const result = await getAllPermissions();
      setPermissions(result.items as Permission[]);
    } catch (error: unknown) {
      const message = getErrorMessage(error as any);
      console.error("Failed to load permissions:", message);
    }
  };

  const handleTogglePermission = (permissionId: number) => {
    setSelectedPermissionIds((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleAssignPermissions = async () => {
    if (!selectedRoleId) {
      setStatusMessage("Pilih role terlebih dahulu.");
      setAlertType('warning');
      return;
    }

    if (selectedPermissionIds.length === 0) {
      setStatusMessage("Pilih minimal satu permission.");
      setAlertType('warning');
      return;
    }

    // Protection: prevent modification of super_admin role
    if (parseInt(selectedRoleId) === 1) {
      setStatusMessage("Hanya Super Admin yang dapat memodifikasi role Super Admin.");
      setAlertType('error');
      return;
    }

    setIsAssigning(true);
    setStatusMessage("Sedang assign permission...");
    setAlertType('info');

    try {
      await assignPermissionsToRole(selectedRoleId, { permission_ids: selectedPermissionIds });
      setStatusMessage("Permission berhasil di-assign!");
      setAlertType('success');
      setSelectedRoleId("");
      setSelectedPermissionIds([]);
      await loadRoles();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Gagal assign permission ke role.";
      setStatusMessage(message);
      setAlertType('error');
    } finally {
      setIsAssigning(false);
    }
  };;

  useEffect(() => {
    void loadRoles();
    void loadPermissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="crud-page">
      {/* Header */}
      <div className="crud-header">
        <div>
          <h1>➕ Assign Permission ke Role</h1>
          <p>Berikan permissions kepada role</p>
        </div>
        <Button 
          variant="outline" 
          size="md" 
          onClick={() => navigate("/admin/roles")}
        >
          ← Kembali ke Roles
        </Button>
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

      {/* Form */}
      <Card className="crud-card" glass>
        <div className="crud-form">
          {/* Role Selection */}
          <div className="form-group">
            <label htmlFor="role-select">Pilih Role 👥</label>
            {roles.length === 0 ? (
              <div style={{ padding: "10px", borderRadius: "8px", backgroundColor: "#f3f4f6", color: "#666", textAlign: "center", fontSize: "14px" }}>
                {loading ? "Loading roles..." : "Tidak ada role tersedia"}
              </div>
            ) : (
              <select 
                id="role-select"
                className="crud-input"
                value={selectedRoleId}
                onChange={(e) => setSelectedRoleId(e.target.value)}
                disabled={isAssigning}
              >
                <option value="">-- Pilih Role --</option>
                {roles && roles.length > 0 && roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.display_name || r.name || `Role ${r.id}`} ({r.permissions_count || 0})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Permissions Selection */}
          {selectedRoleId && (
            <div className="form-group">
              <label>Pilih Permissions 🔐</label>
              {permissions.length === 0 ? (
                <div style={{ padding: "10px", borderRadius: "8px", backgroundColor: "#f3f4f6", color: "#666", textAlign: "center", fontSize: "14px" }}>
                  {loading ? "Loading permissions..." : "Tidak ada permission tersedia"}
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "12px", marginTop: "8px" }}>
                  {permissions.map((perm) => (
                    <label key={perm.id} style={{ display: "flex", alignItems: "flex-start", gap: "8px", padding: "10px", borderRadius: "6px", backgroundColor: "rgba(59, 130, 246, 0.05)", cursor: "pointer", transition: "background 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(59, 130, 246, 0.1)"} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "rgba(59, 130, 246, 0.05)"}>
                      <input
                        type="checkbox"
                        checked={selectedPermissionIds.includes(perm.id)}
                        onChange={() => handleTogglePermission(perm.id)}
                        disabled={isAssigning}
                        style={{ cursor: "pointer", marginTop: "2px" }}
                      />
                      <span style={{ fontSize: "13px" }}>
                        <div style={{ fontWeight: "500" }}>{perm.display_name || perm.name}</div>
                        <div style={{ fontSize: "12px", color: "#666" }}>{perm.name}</div>
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Submit Button */}
          <div className="form-actions" style={{ marginTop: "20px" }}>
            <Button
              variant="primary"
              size="md"
              onClick={() => void handleAssignPermissions()}
              disabled={isAssigning || !selectedRoleId || selectedPermissionIds.length === 0}
            >
              {isAssigning ? "Assigning..." : "✓ Assign Permission"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminRoleAssignPermissionsPage;
