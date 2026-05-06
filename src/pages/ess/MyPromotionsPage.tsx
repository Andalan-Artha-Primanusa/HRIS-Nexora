import React, { useState, useEffect, useMemo } from 'react';
import { Search, RefreshCw, ArrowUpRight, CheckCircle, Clock, XCircle, FileText, X } from 'lucide-react';
import { Card, CardHeader } from '@/shared/ui';
import { LoadingState, ErrorState, EmptyState } from '@/shared/ui/DataStateDisplay';
import { promotionService } from '@/features/organization/api/promotion.service';
import '@/shared/styles/CrudPage.css';
import '@/pages/dashboard/overview/OverviewPage.css';
import '@/pages/employee/EmployeesPage.css';

const MyPromotionsPage: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('Semua');

  const [reportModal, setReportModal] = useState(false);
  const [selectedPromo, setSelectedPromo] = useState<any>(null);
  const [reportContent, setReportContent] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const response = await promotionService.getMyPromotions();
      const payload = response?.data?.data || response?.data || response;
      setItems(payload?.promotions || []);
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.message || 'Gagal memuat data promosi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const searchStr = searchText.toLowerCase();
      const matchesSearch =
        !searchText ||
        item.from_value?.toLowerCase().includes(searchStr) ||
        item.to_value?.toLowerCase().includes(searchStr) ||
        item.reason?.toLowerCase().includes(searchStr);

      let tabMatch = true;
      if (activeTab === 'Disetujui') tabMatch = item.status === 'approved';
      else if (activeTab === 'Menunggu') tabMatch = item.status === 'pending';
      else if (activeTab === 'Ditolak') tabMatch = item.status === 'rejected';
      else if (activeTab === 'Selesai') tabMatch = item.status === 'completed';

      return matchesSearch && tabMatch;
    });
  }, [items, searchText, activeTab]);

  const summaryCards = useMemo(
    () => [
      {
        label: 'Total Promosi',
        subtitle: 'Seluruh riwayat promosi',
        value: String(items.length),
        change: 'Data promosi tersimpan',
        tone: 'blue' as const,
        icon: ArrowUpRight,
      },
      {
        label: 'Disetujui',
        subtitle: 'Promosi disetujui',
        value: String(items.filter((i) => i.status === 'approved').length),
        change: 'Tuntas',
        tone: 'green' as const,
        icon: CheckCircle,
      },
      {
        label: 'Menunggu',
        subtitle: 'Menunggu persetujuan',
        value: String(items.filter((i) => i.status === 'pending').length),
        change: 'Perlu tindak lanjut',
        tone: 'orange' as const,
        icon: Clock,
      },
      {
        label: 'Ditolak',
        subtitle: 'Promosi ditolak',
        value: String(items.filter((i) => i.status === 'rejected').length),
        change: 'Tidak disetujui',
        tone: 'red' as const,
        icon: XCircle,
      },
      {
        label: 'Selesai',
        subtitle: 'Naik jabatan berhasil',
        value: String(items.filter((i) => i.status === 'completed').length),
        change: 'Tuntas',
        tone: 'blue' as const,
        icon: CheckCircle,
      },
    ],
    [items],
  );

  const clearFilters = () => {
    setSearchText('');
    setActiveTab('Semua');
  };

  const openReportModal = (promo: any) => {
    setSelectedPromo(promo);
    setReportContent('');
    setReportModal(true);
  };

  const closeReportModal = () => {
    setReportModal(false);
    setSelectedPromo(null);
    setReportContent('');
  };

  const handleSubmitReport = async () => {
    if (!selectedPromo || !reportContent.trim()) return;
    setSubmittingReport(true);
    try {
      await promotionService.submitReport(selectedPromo.id, {
        activity_report: reportContent,
      });
      closeReportModal();
      fetchData();
    } catch (error) {
      console.error('Failed to submit report:', error);
    } finally {
      setSubmittingReport(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; class: string }> = {
      pending: { label: 'Menunggu', class: 'badge-soft--orange' },
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
    return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
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
              <span>Riwayat Promosi</span>
            </div>
            <h1 className="hero-title">Promosi Saya</h1>
            <p className="hero-subtitle">Lihat riwayat kenaikan jabatan Anda.</p>
          </div>
          <div className="hero-actions">
            <button className="btn-outline" onClick={fetchData} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Segarkan
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
            <h2 className="analytics-title">Riwayat Promosi</h2>
            <p className="analytics-subtitle">Kelola dan lihat semua promosi Anda</p>
          </div>
        </div>
      </Card>

      <Card className="control-section-card">
        <div className="control-section-inner">
          <div className="elyra-tabs">
            {['Semua', 'Menunggu', 'Disetujui', 'Selesai', 'Ditolak'].map((tab) => (
              <button
                key={tab}
                className={`elyra-tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
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
                onChange={(e) => setSearchText(e.target.value)}
                className="search-input-pill"
              />
            </div>
          </div>
        </div>
      </Card>

      <div className="table-section">
        <div className="wuw-table-area">
          {loading && <LoadingState message="Memuat riwayat promosi..." />}
          {!loading && errorMessage && <ErrorState message="Koneksi Terputus" error={errorMessage} onRetry={fetchData} />}

          {!loading && !errorMessage && filteredItems.length === 0 && (
            <div style={{ padding: '5rem 0' }}>
              <EmptyState title="Belum Ada Promosi" message="Anda belum memiliki riwayat promosi." actionLabel="Bersihkan Filter" onAction={clearFilters} />
            </div>
          )}

          {!loading && !errorMessage && filteredItems.length > 0 && (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: '250px' }}>Jabatan</th>
                    <th>Alasan</th>
                    <th>Tanggal Efektif</th>
                    <th>Disetujui Oleh</th>
                    <th className="th-center">Status</th>
                    <th className="th-center">Laporan</th>
                    <th className="th-center" style={{ width: '100px' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((promo) => {
                    const remarks = getRemarks(promo.remarks);
                    return (
                      <tr key={promo.id}>
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
                            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Dept: {remarks.new_department}</span>
                          )}
                          {remarks.new_salary && (
                            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                              Gaji: Rp {Number(remarks.new_salary).toLocaleString('id-ID')}
                            </span>
                          )}
                        </td>
                        <td>
                          <div style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#64748b', fontSize: '0.85rem' }} title={promo.reason}>
                            {promo.reason || '-'}
                          </div>
                        </td>
                        <td>
                          <div className="cell-stacked">
                            <span className="cell-stacked__main" style={{ fontSize: '0.85rem' }}>{formatDate(promo.effective_date)}</span>
                          </div>
                        </td>
                        <td>
                          <span style={{ color: '#64748b', fontWeight: 500 }}>
                            {promo.approver?.name || '-'}
                          </span>
                        </td>
                        <td className="td-center">{getStatusBadge(promo.status)}</td>
                        <td className="td-center">{getReportBadge(promo.report_status, promo.status)}</td>
                        <td className="td-center">
                          <div className="action-btn-group">
                            {promo.status === 'approved' && !promo.report_status && (
                              <button
                                className="action-btn"
                                style={{ background: '#dbeafe', color: '#2563eb' }}
                                onClick={() => openReportModal(promo)}
                                title="Submit Laporan"
                              >
                                <FileText size={16} />
                              </button>
      )}

      {/* Report Modal */}
      {reportModal && selectedPromo && (
        <div className="modal-overlay" onClick={closeReportModal}>
          <div className="modal-completion" onClick={(e) => e.stopPropagation()}>
            <div className="modal-completion-header">
              <div className="modal-completion-icon" style={{ background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)', color: '#2563eb' }}>
                <FileText size={24} />
              </div>
              <div>
                <h3 className="modal-completion-title">Submit Laporan Kegiatan</h3>
                <p className="modal-completion-task">
                  {selectedPromo.to_value}
                </p>
              </div>
              <button className="modal-close-btn" onClick={closeReportModal}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-completion-body">
              <label className="modal-completion-label">Laporan Kegiatan</label>
              <textarea
                className="modal-completion-textarea"
                placeholder="Deskripsikan kegiatan dan pencapaian Anda setelah promosi..."
                value={reportContent}
                onChange={(e) => setReportContent(e.target.value)}
                rows={5}
              />
              <p className="modal-completion-hint">Laporan akan direview oleh HR/Admin sebelum promosi dinyatakan selesai.</p>
            </div>

            <div className="modal-completion-footer">
              <button className="modal-btn-cancel" onClick={closeReportModal}>Batal</button>
              <button
                className="modal-btn-confirm"
                onClick={handleSubmitReport}
                disabled={submittingReport || !reportContent.trim()}
                style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)' }}
              >
                {submittingReport ? (
                  <><RefreshCw size={16} className="animate-spin" /> Mengirim...</>
                ) : (
                  <><FileText size={16} /> Submit Laporan</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyPromotionsPage;
