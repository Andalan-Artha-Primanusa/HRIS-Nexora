import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { Card } from "@/shared/ui/Card";
import { LoadingState, ErrorState, EmptyState } from "@/shared/ui/DataStateDisplay";

import { Calendar, RefreshCw, Clock3, CircleCheckBig, CircleX, Wallet } from "lucide-react";

import { getMyLeaveBalance, getMyLeaves } from "@/features/ess/api/ess.service";
import type { GenericApiItem } from "@/features/ess/types/ess.types";
import "@/shared/styles/CrudPage.css";
import "@/pages/dashboard/overview/OverviewPage.css";
import "@/pages/leave/LeaveShared.css";

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
    annual: "Cuti Tahunan",
    sick: "Cuti Sakit",
    personal: "Cuti Pribadi",
    unpaid: "Cuti Tanpa Bayar",
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

const isNumericLike = (value: unknown) => {
  if (typeof value === "number") return true;
  if (typeof value !== "string") return false;
  return value.trim() !== "" && !Number.isNaN(Number(value));
};

const MyLeavesPage = () => {
  const { pathname } = useLocation();
  const isBalanceRoute = pathname === "/leave/balance" || pathname.includes("leave/balance");

  const [leaves, setLeaves] = useState<GenericApiItem[]>([]);
  const [leaveBalance, setLeaveBalance] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  const loadLeaves = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const result = await getMyLeaves();
      setLeaves(result.items);
    } catch (error: unknown) {
      console.error("Failed to load leaves:", error);
      setErrorMessage("Gagal memuat cuti");
    } finally {
      setLoading(false);
    }
  };

  const loadLeaveBalance = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const result = await getMyLeaveBalance();
      const balancePayload =
        result.payload && typeof result.payload === "object"
          ? (result.payload as Record<string, unknown>)
          : null;
      setLeaveBalance(balancePayload);
    } catch (error: unknown) {
      console.error("Failed to load leave balance:", error);
      setErrorMessage("Gagal memuat saldo cuti");
    } finally {
      setLoading(false);
    }
  };

  const summaryCards = useMemo(() => {
    if (isBalanceRoute) {
      const balanceEntries = leaveBalance ? Object.entries(leaveBalance) : [];
      return [
        {
          label: "Balance Fields",
          subtitle: "Jumlah field saldo cuti",
          value: String(balanceEntries.length),
          change: "Ringkasan data saldo",
          tone: "blue" as const,
          icon: Wallet,
        },
        {
          label: "Available Snapshot",
          subtitle: "Status saldo yang tampil",
          value: leaveBalance ? "Ready" : "-",
          change: "Data saldo personal",
          tone: "green" as const,
          icon: CircleCheckBig,
        },
        {
          label: "Route",
          subtitle: "Halaman yang sedang dibuka",
          value: "Balance",
          change: "/leave/balance",
          tone: "orange" as const,
          icon: Calendar,
        },
      ];
    }

    const pendingLeaves = leaves.filter(
      (item) => String((item as any).status ?? "pending").toLowerCase() === "pending"
    ).length;
    const approvedLeaves = leaves.filter(
      (item) => String((item as any).status ?? "").toLowerCase() === "approved"
    ).length;
    const rejectedLeaves = leaves.filter(
      (item) => String((item as any).status ?? "").toLowerCase() === "rejected"
    ).length;

    return [
      {
        label: "Total Leaves",
        subtitle: "Semua pengajuan cuti",
        value: String(leaves.length),
        change: "Riwayat cuti yang tersimpan",
        tone: "blue" as const,
        icon: Calendar,
      },
      {
        label: "Pending",
        subtitle: "Menunggu persetujuan",
        value: String(pendingLeaves),
        change: "Perlu ditinjau",
        tone: "orange" as const,
        icon: Clock3,
      },
      {
        label: "Approved",
        subtitle: "Pengajuan disetujui",
        value: String(approvedLeaves),
        change: "Status final selesai",
        tone: "green" as const,
        icon: CircleCheckBig,
      },
      {
        label: "Rejected",
        subtitle: "Pengajuan ditolak",
        value: String(rejectedLeaves),
        change: "Butuh revisi atau tindak lanjut",
        tone: "red" as const,
        icon: CircleX,
      },
    ];
  }, [isBalanceRoute, leaveBalance, leaves]);

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
    <div className="crud-page">
      {/* Header */}
      <Card className="hero-card">
        <div className="hero-card-inner">
          <div className="hero-content">
            <div className="hero-badge">
              {isBalanceRoute ? <Wallet size={16} /> : <Calendar size={16} />}
              <span>{isBalanceRoute ? "Pusat Saldo Cuti" : "Pusat Cuti"}</span>
            </div>
            <h1 className="hero-title">{isBalanceRoute ? "Saldo Cuti Saya" : "Cuti Saya"}</h1>
            <p className="hero-subtitle">
              {isBalanceRoute
                ? "Lihat saldo cuti tersedia Anda dengan tampilan visual yang konsisten."
                : "Lihat riwayat cuti Anda dengan tampilan yang konsisten di seluruh aplikasi."}
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn-outline" onClick={handleRefresh} disabled={loading}>
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

      {/* Leave History Table */}
      {!isBalanceRoute && (
        <Card className="crud-table-card">
          <div className="crud-table-wrap">
            <table className="crud-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Jenis Cuti</th>
                  <th>Mulai - Selesai</th>
                  <th>Hari</th>
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
                        <td className="crud-table-id">{index + 1}</td>
                        <td className="crud-table-type">{getLeaveTypeLabel(leave.type)}</td>
                        <td className="crud-table-dates">
                          <div>{formatDate(leave.start_date)}</div>
                          <div className="crud-table-dates-sub">s/d {formatDate(leave.end_date)}</div>
                        </td>
                        <td className="crud-table-days">{leave.total_days || 1} hari</td>
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
                    <td colSpan={5} className="crud-table-empty">
                      Tidak ada data cuti
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Balance Section Header */}
      {isBalanceRoute && leaveBalance && (
        <Card className="analytics-title-card">
          <div className="analytics-title-inner">
            <div className="analytics-icon">
              <Wallet size={24} />
            </div>
            <div>
              <h2 className="analytics-title">Saldo Cuti</h2>
              <p className="analytics-subtitle">Detail saldo cuti Anda</p>
            </div>
          </div>
        </Card>
      )}

      {/* Balance Cards Grid */}
      {isBalanceRoute && (
        <div
          className="leave-balance-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {leaveBalance ? (
            Object.entries(leaveBalance).map(([key, value]) => {
              const label = toLabel(key);
              const isNumeric = isNumericLike(value);
              const numValue = isNumeric ? Number(value) : 0;

              return (
                <div
                  key={key}
                  className="leave-balance-card"
                  style={{
                    padding: "1.5rem",
                    borderRadius: "16px",
                    background: "#fff",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "0.75rem",
                    }}
                  >
                    <div>
                      <h3
                        style={{
                          margin: 0,
                          fontSize: "1rem",
                          fontWeight: "600",
                          color: "#1e293b",
                        }}
                      >
                        {label}
                      </h3>
                      <p
                        style={{
                          margin: "0.25rem 0 0",
                          color: "#64748b",
                          fontSize: "0.85rem",
                        }}
                      >
                        Hari Tersedia
                      </p>
                    </div>
                    <span style={{ fontSize: "2rem", fontWeight: "800", color: "#10b981" }}>
                      {asDisplay(value)}
                    </span>
                  </div>
                  {isNumeric && (
                    <div
                      style={{
                        height: "12px",
                        background: "#e2e8f0",
                        borderRadius: "6px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          background: "linear-gradient(90deg, #10b981, #059669)",
                          borderRadius: "6px",
                          width: `${Math.min((numValue / 30) * 100, 100)}%`,
                          transition: "width 0.3s ease",
                        }}
                      />
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div style={{ textAlign: "center", padding: "4rem 2rem", color: "#94a3b8" }}>
              <Wallet size={64} style={{ opacity: 0.3, marginBottom: "1rem" }} />
              <p style={{ fontSize: "1.1rem", fontWeight: "500" }}>Tidak ada data saldo cuti</p>
              <p style={{ marginTop: "0.5rem" }}>Hak cuti Anda akan muncul di sini.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyLeavesPage;