import { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/app/store/auth.store";
import { Card } from "@/shared/ui/Card";
import { LoadingState, ErrorState, EmptyState } from "@/shared/ui/DataStateDisplay";
import { getErrorMessage } from "@/shared/api/errorHandler";
import { RBACUtils } from "@/shared/hooks/rbac";
import { ClipboardList, RefreshCw, Search, Shield, ShieldCheck, UserCog } from "lucide-react";
import {
  getAuditLogs,
} from "@/features/admin/api/admin-batch1.service";
import type { AuditLogItem } from "@/features/admin/types/admin.types";
import "@/shared/styles/CrudPage.css";
import "@/pages/dashboard/overview/OverviewPage.css";
import "@/pages/payroll/PayrollShared.css";
import "./AdminCrudPages.css";

const canAccessPage = (user: any) => RBACUtils.isAdmin(user);

const AdminAuditLogsPage = () => {
  const user = useAuthStore((state) => state.user);
  const canAccess = canAccessPage(user);
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Search
  const [searchText, setSearchText] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  const loadLogs = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const responseData = await getAuditLogs();
      const logsArray = responseData?.items || [];
      setLogs(Array.isArray(logsArray) ? logsArray : []);
    } catch (error: unknown) {
      setErrorMessage(getErrorMessage(error as never));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadLogs();
  }, []);

  // Filter & Sort & Paginate
  const filteredLogs = useMemo(() => {
    if (!searchText) return logs;
    const q = searchText.toLowerCase();
    return logs.filter((log) => {
      const s = String;
      return (
        s(log.action)?.toLowerCase().includes(q) ||
        s((log as any).user?.name || log.user_name)?.toLowerCase().includes(q) ||
        s(log.module)?.toLowerCase().includes(q) ||
        s(log.ip_address)?.includes(q)
      );
    });
  }, [logs, searchText]);

  const sortedLogs = useMemo(() => {
    return [...filteredLogs].sort((a, b) => {
      const dateA = new Date(a.created_at || a.timestamp || 0).getTime();
      const dateB = new Date(b.created_at || b.timestamp || 0).getTime();
      return dateB - dateA; // Newest first
    });
  }, [filteredLogs]);

  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedLogs.slice(startIndex, startIndex + pageSize);
  }, [sortedLogs, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedLogs.length / pageSize);

  const clearFilters = () => {
    setSearchText('');
    setCurrentPage(1);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText]);

  const summaryCards = useMemo(
    () => [
      {
        label: "Total Logs",
        value: String(logs.length),
        subtitle: "Seluruh activity log",
        icon: ClipboardList,
        tone: "blue" as const,
        change: `${filteredLogs.length} hasil filter`,
      },
      {
        label: "Security",
        value: String(logs.filter((l) => String(l.action ?? "").toLowerCase().includes("login")).length),
        subtitle: "Login/logout events",
        icon: ShieldCheck,
        tone: "green" as const,
        change: "Security events",
      },
      {
        label: "Data Changes",
        value: String(logs.filter((l) => String(l.action ?? "").toLowerCase().includes("create") || String(l.action ?? "").toLowerCase().includes("update") || String(l.action ?? "").toLowerCase().includes("delete")).length),
        subtitle: "CRUD operations",
        icon: UserCog,
        tone: "orange" as const,
        change: "Modify operations",
      },
    ],
    [logs, filteredLogs.length]
  );

  if (!canAccess) {
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
      {/* Header */}
      <Card className="hero-card">
        <div className="hero-card-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <Shield size={16} />
              <span>Admin Center</span>
            </div>
            <h1 className="hero-title">Audit Logs</h1>
            <p className="hero-subtitle">
              Riwayat aktivitas dan perubahan di sistem.
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn-outline" onClick={() => void loadLogs()} disabled={loading}>
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              {loading ? "Memuat..." : "Segarkan"}
            </button>
          </div>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="employee-summary-wrapper">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="employee-summary-card">
              <div className="employee-summary-header">
                <div>
                  <p className="employee-summary-label">{card.label}</p>
                  <p className="employee-summary-subtitle">{card.subtitle}</p>
                </div>
                <div className={`employee-summary-icon-wrapper employee-icon-${card.tone}`}>
                  <Icon size={28} />
                </div>
              </div>
              <div className={`employee-summary-value employee-value-${card.tone}`}>{card.value}</div>
              <p className="employee-summary-trend">{card.change}</p>
            </div>
          );
        })}
      </div>

      {/* Analytics Title Card */}
      <Card className="analytics-title-card">
        <div className="analytics-title-inner">
          <div className="analytics-icon">
            <ClipboardList size={24} />
          </div>
          <div>
            <h2 className="analytics-title">Daftar Audit Log</h2>
            <p className="analytics-subtitle">Kelola dan lihat semua log aktivitas</p>
          </div>
        </div>
      </Card>

      {/* Control Section */}
      <Card className="control-section-card">
        <div className="control-section-inner">
          {/* Search */}
          <div className="control-actions">
            <div className="search-box">
              <div className="search-icon-inside"><Search size={18} /></div>
              <input
                type="text"
                placeholder="Cari action, user, modul, atau IP..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="search-input-pill"
              />
            </div>
            {searchText && (
              <button className="btn-clear-filter" onClick={clearFilters}>
                Hapus Filter
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Table Section */}
      <div className="table-section">
        <div className="wuw-table-area">
          {loading && <LoadingState message="Memuat audit log..." />}
          {!loading && errorMessage && <ErrorState message="Koneksi Terputus" error={errorMessage} onRetry={loadLogs} />}

          {!loading && !errorMessage && paginatedLogs.length === 0 && (
            <div style={{ padding: '5rem 0' }}>
              <EmptyState
                title="Pencarian Kosong"
                message="Kami tidak menemukan log yang sesuai dengan kriteria Anda."
                actionLabel="Bersihkan Filter"
                onAction={clearFilters}
              />
            </div>
          )}

          {!loading && !errorMessage && paginatedLogs.length > 0 && (
            <>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Event</th>
                      <th>User</th>
                      <th>Modul</th>
                      <th>IP Address</th>
                      <th>Waktu</th>
                      <th className="th-center" style={{ width: '120px' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedLogs.map((log, index) => {
                      const logId = (log as any).id ?? index;
                      const eventName = String((log as any).action || (log as any).event || "Unknown Event");
                      const userName = String((log as any).user?.name || (log as any).user_name || (log as any).causer_name || "-");
                      const moduleName = String((log as any).module || (log as any).subject_type || "-");
                      const ipAddress = String((log as any).ip_address || "-");
                      const rawDate = (log as any).created_at || (log as any).timestamp || "-";
                      let createdAt = "-";
                      if (rawDate && rawDate !== "-") {
                        const dateObj = new Date(rawDate);
                        if (!isNaN(dateObj.getTime())) {
                          createdAt = dateObj.toLocaleString("id-ID", {
                            year: "numeric",
                            month: "short",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          });
                        } else {
                          createdAt = String(rawDate);
                        }
                      }

                      return (
                        <tr key={String(logId)}>
                          <td><span className="cell-id">{String(logId)}</span></td>
                          <td>
                            <div className="cell-name">
                              <div className="cell-avatar">
                                {(eventName || 'E').charAt(0).toUpperCase()}
                              </div>
                              <span className="cell-name-text">{eventName}</span>
                            </div>
                          </td>
                          <td>{userName}</td>
                          <td><span className="badge-soft badge-soft--purple">{moduleName}</span></td>
                          <td>{ipAddress}</td>
                          <td className="cell-date">{createdAt}</td>
                          <td className="td-center">
                            <span className="badge-soft badge-soft--blue">Logged</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="table-pagination">
                <div className="pagination-info">
                  Menampilkan <strong>{paginatedLogs.length}</strong> dari <strong>{sortedLogs.length}</strong> log
                </div>
                <div className="pagination-controls">
                  <button
                    className="pagination-btn"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    ‹
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    className="pagination-btn"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    ›
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAuditLogsPage;