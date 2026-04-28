import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/app/store/auth.store";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { Alert } from "@/shared/ui/Alert";
import { LoadingState, EmptyState } from "@/shared/ui/DataStateDisplay";
import { getErrorMessage } from "@/shared/api/errorHandler";
import { ROLES } from "@/shared/types/rbac.types";

import {
  Plus,
  Search,
  RefreshCw,
  CheckCircle2,
  Clock,
  FileText,
  Trash2,
  User,
  Calendar,
  TrendingUp,
  Eye,
  Target,
  Filter,
  Pencil
} from "lucide-react";
import "@/shared/styles/CrudPage.css";
import "@/pages/dashboard/overview/OverviewPage.css";
import "./AdminKpiPage.css";
import {
  getAdminKpis,
  deleteKpi,
  approveKpi
} from "@/features/admin/api/kpi.service";

type KPIItem = {
  id: number;
  employee_id: number;
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
    id: number;
    user?: {
      name: string;
    };
  };
};

const getRoleNames = (user: any) => (user?.roles ?? []).map((role: any) => role.name);

const hasAdminAccess = (user: any) => {
  const roleNames = getRoleNames(user);
  return roleNames.includes(ROLES.ADMIN) || roleNames.includes(ROLES.SUPER_ADMIN) || roleNames.includes(ROLES.HR);
};

const getStatusClass = (status?: string) => {
  const normalized = String(status || "").toLowerCase();
  if (normalized === "approved") return "status-badge status-badge--approved";
  if (normalized === "submitted") return "status-badge status-badge--pending";
  return "status-badge status-badge--draft";
};

const AdminKpiPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);

  const [kpis, setKpis] = useState<KPIItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error" | "info">("info");

  // Search & Filter
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState<"Semua" | "Draft" | "Submitted" | "Approved">("Semua");
  const [periodFilter, setPeriodFilter] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  const [showDetail, setShowDetail] = useState(false);
  const [selectedKpi, setSelectedKpi] = useState<KPIItem | null>(null);

  useEffect(() => {
    if (location.state?.message) {
      setStatusMessage(location.state.message);
      setAlertType("success");
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const kpiRes = await getAdminKpis();
      setKpis(kpiRes.items);
    } catch (error) {
      setStatusMessage(getErrorMessage(error as never));
      setAlertType("error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasAdminAccess(user)) {
      loadData();
    }
  }, [user]);

  const filteredKpis = useMemo(() => {
    return kpis.filter(kpi => {
      const title = String(kpi?.title || '').toLowerCase();
      const empName = String(kpi?.employee?.user?.name || '').toLowerCase();
      const query = searchText.toLowerCase();
      const matchSearch = title.includes(query) || empName.includes(query);

      let statusMatch = true;
      if (activeTab === "Draft") statusMatch = kpi.status === "draft";
      else if (activeTab === "Submitted") statusMatch = kpi.status === "submitted";
      else if (activeTab === "Approved") statusMatch = kpi.status === "approved";

      const matchPeriod = !periodFilter || kpi.period === periodFilter;

      return matchSearch && statusMatch && matchPeriod;
    });
  }, [kpis, searchText, activeTab, periodFilter]);

  const paginatedKpis = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredKpis.slice(startIndex, startIndex + pageSize);
  }, [filteredKpis, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredKpis.length / pageSize);

  const stats = useMemo(() => {
    const total = kpis.length;
    const approved = kpis.filter(k => k.status === 'approved').length;
    const submitted = kpis.filter(k => k.status === 'submitted').length;
    const avgScore = total > 0 ? kpis.reduce((acc, k) => acc + k.score, 0) / total : 0;

    return [
      { label: "Total KPI", value: total, subtitle: "Seluruh target kinerja" },
      { label: "Disetujui", value: approved, subtitle: "KPI yang disetujui" },
      { label: "Menunggu Review", value: submitted, subtitle: "KPI yang diajukan" },
      { label: "Rata-rata Skor", value: `${avgScore.toFixed(1)}%`, subtitle: "Skor kinerja rata-rata" }
    ];
  }, [kpis]);

  const handleOpenCreate = () => navigate("/kpis/create");
  const handleViewDetail = (kpi: KPIItem) => { setSelectedKpi(kpi); setShowDetail(true); };
  const handleEdit = (kpi: KPIItem) => navigate(`/kpis/edit/${kpi.id}`);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus KPI ini?")) return;
    try {
      await deleteKpi(id);
      setStatusMessage("KPI berhasil dihapus");
      setAlertType("success");
      loadData();
    } catch (error) {
      setStatusMessage(getErrorMessage(error as never));
      setAlertType("error");
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await approveKpi(id);
      setStatusMessage("KPI berhasil disetujui");
      setAlertType("success");
      loadData();
    } catch (error) {
      setStatusMessage(getErrorMessage(error as never));
      setAlertType("error");
    }
  };

  const clearFilters = () => {
    setSearchText("");
    setActiveTab("Semua");
    setPeriodFilter("");
    setCurrentPage(1);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, activeTab, periodFilter]);

  if (!hasAdminAccess(user)) {
    return (
      <div className="crud-page">
        <Alert type="error" message="Akses Ditolak. Anda tidak memiliki izin untuk mengelola KPI." />
      </div>
    );
  }

  return (
    <div className="crud-page kpi-page">
      {/* Header */}
      <Card className="hero-card">
        <div className="hero-card-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <Target size={16} />
              <span>Kinerja</span>
            </div>
            <h1 className="hero-title">Pengelolaan KPI</h1>
            <p className="hero-subtitle">
              Kelola target kinerja dan pencapaian KPI karyawan.
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn-outline" onClick={loadData} disabled={loading}>
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Segarkan
            </button>
            <button className="btn-primary" onClick={handleOpenCreate}>
              <Plus size={16} />
              Buat KPI
            </button>
          </div>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="employee-summary-wrapper">
        <div className="employee-summary-card">
          <div className="employee-summary-header">
            <div>
              <p className="employee-summary-label">{stats[0]?.label}</p>
              <p className="employee-summary-subtitle">{stats[0]?.subtitle}</p>
            </div>
            <div className="employee-summary-icon-wrapper employee-icon-blue">
              <FileText size={28} />
            </div>
          </div>
          <div className="employee-summary-value employee-value-blue">{stats[0]?.value || 0}</div>
          <p className="employee-summary-trend">Total KPI</p>
        </div>

        <div className="employee-summary-card">
          <div className="employee-summary-header">
            <div>
              <p className="employee-summary-label">{stats[1]?.label}</p>
              <p className="employee-summary-subtitle">{stats[1]?.subtitle}</p>
            </div>
            <div className="employee-summary-icon-wrapper employee-icon-green">
              <CheckCircle2 size={28} />
            </div>
          </div>
          <div className="employee-summary-value employee-value-green">{stats[1]?.value || 0}</div>
          <p className="employee-summary-trend">KPI Disetujui</p>
        </div>

        <div className="employee-summary-card">
          <div className="employee-summary-header">
            <div>
              <p className="employee-summary-label">{stats[2]?.label}</p>
              <p className="employee-summary-subtitle">{stats[2]?.subtitle}</p>
            </div>
            <div className="employee-summary-icon-wrapper employee-icon-orange">
              <Clock size={28} />
            </div>
          </div>
          <div className="employee-summary-value employee-value-orange">{stats[2]?.value || 0}</div>
          <p className="employee-summary-trend">Butuh Tinjauan</p>
        </div>

        <div className="employee-summary-card">
          <div className="employee-summary-header">
            <div>
              <p className="employee-summary-label">{stats[3]?.label}</p>
              <p className="employee-summary-subtitle">{stats[3]?.subtitle}</p>
            </div>
            <div className="employee-summary-icon-wrapper" style={{ background: '#f5f3ff' }}>
              <TrendingUp size={28} color="#8b5cf6" />
            </div>
          </div>
          <div className="employee-summary-value" style={{ color: '#8b5cf6' }}>{stats[3]?.value || '0%'}</div>
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
            <p className="analytics-subtitle">Kelola dan lihat semua KPI karyawan</p>
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

          {/* Search & Filter */}
          <div className="control-actions">
            <div className="search-box">
              <div className="search-icon-inside"><Search size={18} /></div>
              <input
                type="text"
                placeholder="Cari KPI atau karyawan..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="search-input-pill"
              />
            </div>
            <input
              type="month"
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
              className="filter-select-premium"
              style={{ width: 160 }}
            />
          </div>
        </div>
      </Card>

      {/* Status Message */}
      {statusMessage && (
        <div className={`alert alert-${alertType}`} style={{ marginBottom: 24 }}>
          <span>{statusMessage}</span>
          <button onClick={() => setStatusMessage("")} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>×</button>
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
                message={searchText || activeTab !== "Semua" || periodFilter
                  ? "Tidak ada KPI yang sesuai dengan kriteria Anda."
                  : "Belum ada KPI yang dibuat. Buat KPI pertama untuk memulai."}
                actionLabel="Buat KPI"
                onAction={handleOpenCreate}
              />
            </div>
          )}

          {!loading && paginatedKpis.length > 0 && (
            <>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '200px' }}>Karyawan</th>
                      <th style={{ width: '300px' }}>Judul KPI</th>
                      <th>Periode</th>
                      <th>Progres</th>
                      <th className="th-center">Status</th>
                      <th className="th-center" style={{ width: '140px' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedKpis.map((kpi) => (
                      <tr key={kpi.id}>
                        <td>
                          <div className="cell-name">
                            <div className="cell-avatar">
                              {kpi.employee?.user?.name ? kpi.employee.user.name.charAt(0).toUpperCase() : "K"}
                            </div>
                            <div className="cell-stacked">
                              <span className="cell-name-text">{kpi.employee?.user?.name || "Unknown"}</span>
                              <span className="cell-stacked__sub">ID: {kpi.employee_id}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="cell-stacked">
                            <span className="cell-name-text">{kpi.title}</span>
                            <span className="cell-stacked__sub">{kpi.description ? kpi.description.substring(0, 30) + "..." : "Tidak ada deskripsi"}</span>
                          </div>
                        </td>
                        <td>
                          <span className="badge-soft badge-soft--blue">
                            <Calendar size={12} /> {kpi.period || "—"}
                          </span>
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
                              title="Lihat Detail"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              className="action-btn action-btn-edit"
                              onClick={() => handleEdit(kpi)}
                              title="Edit"
                            >
                              <Pencil size={16} />
                            </button>
                            {kpi.status === 'submitted' && (
                              <button
                                className="action-btn"
                                style={{ color: '#10b981' }}
                                onClick={() => handleApprove(kpi.id)}
                                title="Setujui"
                              >
                                <CheckCircle2 size={16} />
                              </button>
                            )}
                            <button
                              className="action-btn action-btn-delete"
                              onClick={() => handleDelete(kpi.id)}
                              title="Hapus"
                            >
                              <Trash2 size={16} />
                            </button>
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div className="cell-avatar" style={{ width: 48, height: 48, fontSize: 20 }}>
                  {selectedKpi.employee?.user?.name ? selectedKpi.employee.user.name.charAt(0).toUpperCase() : "K"}
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: 18 }}>{selectedKpi.employee?.user?.name || "Unknown"}</h4>
                  <span className="cell-sub">Employee ID: {selectedKpi.employee_id}</span>
                </div>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.02)', padding: 20, borderRadius: 12, marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <h5 style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Objektif KPI</h5>
                  <span className={getStatusClass(selectedKpi.status)}>
                    {selectedKpi.status === "approved" ? "Approved" :
                      selectedKpi.status === "submitted" ? "Submitted" : "Draft"}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>{selectedKpi.title}</p>
                {selectedKpi.description && <p style={{ marginTop: 12, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{selectedKpi.description}</p>}
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
                <Button variant="outline" style={{ flex: 1 }} onClick={() => { setShowDetail(false); handleEdit(selectedKpi); }}>
                  <Pencil size={16} /> Edit KPI
                </Button>
                {selectedKpi.status === 'submitted' && (
                  <Button variant="primary" style={{ flex: 1 }} onClick={() => { setShowDetail(false); handleApprove(selectedKpi.id); }}>
                    <CheckCircle2 size={16} /> Setujui
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminKpiPage;