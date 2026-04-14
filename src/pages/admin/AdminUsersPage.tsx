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
import "./AdminCrudPages.css";
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
        <Card className="admin-users-hero" glass>
          <div className="crud-header admin-users-header">
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
        <Card className="crud-card admin-users-card" glass>
          <p>Silakan hubungi Administrator untuk mendapatkan akses.</p>
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
      <Card className="admin-users-hero" glass>
        <div className="crud-header admin-users-header">
          <div className="crud-header-copy">
            <p className="crud-page-badge">Admin Center</p>
            <div className="crud-header-title-row">
              <span className="crud-header-icon"><Users size={18} /></span>
              <h1>User Management</h1>
            </div>
            <p>Kelola dan tampilkan daftar pengguna beserta role mereka.</p>
          </div>
          <div className="admin-users-toolbar">
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

      <Card className="crud-card admin-users-card" glass>
        <h2>Daftar Pengguna</h2>
        
        {users.length === 0 ? (
          <div className="admin-users-empty-state">
            Tidak ada data user
          </div>
        ) : (
          <div className="crud-table-wrap">
            <table className="crud-table admin-users-table">
              <thead>
                <tr>
                  <th className="admin-users-col-id">ID</th>
                  <th>Nama</th>
                  <th>Email</th>
                  <th>Roles</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td className="admin-users-name">{u.name}</td>
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
        )}
      </Card>
    </div>
  );
};

export default AdminUsersPage;
