import { useEffect, useState } from 'react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Alert } from '@/shared/ui/Alert';
import { LoadingState, EmptyState } from '@/shared/ui/DataStateDisplay';
import { api } from '@/shared/api/httpClient';
import { History, CheckCircle2, Clock, RefreshCw, XCircle, Calendar } from 'lucide-react';
import '@/shared/styles/CrudPage.css';

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
      const result = await api.get('/attendance/history');
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
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-badge">Attendance Center</span>
          <h1>Timesheet</h1>
          <p>Riwayat kehadiran harian, check-in dan check-out karyawan.</p>
        </div>
        <div className="page-header-actions">
          <Button variant="outline" size="md" onClick={() => void loadRecords()} disabled={loading} style={{ borderColor: "#2563eb", color: "#2563eb" }}>
            <RefreshCw size={16} />
            {loading ? 'Memuat...' : 'Segarkan'}
          </Button>
        </div>
      </div>

      {alertMessage && (
        <Alert variant={alertType === 'success' ? 'success' : 'error'} title={alertType === 'success' ? 'Berhasil' : 'Kesalahan'}>
          {alertMessage}
        </Alert>
      )}

      <div className="summary-grid">
        <Card className="summary-card" glass>
          <div className="summary-card__header">
            <div>
              <span className="summary-card__label">Total Records</span>
              <p className="summary-card__subtitle">Semua data timesheet</p>
            </div>
            <span className="summary-card__icon summary-card__icon--blue">
              <History size={20} />
            </span>
          </div>
          <div className="summary-card__value summary-card__value--blue">{records.length}</div>
          <div className="summary-card__change">Data timesheet bulan ini</div>
        </Card>

        <Card className="summary-card" glass>
          <div className="summary-card__header">
            <div>
              <span className="summary-card__label">Hadir</span>
              <p className="summary-card__subtitle">Kehadiran lengkap</p>
            </div>
            <span className="summary-card__icon summary-card__icon--green">
              <CheckCircle2 size={20} />
            </span>
          </div>
          <div className="summary-card__value summary-card__value--green">
            {records.filter(r => (r.status || '').toLowerCase().includes('present')).length}
          </div>
          <div className="summary-card__change">Check-in & check-out</div>
        </Card>

        <Card className="summary-card" glass>
          <div className="summary-card__header">
            <div>
              <span className="summary-card__label">Terlambat</span>
              <p className="summary-card__subtitle">Keterlambatan</p>
            </div>
            <span className="summary-card__icon summary-card__icon--orange">
              <Clock size={20} />
            </span>
          </div>
          <div className="summary-card__value summary-card__value--orange">
            {records.filter(r => (r.status || '').toLowerCase().includes('late')).length}
          </div>
          <div className="summary-card__change">Tidak tepat waktu</div>
        </Card>
      </div>

      <div className="white-unified-wrapper">
        <div className="wuw-header">
          <div className="wuw-header-top">
            <div className="wuw-title-area">
              <h3>Daftar Timesheet</h3>
              <span className="wuw-count-badge">{records.length} Total</span>
            </div>
          </div>
        </div>

        <div className="wuw-table-area">
          {loading && <LoadingState message="Memuat timesheet..." />}
          {!loading && records.length === 0 && (
            <EmptyState title="Tidak Ada Data" message="Belum ada data timesheet." />
          )}
          {!loading && records.length > 0 && (
            <div className="table-wrap">
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
                      <td><Calendar size={14} /> {formatDate(record.date)}</td>
                      <td>{formatTime(record.check_in)}</td>
                      <td>{formatTime(record.check_out)}</td>
                      <td><span className={`badge-soft badge-soft--${getStatusClass(record.status)}`}>{record.status || '-'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimesheetPage;