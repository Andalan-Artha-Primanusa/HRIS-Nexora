import { useEffect, useMemo, useState } from "react";
import { Card } from "@/shared/ui/Card";
import { LoadingState, EmptyState } from "@/shared/ui/DataStateDisplay";
import { getErrorMessage } from "@/shared/api/errorHandler";
import {
  Target,
  Send,
  Search,
  RefreshCw,
  CheckCircle2,
  Eye,
  TrendingUp,
} from "lucide-react";
import "@/shared/styles/CrudPage.css";
import "@/pages/dashboard/overview/OverviewPage.css";
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
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _formatDate = (value?: string) => {
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
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState<"Semua" | "Draft" | "Submitted" | "Approved">("Semua");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error" | "info">("info");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

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
      const matchSearch = kpi.title.toLowerCase().includes(searchText.toLowerCase());
      let statusMatch = true;
      if (activeTab === "Draft") statusMatch = kpi.status === "draft";
      else if (activeTab === "Submitted") statusMatch = kpi.status === "submitted";
      else if (activeTab === "Approved") statusMatch = kpi.status === "approved";
      return matchSearch && statusMatch;
    });
  }, [kpis, searchText, activeTab]);

  const paginatedKpis = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredKpis.slice(startIndex, startIndex + pageSize);
  }, [filteredKpis, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredKpis.length / pageSize);

  const stats = useMemo(() => {
    const total = kpis.length;
    const approved = kpis.filter(k => k.status === 'approved').length;
    const avgScore = total > 0 ? kpis.reduce((acc, k) => acc + k.score, 0) / total : 0;

    return {
      total,
      approved,
      avgScore: avgScore.toFixed(1)
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

  const clearFilters = () => {
    setSearchText("");
    setActiveTab("Semua");
    setCurrentPage(1);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, activeTab]);

  return (
    <div className="crud-page">
      {/* Header */}
      <Card className="hero-card">
        <div className="hero-card-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <Target size={16} />
              <span>Layanan Mandiri</span>
            </div>
            <h1 className="hero-title">Performa Saya (KPI)</h1>
            <p className="hero-subtitle">
              Pantau target kinerja dan ajukan pencapaian Anda.
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn-outline" onClick={loadData} disabled={loading}>
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Segarkan
            </button>
          </div>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="employee-summary-wrapper">
        <div className="employee-summary-card">
          <div className="employee-summary-header">
            <div>
              <p className="employee-summary-label">Total KPI</p>
              <p className="employee-summary-subtitle">KPI Anda</p>
            </div>
            <div className="employee-summary-icon-wrapper employee-icon-blue">
              <Target size={28} />
            </div>
          </div>
          <div className="employee-summary-value employee-value-blue">{stats.total}</div>
          <p className="employee-summary-trend">Total KPI</p>
        </div>

        <div className="employee-summary-card">
          <div className="employee-summary-header">
            <div>
              <p className="employee-summary-label">Disetujui</p>
              <p className="employee-summary-subtitle">KPI yang disetujui</p>
            </div>
            <div className="employee-summary-icon-wrapper employee-icon-green">
              <CheckCircle2 size={28} />
            </div>
          </div>
          <div className="employee-summary-value employee-value-green">{stats.approved}</div>
          <p className="employee-summary-trend">KPI Disetujui</p>
        </div>

        <div className="employee-summary-card">
          <div className="employee-summary-header">
            <div>
              <p className="employee-summary-label">Rata-rata Skor</p>
              <p className="employee-summary-subtitle">Skor kinerja</p>
            </div>
            <div className="employee-summary-icon-wrapper" style={{ background: '#f5f3ff' }}>
              <TrendingUp size={28} color="#8b5cf6" />
            </div>
          </div>
          <div className="employee-summary-value" style={{ color: '#8b5cf6' }}>{stats.avgScore}%</div>
          <p className="employee-summary-trend">Skor Rata-rata</p>
        </div>
      </div>

      {/* Analytics Title Card */}
      <Card className="analytics-title-card">
        <div className="analytics-title-inner">
          <div className="analytics-icon">
            <Target size={24} />
          </div>
          <div>
            <h2 className="analytics-title">Daftar KPI</h2>
            <p className="analytics-subtitle">Kelola dan lihat semua KPI Anda</p>
          </div>
        </div>
      </Card>

      {/* Control Section */}
      <Card className="control-section-card">
        <div className="control-section-inner">
          {/* Tabs */}
          <div className="elyra-tabs">
            {(["Semua", "Draft", "Submitted", "Approved"] as const).map((tab) => (
              <button
                key={tab}
                className={`elyra-tab ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="control-actions">
            <div className="search-box">
              <div className="search-icon-inside"><Search size={18} /></div>
              <input
                type="text"
                placeholder="Cari KPI..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="search-input-pill"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Status Message */}
      {statusMessage && (
        <div className={`alert alert-${alertType}`} style={{ marginBottom: 24 }}>
          <span>{statusMessage}</span>
          <button onClick={() => setStatusMessage("")} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
        </div>
      )}

      {/* Table Section */}
      <div className="table-section">
        <div className="wuw-table-area">
          {loading && <LoadingState message="Memuat KPI..." />}

          {!loading && paginatedKpis.length === 0 && (
            <div style={{ padding: '5rem 0' }}>
              <EmptyState
                title="Belum Ada KPI"
                message={searchText || activeTab !== "Semua"
                  ? "Tidak ada KPI yang sesuai dengan kriteria Anda."
                  : "Anda belum memiliki KPI yang ditugaskan. Silakan hubungi manajer atau HR Anda."}
                actionLabel="Bersihkan Filter"
                onAction={clearFilters}
              />
            </div>
          )}

          {!loading && paginatedKpis.length > 0 && (
            <>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '400px' }}>Judul KPI</th>
                      <th>Periode</th>
                      <th>Target</th>
                      <th>Pencapaian</th>
                      <th>Skor</th>
                      <th className="th-center">Status</th>
                      <th className="th-center" style={{ width: '120px' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedKpis.map((kpi) => (
                      <tr key={kpi.id}>
                        <td>
                          <div className="cell-name">
                            <div className="cell-avatar">
                              {kpi.title ? kpi.title.charAt(0).toUpperCase() : "K"}
                            </div>
                            <div className="cell-stacked">
                              <span className="cell-name-text">{kpi.title}</span>
                              <span className="cell-stacked__sub">{kpi.description || "Tidak ada deskripsi"}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="cell-stacked">
                            <span className="cell-stacked__main" style={{ fontSize: '0.85rem' }}>{kpi.period || "—"}</span>
                            <span className="cell-stacked__sub">Periode</span>
                          </div>
                        </td>
                        <td>
                          <span style={{ color: '#475569', fontWeight: 600 }}>{kpi.target.toLocaleString()}</span>
                        </td>
                        <td>
                          <span style={{ color: '#64748b', fontWeight: 500 }}>{kpi.achievement.toLocaleString()}</span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 60, height: 6, background: 'rgba(0,0,0,0.05)', borderRadius: 3, overflow: 'hidden' }}>
                              <div style={{
                                width: `${Math.min(kpi.score, 100)}%`,
                                height: '100%',
                                background: kpi.score >= 100 ? '#10b981' : kpi.score >= 75 ? '#8b5cf6' : kpi.score >= 50 ? '#f59e0b' : '#ef4444',
                                borderRadius: 3
                              }} />
                            </div>
                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#8b5cf6' }}>{kpi.score.toFixed(1)}%</span>
                          </div>
                        </td>
                        <td className="td-center">
                          <span className={getStatusClass(kpi.status)}>
                            {kpi.status === "approved" ? "Approved" :
                              kpi.status === "submitted" ? "Submitted" : "Draft"}
                          </span>
                        </td>
                        <td className="td-center">
                          <div className="action-btn-group">
                            <button
                              className="action-btn action-btn-edit"
                              onClick={() => handleViewDetail(kpi)}
                              title="Detail"
                            >
                              <Eye size={16} />
                            </button>
                            {kpi.status === 'draft' && (
                              <button
                                className="action-btn action-btn-edit"
                                onClick={() => handleSubmitKpi(kpi.id)}
                                title="Ajukan"
                                disabled={submitting}
                              >
                                <Send size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="table-pagination">
                <div className="pagination-info">
                  Menampilkan <strong>{paginatedKpis.length}</strong> dari <strong>{filteredKpis.length}</strong> KPI
                </div>
                <div className="pagination-controls">
                  <button
                    className="pagination-btn"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    ‹
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    className="pagination-btn"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    ›
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {showDetail && selectedKpi && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <Card className="detail-modal" glass style={{ width: '90%', maxWidth: 600, padding: 0, overflow: 'hidden' }}>
            <div className="table-header-bar" style={{ padding: '16px 24px', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>Detail KPI</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowDetail(false)}>×</Button>
            </div>
            <div style={{ padding: 24 }}>
              <div style={{ background: 'rgba(0,0,0,0.02)', padding: 20, borderRadius: 12, marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: 18 }}>{selectedKpi.title}</h4>
                    <span className="cell-sub">Periode: {selectedKpi.period || "—"}</span>
                  </div>
                  <span className={getStatusClass(selectedKpi.status)}>
                    {selectedKpi.status === "approved" ? "Approved" :
                      selectedKpi.status === "submitted" ? "Submitted" : "Draft"}
                  </span>
                </div>
                {selectedKpi.description && (
                  <p style={{ marginTop: 12, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{selectedKpi.description}</p>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
                <div style={{ textAlign: 'center', padding: 12, background: 'rgba(0,0,0,0.02)', borderRadius: 8 }}>
                  <span style={{ display: 'block', fontSize: 10, color: 'var(--text-secondary)', marginBottom: 4, textTransform: 'uppercase' }}>Target</span>
                  <span style={{ fontSize: 16, fontWeight: 700 }}>{selectedKpi.target.toLocaleString()}</span>
                </div>
                <div style={{ textAlign: 'center', padding: 12, background: 'rgba(0,0,0,0.02)', borderRadius: 8 }}>
                  <span style={{ display: 'block', fontSize: 10, color: 'var(--text-secondary)', marginBottom: 4, textTransform: 'uppercase' }}>Pencapaian</span>
                  <span style={{ fontSize: 16, fontWeight: 700 }}>{selectedKpi.achievement.toLocaleString()}</span>
                </div>
                <div style={{ textAlign: 'center', padding: 12, background: 'rgba(0,0,0,0.02)', borderRadius: 8 }}>
                  <span style={{ display: 'block', fontSize: 10, color: 'var(--text-secondary)', marginBottom: 4, textTransform: 'uppercase' }}>Skor</span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: selectedKpi.score >= 100 ? '#10b981' : '#8b5cf6' }}>{selectedKpi.score.toFixed(1)}%</span>
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
