import { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/app/store/auth.store";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { Alert } from "@/shared/ui/Alert";
import { getErrorMessage } from "@/shared/api/errorHandler";
import { ROLES } from "@/shared/types/rbac.types";
import { Bell, Megaphone, RefreshCw, Send, ShieldAlert, Users } from "lucide-react";
import "@/shared/styles/CrudPage.css";
import "./AdminCrudPages.css";
import { createAdminNotification, getAdminNotificationsSummary, sendAdminBroadcastNotification } from "@/features/admin/api/admin-batch1.service";
import { getAllEmployees } from "@/features/employee/api/employee.service";

type SummaryData = {
  total_notifications?: number;
  total_sent?: number;
  total_pending?: number;
  total_failed?: number;
  sent_today?: number;
  recipients_count?: number;
};

const getRoleNames = (user: ReturnType<typeof useAuthStore.getState>["user"]) => (user?.roles ?? []).map((role) => role.name);

const hasAdminAccess = (user: ReturnType<typeof useAuthStore.getState>["user"]) => {
  const roleNames = getRoleNames(user);
  return roleNames.includes(ROLES.ADMIN) || roleNames.includes(ROLES.SUPER_ADMIN);
};

const getNumber = (value: unknown) => (typeof value === "number" ? value : Number(value) || 0);

const AdminNotificationsPage = () => {
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

  const [summary, setSummary] = useState<SummaryData>({});
  const [statusMessage, setStatusMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error" | "info">("info");
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [sendingDirect, setSendingDirect] = useState(false);
  const [sendingBroadcast, setSendingBroadcast] = useState(false);

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [recipientId, setRecipientId] = useState("");
  const [employees, setEmployees] = useState<any[]>([]);

  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [broadcastAudience, setBroadcastAudience] = useState("all");

  const loadSummary = async () => {
    setLoadingSummary(true);

    try {
      const [result, empResult] = await Promise.all([
        getAdminNotificationsSummary(),
        getAllEmployees()
      ]);
      setSummary((result ?? {}) as SummaryData);
      setEmployees(empResult);
      setStatusMessage("Ringkasan notifikasi berhasil dimuat.");
      setAlertType("success");
    } catch (error: unknown) {
      setStatusMessage(getErrorMessage(error as never));
      setAlertType("error");
    } finally {
      setLoadingSummary(false);
    }
  };

  useEffect(() => {
    void loadSummary();
  }, []);

  const summaryCards = useMemo(
    () => [
      {
        label: "Total Notifikasi",
        value: getNumber(summary.total_notifications ?? summary.total_sent),
        subtitle: "Seluruh notifikasi yang telah diproses",
        icon: <Bell size={18} />,
        iconClass: "summary-card__icon summary-card__icon--blue",
        valueClass: "summary-card__value summary-card__value--blue",
      },
      {
        label: "Terkirim Hari Ini",
        value: getNumber(summary.sent_today ?? summary.total_sent),
        subtitle: "Aktivitas pengiriman notifikasi hari ini",
        icon: <Send size={18} />,
        iconClass: "summary-card__icon summary-card__icon--green",
        valueClass: "summary-card__value summary-card__value--green",
      },
      {
        label: "Pending / Queue",
        value: getNumber(summary.total_pending),
        subtitle: "Notifikasi yang masih menunggu proses",
        icon: <RefreshCw size={18} />,
        iconClass: "summary-card__icon summary-card__icon--orange",
        valueClass: "summary-card__value summary-card__value--orange",
      },
      {
        label: "Penerima",
        value: getNumber(summary.recipients_count),
        subtitle: "Jumlah target penerima terdaftar",
        icon: <Users size={18} />,
        iconClass: "summary-card__icon summary-card__icon--purple",
        valueClass: "summary-card__value summary-card__value--purple",
      },
    ],
    [summary]
  );

  const handleCreateNotification = async (event: React.FormEvent) => {
    event.preventDefault();
    setSendingDirect(true);

    try {
      await createAdminNotification({
        title,
        message,
        type: "info",
        user_ids: recipientId ? [Number(recipientId)] : [],
      });

      setTitle("");
      setMessage("");
      setRecipientId("");
      setStatusMessage("Notifikasi individual berhasil dibuat.");
      setAlertType("success");
      await loadSummary();
    } catch (error: unknown) {
      setStatusMessage(getErrorMessage(error as never));
      setAlertType("error");
    } finally {
      setSendingDirect(false);
    }
  };

  const handleBroadcast = async (event: React.FormEvent) => {
    event.preventDefault();
    setSendingBroadcast(true);

    try {
      await sendAdminBroadcastNotification({
        title: broadcastTitle,
        message: broadcastMessage,
        audience: broadcastAudience,
      });

      setBroadcastTitle("");
      setBroadcastMessage("");
      setBroadcastAudience("all");
      setStatusMessage("Broadcast notifikasi berhasil dikirim.");
      setAlertType("success");
      await loadSummary();
    } catch (error: unknown) {
      setStatusMessage(getErrorMessage(error as never));
      setAlertType("error");
    } finally {
      setSendingBroadcast(false);
    }
  };

  return (
    <div className="crud-page">
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-badge">Admin Center</span>
          <h1>Notification Center</h1>
          <p>Kelola notifikasi admin, kirim pesan individual, dan broadcast pengumuman ke pengguna.</p>
        </div>
        <div className="page-header-actions">
          <Button variant="outline" size="md" onClick={() => void loadSummary()} disabled={loadingSummary} style={{ borderColor: "#2563eb", color: "#2563eb" }}>
            <RefreshCw size={16} />
            {loadingSummary ? "Memuat..." : "Segarkan"}
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
            <div className="summary-card__change">Realtime overview</div>
          </Card>
        ))}
      </div>

      <div className="form-grid">
        <Card className="table-card" glass>
          <div className="table-header-bar">
            <h3>Kirim Notifikasi Individual</h3>
            <span className="table-count">POST /admin/notifications</span>
          </div>
          <div className="table-card-inner">
            <form className="crud-form" onSubmit={handleCreateNotification}>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="notification-title">Judul</label>
                  <input id="notification-title" className="form-input" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Contoh: Pengingat update profil" required />
                </div>
                <div className="form-group">
                  <label htmlFor="notification-recipient">Penerima (Karyawan)</label>
                  <select id="notification-recipient" className="form-input" value={recipientId} onChange={(event) => setRecipientId(event.target.value)}>
                    <option value="">-- Pilih Penerima (Opsional) --</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.user_id || emp.id}>{emp.full_name} ({emp.employee_id})</option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                  <label htmlFor="notification-message">Pesan</label>
                  <textarea id="notification-message" className="form-input" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Tulis isi notifikasi" rows={5} required />
                </div>
              </div>

              <div className="form-actions">
                <Button type="submit" variant="primary" loading={sendingDirect}>
                  <Send size={16} />
                  Buat Notifikasi
                </Button>
              </div>
            </form>
          </div>
        </Card>

        <Card className="table-card" glass>
          <div className="table-header-bar">
            <h3>Broadcast Notifikasi</h3>
            <span className="table-count">POST /admin/notifications/broadcast</span>
          </div>
          <div className="table-card-inner">
            <form className="crud-form" onSubmit={handleBroadcast}>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="broadcast-title">Judul Broadcast</label>
                  <input id="broadcast-title" className="form-input" value={broadcastTitle} onChange={(event) => setBroadcastTitle(event.target.value)} placeholder="Contoh: Informasi maintenance sistem" required />
                </div>
                <div className="form-group">
                  <label htmlFor="broadcast-audience">Audience</label>
                  <select id="broadcast-audience" className="form-input" value={broadcastAudience} onChange={(event) => setBroadcastAudience(event.target.value)}>
                    <option value="all">Semua Pengguna</option>
                    <option value="employees">Employees</option>
                    <option value="managers">Managers</option>
                    <option value="admins">Admins</option>
                  </select>
                </div>
                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                  <label htmlFor="broadcast-message">Pesan Broadcast</label>
                  <textarea id="broadcast-message" className="form-input" value={broadcastMessage} onChange={(event) => setBroadcastMessage(event.target.value)} placeholder="Tulis pengumuman untuk seluruh target audience" rows={5} required />
                </div>
              </div>

              <div className="form-actions">
                <Button type="submit" variant="primary" loading={sendingBroadcast}>
                  <Megaphone size={16} />
                  Kirim Broadcast
                </Button>
              </div>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminNotificationsPage;