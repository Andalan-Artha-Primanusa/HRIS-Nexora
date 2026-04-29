import { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/app/store/auth.store";
import { Card } from "@/shared/ui/Card";
import { LoadingState, ErrorState, EmptyState } from "@/shared/ui/DataStateDisplay";
import { Alert } from "@/shared/ui/Alert";
import { RBACUtils } from "@/shared/hooks/rbac";
import { getAllPermissions } from "@/features/admin/api/admin.service";
import { getErrorMessage } from "@/shared/api/errorHandler";
import type { AdminEntityItem } from "@/features/admin/types/admin.types";
import { KeyRound, RefreshCw, Search, ShieldAlert, Shield } from "lucide-react";
import "@/shared/styles/CrudPage.css";
import "@/pages/dashboard/overview/OverviewPage.css";
import "@/pages/payroll/PayrollShared.css";

const asDisplay = (value: unknown) => {
  if (value === null || value === undefined) return "-";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

const getColumns = (perms: AdminEntityItem[]) => {
  if (perms.length === 0) {
    return ["id", "name", "guard_name"];
  }

  const keys = Object.keys(perms[0]);
  const preferred = ["id", "name", "guard_name"];
  const merged = [...preferred, ...keys.filter((key) => !preferred.includes(key))];
  return merged.filter((key, index) => merged.indexOf(key) === index);
};

const AdminPermissionsPage = () => {
  const user = useAuthStore((state) => state.user);
  const canViewPermissions = RBACUtils.canViewPermissions(user);
  const [permissions, setPermissions] = useState<AdminEntityItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  const columns = useMemo(() => getColumns(permissions), [permissions]);

  const filteredPermissions = useMemo(() => {
    return permissions.filter((item) => {
      const searchStr = searchText.toLowerCase();
      if (!searchStr) return true;
      const nameMatch = item.name?.toLowerCase().includes(searchStr);
      const guardMatch = item.guard_name?.toLowerCase().includes(searchStr);
      return nameMatch || guardMatch;
    });
  }, [permissions, searchText]);

  const paginatedPermissions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPermissions.slice(start, start + pageSize);
  }, [filteredPermissions, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredPermissions.length / pageSize);

  const loadPermissions = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const data = await getAllPermissions();
      const permsArray = Array.isArray(data) ? data : data.data || [];
      setPermissions(permsArray);
    } catch (error: unknown) {
      setErrorMessage(getErrorMessage(error as never));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPermissions();
  }, []);

  if (!canViewPermissions) {
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

  return (
    <div className="crud-page">
      <Card className="hero-card">
        <div className="hero-card-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <Shield size={16} />
              <span>Admin Center</span>
            </div>
            <h1 className="hero-title">Permission Management</h1>
            <p className="hero-subtitle">
              Kelola dan tampilkan daftar permission yang tersedia untuk pengaturan akses sistem.
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn-outline" onClick={() => void loadPermissions()} disabled={loading}>
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              {loading ? "Memuat..." : "Segarkan"}
            </button>
          </div>
        </div>
      </Card>

      <div className="white-unified-wrapper">
        <div className="wuw-header">
          <div className="wuw-header-top">
            <div className="wuw-title-area">
              <h3>Tabel Permissions</h3>
              <span className="wuw-count-badge">{filteredPermissions.length} permissions</span>
            </div>
            <div className="wuw-search">
              <Search size={16} className="wuw-search-icon" />
              <input
                type="text"
                className="search-input-pill"
                placeholder="Cari permission..."
                value={searchText}
                onChange={(e) => { setSearchText(e.target.value); setCurrentPage(1); }}
              />
            </div>
          </div>
        </div>

        <div className="wuw-table-area">
          {loading && <LoadingState message="Memuat permissions..." />}
          {!loading && errorMessage && <ErrorState message="Koneksi Terputus" error={errorMessage} onRetry={loadPermissions} />}

          {!loading && !errorMessage && (
            <>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      {columns.map((column) => (
                        <th key={column}>
                          {column === "id" && "ID"}
                          {column === "name" && "Permission"}
                          {column === "guard_name" && "Guard"}
                          {column !== "id" && column !== "name" && column !== "guard_name" && column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedPermissions.length > 0 ? (
                      paginatedPermissions.map((item, index) => (
                        <tr key={String(item.id ?? index)}>
                          {columns.map((column) => (
                            <td key={`${String(item.id ?? index)}-${column}`}>
                              {column === 'id' ? (
                                <span className="cell-id">{asDisplay(item[column])}</span>
                              ) : column === 'name' ? (
                                <span className="cell-tag">{asDisplay(item[column])}</span>
                              ) : (
                                asDisplay(item[column])
                              )}
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={columns.length} className="cell-empty">
                          <KeyRound size={32} style={{ opacity: 0.4, display: 'block', margin: '0 auto 0.75rem' }} />
                          Tidak ada data permission.
                        </td>
                      </tr>
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

export default AdminPermissionsPage;
