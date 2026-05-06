import { useEffect, useState, useMemo } from "react";
import { Card, CardHeader } from "@/shared/ui";
import { LoadingState, EmptyState } from "@/shared/ui/DataStateDisplay";
import { approveLeave, getLeaveRequests, rejectLeave } from "@/features/leave/api/leave.service";
import type { LeaveItem } from "@/features/leave/types/leave.types";
import { RefreshCw, Check, X, Clock3, CheckCircle2, XCircle, Search } from "lucide-react";
import { showToast } from "@/shared/ui/toast";
import '@/shared/styles/CrudPage.css';
import '@/pages/dashboard/overview/OverviewPage.css';
import '@/pages/leave/LeaveApprovalPage.css';
import '@/pages/admin/AdminPermissionsPage.css';
import { useAuthStore } from "@/app/store/auth.store";

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
};

const getLeaveTypeLabel = (type: string | undefined) => {
  const typeMap: Record<string, string> = {
    annual: "Cuti Tahunan",
    sick: "Cuti Sakit",
    personal: "Cuti Pribadi",
    unpaid: "Cuti Tanpa Gaji",
  };
  return typeMap[type?.toLowerCase() ?? ""] ?? type ?? "-";
};

const getEmployeeName = (leave: any) => {
  if (typeof leave.employee === "string") return leave.employee;
  if (typeof leave.employee_name === "string") return leave.employee_name;
  if (leave.employee?.name) return leave.employee.name;
  if (leave.employee?.user?.name) return leave.employee.user.name;
  if (leave.user?.name) return leave.user.name;
  if (leave.employee?.employee_code) return leave.employee.employee_code;
  return "-";
};

