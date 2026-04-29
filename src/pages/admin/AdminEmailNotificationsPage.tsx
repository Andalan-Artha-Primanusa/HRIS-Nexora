import { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/app/store/auth.store";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { LoadingState, ErrorState, EmptyState } from "@/shared/ui/DataStateDisplay";
import { getErrorMessage } from "@/shared/api/errorHandler";
import { ROLES } from "@/shared/types/rbac.types";
import { BellRing, RefreshCw, Search, Send, Shield } from "lucide-react";
import "@/shared/styles/CrudPage.css";
import "@/pages/dashboard/overview/OverviewPage.css";
import "./AdminCrudPages.css";
import {
  getAdminEmailNotifications,
  getAdminEmailNotificationLogs,
} from "@/features/admin/api/admin-batch1.service";
import { getAllEmployees } from "@/features/employee/api/employee.service";

type EmailTemplateItem = {
  id?: number | string;
  key?: string;
  name?: string;
  subject?: string;
};

type EmailLogItem = {
  id?: number | string;
  subject?: string;
  recipient_email?: string;
  status?: string;
  type?: string;
  sent_at?: string;
};

const getRoleNames = (user: ReturnType<typeof useAuthStore.getState>["user"]) => (user?.roles ?? []).map((role) => role.name);

const hasAdminAccess = (user: ReturnType<typeof useAuthStore.getState>["user"]) => {
  const roleNames = getRoleNames(user);
  return roleNames.includes(ROLES.ADMIN) || roleNames.includes(ROLES.SUPER_ADMIN);
};

const AdminEmailNotificationsPage = () => {
  const user = useAuthStore((state) => state.user);

  if (!hasAdminAccess(user)) {
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

  const [items, setItems] = useState<EmailTemplateItem[]>([]);
  const [logs, setLogs] = useState<EmailLogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Search
  const [searchText, setSearchText] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  const loadData = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const [templatesResult, logsResult, ] = await Promise.all([
        getAdminEmailNotifications(),
        getAdminEmailNotificationLogs(),
        getAllEmployees()
      ]);
      setItems(Array.isArray(templatesResult) ? templatesResult : (templatesResult as any)?.data || []);
      setLogs(Array.isArray(logsResult) ? logsResult : (logsResult as any)?.data || []);
    } catch (error: unknown) {
      setErrorMessage(getErrorMessage(error as never));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  // Filter & Sort & Paginate for Templates
  const filteredTemplates = useMemo(() => {
    if (!searchText) return items;
    const q = searchText.toLowerCase();
    return items.filter((item) => {
      return (
        String(item.name ?? '').toLowerCase().includes(q) ||
        String(item.key ?? '').toLowerCase().includes(q) ||
        String(item.subject ?? '').toLowerCase().includes(q)
      );
    });
  }, [items, searchText]);

  const sortedTemplates = useMemo(() => {
    return [...filteredTemplates].sort((a, b) => {
      const nameA = String(a.name ?? '').toLowerCase();
      const nameB = String(b.name ?? '').toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }, [filteredTemplates]);

  const paginatedTemplates = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedTemplates.slice(startIndex, startIndex + pageSize);
  }, [sortedTemplates, currentPage, pageSize]);

  // Filter & Sort & Paginate for Logs
  const filteredLogs = useMemo(() => {
    if (!searchText) return logs;
    const q = searchText.toLowerCase();
    return logs.filter((log) => {
      return (
        String(log.subject ?? '').toLowerCase().includes(q) ||
        String(log.recipient_email ?? '').toLowerCase().includes(q) ||
        String(log.type ?? '').toLowerCase().includes(q)
      );
    });
  }, [logs, searchText]);

  const sortedLogs = useMemo(() => {
    return [...filteredLogs].sort((a, b) => {
      const dateA = new Date(String(a.sent_at ?? a.created_at ?? 0)).getTime();
      const dateB = new Date(String(b.sent_at ?? b.created_at ?? 0)).getTime();
      return dateB - dateA;
    });
  }, [filteredLogs]);

  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedLogs.slice(startIndex, startIndex + pageSize);
  }, [sortedLogs, currentPage, pageSize]);

  const totalPagesTemplates = Math.ceil(sortedTemplates.length / pageSize);
  const totalPagesLogs = Math.ceil(sortedLogs.length / pageSize);

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
        label: "Email Templates",
        subtitle: "Template yang tersedia",
        value: String(items.length),
        change: `${paginatedTemplates.length} data per halaman`,
        tone: "blue" as const,
        icon: BellRing,
      },
      {
        label: "Email Logs",
        subtitle: "Riwayat pengiriman email",
        value: String(logs.length),
        change: `${paginatedLogs.length} data per halaman`,
        tone: "green" as const,
        icon: Send,
      },
      {
        label: "Berhasil Terkirim",
        subtitle: "Total email sukses terkirim",
        value: String(logs.filter((l) => ["sent", "success", "delivered"].includes(String(l.status ?? '').toLowerCase())).length),
        change: "Sukses",
        tone: "purple" as const,
        icon: Send,
      },
      {
        label: "Pending",
        subtitle: "Masih menunggu proses delivery",
        value: String(logs.filter((l) => ["pending", "queued", "processing"].includes(String(l.status ?? '').toLowerCase())).length),
        change: "Menunggu",
        tone: "orange" as const,
        icon: RefreshCw,
      },
    ],
    [items.length, logs.length, paginatedTemplates.length, paginatedLogs.length]
  );

  const formatDate = (value?: string) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString("id-ID");
  };

  const getStatusBadge = (status?: string) => {
    const normalized = String(status || '').toLowerCase();
    if (["sent", "success", "delivered"].includes(normalized)) {
      return <span className="badge-soft badge-soft--green">SENT</span>;
    }
    if (["pending", "queued", "processing"].includes(normalized)) {
      return <span className="badge-soft badge-soft--orange">PENDING</span>;
    }
    if (["failed", "error"].includes(normalized)) {
      return <span className="badge-soft badge-soft--red">FAILED</span>;
    }
    return <span className="badge-soft badge-soft--gray">{status || 'N/A'}</span>;
  };

  return (
    <div className="crud-page">
      {/* Header */}
      <Card className="hero-card">
        <div className="hero-card-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <BellRing size={16} />
              <span>Admin Center</span>
            </div>
            <h1 className="hero-title">Email Notifications</h1>
            <p className="hero-subtitle">
              Kelola email notification, template, dan pantau log delivery email.
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn-outline" onClick={() => void loadData()} disabled={loading}>
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Segarkan
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
            <BellRing size={24} />
          </div>
          <div>
            <h2 className="analytics-title">Daftar Email Templates</h2>
            <p className="analytics-subtitle">Kelola dan lihat semua template email</p>
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
                placeholder="Cari template..."
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

      {/* Table Section - Templates */}
      <div className="table-section">
        <div className="wuw-table-area">
          {loading && <LoadingState message="Memuat email templates..." />}
          {!loading && errorMessage && <ErrorState message="Koneksi Terputus" error={errorMessage} onRetry={loadData} />}

          {!loading && !errorMessage && paginatedTemplates.length === 0 && (
            <div style={{ padding: '5rem 0' }}>
              <EmptyState
                title="Pencarian Kosong"
                message="Kami tidak menemukan template yang sesuai dengan kriteria Anda."
                actionLabel="Bersihkan Filter"
                onAction={clearFilters}
              />
            </div>
          )}

          {!loading && !errorMessage && paginatedTemplates.length > 0 && (
            <>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Key</th>
                      <th>Name</th>
                      <th>Subject</th>
                      <th>Status</th>
                      <th className="th-center" style={{ width: '120px' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedTemplates.map((item, index) => (
                      <tr key={String(item.id ?? `${item.key ?? "template"}-${index}`)}>
                        <td><span className="cell-id">{item.id ?? "-"}</span></td>
                        <td><span className="badge-soft badge-soft--blue">{item.key || "-"}</span></td>
                        <td>
                          <div className="cell-name">
                            <div className="cell-avatar">
                              {(item.name || 'T').charAt(0).toUpperCase()}
                            </div>
                            <span className="cell-name-text">{item.name || "-"}</span>
                          </div>
                        </td>
                        <td>{item.subject || "-"}</td>
                        <td>
                          <span className={`badge-soft ${item.is_active ? 'badge-soft--green' : 'badge-soft--red'}`}>
                            {item.is_active ? 'ACTIVE' : 'INACTIVE'}
                          </span>
                        </td>
                        <td className="td-center">
                          <span className="badge-soft badge-soft--blue">Template</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="table-pagination">
                <div className="pagination-info">
                  Menampilkan <strong>{paginatedTemplates.length}</strong> dari <strong>{sortedTemplates.length}</strong> templates
                </div>
                <div className="pagination-controls">
                  <button
                    className="pagination-btn"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    ‹
                  </button>
                  {Array.from({ length: totalPagesTemplates }, (_, i) => i + 1).map((page) => (
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
                    onClick={() => setCurrentPage(Math.min(totalPagesTemplates, currentPage + 1))}
                    disabled={currentPage === totalPagesTemplates}
                  >
                    ›
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Analytics Title Card - Logs */}
      <Card className="analytics-title-card">
        <div className="analytics-title-inner">
          <div className="analytics-icon">
            <Send size={24} />
          </div>
          <div>
            <h2 className="analytics-title">Email Delivery Logs</h2>
            <p className="analytics-subtitle">Pantau log pengiriman email</p>
          </div>
        </div>
      </Card>

      {/* Table Section - Logs */}
      <div className="table-section">
        <div className="wuw-table-area">
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
                      <th>Subject</th>
                      <th>Recipient</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Sent At</th>
                      <th className="th-center" style={{ width: '120px' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedLogs.map((log, index) => (
                      <tr key={String(log.id ?? `${log.subject ?? "log"}-${index}`)}>
                        <td><span className="cell-id">{log.id ?? "-"}</span></td>
                        <td>
                          <div className="cell-name">
                            <div className="cell-avatar">
                              {(log.subject || 'L').charAt(0).toUpperCase()}
                            </div>
                            <span className="cell-name-text">{log.subject || "-"}</span>
                          </div>
                        </td>
                        <td>{log.recipient_email || "-"}</td>
                        <td><span className="badge-soft badge-soft--purple">{log.type || "-"}</span></td>
                        <td>{getStatusBadge(log.status)}</td>
                        <td className="cell-date">{formatDate(log.sent_at || log.created_at)}</td>
                        <td className="td-center">
                          <span className="badge-soft badge-soft--blue">Logged</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="table-pagination">
                <div className="pagination-info">
                  Menampilkan <strong>{paginatedLogs.length}</strong> dari <strong>{sortedLogs.length}</strong> logs
                </div>
                <div className="pagination-controls">
                  <button
                    className="pagination-btn"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    ‹
                  </button>
                  {Array.from({ length: totalPagesLogs }, (_, i) => i + 1).map((page) => (
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
                    onClick={() => setCurrentPage(Math.min(totalPagesLogs, currentPage + 1))}
                    disabled={currentPage === totalPagesLogs}
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

export default AdminEmailNotificationsPage;