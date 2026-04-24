import { useEffect, useState } from "react";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { LoadingState, EmptyState } from "@/shared/ui/DataStateDisplay";
import { approveLeave, getPendingLeaves, rejectLeave } from "@/features/leave/api/leave.service";
import type { LeaveItem } from "@/features/leave/types/leave.types";
import { BarChart3, Check, CircleCheckBig, CircleX, Clock3, RefreshCw, X } from "lucide-react";
import "@/shared/styles/CrudPage.css";

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
      {/* Header */}
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-badge">Leave Center</span>
          <h1>Leave Approval</h1>
          <p>Review and approve/reject pending leave requests in a clean, consistent layout.</p>
        </div>
        <div className="page-header-actions">
          <Button variant="outline" size="md" onClick={() => void loadPending()} disabled={loading} style={{ borderColor: "#2563eb", color: "#2563eb" }}>
            <RefreshCw size={16} />
            {loading ? "Memuat..." : "Segarkan"}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-grid">
        {leaveSummaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <Card key={card.label} className="summary-card" glass>
              <div className="summary-card__header">
                <div>
                  <span className="summary-card__label">{card.label}</span>
                  <p className="summary-card__subtitle">{card.subtitle}</p>
                </div>
                <span className={`summary-card__icon summary-card__icon--${card.tone}`}>
                  <Icon size={20} />
                </span>
              </div>
              <div className={`summary-card__value summary-card__value--${card.tone}`}>{card.value}</div>
              <div className="summary-card__change">{card.change}</div>
            </Card>
          );
        })}
      </div>

      {/* Table */}
      <Card className="table-card" glass>
        <div className="table-header-bar">
          <h3>Pending Leave Requests</h3>
          <span className="table-count">{items.length} pengajuan</span>
        </div>

        {loading && <div className="table-card-inner"><LoadingState message="Memuat data pengajuan cuti..." /></div>}
        {!loading && items.length === 0 && (
          <div className="table-card-inner">
            <EmptyState
              icon=""
              title="Tidak ada pengajuan"
              message="Tidak ada pengajuan cuti yang menunggu persetujuan."
            />
          </div>
        )}

        {!loading && items.length > 0 && (
          <div className="table-card-inner">
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Employee</th>
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
                          <div className="cell-id">{index + 1}</div>
                          <div className="cell-sub">ID: {leave.id}</div>
                        </td>
                        <td>
                          <div className="cell-name">
                            <div className="cell-avatar">
                              {getEmployeeName(leave).charAt(0).toUpperCase()}
                            </div>
                            <span className="cell-name-text">{getEmployeeName(leave)}</span>
                          </div>
                        </td>
                        <td><span className="cell-tag">{getLeaveTypeLabel(leave.type)}</span></td>
                        <td>
                          <div className="cell-date">{formatDate(leave.start_date)}</div>
                          <div className="cell-date-sub">hingga {formatDate(leave.end_date)}</div>
                        </td>
                        <td><strong>{getSafeString(leave.total_days) || "1"}</strong> hari</td>
                        <td className="leave-table-reason" title={getSafeString(leave.reason)}>
                          {leave.reason ? String(leave.reason).substring(0, 35) + (String(leave.reason).length > 35 ? "..." : "") : "-"}
                        </td>
                        <td>
                          <div className="action-btn-group">
                            <button 
                              className="action-btn action-btn-success" 
                              onClick={() => void handleApprove(leave.id)}
                              disabled={actionLoading === String(leave.id)}
                              title="Approve"
                            >
                              <Check size={16} />
                            </button>
                            <button 
                              className="action-btn action-btn-delete" 
                              onClick={() => void handleReject(leave.id)}
                              disabled={actionLoading === String(leave.id)}
                              title="Reject"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default LeaveApprovalPage;
