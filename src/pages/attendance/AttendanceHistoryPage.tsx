import { useEffect, useState, useMemo } from 'react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { LoadingState, ErrorState, EmptyState } from '@/shared/ui/DataStateDisplay';
import { api } from '@/shared/api/httpClient';
import { CalendarDays, CheckCircle2, Clock, RefreshCw, XCircle, Search } from 'lucide-react';
import '@/shared/styles/CrudPage.css';
import '@/pages/dashboard/overview/OverviewPage.css';

interface AttendanceRecord {
  date?: string;
  check_in?: string;
  check_out?: string;
  status?: string;
  [key: string]: any;
}

const AttendanceHistoryPage = () => {
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Search & Filter
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState<'Semua' | 'Hadir' | 'Absen' | 'Terlambat'>('Semua');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  const loadHistory = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const result = await api.get('/attendance/history');
      const payload = result.data?.data ?? result.data;
      setHistory(Array.isArray(payload) ? payload : [payload]);
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Terjadi kesalahan';
      setErrorMessage(message);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadHistory();
  }, []);

  // Filter & Sort & Paginate
  const filteredHistory = useMemo(() => {
    return history.filter((record) => {
      const searchStr = searchText.toLowerCase();
      const dateMatch = record.date?.toLowerCase().includes(searchStr) || false;
      const statusMatch = record.status?.toLowerCase().includes(searchStr) || false;
      const textMatch = dateMatch || statusMatch;

      let tabMatch = true;
      if (activeTab === 'Hadir') tabMatch = record.status?.toLowerCase().includes('present') || record.status?.toLowerCase().includes('hadir') || false;
      else if (activeTab === 'Absen') tabMatch = record.status?.toLowerCase().includes('absent') || record.status?.toLowerCase().includes('tidak') || false;
      else if (activeTab === 'Terlambat') tabMatch = record.status?.toLowerCase().includes('late') || record.status?.toLowerCase().includes('terlambat') || false;

      return textMatch && tabMatch;
    });
  }, [history, searchText, activeTab]);

  const sortedHistory = useMemo(() => {
    return [...filteredHistory].sort((a, b) => {
      const dateA = new Date(a.date || '').getTime();
      const dateB = new Date(b.date || '').getTime();
      return dateB - dateA; // Newest first
    });
  }, [filteredHistory]);

  const paginatedHistory = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedHistory.slice(startIndex, startIndex + pageSize);
  }, [sortedHistory, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedHistory.length / pageSize);

  const clearFilters = () => {
    setSearchText('');
    setActiveTab('Semua');
    setCurrentPage(1);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, activeTab]);

  const summaryStats = useMemo(() => [
    { label: "Total Records", subtitle: "Seluruh riwayat", value: String(history.length), tone: "blue" as const, icon: CalendarDays },
    { label: "Hadir", subtitle: "Kehadiran", value: String(history.filter(r => r.status?.toLowerCase().includes('present') || r.status?.toLowerCase().includes('hadir')).length), tone: "green" as const, icon: CheckCircle2 },
    { label: "Absen", subtitle: "Ketidakhadiran", value: String(history.filter(r => r.status?.toLowerCase().includes('absent') || r.status?.toLowerCase().includes('tidak')).length), tone: "red" as const, icon: XCircle },
    { label: "Terlambat", subtitle: "Keterlambatan", value: String(history.filter(r => r.status?.toLowerCase().includes('late') || r.status?.toLowerCase().includes('terlambat')).length), tone: "orange" as const, icon: Clock },
  ], [history]);

  const formatTime = (timeStr: string | undefined) => {
    if (!timeStr) return '-';
    try {
      const [hours, minutes] = timeStr.split(':');
      return `${hours}:${minutes}`;
    } catch {
      return timeStr;
    }
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

  const getStatusBadge = (status: string | undefined) => {
    if (!status) return <span className="badge-soft badge-soft--gray">N/A</span>;
    const statusLower = String(status).toLowerCase();
    if (statusLower.includes('present') || statusLower.includes('hadir')) {
      return <span className="badge-soft badge-soft--green">HADIR</span>;
    } else if (statusLower.includes('absent') || statusLower.includes('tidak')) {
      return <span className="badge-soft badge-soft--red">ABSEN</span>;
    } else if (statusLower.includes('late') || statusLower.includes('terlambat')) {
      return <span className="badge-soft badge-soft--orange">TERLAMBAT</span>;
    }
    return <span className="badge-soft badge-soft--gray">{status}</span>;
  };

  return (
    <div className="crud-page">
      {/* Header */}
      <Card className="hero-card">
        <div className="hero-card-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <CalendarDays size={16} />
              <span>Kehadiran</span>
            </div>
            <h1 className="hero-title">Riwayat Kehadiran</h1>
            <p className="hero-subtitle">
              Riwayat kehadiran Anda, termasuk check-in dan check-out setiap hari.
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn-outline" onClick={() => void loadHistory()} disabled={loading}>
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Segarkan
            </button>
          </div>
        </div>
      </Card>

      {errorMessage && (
        <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '0.5rem', padding: '1rem', marginBottom: '1rem', color: '#b91c1c' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{errorMessage}</span>
            <button onClick={() => setErrorMessage('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#b91c1c' }}>×</button>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="employee-summary-wrapper">
        {summaryStats.map((card) => {
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
            <CalendarDays size={24} />
          </div>
          <div>
            <h2 className="analytics-title">Riwayat Kehadiran</h2>
            <p className="analytics-subtitle">Kelola dan lihat semua riwayat kehadiran</p>
          </div>
        </div>
      </Card>

      {/* Control Section */}
      <Card className="control-section-card">
        <div className="control-section-inner">
          {/* Tabs */}
          <div className="elyra-tabs">
            {(["Semua", "Hadir", "Absen", "Terlambat"] as const).map((tab) => (
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
                placeholder="Cari tanggal atau status..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="search-input-pill"
              />
            </div>
            {(searchText || activeTab !== "Semua") && (
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
          {loading && <LoadingState message="Memuat riwayat kehadiran..." />}
          {!loading && errorMessage && <ErrorState message="Koneksi Terputus" error={errorMessage} onRetry={loadHistory} />}

          {!loading && !errorMessage && paginatedHistory.length === 0 && (
            <div style={{ padding: '5rem 0' }}>
              <EmptyState
                title="Pencarian Kosong"
                message="Kami tidak menemukan riwayat yang sesuai dengan kriteria Anda."
                actionLabel="Bersihkan Filter"
                onAction={clearFilters}
              />
            </div>
          )}

          {!loading && !errorMessage && paginatedHistory.length > 0 && (
            <>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Tanggal</th>
                      <th>Check In</th>
                      <th>Check Out</th>
                      <th>Status</th>
                      <th className="th-center" style={{ width: '120px' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedHistory.map((record, idx) => (
                      <tr key={idx}>
                        <td>
                          <div className="cell-name">
                            <div className="cell-avatar">
                              <CalendarDays size={14} />
                            </div>
                            <span style={{ fontWeight: 600 }}>{formatDate(record.date)}</span>
                          </div>
                        </td>
                        <td style={{ color: '#10b981', fontWeight: 600 }}>
                          {formatTime(record.check_in)}
                        </td>
                        <td style={{ color: '#2563eb', fontWeight: 600 }}>
                          {formatTime(record.check_out)}
                        </td>
                        <td>
                          {getStatusBadge(record.status)}
                        </td>
                        <td className="td-center">
                          <span className="badge-soft badge-soft--blue">Record</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="table-pagination">
                <div className="pagination-info">
                  Menampilkan <strong>{paginatedHistory.length}</strong> dari <strong>{sortedHistory.length}</strong> riwayat
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

export default AttendanceHistoryPage;
