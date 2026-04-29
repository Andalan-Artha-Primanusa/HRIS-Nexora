import React, { useEffect, useMemo, useState } from 'react';
import { RefreshCw, Award, TrendingUp, CheckCircle, Target, Star, Search } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { LoadingState, ErrorState, EmptyState } from '@/shared/ui/DataStateDisplay';
import { trainingService } from '@/features/training/api/training.service';
import '@/shared/styles/CrudPage.css';
import '@/pages/dashboard/overview/OverviewPage.css';
import '@/pages/payroll/PayrollShared.css';

const MyCompetenciesPage: React.FC = () => {
  const [competencies, setCompetencies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Search & Filter
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState<'Semua' | 'Expert' | 'Advanced' | 'Intermediate'>('Semua');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  const fetchData = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const data = await trainingService.getMyCompetencies();
      const competenciesArray = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
      setCompetencies(competenciesArray);
    } catch (error) {
      console.error('Error fetching my competencies:', error);
      setErrorMessage('Gagal memuat kompetensi');
      setCompetencies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getLevelColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'expert': return { color: '#8b5cf6', bg: '#f5f3ff' };
      case 'advanced': return { color: '#2563eb', bg: '#eff6ff' };
      case 'intermediate': return { color: '#10b981', bg: '#ecfdf5' };
      case 'beginner': return { color: '#f59e0b', bg: '#fffbeb' };
      default: return { color: '#64748b', bg: '#f1f5f9' };
    }
  };

  // Filter & Sort & Paginate
  const filteredCompetencies = useMemo(() => {
    return competencies.filter((comp) => {
      const searchStr = searchText.toLowerCase();
      const nameMatch = (comp.name || comp.skill_name || '').toLowerCase().includes(searchStr);
      const categoryMatch = (comp.category || '').toLowerCase().includes(searchStr);
      const textMatch = nameMatch || categoryMatch;

      let levelMatch = true;
      if (activeTab === 'Expert') levelMatch = comp.level?.toLowerCase() === 'expert';
      else if (activeTab === 'Advanced') levelMatch = comp.level?.toLowerCase() === 'advanced';
      else if (activeTab === 'Intermediate') levelMatch = comp.level?.toLowerCase() === 'intermediate' || comp.level?.toLowerCase() === 'beginner';

      return textMatch && levelMatch;
    });
  }, [competencies, searchText, activeTab]);

  const sortedCompetencies = useMemo(() => {
    return [...filteredCompetencies].sort((a, b) => {
      const nameA = (a.name || a.skill_name || '').toLowerCase();
      const nameB = (b.name || b.skill_name || '').toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }, [filteredCompetencies]);

  const paginatedCompetencies = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedCompetencies.slice(startIndex, startIndex + pageSize);
  }, [sortedCompetencies, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedCompetencies.length / pageSize);

  const expertCount = useMemo(() => competencies.filter(c => c.level?.toLowerCase() === 'expert').length, [competencies]);
  const advancedCount = useMemo(() => competencies.filter(c => c.level?.toLowerCase() === 'advanced').length, [competencies]);
  const beginnerCount = useMemo(() => competencies.filter(c => c.level?.toLowerCase() === 'intermediate' || c.level?.toLowerCase() === 'beginner').length, [competencies]);

  const clearFilters = () => {
    setSearchText('');
    setActiveTab('Semua');
    setCurrentPage(1);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, activeTab]);

  const summaryCards = useMemo(
    () => [
      {
        label: 'Total Kompetensi',
        subtitle: 'Seluruh kompetensi',
        value: String(competencies.length),
        change: 'Data tersimpan di sistem',
        tone: 'blue' as const,
        icon: Award,
      },
      {
        label: 'Hasil Filter',
        subtitle: 'Kompetensi sesuai pencarian',
        value: String(sortedCompetencies.length),
        change: `${paginatedCompetencies.length} data per halaman`,
        tone: 'green' as const,
        icon: Search,
      },
      {
        label: 'Tingkat Ahli',
        subtitle: 'Keahlian ahli',
        value: String(expertCount),
        change: 'Expert level',
        tone: 'purple' as const,
        icon: Star,
      },
      {
        label: 'Tingkat Mahir',
        subtitle: 'Keahlian mahir',
        value: String(advancedCount),
        change: 'Advanced/Intermediate',
        tone: 'orange' as const,
        icon: TrendingUp,
      },
    ],
    [competencies.length, expertCount, advancedCount, sortedCompetencies.length, paginatedCompetencies.length]
  );

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
            <h1 className="hero-title">Kompetensi Saya</h1>
            <p className="hero-subtitle">
              Lihat inventaris keterampilan, sertifikasi, dan tingkat kompetensi Anda.
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
            <Award size={24} />
          </div>
          <div>
            <h2 className="analytics-title">Skill Inventory</h2>
            <p className="analytics-subtitle">Kelola dan lihat semua kompetensi Anda</p>
          </div>
        </div>
      </Card>

      {/* Control Section */}
      <Card className="control-section-card">
        <div className="control-section-inner">
          {/* Tabs */}
          <div className="elyra-tabs">
            {(['Semua', 'Expert', 'Advanced', 'Intermediate'] as const).map((tab) => (
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
                placeholder="Cari kompetensi..."
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
          {loading && <LoadingState message="Memuat kompetensi..." />}
          {!loading && errorMessage && <ErrorState message="Koneksi Terputus" error={errorMessage} onRetry={fetchData} />}

          {!loading && !errorMessage && paginatedCompetencies.length === 0 && (
            <div style={{ padding: '5rem 0' }}>
              <EmptyState
                title="Pencarian Kosong"
                message="Kami tidak menemukan kompetensi yang sesuai dengan kriteria Anda."
                actionLabel="Bersihkan Filter"
                onAction={clearFilters}
              />
            </div>
          )}

          {!loading && !errorMessage && paginatedCompetencies.length > 0 && (
            <>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Kompetensi</th>
                      <th>Kategori</th>
                      <th>Tingkat</th>
                      <th>Status</th>
                      <th className="th-center" style={{ width: '120px' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedCompetencies.map((comp) => {
                      const levelStyle = getLevelColor(comp.level);
                      return (
                        <tr key={comp.id}>
                          <td>
                            <div className="cell-name">
                              <div className="cell-avatar" style={{ background: levelStyle.bg, color: levelStyle.color }}>
                                <Award size={18} />
                              </div>
                              <div className="cell-stacked">
                                <span className="cell-name-text">{comp.name || comp.skill_name}</span>
                                <span className="cell-stacked__sub">{comp.category || '-'}</span>
                              </div>
                            </div>
                          </td>
                          <td><span style={{ color: '#475569', fontWeight: 600 }}>{comp.category || '-'}</span></td>
                          <td>
                            <span style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600, background: levelStyle.bg, color: levelStyle.color }}>
                              {comp.level || 'N/A'}
                            </span>
                          </td>
                          <td>
                            {comp.verified ? (
                              <span className="badge-soft badge-soft--green">
                                <CheckCircle size={12} style={{ marginRight: '4px' }} />
                                Verified
                              </span>
                            ) : (
                              <span className="badge-soft badge-soft--orange">Pending</span>
                            )}
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
                  Menampilkan <strong>{paginatedCompetencies.length}</strong> dari <strong>{sortedCompetencies.length}</strong> kompetensi
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

export default MyCompetenciesPage;