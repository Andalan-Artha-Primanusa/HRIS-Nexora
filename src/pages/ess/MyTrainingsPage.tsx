import React, { useState, useEffect } from 'react';
import { RefreshCw, GraduationCap, Clock, CheckCircle, BookOpen, Play, BookTemplate } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { api } from '@/shared/api/httpClient';
import '@/shared/styles/CrudPage.css';
import '@/pages/dashboard/overview/OverviewPage.css';
import '@/pages/payroll/PayrollShared.css';

const MyTrainingsPage: React.FC = () => {
  const [trainings, setTrainings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Search & Filter
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState<'Semua' | 'In Progress' | 'Completed'>('Semua');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  const fetchData = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const response = await api.get('/my/trainings');
      const data = response.data;
      const trainingsArray = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
      setTrainings(trainingsArray);
    } catch (error) {
      console.error('Error fetching my trainings:', error);
      setErrorMessage('Gagal memuat pelatihan');
      setTrainings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter & Sort & Paginate
  const filteredTrainings = useMemo(() => {
    return trainings.filter((training) => {
      const searchStr = searchText.toLowerCase();
      const nameMatch = (training.program?.title || training.title || '').toLowerCase().includes(searchStr);
      const categoryMatch = (training.category || training.program?.category || '').toLowerCase().includes(searchStr);
      const textMatch = nameMatch || categoryMatch;

      let statusMatch = true;
      if (activeTab === 'In Progress') statusMatch = training.status === 'in_progress' || training.status === 'ongoing';
      else if (activeTab === 'Completed') statusMatch = training.status === 'completed';

      return textMatch && statusMatch;
    });
  }, [trainings, searchText, activeTab]);

  const sortedTrainings = useMemo(() => {
    return [...filteredTrainings].sort((a, b) => {
      const nameA = (a.program?.title || a.title || '').toLowerCase();
      const nameB = (b.program?.title || b.title || '').toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }, [filteredTrainings]);

  const paginatedTrainings = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedTrainings.slice(startIndex, startIndex + pageSize);
  }, [sortedTrainings, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedTrainings.length / pageSize);

  const completedCount = useMemo(() => trainings.filter(t => t.status === 'completed').length, [trainings]);
  const inProgressCount = useMemo(() => trainings.filter(t => t.status === 'in_progress' || t.status === 'ongoing').length, [trainings]);

  const clearFilters = () => {
    setSearchText('');
    setActiveTab('Semua');
    setCurrentPage(1);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, activeTab]);

  const getStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return { icon: CheckCircle, color: '#10b981', bg: '#ecfdf5' };
      case 'in_progress': case 'ongoing': return { icon: Play, color: '#f59e0b', bg: '#fffbeb' };
      case 'upcoming': case 'scheduled': return { icon: Clock, color: '#6366f1', bg: '#eef2ff' };
      default: return { icon: Clock, color: '#64748b', bg: '#f1f5f9' };
    }
  };

  const summaryCards = useMemo(
    () => [
      {
        label: 'Total Pelatihan',
        subtitle: 'Seluruh pelatihan',
        value: String(trainings.length),
        change: 'Data tersimpan di sistem',
        tone: 'blue' as const,
        icon: GraduationCap,
      },
      {
        label: 'Hasil Filter',
        subtitle: 'Pelatihan sesuai pencarian',
        value: String(sortedTrainings.length),
        change: `${paginatedTrainings.length} data per halaman`,
        tone: 'green' as const,
        icon: Search,
      },
      {
        label: 'Sedang Berlangsung',
        subtitle: 'Pelatihan aktif',
        value: String(inProgressCount),
        change: 'In progress',
        tone: 'orange' as const,
        icon: Play,
      },
      {
        label: 'Selesai',
        subtitle: 'Pelatihan selesai',
        value: String(completedCount),
        change: 'Completed',
        tone: 'purple' as const,
        icon: CheckCircle,
      },
    ],
    [trainings.length, completedCount, inProgressCount, sortedTrainings.length, paginatedTrainings.length]
  );

  return (
    <div className="crud-page">
      {/* Header */}
      <Card className="hero-card">
        <div className="hero-card-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <BookTemplate size={16} />
              <span>Layanan Mandiri</span>
            </div>
            <h1 className="hero-title">Pelatihan Saya</h1>
            <p className="hero-subtitle">
              Lacak pendaftaran pelatihan, kemajuan, dan kursus yang telah selesai.
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn-outline" onClick={fetchData} disabled={loading}>
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Segarkan
            </button>
          </div>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="employee-summary-wrapper">
        {summaryCards.map((card) => {
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
            <GraduationCap size={24} />
          </div>
          <div>
            <h2 className="analytics-title">Daftar Pelatihan</h2>
            <p className="analytics-subtitle">Kelola dan lihat semua pelatihan Anda</p>
          </div>
        </div>
      </Card>

      {/* Control Section */}
      <Card className="control-section-card">
        <div className="control-section-inner">
          {/* Tabs */}
          <div className="elyra-tabs">
            {(['Semua', 'In Progress', 'Completed'] as const).map((tab) => (
              <button key={tab} className={`elyra-tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
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
                placeholder="Cari pelatihan..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="search-input-pill"
              />
            </div>
            {(searchText || activeTab !== 'Semua') && (
              <button className="btn-clear-filter" onClick={clearFilters}>
                Hapus Filter
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Table Section */}
      <div className="table-section">
        <div className="wuw-table-area">
          {loading && <LoadingState message="Memuat pelatihan..." />}
          {!loading && errorMessage && <ErrorState message="Koneksi Terputus" error={errorMessage} onRetry={fetchData} />}

          {!loading && !errorMessage && paginatedTrainings.length === 0 && (
            <div style={{ padding: '5rem 0' }}>
              <EmptyState
                title="Pencarian Kosong"
                message="Kami tidak menemukan pelatihan yang sesuai dengan kriteria Anda."
                actionLabel="Bersihkan Filter"
                onAction={clearFilters}
              />
            </div>
          )}

          {!loading && !errorMessage && paginatedTrainings.length > 0 && (
            <>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Pelatihan</th>
                      <th>Kategori</th>
                      <th>Status</th>
                      <th>Progress</th>
                      <th className="th-center" style={{ width: '120px' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedTrainings.map((training) => {
                      const statusStyle = getStatusStyle(training.status);
                      const StatusIcon = statusStyle.icon;
                      return (
                        <tr key={training.id}>
                          <td>
                            <div className="cell-name">
                              <div className="cell-avatar" style={{ background: statusStyle.bg, color: statusStyle.color }}>
                                <BookOpen size={18} />
                              </div>
                              <div className="cell-stacked">
                                <span className="cell-name-text">{training.program?.title || training.title || 'Training'}</span>
                                <span className="cell-stacked__sub">{training.category || training.program?.category || '-'}</span>
                              </div>
                            </div>
                          </td>
                          <td><span style={{ color: '#475569', fontWeight: 600 }}>{training.category || training.program?.category || '-'}</span></td>
                          <td>
                            <span style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600, background: statusStyle.bg, color: statusStyle.color }}>
                              <StatusIcon size={12} style={{ marginRight: '4px' }} />
                              {training.status || 'Pending'}
                            </span>
                          </td>
                          <td>
                            {training.progress !== undefined ? (
                              <span style={{ color: '#64748b' }}>{training.progress}%</span>
                            ) : '-'}
                          </td>
                          <td className="td-center">
                            <span className="badge-soft badge-soft--blue">Active</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="table-pagination">
                <div className="pagination-info">
                  Menampilkan <strong>{paginatedTrainings.length}</strong> dari <strong>{sortedTrainings.length}</strong> pelatihan
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

export default MyTrainingsPage;