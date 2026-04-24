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
import "./AdminCrudPages.css";
import { 
  getAdminKpis, 
  deleteKpi, 
  approveKpi 
} from "@/features/admin/api/kpi.service";
// import type { EmployeeItem as EmpItem } from "@/features/employee/types/employee.types";

// KPIItem locally defined as it's specific to this feature
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
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState("");

  // Modal State (Hanya untuk Detail)
  const [showDetail, setShowDetail] = useState(false);
  const [selectedKpi, setSelectedKpi] = useState<KPIItem | null>(null);

  // Check for messages from navigation state
  useEffect(() => {
    if (location.state?.message) {
      setStatusMessage(location.state.message);
      setAlertType("success");
      // Clear state so it doesn't show again on refresh
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
    // const draft = kpis.filter(k => k.status === 'draft').length;
    const avgScore = total > 0 ? kpis.reduce((acc, k) => acc + k.score, 0) / total : 0;

    return [
      { label: "Total KPI", value: total, icon: <FileText size={18} />, color: "blue" },
      { label: "Disetujui", value: approved, icon: <CheckCircle2 size={18} />, color: "green" },
      { label: "Menunggu Review", value: submitted, icon: <Clock size={18} />, color: "orange" },
      { label: "Rata-rata Skor", value: `${avgScore.toFixed(1)}%`, icon: <TrendingUp size={18} />, color: "purple" }
    ];
  }, [kpis]);

  const chartData = useMemo(() => {
    // Group by status
    const statusCounts = kpis.reduce((acc: any, k) => {
      acc[k.status] = (acc[k.status] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  }, [kpis]);

  const performanceData = useMemo(() => {
    // Group by employee and get their best/avg score
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

  const handleOpenCreate = () => {
    navigate("/kpis/create");
  };

  const handleViewDetail = (kpi: KPIItem) => {
    setSelectedKpi(kpi);
    setShowDetail(true);
  };

  const handleEdit = (kpi: KPIItem) => {
    navigate(`/kpis/edit/${kpi.id}`);
  };

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

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");

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
    <div className="crud-page">
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-badge">Performa</span>
          <h1>Manajemen KPI</h1>
          <p>Kelola target kinerja dan pencapaian KPI karyawan.</p>
        </div>
        <div className="page-header-actions">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download size={16} />
            Ekspor CSV
          </Button>
          <Button variant="outline" onClick={loadData} disabled={loading}>
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Segarkan
          </Button>
          <Button variant="primary" onClick={handleOpenCreate}>
            <Plus size={16} />
            Buat KPI
          </Button>
        </div>
      </div>

      <div className="summary-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24, marginBottom: 32 }}>
        {stats.map((stat) => (
          <Card key={stat.label} glass style={{ 
            padding: 24, 
            background: stat.color === 'blue' ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.02))' :
                        stat.color === 'amber' ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(245, 158, 11, 0.02))' :
                        stat.color === 'emerald' ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.02))' :
                        'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.02))',
            border: stat.color === 'blue' ? '1px solid rgba(59, 130, 246, 0.2)' :
                    stat.color === 'amber' ? '1px solid rgba(245, 158, 11, 0.2)' :
                    stat.color === 'emerald' ? '1px solid rgba(16, 185, 129, 0.2)' :
                    '1px solid rgba(139, 92, 246, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            gap: 12
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{stat.label}</span>
              <span style={{ 
                width: 32, 
                height: 32, 
                borderRadius: 8, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                background: stat.color === 'blue' ? '#3b82f6' : stat.color === 'amber' ? '#f59e0b' : stat.color === 'emerald' ? '#10b981' : '#8b5cf6',
                color: '#fff'
              }}>{stat.icon}</span>
            </div>
            <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)' }}>{stat.value}</div>
          </Card>
        ))}
      </div>

      <div className="charts-section" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24, marginBottom: 24 }}>
        <Card glass style={{ padding: 20 }}>
          <h4 style={{ marginBottom: 16, fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>Distribusi Status KPI</h4>
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip 
                  cursor={{fill: 'rgba(0,0,0,0.02)'}}
                  contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.name === 'approved' ? '#10b981' : entry.name === 'submitted' ? '#f59e0b' : '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card glass style={{ padding: 20 }}>
          <h4 style={{ marginBottom: 16, fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>Performa Terbaik (Rata-rata Skor)</h4>
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis type="number" hide domain={[0, 100]} />
                <YAxis dataKey="name" type="category" width={100} fontSize={11} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{fill: 'rgba(0,0,0,0.02)'}}
                  contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar 
                  dataKey="score" 
                  fill="#8b5cf6" 
                  radius={[0, 4, 4, 0]} 
                  barSize={20}
                  label={{ position: 'right', fontSize: 10, formatter: (val: any) => `${val}%` }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {statusMessage && <Alert type={alertType} message={statusMessage} onClose={() => setStatusMessage("")} dismissible />}

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
                  <h4 style={{ margin: 0, fontSize: 18 }}>{selectedKpi.employee?.user?.name}</h4>
                  <span className="cell-sub">ID Karyawan: {selectedKpi.employee_id}</span>
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
                <Button variant="outline" style={{ flex: 1 }} onClick={() => { setShowDetail(false); handleEdit(selectedKpi); }}>
                  <FileText size={16} /> Ubah KPI
                </Button>
                {selectedKpi.status === 'submitted' && (
                  <Button variant="primary" style={{ flex: 1 }} onClick={() => { setShowDetail(false); handleApprove(selectedKpi.id); }}>
                    <CheckCircle2 size={16} /> Setujui Sekarang
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}

      <Card className="table-card" glass>
        <div className="table-header-bar">
          <div className="table-header-left">
            <h3>Daftar KPI</h3>
            <span className="table-count">{filteredKpis.length} Item</span>
          </div>
          <div className="table-controls" style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center', background: 'rgba(255,255,255,0.4)', padding: '16px', borderRadius: '12px', backdropFilter: 'blur(10px)' }}>
            <div className="search-box" style={{ flex: 1, minWidth: 250, position: 'relative' }}>
              <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} size={16} />
              <input 
                className="form-input" 
                placeholder="Cari karyawan atau judul KPI..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: 36, width: '100%', marginBottom: 0 }}
              />
            </div>
            <div className="filter-group" style={{ display: 'flex', gap: 12 }}>
              <select 
                className="form-input" 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ minWidth: 140, marginBottom: 0 }}
              >
                <option value="all">Semua Status</option>
                <option value="draft">Draft</option>
                <option value="submitted">Submitted</option>
                <option value="approved">Approved</option>
              </select>
              <input 
                type="month" 
                className="form-input" 
                value={periodFilter} 
                onChange={(e) => setPeriodFilter(e.target.value)}
                style={{ minWidth: 160, marginBottom: 0 }}
              />
              {(statusFilter !== "all" || periodFilter || searchTerm) && (
                <Button variant="ghost" size="sm" onClick={() => { setStatusFilter("all"); setPeriodFilter(""); setSearchTerm(""); }}>
                  Reset
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Karyawan</th>
                <th>Judul KPI</th>
                <th>Periode</th>
                <th>Target</th>
                <th style={{ width: 200 }}>Progres & Skor</th>
                <th>Status</th>
                <th className="th-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-8">
                    <RefreshCw size={24} className="animate-spin mx-auto opacity-40" />
                    <p style={{ marginTop: 8, opacity: 0.6 }}>Memuat data...</p>
                  </td>
                </tr>
              ) : filteredKpis.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8">
                    <AlertCircle size={24} className="mx-auto opacity-40" />
                    <p style={{ marginTop: 8, opacity: 0.6 }}>Tidak ada KPI ditemukan.</p>
                  </td>
                </tr>
              ) : (
                filteredKpis.map((kpi) => (
                  <tr key={kpi.id}>
                    <td>
                      <div className="cell-user">
                        <div className="cell-avatar"><User size={14} /></div>
                        <div>
                          <div className="cell-name-text">{kpi.employee?.user?.name || "Unknown"}</div>
                          <div className="cell-sub">ID: {kpi.employee_id}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="cell-name-text">{kpi.title}</div>
                      <div className="cell-sub">{kpi.description ? kpi.description.substring(0, 30) + "..." : "Tanpa deskripsi"}</div>
                    </td>
                    <td>
                      <div className="cell-tag"><Calendar size={12} /> {kpi.period || "—"}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 150 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                          <span>{kpi.achievement.toLocaleString()} / {kpi.target.toLocaleString()} tercapai</span>
                          <span style={{ fontWeight: 600, color: '#8b5cf6' }}>{kpi.score.toFixed(1)}%</span>
                        </div>
                        <div style={{ width: '100%', height: 6, background: 'rgba(0,0,0,0.05)', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ 
                            width: `${Math.min(kpi.score, 100)}%`, 
                            height: '100%', 
                            background: kpi.score >= 100 ? '#10b981' : kpi.score >= 75 ? '#8b5cf6' : kpi.score >= 50 ? '#f59e0b' : '#ef4444',
                            borderRadius: 3,
                            transition: 'width 0.5s ease-out'
                          }} />
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={getStatusClass(kpi.status)}>{kpi.status}</span>
                    </td>
                    <td className="td-right">
                      <div className="action-btn-group">
                        <button className="action-btn action-btn-view" onClick={() => handleViewDetail(kpi)} title="Lihat Detail">
                          <Eye size={16} />
                        </button>
                        {kpi.status === 'submitted' && (
                          <button className="action-btn action-btn-success" onClick={() => handleApprove(kpi.id)} title="Setujui">
                            <CheckCircle2 size={16} />
                          </button>
                        )}
                        <button className="action-btn action-btn-edit" onClick={() => handleEdit(kpi)} title="Ubah">
                          <FileText size={16} />
                        </button>
                        <button className="action-btn action-btn-delete" onClick={() => handleDelete(kpi.id)} title="Hapus">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AdminKpiPage;
