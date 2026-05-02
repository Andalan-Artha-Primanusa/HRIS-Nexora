import React, { useState, useEffect, useMemo } from 'react';
import { Search, RefreshCw, ArrowUpRight, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
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
    ],
    [items],
  );

  const clearFilters = () => {
    setSearchText('');
    setActiveTab('Semua');
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; class: string }> = {
      pending: { label: 'Menunggu', class: 'badge-soft--orange' },
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
            {['Semua', 'Menunggu', 'Disetujui', 'Ditolak'].map((tab) => (
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
                    <th>Tanggal Disetujui</th>
                    <th className="th-center">Status</th>
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
                        <td>
                          <span style={{ color: '#64748b', fontSize: '0.85rem' }}>
                            {promo.approval_date ? formatDate(promo.approval_date) : '-'}
                          </span>
                        </td>
                        <td className="td-center">{getStatusBadge(promo.status)}</td>
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
