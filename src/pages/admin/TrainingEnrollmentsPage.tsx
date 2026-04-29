import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, RefreshCw, GraduationCap, Calendar, Users, Search, Filter, CheckCircle, Clock, XCircle, BookOpen, TrendingUp } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { LoadingState, EmptyState } from '@/shared/ui/DataStateDisplay';
import { trainingService } from '@/features/training/api/training.service';
import '@/shared/styles/CrudPage.css';
import '@/pages/dashboard/overview/OverviewPage.css';
import '@/pages/leave/LeaveShared.css';

const TrainingEnrollmentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchText, setSearchText] = useState("");
  const [showFilters, setShowFilters] = useState(false);
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
    const cancelled = enrollments.filter(e => e.status === 'cancelled' || e.status === 'dropped').length;

    return [
      { label: "Total Pendaftaran", subtitle: "Seluruh pendaftaran", value: String(total), change: "Data pendaftaran aktif", tone: "blue" as const, icon: Users },
      { label: "Hasil Filter", subtitle: "Pendaftaran sesuai pencarian", value: String(filteredEnrollments.length), change: `${paginatedEnrollments.length} data per halaman`, tone: "green" as const, icon: Search },
      { label: "Sedang Berlangsung", subtitle: "Pelatihan aktif", value: String(inProgress), change: "Dalam proses", tone: "orange" as const, icon: Clock },
      { label: "Selesai", subtitle: "Pelatihan selesai", value: String(completed), change: "Status final selesai", tone: "green" as const, icon: CheckCircle },
    ];
  }, [enrollments, filteredEnrollments.length, paginatedEnrollments.length]);

  const filteredEnrollments = useMemo(() => {
    return enrollments.filter((e: any) => {
      const programTitle = String(e.program?.title || e.training_title || '').toLowerCase();
      const employeeName = String(e.employee?.user?.name || e.employee_name || '').toLowerCase();
      const query = searchText.toLowerCase();
      
      const matchSearch = !query || programTitle.includes(query) || employeeName.includes(query);

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
    const statusMap: Record<string, { label: string; tone: string }> = {
      'completed': { label: 'Completed', tone: 'green' },
      'in_progress': { label: 'In Progress', tone: 'orange' },
      'ongoing': { label: 'In Progress', tone: 'orange' },
      'pending': { label: 'Pending', tone: 'orange' },
      'cancelled': { label: 'Cancelled', tone: 'red' },
      'dropped': { label: 'Cancelled', tone: 'red' },
    };
    const config = statusMap[status?.toLowerCase()] || { label: status?.toUpperCase() || 'UNKNOWN', tone: 'orange' };
    return (
      <span className={`badge-soft badge-soft--${config.tone}`}>
        {config.label}
      </span>
    );
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
              {loading ? 'Memuat...' : 'Segarkan'}
            </button>
          </div>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="employee-summary-wrapper">
        {summaryStats.map((card) => {
          const Icon = card.icon;
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
              <p className="employee-summary-trend">{card.change}</p>
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
          {/* Tabs */}
          <div className="elyra-tabs">
            {(["Semua", "Pending", "In Progress", "Completed", "Cancelled"] as const).map((tab) => (
              <button
                key={tab}
                className={`elyra-tab ${activeTab === tab ? 'active' : ''}`}
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

          {/* Search & Filter */}
          <div className="control-actions">
            <div className="search-box">
              <div className="search-icon-inside">
                <Search size={18} />
              </div>
              <input
                type="text"
                placeholder="Cari program atau nama karyawan..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="search-input-pill"
              />
            </div>
            <button
              className={`filter-btn-rounded ${showFilters ? 'active' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={18} />
              <span>Filter</span>
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="filter-dropdown">
            <div className="filter-row">
              {(searchText || activeTab !== "Semua") && (
                <button className="btn-clear-filter" onClick={clearFilters}>
                  Hapus Filter
                </button>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* Table Section */}
      <div className="table-section">
        <div className="wuw-table-area">
          {loading && <LoadingState message="Memuat data pendaftaran..." />}

          {!loading && paginatedEnrollments.length === 0 && (
            <div style={{ padding: '5rem 0' }}>
              <EmptyState
                title="Pendaftaran Kosong"
                message={searchText || activeTab !== "Semua" ? 'Tidak ada pendaftaran yang sesuai dengan kriteria Anda.' : 'Belum ada data pendaftaran pelatihan.'}
                actionLabel="Segarkan"
                onAction={fetchData}
              />
            </div>
          )}

          {!loading && paginatedEnrollments.length > 0 && (
            <>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '400px' }}>Program Pelatihan</th>
                      <th>Karyawan</th>
                      <th>Tanggal Mulai</th>
                      <th>Status</th>
                      <th>Progress</th>
                      <th className="th-center" style={{ width: '120px' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedEnrollments.map((enrollment) => (
                      <tr key={enrollment.id}>
                        <td>
                          <div className="cell-name">
                            <div className="cell-avatar">
                              {(enrollment.program?.title || enrollment.training_title || 'T').charAt(0).toUpperCase()}
                            </div>
                            <div className="cell-stacked">
                              <span className="cell-name-text">{enrollment.program?.title || enrollment.program?.nama || enrollment.training_title || 'Training Program'}</span>
                              <span className="cell-stacked__sub">{String(enrollment.program_id || enrollment.id)}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="cell-stacked">
                            <span className="cell-name-text">{enrollment.employee?.user?.name || enrollment.employee_name || 'Employee'}</span>
                            <span className="cell-stacked__sub">{enrollment.employee?.employee_code || '-'}</span>
                          </div>
                        </td>
                        <td style={{ color: '#475569', fontWeight: 500 }}>{enrollment.start_date || 'N/A'}</td>
                        <td className="td-center">
                          {getStatusBadge(enrollment.status)}
                        </td>
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
                        <td className="td-center">
                          <div className="action-btn-group">
                            <button
                              className="action-btn action-btn-edit"
                              onClick={() => navigate(`/training/programs`)}
                              title="Lihat Program"
                            >
                              <BookOpen size={16} />
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
                  Menampilkan <strong>{paginatedEnrollments.length}</strong> dari <strong>{filteredEnrollments.length}</strong> pendaftaran
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
    </div>
  );
};

export default TrainingEnrollmentsPage;
