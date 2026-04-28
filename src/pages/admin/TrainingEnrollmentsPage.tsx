import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, RefreshCw, GraduationCap, Calendar, Users, Search, CheckCircle, Clock, XCircle, BookOpen, TrendingUp } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { LoadingState, EmptyState } from '@/shared/ui/DataStateDisplay';
import { trainingService } from '@/features/training/api/training.service';
import '@/shared/styles/CrudPage.css';
import '@/pages/dashboard/overview/OverviewPage.css';

const TrainingEnrollmentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState<"Semua" | "Pending" | "In Progress" | "Completed" | "Cancelled">("Semua");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await trainingService.getEnrollments();
      const enrollmentsArray = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
      setEnrollments(enrollmentsArray);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const summaryStats = useMemo(() => {
    const total = enrollments.length;
    const completed = enrollments.filter(e => e.status === 'completed').length;
    const inProgress = enrollments.filter(e => e.status === 'in_progress' || e.status === 'ongoing').length;
    const pending = enrollments.filter(e => e.status === 'pending').length;

    return [
      { label: "Total Pendaftaran", subtitle: "Seluruh pendaftaran", value: total, tone: "blue" as const },
      { label: "Sedang Berlangsung", subtitle: "Pelatihan aktif", value: inProgress, tone: "orange" as const },
      { label: "Selesai", subtitle: "Pelatihan selesai", value: completed, tone: "green" as const },
      { label: "Pending", subtitle: "Menunggu persetujuan", value: pending, tone: "red" as const },
    ];
  }, [enrollments]);

  const filteredEnrollments = useMemo(() => {
    return enrollments.filter((e: any) => {
      const programTitle = String(e.program?.title || e.training_title || '').toLowerCase();
      const employeeName = String(e.employee?.user?.name || e.employee_name || '').toLowerCase();
      const query = searchText.toLowerCase();
      const matchSearch = programTitle.includes(query) || employeeName.includes(query);

      let statusMatch = true;
      if (activeTab === "Pending") statusMatch = e.status === 'pending';
      else if (activeTab === "In Progress") statusMatch = e.status === 'in_progress' || e.status === 'ongoing';
      else if (activeTab === "Completed") statusMatch = e.status === 'completed';
      else if (activeTab === "Cancelled") statusMatch = e.status === 'cancelled' || e.status === 'dropped';

      return matchSearch && statusMatch;
    });
  }, [enrollments, searchText, activeTab]);

  const paginatedEnrollments = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredEnrollments.slice(startIndex, startIndex + pageSize);
  }, [filteredEnrollments, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredEnrollments.length / pageSize);

  const clearFilters = () => {
    setSearchText("");
    setActiveTab("Semua");
    setCurrentPage(1);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, activeTab]);

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return <span className="status-badge status-active">COMPLETED</span>;
      case 'in_progress':
      case 'ongoing':
        return <span className="status-badge status-pending">IN PROGRESS</span>;
      case 'pending':
        return <span className="status-badge status-pending">PENDING</span>;
      case 'cancelled':
      case 'dropped':
        return <span className="status-badge status-danger">CANCELLED</span>;
      default:
        return <span className="status-badge status-pending">{status?.toUpperCase() || 'UNKNOWN'}</span>;
    }
  };

  return (
    <div className="crud-page">
      {/* Header */}
      <Card className="hero-card">
        <div className="hero-card-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <GraduationCap size={16} />
              <span>L & D</span>
            </div>
            <h1 className="hero-title">Pendaftaran Pelatihan</h1>
            <p className="hero-subtitle">
              Lacak dan kelola pendaftaran dan kemajuan pelatihan karyawan.
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn-outline" onClick={fetchData} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Segarkan
            </button>
          </div>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="employee-summary-wrapper">
        {summaryStats.map((card) => {
          const Icon = card.tone === "blue" ? Users : card.tone === "orange" ? Clock : card.tone === "green" ? CheckCircle : TrendingUp;

          return (
            <div key={card.label} className="employee-summary-card">
              <div className="employee-summary-header">
                <div>
                  <p className="employee-summary-label">{card.label}</p>
                  <p className="employee-summary-subtitle">{card.subtitle}</p>
                </div>
                <div className={`employee-summary-icon-wrapper employee-icon-${card.tone}`}>
                  <Icon size={28} />
                </div>
              </div>
              <div className={`employee-summary-value employee-value-${card.tone}`}>{card.value}</div>
              <p className="employee-summary-trend">{card.subtitle}</p>
            </div>
          );
        })}
      </div>

      {/* Analytics Title Card */}
      <Card className="analytics-title-card">
        <div className="analytics-title-inner">
          <div className="analytics-icon">
            <BookOpen size={24} />
          </div>
          <div>
            <h2 className="analytics-title">Daftar Pendaftaran</h2>
            <p className="analytics-subtitle">Kelola pendaftaran pelatihan karyawan</p>
          </div>
        </div>
      </Card>

      {/* Control Section */}
      <Card className="control-section-card">
        <div className="control-section-inner">
          <div className="search-filter-group">
            <div className="search-input-wrapper">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Cari program atau nama karyawan..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              {searchText && (
                <button className="clear-search-btn" onClick={() => setSearchText("")}>×</button>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={clearFilters} disabled={!searchText && activeTab === "Semua"}>
              <RefreshCw size={14} />
              Reset
            </Button>
          </div>

          <div className="tabs-container">
            {(["Semua", "Pending", "In Progress", "Completed", "Cancelled"] as const).map((tab) => (
              <button
                key={tab}
                className={`tab-button ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
                {tab !== "Semua" && (
                  <span className="tab-count">
                    {tab === "Pending"
                      ? enrollments.filter(e => e.status === 'pending').length
                      : tab === "In Progress"
                      ? enrollments.filter(e => e.status === 'in_progress' || e.status === 'ongoing').length
                      : tab === "Completed"
                      ? enrollments.filter(e => e.status === 'completed').length
                      : enrollments.filter(e => e.status === 'cancelled' || e.status === 'dropped').length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Data Table */}
      <Card className="data-table-card">
        <div className="data-table-header">
          <h3 className="data-table-title">
            Daftar Pendaftaran Pelatihan
            <span className="data-table-count">{filteredEnrollments.length} ditemukan</span>
          </h3>
        </div>

        {loading ? (
          <LoadingState message="Memuat data pendaftaran..." />
        ) : filteredEnrollments.length === 0 ? (
          <EmptyState
            icon={<GraduationCap size={48} />}
            title="Tidak ada pendaftaran ditemukan"
            message={searchText || activeTab !== "Semua" ? "Coba ubah kata kunci atau filter" : "Belum ada data pendaftaran pelatihan"}
          />
        ) : (
          <>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Program Pelatihan</th>
                    <th>Karyawan</th>
                    <th>Tanggal Mulai</th>
                    <th>Status</th>
                    <th>Progress</th>
                    <th style={{ textAlign: 'right' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedEnrollments.map((enrollment) => (
                    <tr key={enrollment.id}>
                      <td>
                        <div className="cell-stacked">
                          <span className="cell-name-text">{enrollment.program?.title || enrollment.program?.nama || enrollment.training_title || 'Training Program'}</span>
                          <span className="cell-email">{enrollment.program?.description || '-'}</span>
                        </div>
                      </td>
                      <td>
                        <div className="cell-stacked">
                          <span className="cell-name-text">{enrollment.employee?.user?.name || enrollment.employee_name || 'Employee'}</span>
                          <span className="cell-email">{enrollment.employee?.employee_code || '-'}</span>
                        </div>
                      </td>
                      <td>{enrollment.start_date || 'N/A'}</td>
                      <td>{getStatusBadge(enrollment.status)}</td>
                      <td>
                        {enrollment.progress !== undefined ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '60px', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ width: `${enrollment.progress}%`, height: '100%', background: '#10b981', borderRadius: '3px' }} />
                            </div>
                            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{enrollment.progress}%</span>
                          </div>
                        ) : '-'}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="action-btn-group">
                          <Button variant="ghost" size="sm" onClick={() => navigate(`/training/programs`)}>
                            <BookOpen size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="table-pagination">
                <div className="pagination-info">
                  Menampilkan {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, filteredEnrollments.length)} dari {filteredEnrollments.length}
                </div>
                <div className="pagination-controls">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                  >
                    Sebelumnya
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      className={`pagination-page-btn ${currentPage === page ? 'active' : ''}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                  >
                    Selanjutnya
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
};

export default TrainingEnrollmentsPage;
