import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/app/store/auth.store";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { Alert } from "@/shared/ui/Alert";
import { getAllUsers } from "@/features/admin/api/admin.service";
import { getErrorMessage } from "@/shared/api/errorHandler";
import { RBACUtils } from "@/shared/hooks/rbac";
import "./AdminCrudPages.css";

interface UserData {
  id: number;
  name: string;
  email: string;
  role_names?: string[];
}

const AdminUsersPage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const canViewUsers = RBACUtils.canViewUsers(user);
  
  if (!canViewUsers) {
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
  
  const [users, setUsers] = useState<UserData[]>([]);
  const [statusMessage, setStatusMessage] = useState("");
  const [alertType, setAlertType] = useState<'success' | 'error' | 'info'>
('info');
  const [loading, setLoading] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    setStatusMessage("Memuat data users...");

    try {
      const result = await getAllUsers();
      const formattedUsers = result.items.map((item: any) => ({
        id: item.id,
        name: item.name,
        email: item.email,
        role_names: Array.isArray(item.roles) 
          ? item.roles.map((r: any) => r.display_name || r.name) 
          : [],
      }));
      setUsers(formattedUsers);
      setStatusMessage(`${formattedUsers.length} user berhasil dimuat.`);
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
    void loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="crud-page">
      {/* Header */}
      <div className="crud-header">
        <div>
          <h1>👥 User Management</h1>
          <p>Kelola dan tampilkan daftar users</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <Button 
            variant="primary" 
            size="md" 
            onClick={() => navigate("/admin/users/assign-roles")}
          >
            ➕ Assign Role
          </Button>
          <Button 
            variant="outline" 
            size="md" 
            onClick={() => void loadUsers()} 
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

      {/* Users Table */}
      <Card className="crud-card" glass>
        <h2>👤 Daftar Users</h2>
        
        {users.length === 0 ? (
          <div style={{ padding: "40px 20px", textAlign: "center", color: "#888" }}>
            Tidak ada data user
          </div>
        ) : (
          <div className="crud-table-wrap">
            <table className="crud-table">
              <thead>
                <tr>
                  <th style={{ width: "60px" }}>ID</th>
                  <th>Nama</th>
                  <th>Email</th>
                  <th>Roles</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td style={{ fontWeight: "500" }}>{u.name}</td>
                    <td style={{ color: "var(--color-text-secondary)" }}>{u.email}</td>
                    <td>
                      {u.role_names && u.role_names.length > 0 ? (
                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                          {u.role_names.map((role, idx) => (
                            <span
                              key={idx}
                              style={{
                                padding: "4px 10px",
                                borderRadius: "6px",
                                fontSize: "12px",
                                fontWeight: "500",
                                backgroundColor: role === "Super Administrator" ? "#fee2e2" : role === "Administrator" ? "#dbeafe" : "#f0fdf4",
                                color: role === "Super Administrator" ? "#7f1d1d" : role === "Administrator" ? "#1e40af" : "#15803d",
                              }}
                            >
                              {role}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span style={{ color: "var(--color-text-disabled)", fontSize: "14px" }}>-</span>
                      )}
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

export default AdminUsersPage;
