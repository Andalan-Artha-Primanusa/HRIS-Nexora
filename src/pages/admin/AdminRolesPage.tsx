import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/app/store/auth.store";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { LoadingState, ErrorState, EmptyState } from "@/shared/ui/DataStateDisplay";
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
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error" | "info">("info");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  const loadRoles = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const data = await getAllRoles();
      const rolesArray = Array.isArray(data) ? data : data.items || data.data || [];
      setRoles(rolesArray);
    } catch (error: unknown) {
      setErrorMessage(getErrorMessage(error as never));
    } finally {
      setLoading(false);
    }
  };

  const filteredRoles = useMemo(() => {
    return roles.filter(r =>
      r.name.toLowerCase().includes(searchText.toLowerCase()) ||
      (r.display_name && r.display_name.toLowerCase().includes(searchText.toLowerCase()))
    );
  }, [roles, searchText]);

  const paginatedRoles = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRoles.slice(start, start + pageSize);
  }, [filteredRoles, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredRoles.length / pageSize);

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

      <div className="white-unified-wrapper">
        <div className="wuw-header">
          <div className="wuw-header-top">
            <div className="wuw-title-area">
              <h3>Daftar Role</h3>
              <span className="wuw-count-badge">{filteredRoles.length} roles</span>
            </div>
            <div className="wuw-search">
              <Search size={16} className="wuw-search-icon" />
              <input
                type="text"
                className="search-input-pill"
                placeholder="Cari role..."
                value={searchText}
                onChange={(e) => { setSearchText(e.target.value); setCurrentPage(1); }}
              />
            </div>
          </div>
        </div>

        <div className="wuw-table-area">
          {loading && <LoadingState message="Memuat roles..." />}
          {!loading && errorMessage && <ErrorState message="Koneksi Terputus" error={errorMessage} onRetry={loadRoles} />}

          {!loading && !errorMessage && (
            <>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nama Role</th>
                      <th>Display Name</th>
                      <th>Permissions</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedRoles.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="cell-empty">
                          <KeyRound size={32} style={{ opacity: 0.4, display: 'block', margin: '0 auto 0.75rem' }} />
                          Tidak ada data role ditemukan.
                        </td>
                      </tr>
                    ) : (
                      paginatedRoles.map((role) => (
                        <tr key={role.id}>
                          <td><span className="cell-id">#{role.id}</span></td>
                          <td><span className="cell-name-text">{role.name}</span></td>
                          <td>{role.display_name || '—'}</td>
                          <td>
                            <span className={permissionChipClass(role.permissions_count || 0)}>
                              {role.permissions_count || 0} permissions
                            </span>
                          </td>
                          <td>
                            <div className="action-btn-group" style={{ justifyContent: 'flex-end' }}>
                              <button
                                className="action-btn action-btn-edit"
                                onClick={() => navigate(`/admin/roles/edit/${role.id}`)}
                                title="Edit Role"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                className="action-btn action-btn-delete"
                                onClick={() => void handleDelete(role.id, role.name)}
                                title="Hapus Role"
                                disabled={role.id === 1 || role.name === 'admin' || role.name === 'super_admin'}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="pagination-btn"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </button>
                  <span className="pagination-info">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    className="pagination-btn"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminRolesPage;
