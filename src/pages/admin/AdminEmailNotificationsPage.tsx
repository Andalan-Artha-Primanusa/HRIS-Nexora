import { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/app/store/auth.store";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { Alert } from "@/shared/ui/Alert";
import { Tabs } from "@/shared/ui/Tabs";
import { getErrorMessage } from "@/shared/api/errorHandler";
import { ROLES } from "@/shared/types/rbac.types";
import { BellRing, Eye, Mail, RefreshCw, ScrollText, Send, ShieldAlert, Shield } from "lucide-react";
import "@/shared/styles/CrudPage.css";
import "@/pages/dashboard/overview/OverviewPage.css";
import "@/pages/payroll/PayrollShared.css";
import "./AdminCrudPages.css";
import {
  createAdminEmailNotification,
  getAdminEmailNotificationLogs,
  getAdminEmailNotifications,
  createEmailTemplate,
  retryAdminEmailNotification,
  previewEmailTemplate
} from "@/features/admin/api/admin-batch1.service";
import { getAllEmployees } from "@/features/employee/api/employee.service";

type EmailTemplateItem = {
  id?: number | string;
  key?: string;
  name?: string;
  subject?: string;
  html_body?: string;
  text_body?: string;
  placeholders?: string[];
  is_active?: boolean;
  created_at?: string;
};

type EmailLogItem = {
  id?: number | string;
  subject?: string;
  recipient_email?: string;
  status?: string;
  type?: string;
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

  const [items, setItems] = useState<EmailTemplateItem[]>([]);
  const [logs, setLogs] = useState<EmailLogItem[]>([]);
  const [statusMessage, setStatusMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error" | "info">("info");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);

  // Send email form
  const [subject, setSubject] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("notification");
  const [templateKeyNotif, setTemplateKeyNotif] = useState("");
  const [templateDataNotif, setTemplateDataNotif] = useState("");
  const [previewHtml, setPreviewHtml] = useState("");
  const [previewSubject, setPreviewSubject] = useState("");
  const [previewing, setPreviewing] = useState(false);

  // Create template form
  const [templateKey, setTemplateKey] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [templateSubject, setTemplateSubject] = useState("");
  const [templateHtml, setTemplateHtml] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [notificationResult, logResult, empResult] = await Promise.all([
        getAdminEmailNotifications(),
        getAdminEmailNotificationLogs(),
        getAllEmployees()
      ]);
      setItems(Array.isArray(notificationResult) ? notificationResult : (notificationResult && Array.isArray((notificationResult as any).items) ? (notificationResult as any).items : []));
      setLogs(Array.isArray(logResult) ? logResult : (logResult && Array.isArray((logResult as any).items) ? (logResult as any).items : []));
      setEmployees(empResult);
      setStatusMessage("Data berhasil dimuat.");
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
    const totalTemplates = items.length;
    const totalLogs = logs.length;
    const sentCount = logs.filter((item) => ["sent", "success", "delivered"].includes(String(item.status || "").toLowerCase())).length;
    const pendingCount = logs.filter((item) => ["pending", "queued", "processing"].includes(String(item.status || "").toLowerCase())).length;

    return [
      { label: "Email Templates", value: totalTemplates, subtitle: "Template yang tersedia", icon: <BellRing size={18} />, iconClass: "summary-card__icon summary-card__icon--blue", valueClass: "summary-card__value summary-card__value--blue" },
      { label: "Email Logs", value: totalLogs, subtitle: "Riwayat pengiriman email", icon: <ScrollText size={18} />, iconClass: "summary-card__icon summary-card__icon--purple", valueClass: "summary-card__value summary-card__value--purple" },
      { label: "Berhasil Terkirim", value: sentCount, subtitle: "Total email sukses terkirim", icon: <Send size={18} />, iconClass: "summary-card__icon summary-card__icon--green", valueClass: "summary-card__value summary-card__value--green" },
      { label: "Pending", value: pendingCount, subtitle: "Masih menunggu proses delivery", icon: <RefreshCw size={18} />, iconClass: "summary-card__icon summary-card__icon--orange", valueClass: "summary-card__value summary-card__value--orange" },
    ];
  }, [items, logs]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      let parsedTemplateData = undefined;
      if (templateDataNotif) {
        try {
          parsedTemplateData = JSON.parse(templateDataNotif);
        } catch (e) {
          throw new Error("Template Data harus berupa JSON yang valid.");
        }
      }
      await createAdminEmailNotification({
        subject: subject || undefined,
        recipient_email: recipientEmail,
        message: message || undefined,
        type,
        template_key: templateKeyNotif || undefined,
        template_data: parsedTemplateData,
      });
      setSubject("");
      setRecipientEmail("");
      setMessage("");
      setType("notification");
      setTemplateKeyNotif("");
      setTemplateDataNotif("");
      setStatusMessage("Email notification berhasil masuk antrean.");
      setAlertType("success");
      await loadData();
    } catch (error: unknown) {
      setStatusMessage(getErrorMessage(error as never));
      setAlertType("error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateTemplate = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await createEmailTemplate({
        key: templateKey,
        name: templateName,
        subject: templateSubject,
        html_body: templateHtml,
      });
      setTemplateKey("");
      setTemplateName("");
      setTemplateSubject("");
      setTemplateHtml("");
      setStatusMessage("Template berhasil dibuat.");
      setAlertType("success");
      await loadData();
    } catch (error) {
      setStatusMessage(getErrorMessage(error as never));
      setAlertType("error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = async (id: number | string) => {
    try {
      await retryAdminEmailNotification(id);
      setStatusMessage("Email berhasil diantrekan ulang.");
      setAlertType("success");
      await loadData();
    } catch (error) {
      setStatusMessage(getErrorMessage(error as never));
      setAlertType("error");
    }
  };

  const selectedTemplate = useMemo(() => {
    if (!templateKeyNotif) return null;
    return items.find((t) => t.key === templateKeyNotif) ?? null;
  }, [templateKeyNotif, items]);

  useEffect(() => {
    if (selectedTemplate && selectedTemplate.placeholders && selectedTemplate.placeholders.length > 0) {
      // Only auto-populate if the user hasn't already modified the JSON (or it's empty)
      // Actually, it's fine to overwrite when they change template.
      const templateObj: Record<string, string> = {};
      selectedTemplate.placeholders.forEach((ph) => {
        templateObj[ph] = "";
      });
      setTemplateDataNotif(JSON.stringify(templateObj, null, 2));
    } else if (selectedTemplate) {
      setTemplateDataNotif("{}");
    } else {
      setTemplateDataNotif("");
    }
  }, [selectedTemplate]);

  const handlePreview = async () => {
    if (!selectedTemplate?.id) return;
    setPreviewing(true);
    try {
      let parsedData = undefined;
      if (templateDataNotif) {
        try { parsedData = JSON.parse(templateDataNotif); } catch { /* ignore */ }
      }
      const result = (await previewEmailTemplate(selectedTemplate.id, parsedData)) as Record<string, unknown>;
      setPreviewSubject(String(result?.subject ?? ""));
      setPreviewHtml(String(result?.html_body ?? ""));
    } catch (error) {
      setStatusMessage(getErrorMessage(error as never));
      setAlertType("error");
    } finally {
      setPreviewing(false);
    }
  };

  /* ── Tab 1: Kirim Email ── */
  const sendEmailTab = (
    <Card className="table-card" glass>
      <div className="table-header-bar">
        <h3>Kirim Email Notification</h3>
        <span className="table-count">POST /admin/email-notifications</span>
      </div>
      <div className="table-card-inner">
        <form className="crud-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="email-recipient">Recipient Employee <span style={{ color: "red" }}>*</span></label>
              <select 
                id="email-recipient" 
                className="form-input" 
                value={recipientEmail} 
                onChange={(e) => setRecipientEmail(e.target.value)} 
                required
              >
                <option value="">-- Select Employee --</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.user?.email || emp.email}>{emp.full_name} ({emp.user?.email || emp.email})</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="email-type">Type</label>
              <select id="email-type" className="form-input" value={type} onChange={(e) => setType(e.target.value)}>
                <option value="notification">Notification</option>
                <option value="approval">Approval</option>
                <option value="reminder">Reminder</option>
                <option value="alert">Alert</option>
                <option value="report">Report</option>
                <option value="document">Document</option>
                <option value="workflow">Workflow</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="email-template-key">Template (Opsional)</label>
              <select id="email-template-key" className="form-input" value={templateKeyNotif} onChange={(e) => { setTemplateKeyNotif(e.target.value); setPreviewHtml(""); setPreviewSubject(""); }}>
                <option value="">— Tanpa Template (Manual) —</option>
                {items.filter((t) => t.is_active).map((t) => (
                  <option key={String(t.id)} value={t.key ?? ""}>{t.name ?? t.key} — {t.subject ?? ""}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="email-subject">Subject {templateKeyNotif ? "(Opsional)" : <span style={{ color: "red" }}>*</span>}</label>
              <input id="email-subject" className="form-input" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Contoh: Reminder absensi" required={!templateKeyNotif} />
            </div>

            {templateKeyNotif && (
              <>
                {selectedTemplate?.placeholders && selectedTemplate.placeholders.length > 0 && (
                  <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                    <p style={{ fontSize: 13, color: "var(--text-secondary, #94a3b8)", margin: 0 }}>Placeholders yang diperlukan: <strong>{selectedTemplate.placeholders.join(", ")}</strong></p>
                  </div>
                )}
                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                  <label htmlFor="email-template-data">Template Data (JSON)</label>
                  <textarea id="email-template-data" className="form-input" value={templateDataNotif} onChange={(e) => setTemplateDataNotif(e.target.value)} placeholder='{"name": "Budi", "link": "https..."}' rows={3} />
                </div>
                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                  <Button type="button" variant="outline" size="sm" onClick={handlePreview} loading={previewing} style={{ borderColor: "#8b5cf6", color: "#8b5cf6" }}>
                    <Eye size={15} />
                    Preview Template
                  </Button>
                </div>
              </>
            )}

            {!templateKeyNotif && (
              <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                <label htmlFor="email-message">Message <span style={{ color: "red" }}>*</span></label>
                <textarea id="email-message" className="form-input" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Tulis isi email" rows={5} required />
              </div>
            )}
          </div>

          <div className="form-actions">
            <Button type="submit" variant="primary" loading={submitting}>
              <Mail size={16} />
              Kirim Email Notification
            </Button>
          </div>
        </form>

        {previewHtml && (
          <div style={{ marginTop: 20, borderTop: "1px solid var(--border-primary, #334155)", paddingTop: 16 }}>
            <h4 style={{ marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}><Eye size={16} /> Preview Template</h4>
            {previewSubject && <p style={{ fontSize: 13, color: "var(--text-secondary, #94a3b8)", marginBottom: 8 }}><strong>Subject:</strong> {previewSubject}</p>}
            <div
              style={{ border: "1px solid var(--border-primary, #334155)", borderRadius: 8, padding: 16, background: "#fff", color: "#1e293b", maxHeight: 400, overflowY: "auto" }}
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </div>
        )}
      </div>
    </Card>
  );

  /* ── Tab 2: Email Templates (Create + List) ── */
  const emailTemplatesTab = (
    <>
      <Card className="table-card" glass>
        <div className="table-header-bar">
          <h3>Buat Email Template</h3>
          <span className="table-count">POST /admin/email-templates</span>
        </div>
        <div className="table-card-inner">
          <form className="crud-form" onSubmit={handleCreateTemplate}>
            <div className="form-grid">
              <div className="form-group">
                <label>Template Key</label>
                <input className="form-input" value={templateKey} onChange={(e) => setTemplateKey(e.target.value)} placeholder="contoh: welcome_email" required />
              </div>
              <div className="form-group">
                <label>Template Name</label>
                <input className="form-input" value={templateName} onChange={(e) => setTemplateName(e.target.value)} placeholder="Welcome Email" required />
              </div>
              <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                <label>Subject</label>
                <input className="form-input" value={templateSubject} onChange={(e) => setTemplateSubject(e.target.value)} placeholder="Hello {{name}}" required />
              </div>
              <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                <label>HTML Body</label>
                <textarea className="form-input" value={templateHtml} onChange={(e) => setTemplateHtml(e.target.value)} placeholder="<h1>Hello {{name}}</h1>" rows={6} required />
              </div>
            </div>
            <div className="form-actions">
              <Button type="submit" loading={submitting}>
                <Mail size={16} />
                Create Template
              </Button>
            </div>
          </form>
        </div>
      </Card>

      <Card className="table-card" glass style={{ marginTop: 20 }}>
        <div className="table-header-bar">
          <h3>Daftar Email Templates</h3>
          <span className="table-count">{items.length} items</span>
        </div>
        {items.length === 0 ? (
          <div className="table-card-inner">
            <div className="empty-state">
              <BellRing size={32} style={{ opacity: 0.4 }} />
              <p>Belum ada email template yang tersedia.</p>
            </div>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Key</th>
                  <th>Name</th>
                  <th>Subject</th>
                  <th>Status</th>
                  <th>Dibuat</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={String(item.id ?? `${item.key ?? "template"}-${index}`)}>
                    <td><span className="cell-id">{item.id ?? "—"}</span></td>
                    <td><span className="cell-tag">{item.key || "—"}</span></td>
                    <td><div className="cell-name-text">{item.name || "—"}</div></td>
                    <td><div className="cell-sub">{item.subject || "—"}</div></td>
                    <td><span className={item.is_active ? "status-badge status-badge--approved" : "status-badge status-badge--draft"}>{item.is_active ? "Active" : "Inactive"}</span></td>
                    <td className="cell-date">{formatDate(item.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );

  /* ── Tab 3: Email Logs ── */
  const emailLogsTab = (
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
                <th>Type</th>
                <th>Status</th>
                <th>Sent At</th>
                <th className="th-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, index) => (
                <tr key={String(log.id ?? `${log.subject ?? "log"}-${index}`)}>
                  <td><span className="cell-id">{log.id ?? "—"}</span></td>
                  <td><div className="cell-name-text">{log.subject || "Tanpa subject"}</div></td>
                  <td><div className="cell-name-text">{log.recipient_email || "—"}</div></td>
                  <td><span className="cell-tag">{log.type || "—"}</span></td>
                  <td><span className={getStatusClass(log.status)}>{log.status || "draft"}</span></td>
                  <td className="cell-date">{formatDate(log.sent_at || log.created_at)}</td>
                  <td className="td-right">
                    {["failed", "error"].includes(String(log.status || "").toLowerCase()) && (
                      <Button variant="outline" size="sm" onClick={() => log.id && handleRetry(log.id)}>
                        <RefreshCw size={14} style={{ marginRight: 4 }} />
                        Retry
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );

  return (
    <div className="crud-page">
      <Card className="hero-card">
        <div className="hero-card-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <Mail size={16} />
              <span>Admin Center</span>
            </div>
            <h1 className="hero-title">Email Notifications</h1>
            <p className="hero-subtitle">
              Kelola email notification, template, dan pantau log delivery email.
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn-outline" onClick={() => void loadData()} disabled={loading}>
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              {loading ? "Memuat..." : "Segarkan"}
            </button>
          </div>
        </div>
      </Card>

      {statusMessage && <Alert type={alertType} message={statusMessage} onClose={() => setStatusMessage("")} dismissible />}

      <div className="leave-requests-wrapper">
        {summaryCards.map((card) => (
          <div key={card.label} className="leave-summary-card">
            <div className="leave-summary-header">
              <div>
                <p className="leave-summary-label">{card.label}</p>
                <p className="leave-summary-subtitle">{card.subtitle}</p>
              </div>
              <div className="leave-summary-icon-wrapper leave-icon-blue">
                {card.icon}
              </div>
            </div>
            <div className="leave-summary-value leave-value-blue">{card.value}</div>
            <p className="leave-summary-trend">Operational snapshot</p>
          </div>
        ))}
      </div>

      <div className="white-unified-wrapper">
        <Tabs
          tabs={[
            { id: "send", label: "📨 Kirim Email", content: sendEmailTab },
            { id: "templates", label: "📄 Email Templates", content: emailTemplatesTab },
            { id: "logs", label: "📋 Email Logs", content: emailLogsTab },
          ]}
          defaultSelected="send"
        />
      </div>
    </div>
  );
};

export default AdminEmailNotificationsPage;