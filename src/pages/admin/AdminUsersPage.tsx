import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/app/store/auth.store";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { Alert } from "@/shared/ui/Alert";
import { getAllUsers } from "@/features/admin/api/admin.service";
import { getErrorMessage } from "@/shared/api/errorHandler";
import { RBACUtils } from "@/shared/hooks/rbac";
import { RefreshCw, ShieldAlert, UserPlus, Users } from "lucide-react";
import "@/shared/styles/CrudPage.css";
import "./AdminUsersPage.css";

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
  const roleToneClass = (roleName: string) => {
    if (roleName === "Super Administrator") return "admin-users-role-chip admin-users-role-chip--super";
    if (roleName === "Administrator") return "admin-users-role-chip admin-users-role-chip--admin";
    return "admin-users-role-chip admin-users-role-chip--default";
  };
  
  if (!canViewUsers) {
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
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-badge">Admin Center</span>
          <h1>User Management</h1>
          <p>Kelola dan tampilkan daftar pengguna beserta role mereka.</p>
        </div>
        <div className="page-header-actions">
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate("/admin/users/assign-roles")}
          >
            <UserPlus size={16} />
            Assign Role
          </Button>
          <Button
            variant="outline"
            size="md"
            onClick={() => void loadUsers()}
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
          <h3>Daftar Pengguna</h3>
          <span className="table-count">{users.length} users</span>
        </div>

        {users.length === 0 ? (
          <div className="table-card-inner">
            <div className="empty-state">
              <Users size={32} style={{ opacity: 0.4 }} />
              <p>Tidak ada data user</p>
            </div>
          </div>
        ) : (
          <div className="table-card-inner">
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nama</th>
                    <th>Email</th>
                    <th>Roles</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <span className="cell-id">{u.id}</span>
                      </td>
                      <td>
                        <div className="cell-name">
                          <div className="cell-avatar">
                            {u.name?.charAt(0).toUpperCase() || "U"}
                          </div>
                          <span className="cell-name-text">{u.name}</span>
                        </div>
                      </td>
                      <td className="admin-users-email">{u.email}</td>
                      <td>
                        {u.role_names && u.role_names.length > 0 ? (
                          <div className="admin-users-role-list">
                            {u.role_names.map((role, idx) => (
                              <span
                                key={idx}
                                className={roleToneClass(role)}
                              >
                                {role}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="admin-users-role-empty">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminUsersPage;
