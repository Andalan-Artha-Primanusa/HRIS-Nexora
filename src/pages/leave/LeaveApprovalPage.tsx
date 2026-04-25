import { useEffect, useState } from "react";
import { Card } from "@/shared/ui/Card";
import { LoadingState, EmptyState } from "@/shared/ui/DataStateDisplay";
import { approveLeave, getPendingLeaves, rejectLeave } from "@/features/leave/api/leave.service";
import type { LeaveItem } from "@/features/leave/types/leave.types";
import { BarChart3, Check, CircleCheckBig, CircleX, Clock3, RefreshCw, Calendar, CheckCircle, XCircle } from "lucide-react";
import "@/shared/styles/CrudPage.css";
import "@/pages/dashboard/overview/OverviewPage.css";
import "./LeaveShared.css";

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
  // Try different possible paths to get employee name
  if (typeof leave.employee === "string") return leave.employee;
  if (typeof leave.employee_name === "string") return leave.employee_name;
  if (leave.employee?.name) return leave.employee.name;
  if (leave.employee?.user?.name) return leave.employee.user.name;
  if (leave.user?.name) return leave.user.name;
  if (leave.employee?.employee_code) return leave.employee.employee_code;
  return "-";
};

const getSafeString = (value: any) => {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (value === null || value === undefined) return "-";
  return "-";
};

