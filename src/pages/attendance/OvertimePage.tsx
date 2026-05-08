import { useEffect, useState, useMemo } from 'react';
import { Card } from '@/shared/ui/Card';
import { LoadingState, EmptyState } from '@/shared/ui/DataStateDisplay';
import { api } from '@/shared/api/httpClient';
import { attendanceService } from '@/features/attendance/api/attendance.service';
import overtimeService from '@/features/attendance/api/overtime.service';
import { Clock, RefreshCw, Calendar, Timer, AlertCircle, CheckCircle, XCircle, Search, MessageSquare, Eye } from 'lucide-react';
import '@/shared/styles/CrudPage.css';
import '@/pages/dashboard/overview/OverviewPage.css';
import './AttendanceShared.css';

interface OvertimeRecord {
  id: number;
  attendance_id?: number;
  date: string;
  scheduled_checkout?: string;
  scheduled_check_out?: string;
  actual_checkout: string;
  overtime_minutes: number;
  status: string;
  request_id?: number;
  request_status?: string | null;
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
      const [summaryResult, requestResult] = await Promise.all([
        attendanceService.getOvertimeSummary(30),
        api.get('/my/overtime'),
      ]);

      const summaryPayload = summaryResult.payload as any;
      const overtimeRows = Array.isArray(summaryPayload?.records) ? summaryPayload.records : [];

      const requestPayload = requestResult.data?.data ?? requestResult.data;
      const requests = Array.isArray(requestPayload) ? requestPayload : [];
      const requestByAttendanceId = new Map(
        requests.map((request: any) => [String(request.attendance_id), request])
      );

      const mergedRecords = overtimeRows
        .filter((record: any) => Number(record.overtime_minutes || 0) > 0)
        .map((record: any) => {
          const request = requestByAttendanceId.get(String(record.id));
          return {
            ...record,
            attendance_id: request?.attendance_id ?? record.attendance_id ?? record.id,
            request_id: request?.id ?? null,
            request_status: request?.status ?? null,
            reason: request?.reason ?? record.reason ?? null,
            reject_reason: request?.reject_reason ?? null,
            approved_by: request?.approved_by ?? null,
            approved_at: request?.approved_at ?? null,
            approver: request?.approver ?? null,
            evidences: request?.evidences ?? [],
            status: request?.status ?? (Number(record.overtime_minutes || 0) > 0 ? 'pending' : 'draft'),
          };
        });

      setRecords(mergedRecords);
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

  const handleAddReason = async (record: OvertimeRecord) => {
    const requestId = record.request_id;
    if (!requestId) {
      alert('Data lembur belum punya request untuk diisi alasan.');
      return;
    }

    const reason = window.prompt('Masukkan alasan lembur:');
    if (!reason) return;
    try {
      await api.put(`/my/overtime/${requestId}/reason`, { reason });
      loadRecords();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Gagal menambahkan alasan');
    }
  };

