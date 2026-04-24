import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/app/store/auth.store";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { Alert } from "@/shared/ui/Alert";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
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
  AlertCircle,
  Eye,
  X,
  Download
} from "lucide-react";
import "@/shared/styles/CrudPage.css";
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
  if (normalized === "approved") return "status-badge status-active";
  if (normalized === "submitted") return "status-badge status-pending";
  return "status-badge status-default";
};

const AdminKpiPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);

  const [kpis, setKpis] = useState<KPIItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error" | "info">("info");
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState("");

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
      const query = searchTerm.toLowerCase();
      const matchSearch = title.includes(query) || empName.includes(query);
      const matchStatus = statusFilter === "all" || kpi.status === statusFilter;
      const matchPeriod = !periodFilter || kpi.period === periodFilter;
      
      return matchSearch && matchStatus && matchPeriod;
    });
  }, [kpis, searchTerm, statusFilter, periodFilter]);

  const stats = useMemo(() => {
    const total = kpis.length;
    const approved = kpis.filter(k => k.status === 'approved').length;
    const submitted = kpis.filter(k => k.status === 'submitted').length;
    const avgScore = total > 0 ? kpis.reduce((acc, k) => acc + k.score, 0) / total : 0;

    return [
      { label: "Total KPI", value: total, icon: <FileText size={18} />, color: "blue" },
      { label: "Disetujui", value: approved, icon: <CheckCircle2 size={18} />, color: "green" },
      { label: "Menunggu Review", value: submitted, icon: <Clock size={18} />, color: "orange" },
      { label: "Rata-rata Skor", value: `${avgScore.toFixed(1)}%`, icon: <TrendingUp size={18} />, color: "purple" }
    ];
  }, [kpis]);

  const chartData = useMemo(() => {
    const statusCounts = kpis.reduce((acc: any, k) => {
      acc[k.status] = (acc[k.status] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  }, [kpis]);

  const performanceData = useMemo(() => {
    const empScores = kpis.reduce((acc: any, k) => {
      const name = k.employee?.user?.name || "Unknown";
      if (!acc[name]) acc[name] = { name, score: 0, count: 0 };
      acc[name].score += k.score;
      acc[name].count += 1;
      return acc;
    }, {});
    return Object.values(empScores)
      .map((e: any) => ({ name: e.name, score: Math.round(e.score / e.count) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }, [kpis]);

  const handleOpenCreate = () => navigate("/kpis/create");
  const handleViewDetail = (kpi: KPIItem) => { setSelectedKpi(kpi); setShowDetail(true); };
  const handleEdit = (kpi: KPIItem) => navigate(`/kpis/edit/${kpi.id}`);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this KPI?")) return;
    try {
      await deleteKpi(id);
      setStatusMessage("KPI deleted successfully");
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
      setStatusMessage("KPI approved successfully");
      setAlertType("success");
      loadData();
    } catch (error) {
      setStatusMessage(getErrorMessage(error as never));
      setAlertType("error");
    }
  };

  const handleExportCSV = () => {
    const headers = ["Karyawan", "ID Karyawan", "Judul KPI", "Periode", "Target", "Pencapaian", "Skor", "Status"];
    const rows = filteredKpis.map(kpi => [
      kpi.employee?.user?.name || "Unknown",
      kpi.employee_id,
      kpi.title,
      kpi.period,
      kpi.target,
      kpi.achievement,
      `${kpi.score.toFixed(1)}%`,
      kpi.status
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `laporan_kpi_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!hasAdminAccess(user)) {
    return (
      <div className="crud-page">
        <Alert type="error" message="Akses Ditolak. Anda tidak memiliki izin untuk mengelola KPI." />
      </div>
    );
  }

  return (
    <div className="crud-page kpi-page">
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-badge">Performance</span>
          <h1>KPI Management</h1>
          <p>Manage employee performance targets and KPI achievements.</p>
        </div>
        <div className="page-header-actions">
          <Button variant="outline" size="md" onClick={handleExportCSV}>
            <Download size={16} />
            Export CSV
          </Button>
          <Button variant="outline" size="md" onClick={loadData} disabled={loading}>
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </Button>
          <Button variant="primary" size="md" onClick={handleOpenCreate}>
            <Plus size={16} />
            Create KPI
          </Button>
        </div>
      </div>

      <div className="summary-grid">
        {stats.map((stat) => (
          <Card key={stat.label} className="summary-card" glass>
            <div className="summary-card__header">
              <div>
                <span className="summary-card__label">{stat.label}</span>
                <p className="summary-card__subtitle">{stat.label === "Rata-rata Skor" ? "Average" : "Total"}</p>
              </div>
              <span className={`summary-card__icon summary-card__icon--${stat.color === 'purple' ? 'purple' : stat.color}`}>
                {stat.icon}
              </span>
            </div>
            <div className={`summary-card__value summary-card__value--${stat.color === 'purple' ? 'purple' : stat.color}`}>{stat.value}</div>
            <div className="summary-card__change">{stat.label}</div>
          </Card>
        ))}
      </div>

      <div className="white-unified-wrapper">
        <div className="wuw-header">
          <div className="wuw-header-top">
            <div className="wuw-title-area">
              <h3>KPI List</h3>
              <span className="wuw-count-badge">{filteredKpis.length} items</span>
            </div>
            <div className="header-filters">
              <div className="search-box">
                <Search size={18} />
                <input 
                  type="text" 
                  placeholder="Search by employee or title..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="submitted">Submitted</option>
                <option value="approved">Approved</option>
              </select>
              <input 
                type="month" 
                value={periodFilter} 
                onChange={(e) => setPeriodFilter(e.target.value)}
                className="filter-input"
              />
            </div>
          </div>
        </div>

        <div className="wuw-table-area">
          {loading ? (
            <div className="loading-state">
              <RefreshCw size={32} className="animate-spin" />
              <p>Loading KPIs...</p>
            </div>
          ) : filteredKpis.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><TrendingUp size={48} /></div>
              <h4>No KPIs found</h4>
              <p>Create your first KPI to get started.</p>
              <Button variant="primary" onClick={handleOpenCreate}>
                <Plus size={16} /> Create KPI
              </Button>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>KPI Title</th>
                    <th>Period</th>
                    <th>Progress</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredKpis.map((kpi) => (
                    <tr key={kpi.id}>
                      <td>
                        <div className="cell-user">
                          <div className="cell-avatar"><User size={14} /></div>
                          <div className="cell-stacked">
                            <span className="cell-name-text">{kpi.employee?.user?.name || "Unknown"}</span>
                            <span className="cell-sub">ID: {kpi.employee_id}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="cell-stacked">
                          <span className="cell-name-text">{kpi.title}</span>
                          <span className="cell-sub">{kpi.description ? kpi.description.substring(0, 30) + "..." : "No description"}</span>
                        </div>
                      </td>
                      <td><span className="cell-tag"><Calendar size={12} /> {kpi.period || "—"}</span></td>
                      <td>
                        <div className="progress-cell">
                          <div className="progress-bar">
                            <div 
                              className="progress-fill" 
                              style={{ 
                                width: `${Math.min(kpi.score, 100)}%`,
                                background: kpi.score >= 100 ? '#10b981' : kpi.score >= 75 ? '#8b5cf6' : kpi.score >= 50 ? '#f59e0b' : '#ef4444'
                              }} 
                            />
                          </div>
                          <span className="progress-label">{kpi.score.toFixed(1)}%</span>
                        </div>
                      </td>
                      <td><span className={getStatusClass(kpi.status)}>{kpi.status}</span></td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="action-btn-group">
                          <Button variant="ghost" size="sm" onClick={() => handleViewDetail(kpi)}><Eye size={16} /></Button>
                          {kpi.status === 'submitted' && (
                            <Button variant="ghost" size="sm" onClick={() => handleApprove(kpi.id)}><CheckCircle2 size={16} /></Button>
                          )}
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(kpi)}><FileText size={16} /></Button>
                          <Button variant="ghost" size="sm" danger onClick={() => handleDelete(kpi.id)}><Trash2 size={16} /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showDetail && selectedKpi && (
        <div className="modal-overlay" onClick={() => setShowDetail(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>KPI Detail</h3>
              <button className="modal-close" onClick={() => setShowDetail(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-header">
                <div className="cell-avatar cell-avatar-lg"><User size={24} /></div>
                <div>
                  <h4>{selectedKpi.employee?.user?.name}</h4>
                  <span className="cell-sub">Employee ID: {selectedKpi.employee_id}</span>
                </div>
              </div>
              
              <div className="detail-section">
                <h5>KPI Objective</h5>
                <span className={getStatusClass(selectedKpi.status)}>{selectedKpi.status}</span>
                <p className="detail-title">{selectedKpi.title}</p>
                {selectedKpi.description && <p className="detail-desc">{selectedKpi.description}</p>}
              </div>
              
              <div className="detail-stats">
                <div className="detail-stat">
                  <span className="detail-stat-label">Target</span>
                  <span className="detail-stat-value">{selectedKpi.target.toLocaleString()}</span>
                </div>
                <div className="detail-stat">
                  <span className="detail-stat-label">Achievement</span>
                  <span className="detail-stat-value">{selectedKpi.achievement.toLocaleString()}</span>
                </div>
                <div className="detail-stat">
                  <span className="detail-stat-label">Score</span>
                  <span className="detail-stat-value" style={{ color: selectedKpi.score >= 100 ? '#10b981' : '#3b82f6' }}>
                    {selectedKpi.score.toFixed(1)}%
                  </span>
                </div>
              </div>
              
              <div className="detail-actions">
                <Button variant="outline" onClick={() => { setShowDetail(false); handleEdit(selectedKpi); }}>
                  <FileText size={16} /> Edit KPI
                </Button>
                {selectedKpi.status === 'submitted' && (
                  <Button variant="primary" onClick={() => { setShowDetail(false); handleApprove(selectedKpi.id); }}>
                    <CheckCircle2 size={16} /> Approve Now
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminKpiPage;