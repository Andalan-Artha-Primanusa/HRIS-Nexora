import { useEffect, useMemo, useState } from "react";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { Alert } from "@/shared/ui/Alert";
import { api } from "@/shared/api/httpClient";
import { getErrorMessage } from "@/shared/api/errorHandler";
import { Bell, BellRing, Check, RefreshCw } from "lucide-react";
import "@/shared/styles/CrudPage.css";
import "../admin/AdminCrudPages.css";

type NotificationItem = {
  id?: number | string;
  title?: string;
  message?: string;
  type?: string;
  category?: string;
  read_at?: string | null;
  created_at?: string;
};

type AlertType = "success" | "error" | "info";

const toRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : {};

const extractPayload = (raw: unknown) => {
  const root = toRecord(raw);
  return root.data ?? raw;
};

const extractItems = (raw: unknown): NotificationItem[] => {
  const payload = extractPayload(raw);

  if (Array.isArray(payload)) {
    return payload as NotificationItem[];
  }

  const payloadRecord = toRecord(payload);
  const candidates = [payloadRecord.items, payloadRecord.rows, payloadRecord.results, payloadRecord.data];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate as NotificationItem[];
    }
  }

  return [];
};

const formatDate = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("id-ID");
};

const NotificationsPage = () => {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [alertType, setAlertType] = useState<AlertType>("info");
  const [processingId, setProcessingId] = useState<string | number | null>(null);

  const loadData = async () => {
    setLoading(true);

    try {
      const [listResult, unreadResult] = await Promise.all([
        api.get("/notifications"),
        api.get("/notifications/unread-count"),
      ]);

      setItems(extractItems(listResult.data));
      const unreadPayload = toRecord(extractPayload(unreadResult.data));
      const count = Number(unreadPayload.unread_count ?? unreadPayload.count ?? 0);
      setUnreadCount(Number.isFinite(count) ? count : 0);
      setStatusMessage("Notifikasi berhasil dimuat.");
      setAlertType("success");
    } catch (error: unknown) {
      setStatusMessage(getErrorMessage(error as never));
      setAlertType("error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const markRead = async (id: number | string) => {
    setProcessingId(id);
    try {
      await api.put(`/notifications/${id}/read`, {});
      await loadData();
    } catch (error: unknown) {
      setStatusMessage(getErrorMessage(error as never));
      setAlertType("error");
    } finally {
      setProcessingId(null);
    }
  };

  const markAllRead = async () => {
    setProcessingId("all");
    try {
      await api.put("/notifications/read-all", {});
      await loadData();
    } catch (error: unknown) {
      setStatusMessage(getErrorMessage(error as never));
      setAlertType("error");
    } finally {
      setProcessingId(null);
    }
  };

  const summaryCards = useMemo(() => {
    const total = items.length;
    const readCount = items.filter((item) => !!item.read_at).length;

    return [
      {
        label: "Total Notifikasi",
        value: total,
        subtitle: "Seluruh notifikasi user",
        icon: <Bell size={18} />,
        iconClass: "summary-card__icon summary-card__icon--blue",
        valueClass: "summary-card__value summary-card__value--blue",
      },
      {
        label: "Belum Dibaca",
        value: unreadCount,
        subtitle: "Perlu ditindaklanjuti",
        icon: <BellRing size={18} />,
        iconClass: "summary-card__icon summary-card__icon--orange",
        valueClass: "summary-card__value summary-card__value--orange",
      },
      {
        label: "Sudah Dibaca",
        value: readCount,
        subtitle: "Notifikasi selesai",
        icon: <Check size={18} />,
        iconClass: "summary-card__icon summary-card__icon--green",
        valueClass: "summary-card__value summary-card__value--green",
      },
    ];
  }, [items, unreadCount]);

  return (
    <div className="crud-page">
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-badge">Employee Self Service</span>
          <h1>Notification Center</h1>
          <p>Lihat notifikasi akun Anda, tandai satu notifikasi atau semua sekaligus sebagai sudah dibaca.</p>
        </div>
        <div className="page-header-actions">
          <Button variant="outline" size="md" onClick={() => void loadData()} disabled={loading || processingId !== null} style={{ borderColor: "#2563eb", color: "#2563eb" }}>
            <RefreshCw size={16} />
            {loading ? "Memuat..." : "Segarkan"}
          </Button>
          <Button variant="primary" size="md" onClick={() => void markAllRead()} disabled={processingId !== null || unreadCount <= 0}>
            <Check size={16} />
            Tandai Semua Dibaca
          </Button>
        </div>
      </div>

      {statusMessage && <Alert type={alertType} message={statusMessage} onClose={() => setStatusMessage("")} dismissible />}

      <div className="summary-grid">
        {summaryCards.map((card) => (
          <Card key={card.label} className="summary-card" glass>
            <div className="summary-card__header">
              <div>
                <span className="summary-card__label">{card.label}</span>
                <p className="summary-card__subtitle">{card.subtitle}</p>
              </div>
              <span className={card.iconClass}>{card.icon}</span>
            </div>
            <div className={card.valueClass}>{card.value}</div>
            <div className="summary-card__change">Live data</div>
          </Card>
        ))}
      </div>

      <Card className="table-card" glass>
        <div className="table-header-bar">
          <h3>Daftar Notifikasi</h3>
          <span className="table-count">{items.length} items</span>
        </div>

        {items.length === 0 ? (
          <div className="table-card-inner">
            <div className="empty-state">
              <Bell size={32} style={{ opacity: 0.4 }} />
              <p>Belum ada notifikasi.</p>
            </div>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Judul</th>
                  <th>Tipe</th>
                  <th>Status</th>
                  <th>Dibuat</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => {
                  const id = item.id ?? `notification-${index}`;
                  const isRead = Boolean(item.read_at);

                  return (
                    <tr key={String(id)}>
                      <td><span className="cell-id">{item.id ?? "-"}</span></td>
                      <td>
                        <div className="cell-name-text">{item.title || "Tanpa judul"}</div>
                        <div className="cell-sub">{item.message || "-"}</div>
                      </td>
                      <td><span className="cell-tag">{item.type || item.category || "general"}</span></td>
                      <td>
                        <span className={isRead ? "status-badge status-badge--approved" : "status-badge status-badge--pending"}>
                          {isRead ? "read" : "unread"}
                        </span>
                      </td>
                      <td className="cell-date">{formatDate(item.created_at)}</td>
                      <td>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (item.id !== undefined && item.id !== null) {
                              void markRead(item.id);
                            }
                          }}
                          disabled={isRead || processingId !== null || item.id === undefined || item.id === null}
                        >
                          <Check size={14} />
                          Tandai Dibaca
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default NotificationsPage;
