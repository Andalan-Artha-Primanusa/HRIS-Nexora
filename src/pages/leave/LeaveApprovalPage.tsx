import { useEffect, useState } from "react";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { approveLeave, getPendingLeaves, rejectLeave } from "@/features/leave/api/leave.service";
import type { LeaveItem } from "@/features/leave/types/leave.types";
import { Check, X } from "lucide-react";
import "./LeavePages.css";

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
    annual: "Annual Leave",
    sick: "Sick Leave",
    personal: "Personal Leave",
    unpaid: "Unpaid Leave",
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
    <div className="leave-page">
      <div className="leave-header">
        <div>
          <h1>✅ Leave Approval</h1>
          <p>Review and approve/reject pending leave requests</p>
        </div>
        <Button variant="primary" size="md" onClick={() => void loadPending()} disabled={loading}>
          {loading ? "Loading..." : "Refresh"}
        </Button>
      </div>

      <Card className="leave-card" glass>
        <div className="leave-table-wrap">
          <table className="leave-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Employee</th>
                <th>Leave Type</th>
                <th>Dates</th>
                <th>Days</th>
                <th>Reason</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length > 0 ? (
                items.map((item, index) => {
                  const leave = item as any;
                  return (
                    <tr key={String(leave.id ?? index)}>
                      <td className="leave-table-id">{index + 1}</td>
                      <td className="leave-table-employee">
                        <strong>{getEmployeeName(leave)}</strong>
                      </td>
                      <td className="leave-table-type">{getLeaveTypeLabel(leave.type)}</td>
                      <td className="leave-table-dates">
                        <div>{formatDate(leave.start_date)}</div>
                        <div className="leave-table-dates-sub">to {formatDate(leave.end_date)}</div>
                      </td>
                      <td className="leave-table-days">{getSafeString(leave.total_days) || "1"} days</td>
                      <td className="leave-table-reason" title={getSafeString(leave.reason)}>
                        {leave.reason ? String(leave.reason).substring(0, 35) + (String(leave.reason).length > 35 ? "..." : "") : "-"}
                      </td>
                      <td className="leave-table-actions">
                        <button
                          className="action-btn action-approve"
                          onClick={() => void handleApprove(leave.id)}
                          disabled={actionLoading === String(leave.id)}
                          title="Approve"
                        >
                          <Check size={18} />
                        </button>
                        <button
                          className="action-btn action-reject"
                          onClick={() => void handleReject(leave.id)}
                          disabled={actionLoading === String(leave.id)}
                          title="Reject"
                        >
                          <X size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "2rem", color: "var(--color-text-secondary)" }}>
                    No pending leave requests
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default LeaveApprovalPage;
