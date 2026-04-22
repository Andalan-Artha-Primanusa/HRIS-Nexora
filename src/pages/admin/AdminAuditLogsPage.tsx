import { RBACUtils } from "@/shared/hooks/rbac";
import { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/app/store/auth.store";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { Alert } from "@/shared/ui/Alert";
import { getErrorMessage } from "@/shared/api/errorHandler";
import { ClipboardList, Eye, RefreshCw, Search, ShieldAlert, ShieldCheck, UserCog } from "lucide-react";
import {
  getAuditLogById,
  getAuditLogs,
} from "@/features/admin/api/admin-batch1.service";
import type { AuditLogItem } from "@/features/admin/types/admin.types";
import "@/shared/styles/CrudPage.css";
import "./AdminCrudPages.css";

type AlertType = "success" | "error" | "info";

const canAccessPage = (user: any) => RBACUtils.isAdmin(user);

const AdminAuditLogsPage = () => {
  const user = useAuthStore((state) => state.user);
  const canAccess = canAccessPage(user);

  if (!canAccess) {
    return (
      <div className="crud-page">
        <div className="page-header">
          <div className="page-header-title">
            <span className="page-badge">Admin Center</span>
            <h1><ShieldAlert size={22} style={{ display: "inline", verticalAlign: "middle", marginRight: 8 }} />Akses Ditolak</h1>
            <p>Anda tidak memiliki izin untuk mengakses halaman ini.</p>
          </div>
        </div>
        <Card className="table-card" glass>
          <div className="table-card-inner">
            <p>Silakan hubungi Administrator untuk mendapatkan akses.</p>
          </div>
        </Card>
      </div>
    );
  }

  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailLoadingId, setDetailLoadingId] = useState<string | number | null>(null);
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<AlertType>("info");
  const [search, setSearch] = useState("");

  const filteredLogs = useMemo(() => {
    if (!search.trim()) return logs;

    const keyword = search.toLowerCase();
    return logs.filter((log) => {
      const values = [
        (log as any).action,
        (log as any).event,
        (log as any).description,
        (log as any).user_name,
        (log as any).causer_name,
        (log as any).module,
        (log as any).ip_address,
      ];

      return values.some((value) => String(value || "").toLowerCase().includes(keyword));
    });
  }, [logs, search]);

  const summary = useMemo(() => {
    const userActions = logs.filter((log) => {
      const action = String((log as any).action || (log as any).event || "").toLowerCase();
      return action.includes("user") || action.includes("login") || action.includes("role");
    }).length;

    return {
      total: logs.length,
      visible: filteredLogs.length,
      userActions,
    };
  }, [filteredLogs.length, logs]);

  const loadLogs = async () => {
    setLoading(true);
    setAlertMessage("");

    try {
      const result = await getAuditLogs();
      setLogs(Array.isArray(result.items) ? result.items : []);
    } catch (error: unknown) {
      setAlertMessage(getErrorMessage(error as any));
      setAlertType("error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadLogs();
  }, []);

  const handleViewDetail = async (log: AuditLogItem) => {
    const logId = (log as any).id;
    if (logId === undefined || logId === null) {
      setSelectedLog(log);
      return;
    }

    setDetailLoadingId(logId);
    setAlertMessage("");

    try {
      const detail = await getAuditLogById(logId);
      setSelectedLog(detail);
    } catch (error: unknown) {
      setAlertMessage(getErrorMessage(error as any));
      setAlertType("error");
    } finally {
      setDetailLoadingId(null);
    }
  };

  const summaryCards = [
    {
      label: "Total Logs",
      subtitle: "Semua aktivitas terekam",
      value: String(summary.total),
      change: "Riwayat audit tersedia",
      tone: "blue" as const,
      icon: ClipboardList,
    },
    {
      label: "Hasil Filter",
      subtitle: "Log sesuai pencarian",
      value: String(summary.visible),
      change: "Daftar yang sedang ditampilkan",
      tone: "purple" as const,
      icon: Search,
    },
    {
      label: "User Activity",
      subtitle: "Login, role, dan user event",
      value: String(summary.userActions),
      change: "Aktivitas administratif utama",
      tone: "green" as const,
      icon: UserCog,
    },
  ];

  return (
    <div className="crud-page">
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-badge">Admin Center</span>
          <h1>Audit Logs</h1>
          <p>Tinjau jejak aktivitas sistem, cari event penting, dan buka detail log untuk kebutuhan monitoring dan investigasi.</p>
        </div>
        <div className="page-header-actions">
          <Button
            variant="outline"
            size="md"
            onClick={() => void loadLogs()}
            disabled={loading}
            style={{ borderColor: "#2563eb", color: "#2563eb" }}
          >
            <RefreshCw size={16} />
            {loading ? "Memuat..." : "Segarkan"}
          </Button>
        </div>
      </div>

      <div className="summary-grid">
        {summaryCards.map((card) => {
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

      {alertMessage && (
        <Alert
          type={alertType}
          message={alertMessage}
          onClose={() => setAlertMessage("")}
          dismissible
        />
      )}

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
                    <th className="th-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log, index) => {
                    const logId = (log as any).id ?? index;
                    const eventName = String((log as any).action || (log as any).event || "Unknown Event");
                    let userName =
                      (log as any).user_name ||
                      (log as any).causer_name ||
                      "-";
                    let userEmail = "";
                    // If user is an object, show name/email
                    if (!userName || typeof userName === "object") {
                      const userObj = (log as any).user || (log as any).causer;
                      if (userObj && typeof userObj === "object") {
                        userName = userObj.name || userObj.email || "-";
                        userEmail = userObj.email || "";
                      }
                    }
                    userName = String(userName);
                    // Avatar inisial
                    const avatarInitial = userName && userName !== "-" ? userName.charAt(0).toUpperCase() : "?";
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
                          second: "2-digit",
                        });
                      } else {
                        createdAt = String(rawDate);
                      }
                    }
                    const isSecurityEvent = eventName.toLowerCase().includes("login") || eventName.toLowerCase().includes("permission");

                    return (
                      <tr key={String(logId)}>
                        <td><span className="cell-id">{String(logId)}</span></td>
                        <td>
                          <div className="cell-name">
                            <div className="cell-avatar">
                              {isSecurityEvent ? <ShieldCheck size={14} /> : <ClipboardList size={14} />}
                            </div>
                            <div>
                              <div className="cell-name-text">{eventName}</div>
                              <div className="cell-sub">{String((log as any).description || "Tidak ada deskripsi")}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="cell-user">
                            <div className="cell-user-avatar">{avatarInitial}</div>
                            <div className="cell-user-info">
                              <span className="cell-user-name">{userName}</span>
                              {userEmail && <span className="cell-user-email">{userEmail}</span>}
                            </div>
                          </div>
                        </td>
                        <td><span className="cell-tag">{moduleName}</span></td>
                        <td>{ipAddress}</td>
                        <td className="cell-date">{createdAt}</td>
                        <td className="td-center">
                          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => void handleViewDetail(log)}
                              disabled={detailLoadingId === logId}
                            >
                              <Eye size={15} />
                              {detailLoadingId === logId ? "Memuat..." : "Detail"}
                            </Button>
                          </div>
                        </td>
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

      <Card className="table-card" glass>
        <div className="table-header-bar">
          <h3>Detail Audit Log</h3>
          <span className="table-count">{selectedLog ? `Log #${String((selectedLog as any).id || "-")}` : "Pilih log dari tabel"}</span>
        </div>
        <div className="table-card-inner">
          {selectedLog ? (
            <pre className="crud-response">{JSON.stringify(selectedLog, null, 2)}</pre>
          ) : (
            <div className="empty-state">
              <Eye size={32} style={{ opacity: 0.4 }} />
              <p>Pilih salah satu audit log untuk melihat detail lengkap.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default AdminAuditLogsPage;