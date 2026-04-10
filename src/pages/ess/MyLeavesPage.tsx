import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { getMyLeaveBalance, getMyLeaves } from "@/features/ess/api/ess.service";
import type { GenericApiItem } from "@/features/ess/types/ess.types";
import "./EssPages.css";

const formatDate = (dateString: string | undefined | null) => {
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

const asDisplay = (value: unknown) => {
  if (value === null || value === undefined) return "-";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

const MyLeavesPage = () => {
  const { pathname } = useLocation();
  const isBalanceRoute = pathname === "/leave/balance";

  const [leaves, setLeaves] = useState<GenericApiItem[]>([]);
  const [leaveBalance, setLeaveBalance] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  const loadLeaves = async () => {
    setLoading(true);

    try {
      const result = await getMyLeaves();
      setLeaves(result.items);
    } catch (error: unknown) {
      // Handle error silently
    } finally {
      setLoading(false);
    }
  };

  const loadLeaveBalance = async () => {
    setLoading(true);

    try {
      const result = await getMyLeaveBalance();
      const balancePayload =
        result.payload && typeof result.payload === "object"
          ? (result.payload as Record<string, unknown>)
          : null;

      setLeaveBalance(balancePayload);
    } catch (error: unknown) {
      // Handle error silently
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isBalanceRoute) {
      void loadLeaveBalance();
    } else {
      void loadLeaves();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBalanceRoute]);

  return (
    <div className="ess-page">
      <div className="ess-header">
        <div>
          <h1>{isBalanceRoute ? "💰 My Leave Balance" : "📋 My Leaves"}</h1>
          <p>
            {isBalanceRoute
              ? "View your available leave balance"
              : "View your leave history"}
          </p>
        </div>
        <Button variant="primary" size="md" onClick={() => void loadLeaves()} disabled={loading}>
          {loading ? "Loading..." : "Refresh"}
        </Button>
      </div>

      {!isBalanceRoute && (
        <Card className="ess-card" glass>
          <div className="ess-table-wrap">
            <table className="ess-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Leave Type</th>
                  <th>From - To</th>
                  <th>Days</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {leaves.length > 0 ? (
                  leaves.map((item, index) => {
                    const leave = item as any;
                    const status = leave.status || "pending";
                    return (
                      <tr key={String(leave.id ?? index)}>
                        <td className="ess-table-id">{index + 1}</td>
                        <td className="ess-table-type">{getLeaveTypeLabel(leave.type)}</td>
                        <td className="ess-table-dates">
                          <div>{formatDate(leave.start_date)}</div>
                          <div className="ess-table-dates-sub">to {formatDate(leave.end_date)}</div>
                        </td>
                        <td className="ess-table-days">{leave.total_days || 1} days</td>
                        <td>
                          <span className={`leave-status-badge leave-status-${status}`}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
                      No leave data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {isBalanceRoute && (
        <Card className="ess-card" glass>
          <h2>Your Leave Balance</h2>
          {leaveBalance ? (
            <div className="ess-balance-grid">
              {Object.entries(leaveBalance).map(([key, value]) => (
                <div className="ess-balance-item" key={key}>
                  <span>{key.replace(/_/g, " ").toUpperCase()}</span>
                  <strong>{asDisplay(value)}</strong>
                </div>
              ))}
            </div>
          ) : (
            <p className="ess-empty">No leave balance data available.</p>
          )}
        </Card>
      )}
    </div>
  );
};

export default MyLeavesPage;