  const handleUploadEvidence = async (record: OvertimeRecord) => {
    const requestId = record.request_id;
    if (!requestId) {
      alert('Request lembur belum tersedia untuk upload bukti.');
      return;
    }

    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '*/*';
      input.onchange = async () => {
        const file = input.files?.[0];
        if (!file) return;
        if (file.size > 10 * 1024 * 1024) {
          alert('Ukuran file maksimal 10MB');
          return;
        }
        try {
          await overtimeService.uploadEvidence(requestId, file);
          alert('Bukti berhasil diunggah');
          void loadRecords();
        } catch (err: any) {
          console.error(err);
          alert(err?.response?.data?.message || 'Gagal mengunggah bukti');
        }
      };
      input.click();
    } catch (err) {
      console.error(err);
      alert('Gagal membuka dialog file');
    }
  };

  const handleViewMyEvidences = async (record: OvertimeRecord) => {
    const requestId = record.request_id;
    if (!requestId) {
      alert('Request lembur belum tersedia untuk melihat bukti.');
      return;
    }

    try {
      const res = await overtimeService.getMyEvidences(requestId);
      const payload = res?.data?.data ?? res?.data ?? res;
      const list = Array.isArray(payload) ? payload : [];
      if (list.length === 0) {
        alert('Belum ada bukti untuk lembur ini');
        return;
      }
      const names = list.map((e: any, i: number) => `${i + 1}. ${e.filename || e.name || e.file_name || 'file'}`);
      const pick = window.prompt('Bukti:\n' + names.join('\n') + '\n\nMasukkan nomor untuk membuka (kosong = batalkan)');
      if (!pick) return;
      const idx = parseInt(pick, 10) - 1;
      if (Number.isNaN(idx) || idx < 0 || idx >= list.length) return alert('Pilihan tidak valid');
      const url = list[idx].url || list[idx].file_url || list[idx].path;
      if (!url) return alert('Tidak ada URL untuk file ini');
      window.open(url, '_blank');
    } catch (err: any) {
      console.error(err);
      alert('Gagal mengambil bukti');
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

  const pendingCount = records.filter(r => r.request_status === 'pending' || r.status === 'pending').length;
  const approvedCount = records.filter(r => r.request_status === 'approved' || r.status === 'approved').length;
  const rejectedCount = records.filter(r => r.request_status === 'rejected' || r.status === 'rejected').length;
  const totalMinutes = records.reduce((sum, r) => sum + (r.overtime_minutes || 0), 0);
  const totalOvertimeDays = records.length;

  const formatDuration = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}j ${m}m`;
  };

  const formatTime = (timeStr: string | undefined) => {
    if (!timeStr) return '-';
    try {
      const date = new Date(timeStr);
      if (!Number.isNaN(date.getTime())) {
        return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });
      }
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

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; tone: string }> = {
      'pending': { label: 'Menunggu', tone: 'orange' },
      'approved': { label: 'Disetujui', tone: 'green' },
      'rejected': { label: 'Ditolak', tone: 'red' },
    };
    const config = map[status] || { label: 'Tercatat', tone: 'blue' };
    return <span className={`badge-soft badge-soft--${config.tone}`}>{config.label}</span>;
  };

  const summaryCards = [
    { label: 'Hari Lembur', subtitle: 'Checkout melebihi jadwal', value: String(totalOvertimeDays), tone: 'blue' as const, icon: Clock },
    { label: 'Menunggu Persetujuan', subtitle: 'Pending approval', value: String(pendingCount), tone: 'orange' as const, icon: AlertCircle },
    { label: 'Disetujui', subtitle: 'Sudah approved', value: String(approvedCount), tone: 'green' as const, icon: CheckCircle },
    { label: 'Total Jam Lembur', subtitle: 'Akumulasi overtime', value: formatDuration(totalMinutes), tone: 'purple' as const, icon: Timer },
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
              Riwayat lembur diambil dari checkout yang melewati jadwal pulang, lalu dicocokkan dengan request bukti lembur.
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
            <p className="analytics-subtitle">Checkout terlambat dan status request bukti lembur</p>
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
                    {tab === 'Pending' ? pendingCount : tab === 'Approved' ? approvedCount : rejectedCount}
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
                        <td style={{ fontWeight: 500, color: '#475569' }}>{formatTime(record.scheduled_check_out || record.scheduled_checkout)}</td>
                        <td style={{ fontWeight: 600, color: '#0f172a' }}>{formatTime(record.actual_checkout)}</td>
                        <td>
                          <span style={{ fontWeight: 700, color: '#7c3aed' }}>
                            {formatDuration(record.overtime_minutes)}
                          </span>
                        </td>
                        <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {record.reason || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Belum diisi</span>}
                        </td>
                        <td className="td-center">
                          {getStatusBadge(record.request_status || record.status)}
                        </td>
                        <td className="td-center">
                          <div className="action-btn-group">
                            {record.request_id && (record.request_status === 'pending' || !record.reason) && (
                              <button
                                className="action-btn"
                                style={{ color: '#6366f1', background: '#eef2ff' }}
                                onClick={() => void handleAddReason(record)}
                                title="Tambah Alasan"
                              >
                                <MessageSquare size={16} />
                              </button>
                            )}
                            {record.request_id && record.request_status !== 'approved' && (
                              <button
                                className="action-btn"
                                style={{ color: '#06b6d4', background: '#ecfeff' }}
                                onClick={() => void handleUploadEvidence(record)}
                                title="Unggah Bukti"
                              >
                                <MessageSquare size={16} />
                              </button>
                            )}
                            <button
                              className="action-btn"
                              style={{ color: '#0f172a', background: '#f1f5f9' }}
                              onClick={() => void handleViewMyEvidences(record)}
                              title="Lihat Bukti"
                              disabled={!record.request_id}
                            >
                              <Eye size={16} />
                            </button>
                            {record.request_status === 'rejected' && record.reject_reason && (
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
                  Menampilkan <strong>{paginatedRecords.length}</strong> dari <strong>{filteredRecords.length}</strong> hari lembur
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