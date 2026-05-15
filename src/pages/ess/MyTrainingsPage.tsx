import React, { useState, useEffect, useMemo } from 'react';
import { RefreshCw, GraduationCap, Clock, CheckCircle, BookOpen, Play, Search, Award, FileText, Star, X, Eye, History } from 'lucide-react';
import { useAuthStore } from '@/app/store/auth.store';
import { Card } from '@/shared/ui';
import { LoadingState, ErrorState, EmptyState } from '@/shared/ui/DataStateDisplay';
import { trainingService } from '@/features/training/api/training.service';
import { RBACUtils } from '@/shared/hooks/rbac';
import { ApprovalHistoryModal } from "@/shared/components/ApprovalHistoryModal";
import { showToast } from "@/shared/ui/toast";
import { parsePaginatedResponse } from "@/shared/api/pagination";
import '@/shared/styles/CrudPage.css';
import '@/pages/dashboard/overview/OverviewPage.css';

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  completed: { label: 'Selesai', color: '#10b981', bg: '#ecfdf5' },
  in_progress: { label: 'Berlangsung', color: '#f59e0b', bg: '#fffbeb' },
  ongoing: { label: 'Berlangsung', color: '#f59e0b', bg: '#fffbeb' },
  enrolled: { label: 'Terdaftar', color: '#6366f1', bg: '#eef2ff' },
  pending: { label: 'Menunggu', color: '#f59e0b', bg: '#fffbeb' },
  active: { label: 'Aktif', color: '#3b82f6', bg: '#eff6ff' },
};

