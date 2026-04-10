import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { Alert } from "@/shared/ui/Alert";
import { assignRolesToUser, getAllUsers, getAllRoles } from "@/features/admin/api/admin.service";
import type { Role } from "@/shared/types/rbac.types";
import "./AdminCrudPages.css";

interface UserData {
  id: number;
  name: string;
  email: string;
}

const AdminUserAssignRolesPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserData[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);
  const [statusMessage, setStatusMessage] = useState("");
  const [alertType, setAlertType] = useState<'success' | 'error' | 'info' | 'warning'>('info');
  const [isAssigning, setIsAssigning] = useState(false);

  const loadUsers = async () => {
    setStatusMessage("Memuat data users...");

    try {
      const result = await getAllUsers();
      const formattedUsers = result.items.map((item: any) => ({
        id: item.id,
        name: item.name,
        email: item.email,
      }));
      setUsers(formattedUsers);
      setStatusMessage(`${formattedUsers.length} user berhasil dimuat.`);
      setAlertType('success');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Gagal memuat users.";
      setStatusMessage(message);
      setAlertType('error');
    }
  };

  const loadRoles = async () => {
    try {
      const result = await getAllRoles();
      setRoles(result.items as Role[]);
    } catch (error) {
      console.error("Failed to load roles:", error);
    }
  };

  const handleToggleRole = (roleId: number) => {
    setSelectedRoleIds((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId]
    );
  };

  const handleAssignRoles = async () => {
    if (!selectedUserId) {
      setStatusMessage("Pilih user terlebih dahulu.");
      setAlertType('warning');
      return;
    }

    if (selectedRoleIds.length === 0) {
      setStatusMessage("Pilih minimal satu role.");
      setAlertType('warning');
      return;
    }

    if (selectedRoleIds.includes(1)) {
      setStatusMessage("Hanya Super Admin yang dapat assign role Super Admin.");
      setAlertType('error');
      return;
    }

    setIsAssigning(true);
    setStatusMessage("Sedang assign role...");
    setAlertType('info');

    try {
      await assignRolesToUser(selectedUserId, { role_ids: selectedRoleIds });
      setStatusMessage("Role berhasil di-assign!");
      setAlertType('success');
      setSelectedUserId("");
      setSelectedRoleIds([]);
      await loadUsers();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Gagal assign role.";
      setStatusMessage(message);
      setAlertType('error');
    } finally {
      setIsAssigning(false);
    }
  };

  useEffect(() => {
    void loadUsers();
    void loadRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="crud-page">
      {/* Header */}
      <div className="crud-header">
        <div>
          <h1>➕ Assign Role ke User</h1>
          <p>Berikan role/permissions kepada user</p>
        </div>
        <Button 
          variant="outline" 
          size="md" 
          onClick={() => navigate("/admin/users")}
        >
          ← Kembali ke Users
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
          {/* User Selection */}
          <div className="form-group">
            <label htmlFor="user-select">Pilih User</label>
            <select 
              id="user-select"
              className="crud-input"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              disabled={isAssigning || users.length === 0}
            >
              <option value="">-- Pilih User --</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
          </div>

          {/* Roles Selection */}
          <div className="form-group">
            <label>Pilih Roles</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "12px", marginTop: "8px" }}>
              {roles.map((role) => (
                <label key={role.id} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px", borderRadius: "6px", backgroundColor: "rgba(59, 130, 246, 0.05)", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={selectedRoleIds.includes(role.id)}
                    onChange={() => handleToggleRole(role.id)}
                    disabled={isAssigning}
                    style={{ cursor: "pointer" }}
                  />
                  <span style={{ fontSize: "14px" }}>
                    {role.display_name || role.name}
                    {role.id === 1 && <span style={{ marginLeft: "4px", color: "#ef4444", fontSize: "12px" }}>(🔒 Super Admin)</span>}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="form-actions" style={{ marginTop: "20px" }}>
            <Button
              variant="primary"
              size="md"
              onClick={() => void handleAssignRoles()}
              disabled={isAssigning || !selectedUserId || selectedRoleIds.length === 0}
            >
              {isAssigning ? "Assigning..." : "✓ Assign Role"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminUserAssignRolesPage;
