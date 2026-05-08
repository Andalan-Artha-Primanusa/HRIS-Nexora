import { useEffect, useState } from 'react';
import { Card, CardHeader } from '@/shared/ui';
import { Alert } from '@/shared/ui/Alert';
import { LoadingState, EmptyState } from '@/shared/ui/DataStateDisplay';
import { attendanceService } from '@/features/attendance/api/attendance.service';
import { History, CheckCircle2, Clock, RefreshCw, Calendar, Timer } from 'lucide-react';
import '@/shared/styles/CrudPage.css';
import '@/pages/dashboard/overview/OverviewPage.css';
import './AttendanceShared.css';

interface TimesheetRecord {
  id?: number;
  date?: string;
  check_in?: string;
  check_out?: string;
  status?: string;
  employee_name?: string;
  department?: string;
  [key: string]: any;
}

const TimesheetPage = () => {
  const [records, setRecords] = useState<TimesheetRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'error' | 'info'>('error');

  const loadRecords = async () => {
    setLoading(true);
    setAlertMessage('');
    try {
      const result = await attendanceService.getHistory();
      console.log('Timesheet attendance history:', result);
      setRecords(result.items);
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Terjadi kesalahan';
      console.error('Timesheet load error:', error);
      setAlertMessage(message);
      setAlertType('error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRecords();
  }, []);

  const formatTime = (timeStr: string | undefined) => {
    if (!timeStr) return '-';
    try {
      // Handle both ISO datetime (2026-05-07T21:37:00) and time-only (21:37) formats
      const date = new Date(timeStr);
      if (isNaN(date.getTime())) {
        // If datetime parsing fails, try time-only format
        const [hours, minutes] = timeStr.split(':');
        return `${hours}:${minutes}`;
      }
      // Format ISO datetime to HH:MM
      return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch {
      return timeStr;
    }
  };

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return '-';
    try {
      // Handle both ISO datetime and date-only formats
      const date = new Date(dateStr);
      return date.toLocaleDateString('id-ID', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const getStatusClass = (status: string | undefined) => {
    if (!status) return 'draft';
    const statusLower = String(status).toLowerCase();
    if (statusLower.includes('present') || statusLower.includes('hadir')) return 'approved';
    if (statusLower.includes('absent') || statusLower.includes('tidak')) return 'rejected';
    if (statusLower.includes('late') || statusLower.includes('terlambat')) return 'pending';
    return 'draft';
  };

  return (
    <div className="crud-page">
      {/* Header - Same style as Dashboard */}
      <Card className="hero-card">
        <div className="hero-card-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <Timer size={16} />
              <span>Pusat Timesheet</span>
            </div>
            <h1 className="hero-title">Timesheet</h1>
            <p className="hero-subtitle">Riwayat kehadiran harian, check-in dan check-out karyawan.</p>
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
      <div className="attendance-timesheet-wrapper">
        <div className="attendance-summary-card">
          <div className="attendance-summary-header">
            <div>
              <p className="attendance-summary-label">Total Records</p>
              <p className="attendance-summary-subtitle">Semua data timesheet</p>
            </div>
            <div className="attendance-summary-icon-wrapper attendance-icon-blue">
              <History size={28} />
            </div>
          </div>
          <div className="attendance-summary-value attendance-value-blue">{records.length}</div>
          <p className="attendance-summary-trend">Data timesheet tersimpan</p>
        </div>

        <div className="attendance-summary-card">
          <div className="attendance-summary-header">
            <div>
              <p className="attendance-summary-label">Hadir</p>
              <p className="attendance-summary-subtitle">Kehadiran lengkap</p>
            </div>
            <div className="attendance-summary-icon-wrapper attendance-icon-green">
              <CheckCircle2 size={28} />
            </div>
          </div>
          <div className="attendance-summary-value attendance-value-green">
            {records.filter(r => (r.status || '').toLowerCase().includes('present')).length}
          </div>
          <p className="attendance-summary-trend">Check-in & check-out selesai</p>
        </div>

        <div className="attendance-summary-card">
          <div className="attendance-summary-header">
            <div>
              <p className="attendance-summary-label">Terlambat</p>
              <p className="attendance-summary-subtitle">Keterlambatan</p>
            </div>
            <div className="attendance-summary-icon-wrapper attendance-icon-orange">
              <Clock size={28} />
            </div>
          </div>
          <div className="attendance-summary-value attendance-value-orange">
            {records.filter(r => (r.status || '').toLowerCase().includes('late')).length}
          </div>
          <p className="attendance-summary-trend">Tidak tepat waktu</p>
        </div>
      </div>

      {/* Analytics Title Card */}
      <Card className="analytics-title-card">
        <CardHeader
          icon={History}
          title="Daftar Timesheet"
          subtitle="Riwayat kehadiran harian"
          iconColor="#1d4ed8"
          iconBgColor="#dbeafe"
        />
      </Card>

      {/* Table Section */}
      <div className="table-section">
        <div className="table-wrap">
          {loading && <LoadingState message="Memuat timesheet..." />}
          {!loading && records.length === 0 && (
            <div className="empty-state">
              <EmptyState title="Tidak Ada Data" message="Belum ada data timesheet." />
            </div>
          )}
          {!loading && records.length > 0 && (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Check In</th>
                  <th>Check Out</th>
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
                    <td style={{ fontWeight: 600 }}>{formatTime(record.check_in)}</td>
                    <td style={{ fontWeight: 600 }}>{formatTime(record.check_out)}</td>
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

export default TimesheetPage;