import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Plus, RefreshCw, CheckCircle, XCircle, Trash2, ArrowUpRight, FileText, X, History } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { LoadingState, ErrorState, EmptyState } from '@/shared/ui/DataStateDisplay';
import { promotionService } from '@/features/organization/api/promotion.service';
import { PromotionModal } from '@/features/organization/components/PromotionModal';
import '@/shared/styles/CrudPage.css';
import '@/pages/dashboard/overview/OverviewPage.css';
import '@/pages/employee/EmployeesPage.css';
import { ApprovalHistoryModal } from "@/shared/components/ApprovalHistoryModal";

const PromotionPage: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [reportModal, setReportModal] = useState(false);
  const [selectedPromo, setSelectedPromo] = useState<any>(null);
  const [viewingReport, setViewingReport] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [reportActionLoading, setReportActionLoading] = useState(false);
  const [historyModal, setHistoryModal] = useState<{ module: string; id: number } | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const params: Record<string, string> = {};
      if (searchText) params.search = searchText;
      if (selectedStatus) params.status = selectedStatus;

      const response = await promotionService.getPromotions(params);
      let data: any[] = [];
      if (response?.data?.data?.data && Array.isArray(response.data.data.data)) {
        data = response.data.data.data;
      } else if (response?.data?.data && Array.isArray(response.data.data)) {
        data = response.data.data;
      } else if (response?.data && Array.isArray(response.data)) {
        data = response.data;
      } else if (Array.isArray(response)) {
        data = response;
      }
      setItems(data);
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.message || 'Gagal memuat data promosi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (formData: any) => {
    await promotionService.createPromotion(formData);
    fetchData();
  };

  const handleApprove = async (id: string | number) => {
    if (!window.confirm('Setujui promosi ini? Jabatan karyawan akan otomatis diperbarui.')) return;
    try {
      await promotionService.approvePromotion(id);
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleReject = async (id: string | number) => {
    const remarks = prompt('Alasan penolakan (opsional):');
    if (remarks === null) return;
    try {
      await promotionService.rejectPromotion(id, remarks);
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!window.confirm('Hapus pengajuan promosi ini?')) return;
    try {
      await promotionService.deletePromotion(id);
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const openViewReport = (promo: any) => {
    setSelectedPromo(promo);
    setViewingReport(true);
    setReportModal(true);
  };

  const handleApproveReport = async (id: string | number) => {
    if (!window.confirm('Setujui laporan kegiatan ini? Promosi akan dinyatakan selesai.')) return;
    setReportActionLoading(true);
    try {
      await promotionService.approveReport(id);
      fetchData();
    } catch (error) {
      console.error(error);
    } finally {
      setReportActionLoading(false);
    }
  };

  const handleRejectReport = async (id: string | number) => {
    setSelectedPromo(items.find((p) => p.id === id));
    setRejectionReason('');
    setViewingReport(false);
    setReportModal(true);
  };

  const submitRejectReport = async () => {
    if (!selectedPromo || !rejectionReason.trim()) return;
    setReportActionLoading(true);
    try {
      await promotionService.rejectReport(selectedPromo.id, {
        rejection_reason: rejectionReason,
      });
      closeReportModal();
      fetchData();
    } catch (error) {
      console.error(error);
    } finally {
      setReportActionLoading(false);
    }
  };

  const closeReportModal = () => {
    setReportModal(false);
    setSelectedPromo(null);
    setViewingReport(false);
    setRejectionReason('');
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const searchStr = searchText.toLowerCase();
      const matchesSearch =
        !searchText ||
        item.employee?.user?.name?.toLowerCase().includes(searchStr) ||
        item.employee?.full_name?.toLowerCase().includes(searchStr) ||
        item.from_value?.toLowerCase().includes(searchStr) ||
        item.to_value?.toLowerCase().includes(searchStr) ||
        item.reason?.toLowerCase().includes(searchStr);

      const matchesStatus = !selectedStatus || item.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [items, searchText, selectedStatus]);

  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      const statusOrder: Record<string, number> = { pending: 0, approved: 1, rejected: 2, completed: 3 };
      const aStatus = statusOrder[a.status] ?? 3;
      const bStatus = statusOrder[b.status] ?? 3;
      if (aStatus !== bStatus) return aStatus - bStatus;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [filteredItems]);

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedItems.slice(startIndex, startIndex + pageSize);
  }, [sortedItems, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedItems.length / pageSize);

  const summaryCards = useMemo(
    () => [
      {
        label: 'Total Pengajuan',
        subtitle: 'Seluruh pengajuan promosi',
        value: String(items.length),
        change: 'Data promosi tersimpan',
        tone: 'blue' as const,
        icon: ArrowUpRight,
      },
      {
        label: 'Hasil Filter',
        subtitle: 'Sesuai pencarian',
        value: String(sortedItems.length),
        change: `${paginatedItems.length} data per halaman`,
        tone: 'green' as const,
        icon: Search,
      },
      {
        label: 'Disetujui',
        subtitle: 'Promosi yang disetujui',
        value: String(items.filter((i) => i.status === 'approved').length),
        change: 'Telah efektif',
        tone: 'orange' as const,
        icon: CheckCircle,
      },
      {
        label: 'Menunggu',
        subtitle: 'Perlu persetujuan',
        value: String(items.filter((i) => i.status === 'pending').length),
        change: 'Pending review',
        tone: 'purple' as const,
        icon: Filter,
      },
      {
        label: 'Selesai',
        subtitle: 'Naik jabatan berhasil',
        value: String(items.filter((i) => i.status === 'completed').length),
        change: 'Laporan disetujui',
        tone: 'blue' as const,
        icon: CheckCircle,
      },
    ],
    [items, sortedItems.length, paginatedItems.length],
  );

  const clearFilters = () => {
    setSearchText('');
    setSelectedStatus('');
    setCurrentPage(1);
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; class: string }> = {
      pending: { label: 'Menunggu', class: 'badge-soft--yellow' },
      approved: { label: 'Disetujui', class: 'badge-soft--green' },
      rejected: { label: 'Ditolak', class: 'badge-soft--red' },
      completed: { label: 'Naik Jabatan Berhasil', class: 'badge-soft--blue' },
    };
    const info = map[status] || { label: status, class: 'badge-soft--gray' };
    return <span className={`badge-soft ${info.class}`}>{info.label}</span>;
  };

  const getReportBadge = (reportStatus: string | null, promoStatus: string) => {
    if (promoStatus === 'completed') {
      return <span className="badge-soft badge-soft--blue"><CheckCircle size={12} style={{ display: 'inline', marginRight: '4px' }} />Selesai</span>;
    }
    if (!reportStatus) {
      if (promoStatus === 'approved') {
        return <span className="badge-soft badge-soft--orange">Perlu Laporan</span>;
      }
      return <span className="badge-soft badge-soft--gray">-</span>;
    }
    const map: Record<string, { label: string; class: string }> = {
      submitted: { label: 'Dikirim', class: 'badge-soft--purple' },
      approved: { label: 'Disetujui', class: 'badge-soft--blue' },
      rejected: { label: 'Ditolak', class: 'badge-soft--red' },
    };
    const info = map[reportStatus] || { label: reportStatus, class: 'badge-soft--gray' };
    return <span className={`badge-soft ${info.class}`}>{info.label}</span>;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getRemarks = (remarksStr: string | null) => {
    if (!remarksStr) return {};
    try {
      return JSON.parse(remarksStr);
    } catch {
      return {};
    }
  };

  return (
    <div className="crud-page">
      <Card className="hero-card">
        <div className="hero-card-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <ArrowUpRight size={16} />
              <span>Kenaikan Jabatan</span>
            </div>
            <h1 className="hero-title">Promotion Management</h1>
            <p className="hero-subtitle">Ajukan, setujui, dan kelola promosi jabatan karyawan secara terpusat.</p>
          </div>
          <div className="hero-actions">
            <button className="btn-outline" onClick={fetchData} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Segarkan
            </button>
            <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
              <Plus size={16} />
              Ajukan Promosi
            </button>
          </div>
        </div>
      </Card>

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

      <Card className="analytics-title-card">
        <div className="analytics-title-inner">
          <div className="analytics-icon">
            <ArrowUpRight size={24} />
          </div>
          <div>
            <h2 className="analytics-title">Daftar Promosi</h2>
            <p className="analytics-subtitle">Semua pengajuan promosi jabatan karyawan</p>
          </div>
        </div>
      </Card>

      <Card className="control-section-card">
        <div className="control-section-inner">
          <div className="elyra-tabs">
            {[
              { value: '', label: 'Semua' },
              { value: 'pending', label: 'Menunggu' },
              { value: 'approved', label: 'Disetujui' },
              { value: 'completed', label: 'Selesai' },
              { value: 'rejected', label: 'Ditolak' },
            ].map((tab) => (
              <button
                key={tab.value}
                className={`elyra-tab ${selectedStatus === tab.value ? 'active' : ''}`}
                onClick={() => { setSelectedStatus(tab.value); setCurrentPage(1); }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="control-actions">
            <div className="search-box">
              <div className="search-icon-inside"><Search size={18} /></div>
              <input
                type="text"
                placeholder="Cari promosi..."
                value={searchText}
                onChange={(e) => { setSearchText(e.target.value); setCurrentPage(1); }}
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

        {showFilters && (
          <div className="filter-dropdown">
            <div className="filter-row">
              {(searchText || selectedStatus) && (
                <button className="btn-clear-filter" onClick={clearFilters}>
                  Hapus Filter
                </button>
              )}
            </div>
          </div>
        )}
      </Card>

      <div className="table-section">
        <div className="wuw-table-area">
          {loading && <LoadingState message="Memuat promosi..." />}
          {errorMessage && !loading && <ErrorState message={errorMessage} onRetry={fetchData} />}
          {!loading && !errorMessage && paginatedItems.length === 0 && (
            <div style={{ padding: '5rem 0' }}>
              <EmptyState title="Tidak Ada Promosi" message="Belum ada pengajuan promosi." actionLabel="Ajukan Promosi" onAction={() => setIsModalOpen(true)} />
            </div>
          )}
          {!loading && !errorMessage && paginatedItems.length > 0 && (
            <>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '250px' }}>Karyawan</th>
                      <th>Jabatan</th>
                      <th>Alasan</th>
                      <th>Tanggal Efektif</th>
                      <th>Status</th>
                      <th>Laporan</th>
                      <th className="th-center" style={{ width: '160px' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedItems.map((promo) => {
                      const remarks = getRemarks(promo.remarks);
                      return (
                        <tr key={promo.id}>
                          <td>
                            <div className="cell-stacked">
                              <span className="cell-stacked__main">
                                {promo.employee?.user?.name || promo.employee?.full_name || '-'}
                              </span>
                              <span className="cell-stacked__sub">
                                oleh {promo.initiator?.user?.name || promo.initiator?.full_name || '-'}
                              </span>
                            </div>
                          </td>
                          <td>
                            <div className="cell-stacked">
                              <span className="cell-stacked__sub" style={{ textDecoration: 'line-through', color: '#94a3b8' }}>
                                {promo.from_value || '-'}
                              </span>
                              <span className="cell-stacked__main" style={{ color: '#059669', fontWeight: 600 }}>
                                <ArrowUpRight size={12} style={{ display: 'inline', marginRight: '4px' }} />
                                {promo.to_value}
                              </span>
                            </div>
                            {remarks.new_department && (
                              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>→ {remarks.new_department}</span>
                            )}
                          </td>
                          <td>
                            <div style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#64748b', fontSize: '0.85rem' }} title={promo.reason}>
                              {promo.reason}
                            </div>
                          </td>
                          <td>
                            <div className="cell-stacked">
                              <span className="cell-stacked__main" style={{ fontSize: '0.85rem' }}>{formatDate(promo.effective_date)}</span>
                            </div>
                          </td>
                          <td>{getStatusBadge(promo.status)}</td>
                          <td className="td-center">{getReportBadge(promo.report_status, promo.status)}</td>
                          <td className="td-center">
                            <div className="action-btn-group">
                              {promo.status === 'pending' && (
                                <>
                                  <button
                                    className="action-btn"
                                    style={{ background: '#dcfce7', color: '#16a34a' }}
                                    onClick={() => handleApprove(promo.id)}
                                    title="Setujui"
                                  >
                                    <CheckCircle size={16} />
                                  </button>
                                  <button
                                    className="action-btn"
                                    style={{ background: '#fee2e2', color: '#dc2626' }}
                                    onClick={() => handleReject(promo.id)}
                                    title="Tolak"
                                  >
                                    <XCircle size={16} />
                                  </button>
                                  <button
                                    className="action-btn action-btn-delete"
                                    onClick={() => handleDelete(promo.id)}
                                    title="Hapus"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </>
                              )}
                              {promo.report_status === 'submitted' && (
                                <>
                                  <button
                                    className="action-btn"
                                    style={{ background: '#dbeafe', color: '#2563eb' }}
                                    onClick={() => openViewReport(promo)}
                                    title="Lihat Laporan"
                                  >
                                    <FileText size={16} />
                                  </button>
                                  <button
                                    className="action-btn"
                                    style={{ background: '#dcfce7', color: '#16a34a' }}
                                    onClick={() => handleApproveReport(promo.id)}
                                    title="Setujui Laporan"
                                  >
                                    <CheckCircle size={16} />
                                  </button>
                                  <button
                                    className="action-btn"
                                    style={{ background: '#fee2e2', color: '#dc2626' }}
                                    onClick={() => handleRejectReport(promo.id)}
                                    title="Tolak Laporan"
                                  >
                                    <XCircle size={16} />
                                  </button>
                                </>
                              )}
                            <button className="action-btn" style={{ color: '#8b5cf6', background: '#f5f3ff' }} onClick={() => setHistoryModal({ module: 'promotion', id: promo.id })} title="Riwayat Approval"><History size={16} /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="table-pagination">
                <div className="pagination-info">
                  Menampilkan <strong>{paginatedItems.length}</strong> dari <strong>{sortedItems.length}</strong> pengajuan
                </div>
                <div className="pagination-controls">
                  <button
                    className="pagination-btn"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    ‹
                  </button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((page) => (
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

      <PromotionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} />

      {/* Report Modal */}
      {reportModal && selectedPromo && (
        <div className="modal-overlay" onClick={closeReportModal}>
          <div className="modal-completion" onClick={(e) => e.stopPropagation()}>
            <div className="modal-completion-header">
              <div className="modal-completion-icon" style={{ background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)', color: viewingReport ? '#2563eb' : '#dc2626' }}>
                <FileText size={24} />
              </div>
              <div>
                <h3 className="modal-completion-title">
                  {viewingReport ? 'Laporan Kegiatan' : 'Tolak Laporan'}
                </h3>
                <p className="modal-completion-task">
                  {selectedPromo.employee?.user?.name || '-'} → {selectedPromo.to_value}
                </p>
              </div>
              <button className="modal-close-btn" onClick={closeReportModal}>
                <X size={20} />
              </button>
            </div>

            {viewingReport ? (
              <>
                <div className="modal-completion-body">
                  <label className="modal-completion-label">Isi Laporan</label>
                  <div className="modal-completion-textarea" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px', borderRadius: '8px', minHeight: '120px', whiteSpace: 'pre-wrap' }}>
                    {selectedPromo.activity_report || 'Tidak ada laporan.'}
                  </div>
                </div>
                <div className="modal-completion-footer">
                  <button className="modal-btn-cancel" onClick={closeReportModal}>Tutup</button>
                  <button
                    className="modal-btn-confirm"
                    onClick={() => handleApproveReport(selectedPromo.id)}
                    disabled={reportActionLoading}
                    style={{ background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)', boxShadow: '0 4px 14px rgba(22, 163, 74, 0.3)' }}
                  >
                    {reportActionLoading ? (
                      <><RefreshCw size={16} className="animate-spin" /> Memproses...</>
                    ) : (
                      <><CheckCircle size={16} /> Setujui Laporan</>
                    )}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="modal-completion-body">
                  <label className="modal-completion-label">Alasan Penolakan</label>
                  <textarea
                    className="modal-completion-textarea"
                    placeholder="Jelaskan alasan penolakan laporan ini..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={4}
                  />
                </div>
                <div className="modal-completion-footer">
                  <button className="modal-btn-cancel" onClick={closeReportModal}>Batal</button>
                  <button
                    className="modal-btn-confirm"
                    onClick={submitRejectReport}
                    disabled={reportActionLoading || !rejectionReason.trim()}
                    style={{ background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)', boxShadow: '0 4px 14px rgba(220, 38, 38, 0.3)' }}
                  >
                    {reportActionLoading ? (
                      <><RefreshCw size={16} className="animate-spin" /> Memproses...</>
                    ) : (
                      <><XCircle size={16} /> Tolak Laporan</>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
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

export default PromotionPage;
