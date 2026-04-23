import { useEffect, useMemo, useState } from "react";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { Alert } from "@/shared/ui/Alert";
import { getErrorMessage } from "@/shared/api/errorHandler";
import { 
  Target, 
  Send, 
  Search,
  RefreshCw, 
  CheckCircle2, 
  Calendar,
  Eye,
  X,
  User
} from "lucide-react";
import "@/shared/styles/CrudPage.css";
import "./EssPages.css";
import { getMyKpi, submitMyKpi } from "@/features/ess/api/ess.service";

type KPIItem = {
  id: number;
  title: string;
  description?: string;
  target: number;
  achievement: number;
  score: number;
  status: string;
  period?: string;
  created_at: string;
  updated_at: string;
  employee?: {
    user: {
      name: string;
    }
  }
};

const formatDate = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  if (isNaN(date.getTime())) return value;
  return date.toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' });
};

const getStatusClass = (status?: string) => {
  const normalized = String(status || "").toLowerCase();
  if (normalized === "approved") return "status-badge status-badge--approved";
  if (normalized === "submitted") return "status-badge status-badge--pending";
  return "status-badge status-badge--draft";
};

const MyKpiPage = () => {
  const [kpis, setKpis] = useState<KPIItem[]>([]);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedKpi, setSelectedKpi] = useState<KPIItem | null>(null);
  
  // Search & Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error" | "info">("info");

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await getMyKpi();
      setKpis(response.items as unknown as KPIItem[]);
    } catch (error) {
      console.error("KPI Fetch Error:", error);
      setStatusMessage(getErrorMessage(error as never) || "Gagal memuat data KPI Anda");
      setAlertType("error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredKpis = useMemo(() => {
    return kpis.filter(kpi => {
      const matchSearch = kpi.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === "all" || kpi.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [kpis, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    const total = kpis.length;
    const approved = kpis.filter(k => k.status === 'approved').length;
    const avgScore = total > 0 ? kpis.reduce((acc, k) => acc + k.score, 0) / total : 0;
    const bestKpi = kpis.length > 0 ? [...kpis].sort((a, b) => b.score - a.score)[0] : null;

    return { 
      total, 
      approved, 
      avgScore,
      bestScore: bestKpi ? `${bestKpi.score.toFixed(1)}%` : "—"
    };
  }, [kpis]);

  const handleViewDetail = (kpi: KPIItem) => {
    setSelectedKpi(kpi);
    setShowDetail(true);
  };

  const handleSubmitKpi = async (id: number) => {
    if (!window.confirm("Ajukan KPI ini untuk ditinjau?")) return;
    setSubmitting(true);
    try {
      await submitMyKpi(String(id));
      setStatusMessage("KPI berhasil diajukan untuk persetujuan.");
      setAlertType("success");
      loadData();
    } catch (error) {
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
          <span className="page-badge">Layanan Mandiri</span>
          <h1>Performa Saya (KPI)</h1>
          <p>Pantau target kinerja dan ajukan pencapaian Anda.</p>
        </div>
      </div>

      <div className="summary-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24, marginBottom: 32 }}>
        <Card glass style={{ padding: 20 }}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 8 }}>Total KPI</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>{stats.total}</div>
        </Card>
        <Card glass style={{ padding: 20 }}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <CheckCircle2 size={14} color="#10b981" /> Disetujui
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#10b981' }}>{stats.approved}</div>
        </Card>
        <Card glass style={{ padding: 20 }}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 8 }}>Rata-rata Skor</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#8b5cf6' }}>{stats.avgScore.toFixed(1)}%</div>
        </Card>
      </div>

      <div className="table-controls" style={{ display: 'flex', gap: 16, marginBottom: 24, alignItems: 'center' }}>
        <div className="search-box" style={{ flex: 1, position: 'relative' }}>
          <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} size={16} />
          <input 
            className="form-input" 
            placeholder="Cari judul KPI..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: 36, width: '100%', marginBottom: 0 }}
          />
        </div>
        <select 
          className="form-input" 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ width: 160, marginBottom: 0 }}
        >
          <option value="all">Semua Status</option>
          <option value="draft">Draft</option>
          <option value="submitted">Submitted</option>
          <option value="approved">Approved</option>
        </select>
        <Button variant="outline" onClick={loadData} disabled={loading}>
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        </Button>
      </div>

      {statusMessage && <Alert type={alertType} message={statusMessage} onClose={() => setStatusMessage("")} dismissible />}

      {loading ? (
        <div className="kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
          {Array(3).fill(0).map((_, i) => (
            <Card key={i} glass style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
              <RefreshCw size={24} className="animate-spin" />
            </Card>
          ))}
        </div>
      ) : filteredKpis.length === 0 ? (
        <Card glass style={{ padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ opacity: 0.3, marginBottom: 16 }}>
            <Target size={48} style={{ margin: '0 auto' }} />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Belum Ada KPI</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 400, margin: '0 auto' }}>
            {searchTerm || statusFilter !== "all" 
              ? "Tidak ada KPI yang sesuai dengan kriteria pencarian Anda." 
              : "Anda belum memiliki KPI yang ditugaskan. Silakan hubungi manajer atau HR Anda."}
          </p>
          {(searchTerm || statusFilter !== "all") && (
            <Button variant="ghost" style={{ marginTop: 16 }} onClick={() => { setSearchTerm(""); setStatusFilter("all"); }}>
              Reset Filter
            </Button>
          )}
        </Card>
      ) : (
        <div className="kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
          {filteredKpis.map((kpi) => (
            <Card key={kpi.id} glass className="kpi-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, transition: 'transform 0.2s', cursor: 'default' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span className={getStatusClass(kpi.status)}>{kpi.status}</span>
                <div className="kpi-card__period" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
                  <Calendar size={14} /> {kpi.period || "—"}
                </div>
              </div>
              
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4, lineHeight: 1.4 }}>{kpi.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {kpi.description || "Tidak ada deskripsi tersedia."}
                </p>
              </div>

              <div style={{ marginTop: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Progres Capaian</span>
                  <span style={{ fontWeight: 600, color: '#8b5cf6' }}>{kpi.score.toFixed(1)}%</span>
                </div>
                <div style={{ width: '100%', height: 8, background: 'rgba(0,0,0,0.05)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ 
                    width: `${Math.min(kpi.score, 100)}%`, 
                    height: '100%', 
                    background: kpi.score >= 100 ? '#10b981' : kpi.score >= 75 ? '#8b5cf6' : kpi.score >= 50 ? '#f59e0b' : '#ef4444',
                    borderRadius: 4,
                    transition: 'width 1s ease-in-out'
                  }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginTop: 8, color: 'var(--text-secondary)' }}>
                  <span>{kpi.achievement.toLocaleString()} / {kpi.target.toLocaleString()} tercapai</span>
                  <span>Update: {formatDate(kpi.updated_at)}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, paddingTop: 16, borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                <Button variant="ghost" size="sm" style={{ flex: 1 }} onClick={() => handleViewDetail(kpi)}>
                  <Eye size={14} /> Detail
                </Button>
                {kpi.status === 'draft' && (
                  <Button variant="primary" size="sm" style={{ flex: 1.5 }} onClick={() => handleSubmitKpi(kpi.id)} loading={submitting}>
                    <Send size={14} /> Ajukan
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
      {showDetail && selectedKpi && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <Card className="detail-modal" glass style={{ width: '90%', maxWidth: 600, padding: 0, overflow: 'hidden' }}>
            <div className="table-header-bar" style={{ padding: '16px 24px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
              <h3>Detail KPI</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowDetail(false)}><X size={18} /></Button>
            </div>
            <div style={{ padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div className="cell-avatar" style={{ width: 48, height: 48, fontSize: 20 }}><User size={24} /></div>
                <div>
                  <h4 style={{ margin: 0, fontSize: 18 }}>KPI Saya</h4>
                  <span className="cell-sub">Periode: {selectedKpi.period}</span>
                </div>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.02)', padding: 20, borderRadius: 12, marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <h5 style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Objektif KPI</h5>
                  <span className={getStatusClass(selectedKpi.status)}>{selectedKpi.status}</span>
                </div>
                <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>{selectedKpi.title}</p>
                {selectedKpi.description && <p style={{ marginTop: 12, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{selectedKpi.description}</p>}
              </div>

              <div className="summary-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
                <div style={{ textAlign: 'center', padding: 12, background: 'rgba(0,0,0,0.02)', borderRadius: 8 }}>
                  <span style={{ display: 'block', fontSize: 10, color: 'var(--text-secondary)', marginBottom: 4 }}>TARGET</span>
                  <span style={{ fontSize: 16, fontWeight: 700 }}>{selectedKpi.target.toLocaleString()}</span>
                </div>
                <div style={{ textAlign: 'center', padding: 12, background: 'rgba(0,0,0,0.02)', borderRadius: 8 }}>
                  <span style={{ display: 'block', fontSize: 10, color: 'var(--text-secondary)', marginBottom: 4 }}>PENCAPAIAN</span>
                  <span style={{ fontSize: 16, fontWeight: 700 }}>{selectedKpi.achievement.toLocaleString()}</span>
                </div>
                <div style={{ textAlign: 'center', padding: 12, background: 'rgba(0,0,0,0.02)', borderRadius: 8 }}>
                  <span style={{ display: 'block', fontSize: 10, color: 'var(--text-secondary)', marginBottom: 4 }}>SKOR</span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: selectedKpi.score >= 100 ? '#10b981' : '#3b82f6' }}>{selectedKpi.score.toFixed(1)}%</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                {selectedKpi.status === 'draft' && (
                  <Button variant="primary" style={{ flex: 1 }} onClick={() => { setShowDetail(false); handleSubmitKpi(selectedKpi.id); }}>
                    <Send size={16} /> Ajukan Sekarang
                  </Button>
                )}
                <Button variant="outline" style={{ flex: 1 }} onClick={() => setShowDetail(false)}>
                  Tutup
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MyKpiPage;
