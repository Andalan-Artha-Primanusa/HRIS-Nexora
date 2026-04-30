import { useEffect, useState, useMemo } from 'react';
import { Card } from '@/shared/ui/Card';
import { LoadingState, EmptyState } from '@/shared/ui/DataStateDisplay';
import { api } from '@/shared/api/httpClient';
import { Clock, RefreshCw, Calendar, Timer, AlertCircle, CheckCircle, XCircle, Search, MessageSquare } from 'lucide-react';
import '@/shared/styles/CrudPage.css';
import '@/pages/dashboard/overview/OverviewPage.css';
import './AttendanceShared.css';

interface OvertimeRecord {
  id: number;
  date: string;
  scheduled_checkout: string;
  actual_checkout: string;
  overtime_minutes: number;
  status: string;
  reason: string | null;
  reject_reason: string | null;
  approved_by: number | null;
  approved_at: string | null;
  approver?: { id: number; name: string } | null;
  [key: string]: any;
}

const OvertimePage = () => {
  const [records, setRecords] = useState<OvertimeRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState<'Semua' | 'Pending' | 'Approved' | 'Rejected'>('Semua');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  const loadRecords = async () => {
    setLoading(true);
    try {
      const result = await api.get('/my/overtime');
      const payload = result.data?.data ?? result.data;
      setRecords(Array.isArray(payload) ? payload : []);
    } catch (error: any) {
      console.error('Failed to load overtime:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRecords();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, activeTab]);

  const handleAddReason = async (id: number) => {
    const reason = window.prompt('Masukkan alasan lembur:');
    if (!reason) return;
    try {
      await api.put(`/my/overtime/${id}/reason`, { reason });
      loadRecords();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Gagal menambahkan alasan');
    }
  };

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const dateMatch = (r.date || '').toLowerCase().includes(searchText.toLowerCase());
      const reasonMatch = (r.reason || '').toLowerCase().includes(searchText.toLowerCase());
      const textMatch = dateMatch || reasonMatch;

      let statusMatch = true;
      if (activeTab === 'Pending') statusMatch = r.status === 'pending';
      else if (activeTab === 'Approved') statusMatch = r.status === 'approved';
      else if (activeTab === 'Rejected') statusMatch = r.status === 'rejected';

      return textMatch && statusMatch;
    });
  }, [records, searchText, activeTab]);

  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredRecords.length / pageSize);

  const pendingCount = records.filter(r => r.status === 'pending').length;
  const approvedCount = records.filter(r => r.status === 'approved').length;
  const totalMinutes = records.filter(r => r.status === 'approved').reduce((sum, r) => sum + (r.overtime_minutes || 0), 0);

  const formatDuration = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}j ${m}m`;
  };

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('id-ID', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; tone: string }> = {
      'pending': { label: 'Menunggu', tone: 'orange' },
      'approved': { label: 'Disetujui', tone: 'green' },
      'rejected': { label: 'Ditolak', tone: 'red' },
    };
    const config = map[status] || { label: status, tone: 'orange' };
    return <span className={`badge-soft badge-soft--${config.tone}`}>{config.label}</span>;
  };

  const summaryCards = [
    { label: 'Total Pengajuan', subtitle: 'Seluruh lembur', value: String(records.length), tone: 'blue' as const, icon: Clock },
    { label: 'Menunggu Persetujuan', subtitle: 'Pending approval', value: String(pendingCount), tone: 'orange' as const, icon: AlertCircle },
    { label: 'Disetujui', subtitle: 'Sudah approved', value: String(approvedCount), tone: 'green' as const, icon: CheckCircle },
    { label: 'Total Jam Approved', subtitle: 'Total jam disetujui', value: formatDuration(totalMinutes), tone: 'purple' as const, icon: Timer },
  ];

  return (
    <div className="crud-page">
      <Card className="hero-card">
        <div className="hero-card-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <Timer size={16} />
              <span>Layanan Mandiri</span>
            </div>
            <h1 className="hero-title">Lembur Saya</h1>
            <p className="hero-subtitle">
              Riwayat dan status pengajuan lembur Anda. Lembur otomatis tercatat saat Anda checkout melebihi jam kerja.
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn-outline" onClick={() => void loadRecords()} disabled={loading}>
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
              <p className="employee-summary-trend">{card.subtitle}</p>
            </div>
          );
        })}
      </div>

      {/* Analytics Title Card */}
      <Card className="analytics-title-card">
        <div className="analytics-title-inner">
          <div className="analytics-icon">
            <Timer size={24} />
          </div>
          <div>
            <h2 className="analytics-title">Daftar Lembur</h2>
            <p className="analytics-subtitle">Riwayat pengajuan lembur otomatis dari sistem absensi</p>
          </div>
        </div>
      </Card>

      {/* Control Section */}
      <Card className="control-section-card">
        <div className="control-section-inner">
          <div className="elyra-tabs">
            {(['Semua', 'Pending', 'Approved', 'Rejected'] as const).map((tab) => (
              <button
                key={tab}
                className={`elyra-tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
                {tab !== 'Semua' && (
                  <span className="tab-count">
                    {tab === 'Pending' ? pendingCount : tab === 'Approved' ? approvedCount : records.filter(r => r.status === 'rejected').length}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="control-actions">
            <div className="search-box">
              <div className="search-icon-inside"><Search size={18} /></div>
              <input
                type="text"
                placeholder="Cari lembur..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="search-input-pill"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Table */}
      <div className="table-section">
        <div className="wuw-table-area">
          {loading && <LoadingState message="Memuat lembur..." />}

          {!loading && paginatedRecords.length === 0 && (
            <div style={{ padding: '5rem 0' }}>
              <EmptyState
                title="Belum Ada Lembur"
                message="Belum ada data lembur. Lembur akan otomatis tercatat saat Anda checkout melebihi jadwal."
              />
            </div>
          )}

          {!loading && paginatedRecords.length > 0 && (
            <>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Tanggal</th>
                      <th>Jadwal Checkout</th>
                      <th>Aktual Checkout</th>
                      <th>Durasi Lembur</th>
                      <th>Alasan</th>
                      <th className="th-center">Status</th>
                      <th className="th-center" style={{ width: '100px' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedRecords.map((record) => (
                      <tr key={record.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Calendar size={16} color="#64748b" />
                            {formatDate(record.date)}
                          </div>
                        </td>
                        <td style={{ fontWeight: 500, color: '#475569' }}>{record.scheduled_checkout || '-'}</td>
                        <td style={{ fontWeight: 600, color: '#0f172a' }}>{record.actual_checkout || '-'}</td>
                        <td>
                          <span style={{ fontWeight: 700, color: '#7c3aed' }}>
                            {formatDuration(record.overtime_minutes)}
                          </span>
                        </td>
                        <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {record.reason || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Belum diisi</span>}
                        </td>
                        <td className="td-center">
                          {getStatusBadge(record.status)}
                        </td>
                        <td className="td-center">
                          <div className="action-btn-group">
                            {record.status === 'pending' && !record.reason && (
                              <button
                                className="action-btn"
                                style={{ color: '#6366f1', background: '#eef2ff' }}
                                onClick={() => handleAddReason(record.id)}
                                title="Tambah Alasan"
                              >
                                <MessageSquare size={16} />
                              </button>
                            )}
                            {record.status === 'rejected' && record.reject_reason && (
                              <button
                                className="action-btn"
                                style={{ color: '#ef4444', background: '#fef2f2' }}
                                onClick={() => alert('Alasan ditolak: ' + record.reject_reason)}
                                title="Lihat Alasan Penolakan"
                              >
                                <XCircle size={16} />
                              </button>
                            )}
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
                  Menampilkan <strong>{paginatedRecords.length}</strong> dari <strong>{filteredRecords.length}</strong> lembur
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

export default OvertimePage;