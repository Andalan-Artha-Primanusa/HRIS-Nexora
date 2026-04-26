import React, { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/app/store/auth.store";
import { Card } from "@/shared/ui/Card";
import { Alert } from "@/shared/ui/Alert";
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

type AlertType = "success" | "error" | "info";

const canAccessPage = (user: any) => RBACUtils.isAdmin(user);

const AdminAuditLogsPage = () => {
  const user = useAuthStore((state) => state.user);
  const canAccess = canAccessPage(user);
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<AlertType>("info");
  const [search, setSearch] = useState("");

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await getAuditLogs();
      const logsArray = Array.isArray(data) ? data : data.data || [];
      setLogs(logsArray);
    } catch (error: unknown) {
      setAlertMessage(getErrorMessage(error as never));
      setAlertType("error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    if (!search) return logs;
    const q = search.toLowerCase();
    return logs.filter((log) => {
      const s = String;
      return (
        s(log.action)?.toLowerCase().includes(q) ||
        s(log.user_name)?.toLowerCase().includes(q) ||
        s(log.module)?.toLowerCase().includes(q) ||
        s(log.ip_address)?.includes(q)
      );
    });
  }, [logs, search]);

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

      {alertMessage && (
        <Alert
          type={alertType}
          message={alertMessage}
          onClose={() => setAlertMessage("")}
          dismissible
        />
      )}

      <div className="leave-requests-wrapper">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="leave-summary-card">
              <div className="leave-summary-header">
                <div>
                  <p className="leave-summary-label">{card.label}</p>
                  <p className="leave-summary-subtitle">{card.subtitle}</p>
                </div>
                <div className={`leave-summary-icon-wrapper leave-icon-${card.tone === 'blue' ? 'blue' : card.tone === 'green' ? 'green' : card.tone === 'orange' ? 'orange' : 'purple'}`}>
                  <Icon size={28} />
                </div>
              </div>
              <div className={`leave-summary-value leave-value-${card.tone === 'blue' ? 'blue' : card.tone === 'green' ? 'green' : card.tone === 'orange' ? 'orange' : 'purple'}`}>{card.value}</div>
              <p className="leave-summary-trend">{card.change}</p>
            </div>
          );
        })}
      </div>

      <Card className="table-card" glass>
        <div className="table-header-bar">
          <h3>Filter Audit Log</h3>
          <span className="table-count">Cari action, user, modul, atau IP</span>
        </div>
        <div className="table-card-inner">
          <div className="search-box" style={{ minWidth: 0 }}>
            <Search size={18} />
            <input
              className="search-input"
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari log audit..."
            />
          </div>
        </div>
      </Card>

      <Card className="table-card" glass>
        <div className="table-header-bar">
          <h3>Daftar Audit Log</h3>
          <span className="table-count">{filteredLogs.length} log</span>
        </div>

        {filteredLogs.length > 0 ? (
          <div className="table-card-inner">
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
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log, index) => {
                    const logId = (log as any).id ?? index;
                    const eventName = String((log as any).action || (log as any).event || "Unknown Event");
                    const userName = String((log as any).user_name || (log as any).causer_name || "-");
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
                        <td><span className="cell-name">{eventName}</span></td>
                        <td>{userName}</td>
                        <td><span className="cell-tag">{moduleName}</span></td>
                        <td>{ipAddress}</td>
                        <td className="cell-date">{createdAt}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="table-card-inner">
            <div className="empty-state">
              <ClipboardList size={32} style={{ opacity: 0.4 }} />
              <p>Tidak ada audit log yang sesuai dengan filter.</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminAuditLogsPage;