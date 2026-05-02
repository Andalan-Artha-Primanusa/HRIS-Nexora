import React, { useState, useEffect, useMemo } from 'react';
import { RefreshCw, ArrowUpRight, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { LoadingState, ErrorState, EmptyState } from '@/shared/ui/DataStateDisplay';
import { promotionService } from '@/features/organization/api/promotion.service';
import '@/shared/styles/CrudPage.css';
import '@/pages/dashboard/overview/OverviewPage.css';

const MyPromotionsPage: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const response = await promotionService.getPromotions();
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

  const summaryCards = useMemo(() => {
    const total = items.length;
    const approved = items.filter((i) => i.status === 'approved').length;
    const pending = items.filter((i) => i.status === 'pending').length;
    const rejected = items.filter((i) => i.status === 'rejected').length;
    return [
      { label: 'Total Promosi', value: total, tone: 'blue', icon: ArrowUpRight },
      { label: 'Disetujui', value: approved, tone: 'green', icon: CheckCircle },
      { label: 'Menunggu', value: pending, tone: 'yellow', icon: Clock },
      { label: 'Ditolak', value: rejected, tone: 'red', icon: XCircle },
    ];
  }, [items]);

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

      <div className="overview-summary-wrapper">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="overview-summary-card">
              <div className="overview-summary-header">
                <div>
                  <p className="overview-summary-label">{card.label}</p>
                </div>
                <div className={`overview-summary-icon-wrapper overview-icon-${card.tone}`}>
                  <Icon size={28} />
                </div>
              </div>
              <div className={`overview-summary-value overview-value-${card.tone}`}>{card.value}</div>
            </div>
          );
        })}
      </div>

      <div className="table-section">
        <div className="wuw-table-area">
          {loading && <LoadingState message="Memuat riwayat promosi..." />}
          {errorMessage && !loading && <ErrorState message={errorMessage} onRetry={fetchData} />}
          {!loading && !errorMessage && items.length === 0 && (
            <div style={{ padding: '5rem 0' }}>
              <EmptyState title="Belum Ada Promosi" message="Anda belum memiliki riwayat promosi." />
            </div>
          )}
          {!loading && !errorMessage && items.length > 0 && (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: '200px' }}>Jabatan</th>
                    <th>Alasan</th>
                    <th>Tanggal Efektif</th>
                    <th>Disetujui Oleh</th>
                    <th>Tanggal Disetujui</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((promo) => {
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
                            {promo.reason}
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
                        <td>
                          <span style={{ color: '#64748b', fontSize: '0.85rem' }}>
                            {promo.approval_date ? formatDate(promo.approval_date) : '-'}
                          </span>
                        </td>
                        <td>{getStatusBadge(promo.status)}</td>
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
