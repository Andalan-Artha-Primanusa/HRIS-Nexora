import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/app/store/auth.store";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { Alert } from "@/shared/ui/Alert";
import { KeyRound, RefreshCw, ShieldAlert, ShieldPlus, Shield, Plus, Edit, Trash2, Search } from "lucide-react";
import { deleteRole, getAllRoles } from "@/features/admin/api/admin.service";
import { getErrorMessage } from "@/shared/api/errorHandler";
import { RBACUtils } from "@/shared/hooks/rbac";
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
  const filteredRoles = roles.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (r.display_name && r.display_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error" | "info">("info");

  const loadRoles = async () => {
    setLoading(true);
    try {
      const data = await getAllRoles();
      const rolesArray = Array.isArray(data) ? data : data.items || data.data || [];
      setRoles(rolesArray);
    } catch (error: unknown) {
      setStatusMessage(getErrorMessage(error as never));
      setAlertType("error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRoles();
  }, []);

  const handleDelete = async (id: number, name: string) => {
    if (id === 1 || name === 'admin' || name === 'super_admin') {
      setStatusMessage("Role sistem utama tidak dapat dihapus.");
      setAlertType("error");
      return;
    }

    if (!window.confirm(`Apakah Anda yakin ingin menghapus role "${name}"?`)) return;

    try {
      await deleteRole(id);
      setStatusMessage(`Role "${name}" berhasil dihapus.`);
      setAlertType("success");
      void loadRoles();
    } catch (error: unknown) {
      setStatusMessage(getErrorMessage(error as never));
      setAlertType("error");
    }
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
            <button type="button" className="btn-primary" onClick={() => navigate("/admin/roles/create")}>
              <Plus size={16} />
              Tambah Role
            </button>
          </div>
        </div>
      </Card>

      {statusMessage && <Alert type={alertType} message={statusMessage} onClose={() => setStatusMessage("")} dismissible />}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: '2rem' }}>
        <Card glass style={{ padding: '2rem', borderRadius: '32px' }}>
          <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#1e3a8a' }}>Daftar Role</h3>
              <span style={{ padding: '4px 12px', background: '#eff6ff', color: '#2563eb', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700 }}>
                {roles.length} roles
              </span>
            </div>
            
            <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
              <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Cari role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '12px 16px 12px 42px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '0.9rem', color: '#0f172a', transition: 'all 0.2s', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div style={{ borderRadius: '16px', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead style={{ background: '#f8fafc' }}>
                <tr>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', borderBottom: '1px solid #f1f5f9' }}>ID</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', borderBottom: '1px solid #f1f5f9' }}>Nama Role</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', borderBottom: '1px solid #f1f5f9' }}>Display Name</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', borderBottom: '1px solid #f1f5f9' }}>Permissions</th>
                  <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', borderBottom: '1px solid #f1f5f9' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Memuat data...</td></tr>
                ) : filteredRoles.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '4rem' }}>
                      <KeyRound size={48} style={{ margin: '0 auto 1rem', opacity: 0.1, color: '#1e3a8a' }} />
                      <div style={{ fontWeight: 600, color: '#94a3b8' }}>Tidak ada data role ditemukan</div>
                    </td>
                  </tr>
                ) : filteredRoles.map((role) => (
                  <tr key={role.id} style={{ transition: 'all 0.2s' }}>
                    <td style={{ padding: '1.25rem 1rem', borderBottom: '1px solid #f1f5f9' }}>
                      <span style={{ fontWeight: 800, color: '#2563eb' }}>#{role.id}</span>
                    </td>
                    <td style={{ padding: '1.25rem 1rem', borderBottom: '1px solid #f1f5f9' }}>
                      <div style={{ fontWeight: 700, color: '#1e293b' }}>{role.name}</div>
                    </td>
                    <td style={{ padding: '1.25rem 1rem', borderBottom: '1px solid #f1f5f9' }}>
                      <div style={{ color: '#475569' }}>{role.display_name || '—'}</div>
                    </td>
                    <td style={{ padding: '1.25rem 1rem', borderBottom: '1px solid #f1f5f9' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '8px', background: (role.permissions_count || 0) > 0 ? '#dcfce7' : '#f1f5f9', color: (role.permissions_count || 0) > 0 ? '#166534' : '#64748b', fontSize: '0.75rem', fontWeight: 700 }}>
                        {role.permissions_count || 0} permissions
                      </span>
                    </td>
                    <td style={{ padding: '1.25rem 1rem', borderBottom: '1px solid #f1f5f9', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button 
                          onClick={() => navigate(`/admin/roles/edit/${role.id}`)}
                          style={{ padding: '8px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', transition: 'all 0.2s', cursor: 'pointer' }}
                          title="Edit Role"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => void handleDelete(role.id, role.name)}
                          style={{ padding: '8px', borderRadius: '10px', border: '1px solid #fee2e2', background: '#fff', color: '#ef4444', transition: 'all 0.2s', cursor: 'pointer' }}
                          title="Hapus Role"
                          disabled={role.id === 1 || role.name === 'admin' || role.name === 'super_admin'}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminRolesPage;