const LeaveApprovalPage = () => {
  const [items, setItems] = useState<LeaveItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const leaveSummaryCards = [
    {
      label: "Pending Requests",
      subtitle: "Pengajuan yang menunggu aksi",
      value: String(items.length),
      change: "Prioritas review hari ini",
      tone: "blue" as const,
      icon: BarChart3,
    },
    {
      label: "Ready to Review",
      subtitle: "Daftar yang dapat diproses",
      value: String(items.length > 0 ? items.length : 0),
      change: "Approve atau reject dengan cepat",
      tone: "orange" as const,
      icon: Clock3,
    },
    {
      label: "Approved Today",
      subtitle: "Aksi yang selesai hari ini",
      value: "0",
      change: "Update mengikuti aksi terbaru",
      tone: "green" as const,
      icon: CircleCheckBig,
    },
    {
      label: "Rejected Today",
      subtitle: "Aksi penolakan hari ini",
      value: "0",
      change: "Status final penolakan",
      tone: "red" as const,
      icon: CircleX,
    },
  ];

  const loadPending = async () => {
    setLoading(true);

    try {
      const result = await getPendingLeaves();
      setItems(result.items);
    } catch (error: unknown) {
      // Handle error silently
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (leaveId: string | number) => {
    setActionLoading(String(leaveId));

    try {
      await approveLeave(String(leaveId), { note: "Approved" });
      await loadPending();
    } catch (error: unknown) {
      // Handle error silently
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (leaveId: string | number) => {
    setActionLoading(String(leaveId));

    try {
      await rejectLeave(String(leaveId), { note: "Rejected" });
      await loadPending();
    } catch (error: unknown) {
      // Handle error silently
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    void loadPending();
  }, []);

  return (
    <div className="crud-page">
      {/* Header - Same style as Dashboard */}
      <Card className="hero-card">
        <div className="hero-card-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <Calendar size={16} />
              <span>Pusat Persetujuan</span>
            </div>
            <h1 className="hero-title">Persetujuan Cuti</h1>
            <p className="hero-subtitle">Review dan setujui atau tolak pengajuan cuti yang menunggu.</p>
          </div>
          <div className="hero-actions">
            <button className="btn-outline" onClick={() => void loadPending()}>
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Segarkan
            </button>
          </div>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="leave-approval-wrapper">
        <div className="leave-summary-card">
          <div className="leave-summary-header">
            <div>
              <p className="leave-summary-label">Menunggu</p>
              <p className="leave-summary-subtitle">Pengajuan yang menunggu aksi</p>
            </div>
            <div className="leave-summary-icon-wrapper leave-icon-blue">
              <BarChart3 size={28} />
            </div>
          </div>
          <div className="leave-summary-value leave-value-blue">{items.length}</div>
          <p className="leave-summary-trend">Prioritas review hari ini</p>
        </div>

        <div className="leave-summary-card">
          <div className="leave-summary-header">
            <div>
              <p className="leave-summary-label">Siap Diproses</p>
              <p className="leave-summary-subtitle">Daftar yang dapat diproses</p>
            </div>
            <div className="leave-summary-icon-wrapper leave-icon-orange">
              <Clock3 size={28} />
            </div>
          </div>
          <div className="leave-summary-value leave-value-orange">{items.length}</div>
          <p className="leave-summary-trend">Approve atau reject</p>
        </div>

        <div className="leave-summary-card">
          <div className="leave-summary-header">
            <div>
              <p className="leave-summary-label">Disetujui</p>
              <p className="leave-summary-subtitle">Aksi yang selesai</p>
            </div>
            <div className="leave-summary-icon-wrapper leave-icon-green">
              <CircleCheckBig size={28} />
            </div>
          </div>
          <div className="leave-summary-value leave-value-green">0</div>
          <p className="leave-summary-trend">Update mengikuti aksi terbaru</p>
        </div>

        <div className="leave-summary-card">
          <div className="leave-summary-header">
            <div>
              <p className="leave-summary-label">Ditolak</p>
              <p className="leave-summary-subtitle">Aksi penolakan</p>
            </div>
            <div className="leave-summary-icon-wrapper leave-icon-red">
              <CircleX size={28} />
            </div>
          </div>
          <div className="leave-summary-value leave-value-red">0</div>
          <p className="leave-summary-trend">Status final penolakan</p>
        </div>
      </div>

      {/* Analytics Title Card */}
      <Card className="analytics-title-card">
        <div className="analytics-title-inner">
          <div className="analytics-icon">
            <Calendar size={24} />
          </div>
          <div>
            <h2 className="analytics-title">Pengajuan Menunggu</h2>
            <p className="analytics-subtitle">{items.length} pengajuan cuti menunggu persetujuan</p>
          </div>
        </div>
      </Card>

      {/* Table Section */}
      <div className="table-section">
        <div className="table-wrap">
          {loading && <LoadingState message="Memuat data pengajuan cuti..." />}
          {!loading && items.length === 0 && (
            <div className="empty-state">
              <EmptyState title="Tidak ada pengajuan" message="Tidak ada pengajuan cuti yang menunggu persetujuan." />
            </div>
          )}
          {!loading && items.length > 0 && (
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Karyawan</th>
                  <th>Tipe Cuti</th>
                  <th>Tanggal</th>
                  <th>Hari</th>
                  <th>Alasan</th>
                  <th className="th-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => {
                  const leave = item as any;
                  return (
                    <tr key={String(leave.id ?? index)}>
                      <td>
                        <span style={{ fontWeight: 700, color: '#1e293b' }}>{index + 1}</span>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8' }}>ID: {leave.id}</span>
                      </td>
                      <td>
                        <div className="cell-name">
                          <div className="cell-avatar">
                            {getEmployeeName(leave).charAt(0).toUpperCase()}
                          </div>
                          <span className="cell-name-text">{getEmployeeName(leave)}</span>
                        </div>
                      </td>
                      <td><span className="status-badge status-badge--blue">{getLeaveTypeLabel(leave.type)}</span></td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{formatDate(leave.start_date)}</div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>hingga {formatDate(leave.end_date)}</div>
                      </td>
                      <td><strong>{getSafeString(leave.total_days) || "1"}</strong> hari</td>
                      <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {getSafeString(leave.reason)}
                      </td>
                      <td>
                        <div className="action-btn-group">
                          <button 
                            className="action-btn action-btn-approve" 
                            onClick={() => void handleApprove(leave.id)}
                            disabled={actionLoading === String(leave.id)}
                            title="Setujui"
                          >
                            <CheckCircle size={16} />
                          </button>
                          <button 
                            className="action-btn action-btn-reject" 
                            onClick={() => void handleReject(leave.id)}
                            disabled={actionLoading === String(leave.id)}
                            title="Tolak"
                          >
                            <XCircle size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaveApprovalPage;
