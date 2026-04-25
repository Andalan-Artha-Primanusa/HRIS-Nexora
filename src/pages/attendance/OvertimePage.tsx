import { useEffect, useState } from 'react';
import { Card } from '@/shared/ui/Card';
import { Alert } from '@/shared/ui/Alert';
import { LoadingState, EmptyState } from '@/shared/ui/DataStateDisplay';
import { api } from '@/shared/api/httpClient';
import { Clock, RefreshCw, DollarSign, Calendar, Timer, AlertCircle } from 'lucide-react';
import '@/shared/styles/CrudPage.css';
import '@/pages/dashboard/overview/OverviewPage.css';
import './AttendanceShared.css';

interface OvertimeRecord {
  id?: number;
  date?: string;
  hours?: number;
  minutes?: number;
  reason?: string;
  status?: string;
  employee_name?: string;
  approved_by?: string;
  [key: string]: any;
}

const OvertimePage = () => {
  const [records, setRecords] = useState<OvertimeRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'error' | 'info'>('error');

  const loadRecords = async () => {
    setLoading(true);
    setAlertMessage('');
    try {
      const result = await api.get('/attendance/overtime', { params: { days: 30 } });
      const payload = result.data?.data ?? result.data;
      setRecords(Array.isArray(payload) ? payload : []);
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Terjadi kesalahan';
      setAlertMessage(message);
      setAlertType('error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRecords();
  }, []);

  const formatDuration = (hours?: number, minutes?: number) => {
    if (!hours && !minutes) return '-';
    const h = hours || 0;
    const m = minutes || 0;
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

  const getStatusClass = (status: string | undefined) => {
    if (!status) return 'draft';
    const statusLower = String(status).toLowerCase();
    if (statusLower.includes('approved') || statusLower.includes('disetujui')) return 'approved';
    if (statusLower.includes('rejected') || statusLower.includes('ditolak')) return 'rejected';
    if (statusLower.includes('pending') || statusLower.includes('menunggu')) return 'pending';
    return 'draft';
  };

  const totalHours = records.reduce((sum, r) => sum + (r.hours || 0), 0);
  const totalMinutes = records.reduce((sum, r) => sum + (r.minutes || 0), 0);

  return (
    <div className="crud-page">
      {/* Header - Same style as Dashboard */}
      <Card className="hero-card">
        <div className="hero-card-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <Timer size={16} />
              <span>Pusat Overtime</span>
            </div>
            <h1 className="hero-title">Overtime</h1>
            <p className="hero-subtitle">Pengajuan dan riwayat lembur karyawan.</p>
          </div>
          <div className="hero-actions">
            <button className="btn-outline" onClick={() => void loadRecords()}>
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Segarkan
            </button>
          </div>
        </div>
      </Card>

      {alertMessage && (
        <Alert variant={alertType === 'success' ? 'success' : 'error'} title={alertType === 'success' ? 'Berhasil' : 'Kesalahan'}>
          {alertMessage}
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="attendance-overtime-wrapper">
        <div className="attendance-summary-card">
          <div className="attendance-summary-header">
            <div>
              <p className="attendance-summary-label">Total Overtime</p>
              <p className="attendance-summary-subtitle">Semua pengajuan</p>
            </div>
            <div className="attendance-summary-icon-wrapper attendance-icon-blue">
              <Clock size={28} />
            </div>
          </div>
          <div className="attendance-summary-value attendance-value-blue">{records.length}</div>
          <p className="attendance-summary-trend">Pengajuan dalam 30 hari</p>
        </div>

        <div className="attendance-summary-card">
          <div className="attendance-summary-header">
            <div>
              <p className="attendance-summary-label">Total Jam</p>
              <p className="attendance-summary-subtitle">Total jam lembur</p>
            </div>
            <div className="attendance-summary-icon-wrapper attendance-icon-green">
              <Clock size={28} />
            </div>
          </div>
          <div className="attendance-summary-value attendance-value-green">{totalHours + Math.floor(totalMinutes / 60)}j</div>
          <p className="attendance-summary-trend">{(totalMinutes % 60)}m menit lembur</p>
        </div>

        <div className="attendance-summary-card">
          <div className="attendance-summary-header">
            <div>
              <p className="attendance-summary-label">Menunggu</p>
              <p className="attendance-summary-subtitle">Pending approval</p>
            </div>
            <div className="attendance-summary-icon-wrapper attendance-icon-orange">
              <AlertCircle size={28} />
            </div>
          </div>
          <div className="attendance-summary-value attendance-value-orange">
            {records.filter(r => (r.status || '').toLowerCase().includes('pending')).length}
          </div>
          <p className="attendance-summary-trend">Perlu review</p>
        </div>
      </div>

      {/* Analytics Title Card */}
      <Card className="analytics-title-card">
        <div className="analytics-title-inner">
          <div className="analytics-icon">
            <Timer size={24} />
          </div>
          <div>
            <h2 className="analytics-title">Daftar Overtime</h2>
            <p className="analytics-subtitle">Riwayat pengajuan lembur</p>
          </div>
        </div>
      </Card>

      {/* Table Section */}
      <div className="table-section">
        <div className="table-wrap">
          {loading && <LoadingState message="Memuat overtime..." />}
          {!loading && records.length === 0 && (
            <div className="empty-state">
              <EmptyState title="Tidak Ada Data" message="Belum ada data overtime." />
            </div>
          )}
          {!loading && records.length > 0 && (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Durasi</th>
                  <th>Alasan</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record, idx) => (
                  <tr key={record.id || idx}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Calendar size={16} color="#64748b" />
                        {formatDate(record.date)}
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{formatDuration(record.hours, record.minutes)}</td>
                    <td>{record.reason || '-'}</td>
                    <td>
                      <span className={`status-badge status-badge--${getStatusClass(record.status)}`}>
                        {record.status || '-'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default OvertimePage;