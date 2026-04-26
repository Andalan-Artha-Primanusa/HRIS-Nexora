import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/app/store/auth.store";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { Alert } from "@/shared/ui/Alert";
import { getAllRoles } from "@/features/admin/api/admin.service";
import { getErrorMessage } from "@/shared/api/errorHandler";
import { RBACUtils } from "@/shared/hooks/rbac";
import { KeyRound, RefreshCw, ShieldAlert, ShieldPlus, Shield, Plus } from "lucide-react";
import "@/shared/styles/CrudPage.css";
import "@/pages/dashboard/overview/OverviewPage.css";
import "@/pages/payroll/PayrollShared.css";
import "./AdminRolesPage.css";

interface Role {
  id: number;
  name: string;
  display_name?: string;
  description?: string;
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

  const [roles, setRoles] = useState<Role[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const filteredRoles = roles.filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error" | "info">("info");

  const loadRoles = async () => {
    try {
      const data = await getAllRoles();
      const rolesArray = Array.isArray(data) ? data : data.data || [];
      setRoles(rolesArray);
    } catch (error: unknown) {
      setStatusMessage(getErrorMessage(error as never));
      setAlertType("error");
    }
  };

  useEffect(() => {
    void loadRoles();
  }, []);

  const handleCreate = () => {
    setEditingRole(null);
    setFormData({ name: "", description: "" });
    setIsModalOpen(true);
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setFormData({ name: role.name, description: role.description || "" });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    setStatusMessage("Fitur hapus role belum tersedia.");
    setAlertType("info");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    setStatusMessage("Fitur buat role belum tersedia.");
    setAlertType("info");
    setIsModalOpen(false);
  };

  return (
    <div className="crud-page">
      <Card className="hero-card">
        <div className="hero-card-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <Shield size={16} />
              <span>Admin Center</span>
            </div>
            <h1 className="hero-title">Kelola Role</h1>
            <p className="hero-subtitle">
              Manajemen role dan permission pengguna sistem.
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn-primary" onClick={handleCreate}>
              <Plus size={16} />
              Tambah Role
            </button>
          </div>
        </div>
      </Card>

      {statusMessage && <Alert type={alertType} message={statusMessage} onClose={() => setStatusMessage("")} dismissible />}

      <div className="white-unified-wrapper">
        <div className="wuw-header">
          <div className="wuw-header-top">
            <div className="wuw-title-area">
              <h3>Daftar Role</h3>
              <span className="wuw-count-badge">{roles.length} roles</span>
            </div>
            <div className="wuw-actions">
              <input
                type="text"
                placeholder="Cari role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
        </div>

        <div className="wuw-table-area">
          {roles.length === 0 ? (
            <div className="empty-state">
              <KeyRound size={32} style={{ opacity: 0.4 }} />
              <p>Tidak ada data role</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nama Role</th>
                    <th>Display Name</th>
                    <th>Permissions</th>
                  </tr>
                </thead>
                <tbody>
                  {roles.map((role) => (
                    <tr key={role.id}>
                      <td>{role.id}</td>
                      <td>
                        <span className="cell-name">{role.name}</span>
                      </td>
                      <td>{role.display_name}</td>
                      <td>
                        <span className={permissionChipClass(role.permissions_count || 0)}>
                          {role.permissions_count || 0} permissions
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
</div>
      </div>
    </div>
  );
};

export default AdminRolesPage;
