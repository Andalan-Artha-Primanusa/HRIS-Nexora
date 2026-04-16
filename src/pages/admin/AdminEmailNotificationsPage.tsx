import { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/app/store/auth.store";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { Alert } from "@/shared/ui/Alert";
import { getErrorMessage } from "@/shared/api/errorHandler";
import { ROLES } from "@/shared/types/rbac.types";
import { BellRing, Mail, RefreshCw, ScrollText, Send, ShieldAlert } from "lucide-react";
import "@/shared/styles/CrudPage.css";
import "./AdminCrudPages.css";
import { createAdminEmailNotification, getAdminEmailNotificationLogs, getAdminEmailNotifications } from "@/features/admin/api/admin-batch1.service";

type EmailNotificationItem = {
  id?: number | string;
  subject?: string;
  type?: string;
  status?: string;
  recipients_count?: number;
  recipient_email?: string;
  created_at?: string;
};

type EmailLogItem = {
  id?: number | string;
  subject?: string;
  recipient?: string;
  recipient_email?: string;
  status?: string;
  sent_at?: string;
  created_at?: string;
};

const getRoleNames = (user: ReturnType<typeof useAuthStore.getState>["user"]) => (user?.roles ?? []).map((role) => role.name);

const hasAdminAccess = (user: ReturnType<typeof useAuthStore.getState>["user"]) => {
  const roleNames = getRoleNames(user);
  return roleNames.includes(ROLES.ADMIN) || roleNames.includes(ROLES.SUPER_ADMIN);
};

const formatDate = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("id-ID");
};

const getStatusClass = (status?: string) => {
  const normalized = String(status || "").toLowerCase();

  if (["sent", "success", "delivered"].includes(normalized)) return "status-badge status-badge--approved";
  if (["pending", "queued", "processing"].includes(normalized)) return "status-badge status-badge--pending";
  if (["failed", "error"].includes(normalized)) return "status-badge status-badge--rejected";
  return "status-badge status-badge--draft";
};