const MyTrainingsPage: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const [trainings, setTrainings] = useState<any[]>([]);
  const [available, setAvailable] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'Semua' | 'Tersedia' | 'Berlangsung' | 'Selesai'>('Semua');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [resultModal, setResultModal] = useState<any>(null);
  const [historyModal, setHistoryModal] = useState<{ module: string; id: number | string } | null>(null);
  const pageSize = 10;

  const canViewAllTrainings = RBACUtils.hasPermission(user, 'training.view');
  const isSelfService = !canViewAllTrainings;

  const fetchData = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      if (isSelfService) {
        const [myRes, availRes] = await Promise.all([
          trainingService.getMyTrainings(page, pageSize),
          trainingService.getAvailableTrainings({ page, per_page: pageSize }),
        ]);
        const myParsed = parsePaginatedResponse<any>(myRes);
        const availableParsed = parsePaginatedResponse<any>(availRes);
        setTrainings(myParsed.items);
        setAvailable(availableParsed.items);
        setTotalPages(tab === 'Tersedia' ? availableParsed.totalPages : myParsed.totalPages);
      } else if (canViewAllTrainings) {
        const [progRes, enrollRes] = await Promise.all([
          trainingService.getPrograms({ page, per_page: pageSize }),
          trainingService.getEnrollments(page, pageSize),
        ]);
        const programs = parsePaginatedResponse<any>(progRes);
        const enrollments = parsePaginatedResponse<any>(enrollRes);
        setTrainings(enrollments.items);
        setAvailable(programs.items);
        setTotalPages(tab === 'Tersedia' ? programs.totalPages : enrollments.totalPages);
      } else {
        setErrorMessage('Akses terbatas');
      }
    } catch (e) {
      console.error(e);
      setErrorMessage('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [canViewAllTrainings, isSelfService, page, pageSize, tab]);

  const handleEnroll = async (id: number) => {
    try {
      setLoading(true);
      await trainingService.selfEnroll(id);
      showToast('Pendaftaran berhasil diajukan', 'success');
      fetchData();
    } catch (e: any) {
      showToast(e.response?.data?.message || 'Gagal mendaftar', 'error');
      setLoading(false);
    }
  };

  const list = tab === 'Tersedia' ? available : trainings;

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return list.filter((t: any) => {
      const title = (t.program?.title || t.title || '').toLowerCase();
      const cat = (t.category || t.program?.category || '').toLowerCase();
      const matchText = title.includes(q) || cat.includes(q);
      let matchStatus = true;
      if (tab === 'Berlangsung') matchStatus = ['in_progress', 'ongoing', 'enrolled'].includes(t.status);
      else if (tab === 'Selesai') matchStatus = t.status === 'completed';
      return matchText && matchStatus;
    });
  }, [list, search, tab]);

  const sorted = useMemo(() => [...filtered].sort((a: any, b: any) => (a.program?.title || a.title || '').localeCompare(b.program?.title || b.title || '')), [filtered]);
  const paginated = sorted;

  useEffect(() => { setPage(1); }, [search, tab]);

  const totalActive = trainings.filter((t: any) => ['in_progress', 'ongoing', 'enrolled'].includes(t.status)).length;
  const totalDone = trainings.filter((t: any) => t.status === 'completed').length;

  return (
    <div className="crud-page">
      <Card className="hero-card">
        <div className="hero-card-inner">
          <div className="hero-content">
            <div className="hero-badge"><GraduationCap size={16} /><span>Pengembangan Diri</span></div>
            <h1 className="hero-title">Pelatihan Saya</h1>
            <p className="hero-subtitle">
              {isSelfService ? 'Ikuti pelatihan dan lacak kemajuan belajar Anda.' : 'Lihat program pelatihan dan enrollment.'}
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn-outline" onClick={fetchData} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Segarkan
            </button>
          </div>
        </div>
      </Card>

      <div className="employee-summary-wrapper">
        <div className="employee-summary-card">
          <div className="employee-summary-header">
            <div><p className="employee-summary-label">Total Pelatihan</p><p className="employee-summary-subtitle">Semua pelatihan</p></div>
            <div className="employee-summary-icon-wrapper employee-icon-blue"><GraduationCap size={28} /></div>
          </div>
          <div className="employee-summary-value employee-value-blue">{trainings.length}</div>
          <p className="employee-summary-trend">Data tersimpan</p>
        </div>
        <div className="employee-summary-card">
          <div className="employee-summary-header">
            <div><p className="employee-summary-label">Sedang Berlangsung</p><p className="employee-summary-subtitle">Pelatihan aktif</p></div>
            <div className="employee-summary-icon-wrapper employee-icon-orange"><Play size={28} /></div>
          </div>
          <div className="employee-summary-value employee-value-orange">{totalActive}</div>
          <p className="employee-summary-trend">Dalam proses</p>
        </div>
        <div className="employee-summary-card">
          <div className="employee-summary-header">
            <div><p className="employee-summary-label">Selesai</p><p className="employee-summary-subtitle">Pelatihan selesai</p></div>
            <div className="employee-summary-icon-wrapper employee-icon-green"><CheckCircle size={28} /></div>
          </div>
          <div className="employee-summary-value employee-value-green">{totalDone}</div>
          <p className="employee-summary-trend">Completed</p>
        </div>
      </div>

      <Card className="control-section-card">
        <div className="control-section-inner">
          <div className="elyra-tabs">
            {(['Semua', 'Tersedia', 'Berlangsung', 'Selesai'] as const).map((t) => (
              <button key={t} className={`elyra-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t}</button>
            ))}
          </div>
          <div className="control-actions">
            <div className="search-box">
              <div className="search-icon-inside"><Search size={18} /></div>
              <input type="text" placeholder="Cari pelatihan..." value={search} onChange={(e) => setSearch(e.target.value)} className="search-input-pill" />
            </div>
            {(search || tab !== 'Semua') && (
              <button className="btn-clear-filter" onClick={() => { setSearch(''); setTab('Semua'); }}>Hapus Filter</button>
            )}
          </div>
        </div>
      </Card>

      <div className="table-section">
        <div className="wuw-table-area">
          {loading && <LoadingState message="Memuat pelatihan..." />}
          {!loading && errorMessage && <ErrorState message="Terjadi Kesalahan" error={errorMessage} onRetry={fetchData} />}
          {!loading && !errorMessage && paginated.length === 0 && (
            <div style={{ padding: '5rem 0' }}>
              <EmptyState title="Tidak Ada Data" message={search || tab !== 'Semua' ? 'Tidak ada hasil yang sesuai.' : 'Belum ada pelatihan.'} actionLabel={search || tab !== 'Semua' ? 'Hapus Filter' : undefined} onAction={() => { setSearch(''); setTab('Semua'); }} />
            </div>
          )}

          {!loading && !errorMessage && paginated.length > 0 && (
            <>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '380px' }}>Pelatihan</th>
                      <th>Kategori</th>
                      <th>Status</th>
                      <th>Progress</th>
                      <th className="th-center" style={{ width: '110px' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((t: any) => {
                      const cfg = statusConfig[t.status] || { label: t.status, color: '#64748b', bg: '#f1f5f9' };
                      const title = t.program?.title || t.title || 'Training';
                      const category = t.category || t.program?.category || '-';
                      return (
                        <tr key={t.id}>
                          <td>
                            <div className="cell-name">
                              <div className="cell-avatar" style={{ background: cfg.bg, color: cfg.color }}>
                                <BookOpen size={18} />
                              </div>
                              <div className="cell-stacked">
                                <span className="cell-name-text">{title}</span>
                                <span className="cell-stacked__sub">{category}</span>
                              </div>
                            </div>
                          </td>
                          <td><span style={{ color: '#475569', fontWeight: 600 }}>{category}</span></td>
                          <td>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 8, fontSize: '0.75rem', fontWeight: 600, background: cfg.bg, color: cfg.color }}>
                              {tab === 'Tersedia' ? 'Tersedia' : cfg.label}
                            </span>
                          </td>
                          <td>
                            {tab !== 'Tersedia' && t.progress !== undefined ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ width: 64, height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
                                  <div style={{ width: `${Math.min(t.progress, 100)}%`, height: '100%', background: '#10b981', borderRadius: 3 }} />
                                </div>
                                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{t.progress}%</span>
                              </div>
                            ) : <span style={{ color: '#94a3b8' }}>-</span>}
                          </td>
                          <td className="td-center">
                            {tab === 'Tersedia' ? (
                              isSelfService ? (
                                <button className="btn-primary" style={{ padding: '6px 14px', fontSize: '0.75rem' }} onClick={() => handleEnroll(t.id)}>Daftar</button>
                              ) : (
                                <span className="badge-soft badge-soft--blue">Admin</span>
                              )
                            ) : t.status === 'completed' ? (
                              <button className="btn-outline" style={{ padding: '6px 12px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: 4 }} onClick={() => setResultModal(t)}>
                                <Eye size={14} /> Hasil
                              </button>
                            ) : (
                              <span className={`badge-soft badge-soft--${t.status === 'completed' ? 'green' : t.status === 'pending' ? 'yellow' : 'blue'}`}>
                                {cfg.label}
                              </span>
                            )}
                            {tab !== 'Tersedia' && (
                              <button className="action-btn" style={{ color: '#8b5cf6', background: '#f5f3ff', marginLeft: 8, verticalAlign: 'middle' }} onClick={() => setHistoryModal({ module: 'training', id: t.id })} title="Riwayat Approval"><History size={16} /></button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="table-pagination">
                <div className="pagination-info">Menampilkan <strong>{paginated.length}</strong> dari <strong>{sorted.length}</strong> pelatihan</div>
                <div className="pagination-controls">
                  <button className="pagination-btn" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>‹</button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button key={p} className={`pagination-btn ${page === p ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
                  ))}
                  <button className="pagination-btn" onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}>›</button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {resultModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={() => setResultModal(null)}>
          <Card glass style={{ maxWidth: 520, width: '100%', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ background: '#ecfdf5', borderRadius: 12, padding: '0.75rem' }}><Award size={28} color="#10b981" /></div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b', fontWeight: 700 }}>Hasil Pelatihan</h3>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>{resultModal.program?.title || resultModal.title}</p>
                  </div>
                </div>
                <button onClick={() => setResultModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '0.25rem' }}><X size={20} /></button>
              </div>

              {resultModal.score !== null && resultModal.score !== undefined && (
                <div style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: 16, padding: '1.5rem', marginBottom: '1.5rem', textAlign: 'center', color: '#fff' }}>
                  <Star size={28} style={{ marginBottom: '0.5rem' }} fill="#fbbf24" color="#fbbf24" />
                  <div style={{ fontSize: '2.5rem', fontWeight: 800 }}>{resultModal.score}</div>
                  <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Skor Akhir</div>
                </div>
              )}

              <div style={{ background: '#f8fafc', borderRadius: 12, padding: '1.25rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <div style={{ background: '#eff6ff', borderRadius: 8, padding: '0.5rem' }}><BookOpen size={16} color="#3b82f6" /></div>
                    <div><div style={{ fontSize: '0.75rem', color: '#64748b' }}>Program</div><div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>{resultModal.program?.title || resultModal.title || '-'}</div></div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <div style={{ background: '#fef3c7', borderRadius: 8, padding: '0.5rem' }}><Clock size={16} color="#f59e0b" /></div>
                    <div><div style={{ fontSize: '0.75rem', color: '#64748b' }}>Selesai</div><div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>{resultModal.completed_at ? new Date(resultModal.completed_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}</div></div>
                  </div>
                  {resultModal.notes && (
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <div style={{ background: '#f1f5f9', borderRadius: 8, padding: '0.5rem' }}><FileText size={16} color="#64748b" /></div>
                      <div><div style={{ fontSize: '0.75rem', color: '#64748b' }}>Catatan</div><div style={{ fontSize: '0.85rem', color: '#334155' }}>{resultModal.notes}</div></div>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn-primary" onClick={() => setResultModal(null)} style={{ padding: '0.5rem 1.25rem' }}>Tutup</button>
              </div>
            </div>
          </Card>
        </div>
      )}
      {historyModal && (
        <ApprovalHistoryModal
          isOpen={!!historyModal}
          onClose={() => setHistoryModal(null)}
          module={historyModal.module}
          moduleId={historyModal.id}
        />
      )}
    </div>
  );
};

export default MyTrainingsPage;
