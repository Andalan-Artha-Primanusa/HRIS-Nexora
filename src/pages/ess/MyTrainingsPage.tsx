import React, { useState, useEffect, useMemo } from 'react';
import { RefreshCw, GraduationCap, Clock, CheckCircle, BookOpen, Play, BookTemplate, Search, Award, FileText, Star, X, ExternalLink, Eye } from 'lucide-react';
import { Card, CardHeader } from '@/shared/ui';
import { LoadingState, ErrorState, EmptyState } from '@/shared/ui/DataStateDisplay';
import { trainingService } from '@/features/training/api/training.service';
import '@/shared/styles/CrudPage.css';
import '@/pages/dashboard/overview/OverviewPage.css';
import '@/pages/payroll/PayrollShared.css';

const MyTrainingsPage: React.FC = () => {
  const [trainings, setTrainings] = useState<any[]>([]);
  const [availableTrainings, setAvailableTrainings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Search & Filter
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState<'Semua' | 'In Progress' | 'Completed' | 'Tersedia' | 'Pending'>('Semua');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // Result Modal
  const [showResultModal, setShowResultModal] = useState(false);
  const [selectedResult, setSelectedResult] = useState<any>(null);

  const fetchData = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const [myRes, availRes] = await Promise.all([
        trainingService.getMyTrainings(),
        trainingService.getAvailableTrainings()
      ]);
      
      setTrainings(Array.isArray(myRes) ? myRes : Array.isArray(myRes?.data) ? myRes.data : []);
      setAvailableTrainings(Array.isArray(availRes) ? availRes : Array.isArray(availRes?.data?.data) ? availRes.data.data : Array.isArray(availRes?.data) ? availRes.data : []);
    } catch (error) {
      console.error('Error fetching trainings:', error);
      setErrorMessage('Gagal memuat pelatihan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEnroll = async (id: number) => {
    if (!window.confirm('Apakah Anda yakin ingin mendaftar pelatihan ini?')) return;
    try {
      setLoading(true);
      await trainingService.selfEnroll(id);
      alert('Berhasil mengajukan pendaftaran pelatihan. Menunggu approval.');
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Gagal mendaftar pelatihan');
      setLoading(false);
    }
  };

  const handleViewResult = (training: any) => {
    setSelectedResult(training);
    setShowResultModal(true);
  };

  // Filter & Sort & Paginate
  const currentList = useMemo(() => activeTab === 'Tersedia' ? availableTrainings : trainings, [activeTab, availableTrainings, trainings]);

  const filteredTrainings = useMemo(() => {
    return currentList.filter((training) => {
      const searchStr = searchText.toLowerCase();
      const nameMatch = (training.program?.title || training.title || '').toLowerCase().includes(searchStr);
      const categoryMatch = (training.category || training.program?.category || '').toLowerCase().includes(searchStr);
      const textMatch = nameMatch || categoryMatch;

      let statusMatch = true;
      if (activeTab === 'In Progress') statusMatch = training.status === 'in_progress' || training.status === 'ongoing' || training.status === 'enrolled';
      else if (activeTab === 'Completed') statusMatch = training.status === 'completed';
      else if (activeTab === 'Pending') statusMatch = training.status === 'pending';

      return textMatch && statusMatch;
    });
  }, [currentList, searchText, activeTab]);

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
      case 'in_progress': case 'ongoing': case 'enrolled': return { icon: Play, color: '#f59e0b', bg: '#fffbeb' };
      case 'upcoming': case 'scheduled': return { icon: Clock, color: '#6366f1', bg: '#eef2ff' };
      case 'pending': return { icon: Clock, color: '#f59e0b', bg: '#fffbeb' };
      case 'active': return { icon: BookOpen, color: '#3b82f6', bg: '#eff6ff' };
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
        label: 'Menunggu Persetujuan',
        subtitle: 'Pengajuan pelatihan',
        value: String(trainings.filter(t => t.status === 'pending').length),
        change: 'Pending approval',
        tone: 'orange' as const,
        icon: Clock,
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
            {(['Semua', 'Tersedia', 'Pending', 'In Progress', 'Completed'] as const).map((tab) => (
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
                              {activeTab === 'Tersedia' ? 'Tersedia' : (training.status || 'Pending')}
                            </span>
                          </td>
                          <td>
                            {training.progress !== undefined && activeTab !== 'Tersedia' ? (
                              <span style={{ color: '#64748b' }}>{training.progress}%</span>
                            ) : '-'}
                          </td>
                           <td className="td-center">
                            {activeTab === 'Tersedia' ? (
                              <button className="btn-primary" style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={() => handleEnroll(training.id)}>
                                Daftar
                              </button>
                            ) : training.status === 'completed' ? (
                              <button className="btn-outline" style={{ padding: '6px 12px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }} onClick={() => handleViewResult(training)}>
                                <Eye size={14} /> Lihat Hasil
                              </button>
                            ) : (
                              <span className={`badge-soft badge-soft--${training.status === 'completed' ? 'green' : training.status === 'pending' ? 'yellow' : 'blue'}`}>
                                {training.status}
                              </span>
                            )}
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

      {/* Result Modal */}
      {showResultModal && selectedResult && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={() => setShowResultModal(false)}>
          <Card glass style={{ maxWidth: '560px', width: '100%', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '1.5rem' }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ background: '#ecfdf5', borderRadius: '12px', padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Award size={28} color="#10b981" />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b', fontWeight: 700 }}>Hasil Pelatihan</h3>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>{selectedResult.program?.title || selectedResult.title}</p>
                  </div>
                </div>
                <button onClick={() => setShowResultModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '0.25rem' }}>
                  <X size={20} />
                </button>
              </div>

              {/* Score Card */}
              {selectedResult.score !== null && selectedResult.score !== undefined && (
                <div style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem', textAlign: 'center', color: '#fff' }}>
                  <Star size={32} style={{ marginBottom: '0.5rem' }} fill="#fbbf24" color="#fbbf24" />
                  <div style={{ fontSize: '3rem', fontWeight: 800 }}>{selectedResult.score}</div>
                  <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Skor Akhir</div>
                </div>
              )}

              {/* Details */}
              <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '1.25rem' }}>
                <h4 style={{ margin: '0 0 1rem', fontSize: '0.9rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Detail</h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {/* Program */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <div style={{ background: '#eff6ff', borderRadius: '8px', padding: '0.5rem', display: 'flex' }}>
                      <BookOpen size={16} color="#3b82f6" />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.125rem' }}>Program</div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b' }}>{selectedResult.program?.title || selectedResult.title || '-'}</div>
                    </div>
                  </div>

                  {/* Category */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <div style={{ background: '#f0fdf4', borderRadius: '8px', padding: '0.5rem', display: 'flex' }}>
                      <GraduationCap size={16} color="#22c55e" />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.125rem' }}>Kategori</div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b' }}>{selectedResult.category || selectedResult.program?.category || '-'}</div>
                    </div>
                  </div>

                  {/* Completed Date */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <div style={{ background: '#fef3c7', borderRadius: '8px', padding: '0.5rem', display: 'flex' }}>
                      <Clock size={16} color="#f59e0b" />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.125rem' }}>Tanggal Selesai</div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b' }}>{selectedResult.completed_at ? new Date(selectedResult.completed_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}</div>
                    </div>
                  </div>

                  {/* Certificate */}
                  {selectedResult.certificate_path && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                      <div style={{ background: '#fdf2f8', borderRadius: '8px', padding: '0.5rem', display: 'flex' }}>
                        <FileText size={16} color="#ec4899" />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.125rem' }}>Sertifikat</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b' }}>Tersedia</span>
                          <ExternalLink size={14} color="#6366f1" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {selectedResult.notes && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                      <div style={{ background: '#f1f5f9', borderRadius: '8px', padding: '0.5rem', display: 'flex' }}>
                        <FileText size={16} color="#64748b" />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.125rem' }}>Catatan</div>
                        <div style={{ fontSize: '0.875rem', color: '#334155' }}>{selectedResult.notes}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Close Button */}
              <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn-primary" onClick={() => setShowResultModal(false)} style={{ padding: '0.625rem 1.5rem' }}>
                  Tutup
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MyTrainingsPage;