import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Plus, RefreshCw, CheckCircle, XCircle, Trash2, ArrowUpRight } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { LoadingState, ErrorState, EmptyState } from '@/shared/ui/DataStateDisplay';
import { promotionService } from '@/features/organization/api/promotion.service';
import { PromotionModal } from '@/features/organization/components/PromotionModal';
import '@/shared/styles/CrudPage.css';
import '@/pages/dashboard/overview/OverviewPage.css';
import '@/pages/employee/EmployeesPage.css';

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

  const fetchData = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const params: Record<string, string> = {};
      if (searchText) params.search = searchText;
      if (selectedStatus) params.status = selectedStatus;

      const response = await promotionService.getPromotions(params);
      let data: any[] = [];
      if (response?.data?.data && Array.isArray(response.data.data)) {
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
      const statusOrder: Record<string, number> = { pending: 0, approved: 1, rejected: 2 };
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
    };
    const info = map[status] || { label: status, class: 'badge-soft--gray' };
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

      <div className="overview-summary-wrapper">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="overview-summary-card">
              <div className="overview-summary-header">
                <div>
                  <p className="overview-summary-label">{card.label}</p>
                  <p className="overview-summary-subtitle">{card.subtitle}</p>
                </div>
                <div className={`overview-summary-icon-wrapper overview-icon-${card.tone}`}>
                  <Icon size={28} />
                </div>
              </div>
              <div className={`overview-summary-value overview-value-${card.tone}`}>{card.value}</div>
              <p className="overview-summary-trend">{card.change}</p>
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
                                </>
                              )}
                              {promo.status === 'pending' && (
                                <button
                                  className="action-btn action-btn-delete"
                                  onClick={() => handleDelete(promo.id)}
                                  title="Hapus"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
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
    </div>
  );
};

export default PromotionPage;