const LeaveApprovalPage = () => {
  const user = useAuthStore((state) => state.user) as any;
  const isAdmin = user?.roles?.some((r: any) => ['super_admin', 'admin', 'hr', 'manager'].includes(r.name?.toLowerCase())) || false;

  const [items, setItems] = useState<LeaveItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Search & Filter
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState<"Semua" | "Pending" | "Approved" | "Rejected">("Semua");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await getLeaveRequests({});
      const raw = result.items || [];
      setItems(raw);
    } catch (error: unknown) {
      console.error("Failed to load leaves:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const empName = getEmployeeName(item).toLowerCase();
      const query = searchText.toLowerCase();
      const matchSearch = empName.includes(query);

      let statusMatch = true;
      if (activeTab === "Pending") statusMatch = item.status === 'pending' || item.status === 'submitted';
      else if (activeTab === "Approved") statusMatch = item.status === 'approved';
      else if (activeTab === "Rejected") statusMatch = item.status === 'rejected';

      return matchSearch && statusMatch;
    });
  }, [items, searchText, activeTab]);

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredItems.slice(startIndex, startIndex + pageSize);
  }, [filteredItems, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredItems.length / pageSize);

  const summaryStats = useMemo(() => {
    const pending = items.filter(i => i.status === 'pending' || i.status === 'submitted').length;
    const approved = items.filter(i => i.status === 'approved').length;
    const rejected = items.filter(i => i.status === 'rejected').length;

    return [
      { label: "Pending", subtitle: "Menunggu persetujuan", value: pending, tone: "blue" as const },
      { label: "Disetujui", subtitle: "Pengajuan disetujui", value: approved, tone: "green" as const },
      { label: "Ditolak", subtitle: "Pengajuan ditolak", value: rejected, tone: "red" as const },
    ];
  }, [items]);

  const handleApprove = async (leaveId: string | number) => {
    setActionLoading(String(leaveId));
    try {
      await approveLeave(String(leaveId), { note: "Disetujui" });
      await loadData();
      showToast("Pengajuan disetujui", "success");
    } catch (error: unknown) {
      console.error("Failed to approve:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (leaveId: string | number) => {
    const reason = window.prompt("Berikan alasan penolakan untuk karyawan:");
    if (reason === null) return;

    setActionLoading(String(leaveId));
    try {
      await rejectLeave(String(leaveId), { note: reason || "Ditolak tanpa alasan" });
      await loadData();
      showToast("Pengajuan ditolak", "success");
    } catch (error: unknown) {
      console.error("Failed to reject:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const clearFilters = () => {
    setSearchText("");
    setActiveTab("Semua");
    setCurrentPage(1);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, activeTab]);

  const getStatusClass = (status?: string) => {
    const normalized = String(status || "").toLowerCase();
    if (normalized === "approved") return "status-badge status-badge--approved";
    if (normalized === "submitted" || normalized === "pending") return "status-badge status-badge--pending";
    if (normalized === "rejected") return "status-badge status-badge--draft";
    return "status-badge status-badge--draft";
  };

  return (
    <div className="crud-page">
      {/* Header */}
      <Card className="hero-card">
        <div className="hero-card-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <Clock3 size={16} />
              <span>Leave Center</span>
            </div>
            <h1 className="hero-title">Leave Approval</h1>
            <p className="hero-subtitle">
              Review and approve/reject pending employee leave requests securely.
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn-outline" onClick={() => void loadData()} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Segarkan
            </button>
          </div>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="employee-summary-wrapper">
        {summaryStats.map((card) => {
          const Icon = card.tone === "blue" ? Clock3 : card.tone === "green" ? CheckCircle2 : XCircle;

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
              <p className="employee-summary-trend">{card.subtitle}</p>
            </div>
          );
        })}
      </div>

      {/* Analytics Title Card */}
      <Card className="analytics-title-card">
        <div className="analytics-title-inner">
          <div className="analytics-icon">
            <Clock3 size={24} />
          </div>
          <div>
            <h2 className="analytics-title">Daftar Pengajuan Cuti</h2>
            <p className="analytics-subtitle">Kelola dan lihat semua pengajuan cuti karyawan</p>
          </div>
        </div>
      </Card>

      {/* Control Section */}
      <Card className="control-section-card">
        <div className="control-section-inner">
          {/* Tabs */}
          <div className="elyra-tabs">
            {["Semua", "Pending", "Approved", "Rejected"].map((tab) => (
              <button
                key={tab}
                className={`elyra-tab ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab as "Semua" | "Pending" | "Approved" | "Rejected")}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="control-actions">
            <div className="search-box">
              <div className="search-icon-inside"><Search size={18} /></div>
              <input
                type="text"
                placeholder="Cari karyawan..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="search-input-pill"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Table Section */}
      <div className="table-section">
        <div className="wuw-table-area">
          {loading && <LoadingState message="Memuat pengajuan cuti..." />}

          {!loading && paginatedItems.length === 0 && (
            <div style={{ padding: '5rem 0' }}>
              <EmptyState
                title="Belum Ada Pengajuan"
                message={searchText || activeTab !== "Semua"
                  ? "Tidak ada pengajuan yang sesuai dengan kriteria Anda."
                  : "Tidak ada pengajuan cuti yang perlu disetujui."}
                actionLabel="Segarkan"
                onAction={() => void loadData()}
              />
            </div>
          )}

          {!loading && paginatedItems.length > 0 && (
            <>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '250px' }}>Karyawan</th>
                      <th>Tipe Cuti</th>
                      <th>Tanggal</th>
                      <th>Hari</th>
                      <th>Alasan</th>
                      <th className="th-center">Status</th>
                      {isAdmin && <th className="th-center" style={{ width: '140px' }}>Aksi</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedItems.map((item: any, index) => (
                      <tr key={String(item.id ?? index)}>
                        <td>
                          <div className="cell-name">
                            <div className="cell-avatar">
                              {getEmployeeName(item).charAt(0).toUpperCase()}
                            </div>
                            <div className="cell-stacked">
                              <span className="cell-name-text">{getEmployeeName(item)}</span>
                              <span className="cell-stacked__sub">{item.employee?.employee_code || item.id}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="badge-soft badge-soft--blue">{getLeaveTypeLabel(item.type)}</span>
                        </td>
                        <td>
                          <div className="cell-stacked">
                            <span className="cell-stacked__main" style={{ fontSize: '0.85rem' }}>{formatDate(item.start_date)}</span>
                            <span className="cell-stacked__sub">hingga {formatDate(item.end_date)}</span>
                          </div>
                        </td>
                        <td>
                          <span style={{ fontWeight: 700, color: '#1e293b' }}>{item.total_days || 1} hari</span>
                        </td>
                        <td style={{ maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {item.reason || "-"}
                        </td>
                        <td className="td-center">
                          <span className={getStatusClass(item.status)}>
                            {item.status === "approved" ? "Approved" :
                              item.status === "submitted" || item.status === "pending" ? "Pending" : "Rejected"}
                          </span>
                        </td>
                        {isAdmin && (
                          <td className="td-center">
                            <div className="action-btn-group">
                              {item.status === 'pending' || item.status === 'submitted' ? (
                                <>
                                  <button
                                    className="action-btn"
                                    style={{ color: '#10b981' }}
                                    onClick={() => handleApprove(item.id)}
                                    disabled={actionLoading === String(item.id)}
                                    title="Setujui"
                                  >
                                    <Check size={16} />
                                  </button>
                                  <button
                                    className="action-btn action-btn-delete"
                                    onClick={() => handleReject(item.id)}
                                    disabled={actionLoading === String(item.id)}
                                    title="Tolak"
                                  >
                                    <X size={16} />
                                  </button>
                                </>
                              ) : null}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="table-pagination">
                <div className="pagination-info">
                  Menampilkan <strong>{paginatedItems.length}</strong> dari <strong>{filteredItems.length}</strong> pengajuan
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

export default LeaveApprovalPage;
