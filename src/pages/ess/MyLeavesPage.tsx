import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { Card } from "@/shared/ui/Card";

import { Calendar } from "lucide-react";

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
  if (typeof value === "object") return "-";

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.includes("T") && !Number.isNaN(Date.parse(trimmed))) {
      return new Date(trimmed).toLocaleString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  }

  return String(value);
};

const toLabel = (key: string) =>
  key
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isNumericLike = (value: unknown) => {
  if (typeof value === "number") return true;
  if (typeof value !== "string") return false;
  return value.trim() !== "" && !Number.isNaN(Number(value));
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

  const leaveSummaryCards = useMemo(
    () => {
      if (isBalanceRoute) {
        const balanceEntries = leaveBalance ? Object.entries(leaveBalance) : [];

        return [
          {
            label: "Balance Fields",
            subtitle: "Jumlah field saldo cuti",
            value: String(balanceEntries.length),
            change: "Ringkasan data saldo",
            tone: "blue" as const,
          },
          {
            label: "Available Snapshot",
            subtitle: "Status saldo yang tampil",
            value: leaveBalance ? "Ready" : "-",
            change: "Data saldo personal",
            tone: "green" as const,
          },
          {
            label: "Route",
            subtitle: "Halaman yang sedang dibuka",
            value: "Balance",
            change: "/leave/balance",
            tone: "orange" as const,
          },
        ];
      }

      const pendingLeaves = leaves.filter((item) => String((item as any).status ?? "pending").toLowerCase() === "pending").length;
      const approvedLeaves = leaves.filter((item) => String((item as any).status ?? "").toLowerCase() === "approved").length;
      const rejectedLeaves = leaves.filter((item) => String((item as any).status ?? "").toLowerCase() === "rejected").length;

      return [
        {
          label: "Total Leaves",
          subtitle: "Semua pengajuan cuti",
          value: String(leaves.length),
          change: "Riwayat cuti yang tersimpan",
          tone: "blue" as const,
        },
        {
          label: "Pending",
          subtitle: "Menunggu persetujuan",
          value: String(pendingLeaves),
          change: "Perlu ditinjau",
          tone: "orange" as const,
        },
        {
          label: "Approved",
          subtitle: "Pengajuan disetujui",
          value: String(approvedLeaves),
          change: "Status final selesai",
          tone: "green" as const,
        },
        {
          label: "Rejected",
          subtitle: "Pengajuan ditolak",
          value: String(rejectedLeaves),
          change: "Butuh revisi atau tindak lanjut",
          tone: "red" as const,
        },
      ];
    },
    [isBalanceRoute, leaveBalance, leaves]
  );

  const handleRefresh = () => {
    if (isBalanceRoute) {
      void loadLeaveBalance();
      return;
    }

    void loadLeaves();
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
        <div className="ess-header-copy">
          <p className="ess-badge">ESS Center</p>
          <h1>{isBalanceRoute ? "My Leave Balance" : "My Leaves"}</h1>
          <p>
      {isBalanceRoute
        ? "Lihat saldo cuti tersedia Anda dengan tampilan visual yang konsisten dan menarik."
        : "Lihat riwayat cuti Anda dengan tampilan yang konsisten di seluruh aplikasi."}

          </p>
        </div>
        <Button variant="primary" size="md" onClick={handleRefresh} disabled={loading}>
          {loading ? "Loading..." : "Refresh"}
        </Button>
      </div>

      <div className="ess-summary-grid">
        {leaveSummaryCards.map((card) => (
          <Card key={card.label} className="ess-summary-card" glass>
            <div className="ess-summary-header">
              <div>
                <span className="ess-summary-label">{card.label}</span>
                <p className="ess-summary-subtitle">{card.subtitle}</p>
              </div>
              <span className={`ess-summary-icon ess-summary-icon--${card.tone}`} />
            </div>
            <div className="ess-summary-value">{card.value}</div>
            <div className="ess-summary-change">{card.change}</div>
          </Card>
        ))}
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
                    <td colSpan={5} className="submenu-table-empty">
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
            <div className="leave-balance-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
              {Object.entries(leaveBalance).map(([key, value]) => {
                const label = toLabel(key);
                const isNumeric = isNumericLike(value);
                const numValue = isNumeric ? Number(value) : 0;
                
                return (
                  <Card key={key} className="leave-balance-card" glass style={{ padding: '1.5rem', borderRadius: '20px', border: '1px solid rgba(37,99,235,0.12)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#1e293b' }}>{label}</h3>
                        <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.85rem' }}>Available Days</p>
                      </div>
                      <span style={{ fontSize: '2rem', fontWeight: '800', color: '#10b981' }}>
                        {asDisplay(value)}
                      </span>
                    </div>
                    {isNumeric && (
                      <div style={{ height: '12px', background: '#e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%',
                          background: 'linear-gradient(90deg, #10b981, #059669)',
                          borderRadius: '6px',
                          width: `${Math.min(numValue / 30 * 100, 100)}%`,
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#94a3b8' }}>
              <Calendar size={64} style={{ opacity: 0.3, marginBottom: '1rem' }} />
              <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>No leave balance data available</p>
              <p style={{ marginTop: '0.5rem' }}>Your leave entitlements will appear here.</p>
            </div>
          )}

        </Card>
      )}
    </div>
  );
};

export default MyLeavesPage;
