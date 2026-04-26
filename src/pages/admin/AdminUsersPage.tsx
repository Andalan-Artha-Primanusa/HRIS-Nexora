import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/app/store/auth.store";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { Alert } from "@/shared/ui/Alert";
import { getAllUsers } from "@/features/admin/api/admin.service";
import { getErrorMessage } from "@/shared/api/errorHandler";
import { RBACUtils } from "@/shared/hooks/rbac";
import { RefreshCw, ShieldAlert, UserPlus, Users, Shield } from "lucide-react";
import "@/shared/styles/CrudPage.css";
import "@/pages/dashboard/overview/OverviewPage.css";
import "@/pages/payroll/PayrollShared.css";
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
        <Card className="hero-card">
          <div className="hero-card-inner">
            <div className="hero-content">
              <div className="hero-badge">
                <Shield size={16} />
                <span>Admin Center</span>
              </div>
              <h1 className="hero-title">Akses Ditolak</h1>
              <p className="hero-subtitle">
                Anda tidak memiliki izin untuk mengakses halaman ini.
              </p>
            </div>
          </div>
        </Card>
        <div className="white-unified-wrapper">
          <Card glass style={{ padding: '2rem', textAlign: 'center' }}>
            <p>Silakan hubungi Administrator untuk mendapatkan akses.</p>
          </Card>
        </div>
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
      <Card className="hero-card">
        <div className="hero-card-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <Shield size={16} />
              <span>Admin Center</span>
            </div>
            <h1 className="hero-title">User Management</h1>
            <p className="hero-subtitle">
              Kelola dan tampilkan daftar pengguna beserta role mereka.
            </p>
          </div>
          <div className="hero-actions">
            <button
              className="btn-outline"
              onClick={() => void loadUsers()}
              disabled={loading}
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              {loading ? "Memuat..." : "Segarkan"}
            </button>
            <button
              className="btn-primary"
              onClick={() => navigate("/admin/users/assign-roles")}
            >
              <UserPlus size={16} />
              Assign Role
            </button>
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
