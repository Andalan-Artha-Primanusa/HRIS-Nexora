import { useEffect, useState } from 'react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Alert } from '@/shared/ui/Alert';
import { LoadingState, EmptyState } from '@/shared/ui/DataStateDisplay';
import { api } from '@/shared/api/httpClient';
import { Clock, RefreshCw, DollarSign, Calendar } from 'lucide-react';
import '@/shared/styles/CrudPage.css';

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
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-badge">Attendance Center</span>
          <h1>Overtime</h1>
          <p>Pengajuan dan riwayat lembur karyawan.</p>
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
              <span className="summary-card__label">Total Overtime</span>
              <p className="summary-card__subtitle">Semua pengajuan</p>
            </div>
            <span className="summary-card__icon summary-card__icon--blue">
              <Clock size={20} />
            </span>
          </div>
          <div className="summary-card__value summary-card__value--blue">{records.length}</div>
          <div className="summary-card__change">Pengajuan dalam 30 hari</div>
        </Card>

        <Card className="summary-card" glass>
          <div className="summary-card__header">
            <div>
              <span className="summary-card__label">Total Hours</span>
              <p className="summary-card__subtitle">Total jam lembur</p>
            </div>
            <span className="summary-card__icon summary-card__icon--green">
              <Clock size={20} />
            </span>
          </div>
          <div className="summary-card__value summary-card__value--green">{totalHours + Math.floor(totalMinutes / 60)}j</div>
          <div className="summary-card__change">{(totalMinutes % 60)}m menit</div>
        </Card>

        <Card className="summary-card" glass>
          <div className="summary-card__header">
            <div>
              <span className="summary-card__label">Pending</span>
              <p className="summary-card__subtitle">Menunggu approval</p>
            </div>
            <span className="summary-card__icon summary-card__icon--orange">
              <Clock size={20} />
            </span>
          </div>
          <div className="summary-card__value summary-card__value--orange">
            {records.filter(r => (r.status || '').toLowerCase().includes('pending')).length}
          </div>
          <div className="summary-card__change">Perlu review</div>
        </Card>
      </div>

      <div className="white-unified-wrapper">
        <div className="wuw-header">
          <div className="wuw-header-top">
            <div className="wuw-title-area">
              <h3>Daftar Overtime</h3>
              <span className="wuw-count-badge">{records.length} Total</span>
            </div>
          </div>
        </div>

        <div className="wuw-table-area">
          {loading && <LoadingState message="Memuat overtime..." />}
          {!loading && records.length === 0 && (
            <EmptyState title="Tidak Ada Data" message="Belum ada data overtime." />
          )}
          {!loading && records.length > 0 && (
            <div className="table-wrap">
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
                      <td><Calendar size={14} /> {formatDate(record.date)}</td>
                      <td>{formatDuration(record.hours, record.minutes)}</td>
                      <td>{record.reason || '-'}</td>
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

export default OvertimePage;