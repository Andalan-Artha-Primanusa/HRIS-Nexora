import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { Card } from "@/shared/ui/Card";

import { Calendar, RefreshCw, Clock3, CircleCheckBig, CircleX, Wallet } from "lucide-react";

import { Button } from "@/shared/ui/Button";
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
    <div className="crud-page">
      {/* Header - Same style as Dashboard */}
      <Card className="hero-card">
        <div className="hero-card-inner">
          <div className="hero-content">
            <div className="hero-badge">
              {isBalanceRoute ? <Wallet size={16} /> : <Calendar size={16} />}
              <span>{isBalanceRoute ? 'Pusat Saldo Cuti' : 'Pusat Cuti'}</span>
            </div>
            <h1 className="hero-title">{isBalanceRoute ? 'Saldo Cuti Saya' : 'Cuti Saya'}</h1>
            <p className="hero-subtitle">
              {isBalanceRoute 
                ? 'Lihat saldo cuti tersedia Anda dengan tampilan visual yang konsisten.' 
                : 'Lihat riwayat cuti Anda dengan tampilan yang konsisten di seluruh aplikasi.'}
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn-outline" onClick={handleRefresh} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Segarkan
            </button>
          </div>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="leave-requests-wrapper">
        {isBalanceRoute ? (
          <>
            <div className="leave-summary-card">
              <div className="leave-summary-header">
                <div>
                  <p className="leave-summary-label">Field Saldo</p>
                  <p className="leave-summary-subtitle">Jumlah field saldo cuti</p>
                </div>
                <div className="leave-summary-icon-wrapper leave-icon-blue">
                  <Wallet size={28} />
                </div>
              </div>
              <div className="leave-summary-value leave-value-blue">{leaveBalance ? Object.keys(leaveBalance).length : 0}</div>
              <p className="leave-summary-trend">Ringkasan data saldo</p>
            </div>
            <div className="leave-summary-card">
              <div className="leave-summary-header">
                <div>
                  <p className="leave-summary-label">Status</p>
                  <p className="leave-summary-subtitle">Status saldo yang tampil</p>
                </div>
                <div className="leave-summary-icon-wrapper leave-icon-green">
                  <CircleCheckBig size={28} />
                </div>
              </div>
              <div className="leave-summary-value leave-value-green">{leaveBalance ? 'Ready' : '-'}</div>
              <p className="leave-summary-trend">Data saldo personal</p>
            </div>
          </>
        ) : (
          <>
            <div className="leave-summary-card">
              <div className="leave-summary-header">
                <div>
                  <p className="leave-summary-label">Total Cuti</p>
                  <p className="leave-summary-subtitle">Semua pengajuan cuti</p>
                </div>
                <div className="leave-summary-icon-wrapper leave-icon-blue">
                  <Calendar size={28} />
                </div>
              </div>
              <div className="leave-summary-value leave-value-blue">{leaves.length}</div>
              <p className="leave-summary-trend">Riwayat cuti tersimpan</p>
            </div>
            <div className="leave-summary-card">
              <div className="leave-summary-header">
                <div>
                  <p className="leave-summary-label">Menunggu</p>
                  <p className="leave-summary-subtitle">Menunggu persetujuan</p>
                </div>
                <div className="leave-summary-icon-wrapper leave-icon-orange">
                  <Clock3 size={28} />
                </div>
              </div>
              <div className="leave-summary-value leave-value-orange">
                {leaves.filter((item) => String((item as any).status ?? "pending").toLowerCase() === "pending").length}
              </div>
              <p className="leave-summary-trend">Perlu ditinjau</p>
            </div>
            <div className="leave-summary-card">
              <div className="leave-summary-header">
                <div>
                  <p className="leave-summary-label">Disetujui</p>
                  <p className="leave-summary-subtitle">Pengajuan disetujui</p>
                </div>
                <div className="leave-summary-icon-wrapper leave-icon-green">
                  <CircleCheckBig size={28} />
                </div>
              </div>
              <div className="leave-summary-value leave-value-green">
                {leaves.filter((item) => String((item as any).status ?? "").toLowerCase() === "approved").length}
              </div>
              <p className="leave-summary-trend">Status final selesai</p>
            </div>
            <div className="leave-summary-card">
              <div className="leave-summary-header">
                <div>
                  <p className="leave-summary-label">Ditolak</p>
                  <p className="leave-summary-subtitle">Pengajuan ditolak</p>
                </div>
                <div className="leave-summary-icon-wrapper leave-icon-red">
                  <CircleX size={28} />
                </div>
              </div>
              <div className="leave-summary-value leave-value-red">
                {leaves.filter((item) => String((item as any).status ?? "").toLowerCase() === "rejected").length}
              </div>
              <p className="leave-summary-trend">Perlu revisi</p>
            </div>
          </>
        )}
      </div>

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

{isBalanceRoute && (
        <div className="leave-balance-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {leaveBalance ? (
            Object.entries(leaveBalance).map(([key, value]) => {
              const label = toLabel(key);
              const isNumeric = isNumericLike(value);
              const numValue = isNumeric ? Number(value) : 0;

              return (
                <div key={key} className="leave-balance-card" style={{ padding: '1.5rem', borderRadius: '16px', background: '#fff', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: '#1e293b' }}>{label}</h3>
                      <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.85rem' }}>Hari Tersedia</p>
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
                        width: `${Math.min((numValue / 30) * 100, 100)}%`,
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#94a3b8' }}>
              <Wallet size={64} style={{ opacity: 0.3, marginBottom: '1rem' }} />
              <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>Tidak ada data saldo cuti</p>
              <p style={{ marginTop: '0.5rem' }}>Hak cuti Anda akan muncul di sini.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyLeavesPage;