const AdminEmailNotificationsPage = () => {
  const user = useAuthStore((state) => state.user);

  if (!hasAdminAccess(user)) {
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

  const [items, setItems] = useState<EmailNotificationItem[]>([]);
  const [logs, setLogs] = useState<EmailLogItem[]>([]);
  const [statusMessage, setStatusMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error" | "info">("info");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [subject, setSubject] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("manual");

  const loadData = async () => {
    setLoading(true);

    try {
      const [notificationResult, logResult] = await Promise.all([
        getAdminEmailNotifications(),
        getAdminEmailNotificationLogs(),
      ]);

      setItems(Array.isArray(notificationResult) ? notificationResult : (notificationResult?.items ?? []));
      setLogs(Array.isArray(logResult) ? logResult : (logResult?.items ?? []));
      setStatusMessage("Data email notification berhasil dimuat.");
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

  const summaryCards = useMemo(() => {
    const totalNotifications = items.length;
    const totalLogs = logs.length;
    const sentCount = logs.filter((item) => ["sent", "success", "delivered"].includes(String(item.status || "").toLowerCase())).length;
    const pendingCount = logs.filter((item) => ["pending", "queued", "processing"].includes(String(item.status || "").toLowerCase())).length;

    return [
      {
        label: "Email Notifications",
        value: totalNotifications,
        subtitle: "Konfigurasi email notification yang tersedia",
        icon: <BellRing size={18} />,
        iconClass: "summary-card__icon summary-card__icon--blue",
        valueClass: "summary-card__value summary-card__value--blue",
      },
      {
        label: "Email Logs",
        value: totalLogs,
        subtitle: "Riwayat pengiriman email",
        icon: <ScrollText size={18} />,
        iconClass: "summary-card__icon summary-card__icon--purple",
        valueClass: "summary-card__value summary-card__value--purple",
      },
      {
        label: "Berhasil Terkirim",
        value: sentCount,
        subtitle: "Total email sukses terkirim",
        icon: <Send size={18} />,
        iconClass: "summary-card__icon summary-card__icon--green",
        valueClass: "summary-card__value summary-card__value--green",
      },
      {
        label: "Pending",
        value: pendingCount,
        subtitle: "Masih menunggu proses delivery",
        icon: <RefreshCw size={18} />,
        iconClass: "summary-card__icon summary-card__icon--orange",
        valueClass: "summary-card__value summary-card__value--orange",
      },
    ];
  }, [items, logs]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      await createAdminEmailNotification({
        subject,
        recipient_email: recipientEmail,
        message,
        type,
      });

      setSubject("");
      setRecipientEmail("");
      setMessage("");
      setType("manual");
      setStatusMessage("Email notification berhasil dibuat.");
      setAlertType("success");
      await loadData();
    } catch (error: unknown) {
      setStatusMessage(getErrorMessage(error as never));
      setAlertType("error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="crud-page">
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-badge">Admin Center</span>
          <h1>Email Notifications</h1>
          <p>Kelola email notification, buat pengiriman manual, dan pantau log delivery email.</p>
        </div>
        <div className="page-header-actions">
          <Button variant="outline" size="md" onClick={() => void loadData()} disabled={loading} style={{ borderColor: "#2563eb", color: "#2563eb" }}>
            <RefreshCw size={16} />
            {loading ? "Memuat..." : "Segarkan"}
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
            <div className="summary-card__change">Operational snapshot</div>
          </Card>
        ))}
      </div>

      <Card className="table-card" glass>
        <div className="table-header-bar">
          <h3>Buat Email Notification</h3>
          <span className="table-count">POST /admin/email-notifications</span>
        </div>
        <div className="table-card-inner">
          <form className="crud-form" onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="email-subject">Subject</label>
                <input id="email-subject" className="form-input" value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="Contoh: Reminder absensi" required />
              </div>
              <div className="form-group">
                <label htmlFor="email-recipient">Recipient Email</label>
                <input id="email-recipient" type="email" className="form-input" value={recipientEmail} onChange={(event) => setRecipientEmail(event.target.value)} placeholder="nama@company.com" required />
              </div>
              <div className="form-group">
                <label htmlFor="email-type">Type</label>
                <select id="email-type" className="form-input" value={type} onChange={(event) => setType(event.target.value)}>
                  <option value="manual">Manual</option>
                  <option value="reminder">Reminder</option>
                  <option value="announcement">Announcement</option>
                </select>
              </div>
              <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                <label htmlFor="email-message">Message</label>
                <textarea id="email-message" className="form-input" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Tulis isi email" rows={5} required />
              </div>
            </div>

            <div className="form-actions">
              <Button type="submit" variant="primary" loading={submitting}>
                <Mail size={16} />
                Kirim Email Notification
              </Button>
            </div>
          </form>
        </div>
      </Card>

      <Card className="table-card" glass>
        <div className="table-header-bar">
          <h3>Daftar Email Notifications</h3>
          <span className="table-count">{items.length} items</span>
        </div>

        {items.length === 0 ? (
          <div className="table-card-inner">
            <div className="empty-state">
              <BellRing size={32} style={{ opacity: 0.4 }} />
              <p>Belum ada email notification yang tersedia.</p>
            </div>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Subject</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th className="th-center">Recipients</th>
                  <th>Dibuat</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={String(item.id ?? `${item.subject ?? "email"}-${index}`)}>
                    <td><span className="cell-id">{item.id ?? "—"}</span></td>
                    <td>
                      <div className="cell-name-text">{item.subject || "Tanpa subject"}</div>
                      <div className="cell-sub">{item.recipient_email || "Target tidak tersedia"}</div>
                    </td>
                    <td><span className="cell-tag">{item.type || "manual"}</span></td>
                    <td><span className={getStatusClass(item.status)}>{item.status || "draft"}</span></td>
                    <td className="td-center">{item.recipients_count ?? 1}</td>
                    <td className="cell-date">{formatDate(item.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card className="table-card" glass>
        <div className="table-header-bar">
          <h3>Email Delivery Logs</h3>
          <span className="table-count">{logs.length} logs</span>
        </div>

        {logs.length === 0 ? (
          <div className="table-card-inner">
            <div className="empty-state">
              <ScrollText size={32} style={{ opacity: 0.4 }} />
              <p>Belum ada log pengiriman email.</p>
            </div>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Subject</th>
                  <th>Recipient</th>
                  <th>Status</th>
                  <th>Sent At</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, index) => (
                  <tr key={String(log.id ?? `${log.subject ?? "log"}-${index}`)}>
                    <td><span className="cell-id">{log.id ?? "—"}</span></td>
                    <td><div className="cell-name-text">{log.subject || "Tanpa subject"}</div></td>
                    <td>
                      <div className="cell-name-text">{log.recipient || log.recipient_email || "—"}</div>
                      <div className="cell-sub">{log.recipient_email || "Email tidak tersedia"}</div>
                    </td>
                    <td><span className={getStatusClass(log.status)}>{log.status || "draft"}</span></td>
                    <td className="cell-date">{formatDate(log.sent_at || log.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminEmailNotificationsPage;