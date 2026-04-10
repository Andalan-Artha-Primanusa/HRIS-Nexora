import { useEffect, useState } from 'react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { api } from '@/shared/api/httpClient';
import { CalendarDays, AlertCircle, CheckCircle2, Clock, XCircle } from 'lucide-react';
import './AttendancePages.css';

interface AttendanceRecord {
  date?: string;
  check_in?: string;
  check_out?: string;
  status?: string;
  [key: string]: any;
}

const AttendanceHistoryPage = () => {
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [status, setStatus] = useState('Memuat riwayat attendance...');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadHistory = async () => {
    setLoading(true);
    setStatus('Mengambil data history...');
    setError('');

    try {
      const result = await api.get('/attendance/history');
      const payload = result.data?.data ?? result.data;
      setHistory(Array.isArray(payload) ? payload : [payload]);
      setStatus('History attendance berhasil dimuat.');
    } catch (error: any) {
      setStatus('Gagal memuat history.');
      setError(error.response?.data?.message || error.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadHistory();
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

  const getStatusIcon = (status: string | undefined) => {
    if (!status) return null;
    const statusLower = String(status).toLowerCase();
    if (statusLower.includes('present') || statusLower.includes('hadir')) {
      return <CheckCircle2 size={18} style={{ color: '#2e7d32' }} />;
    } else if (statusLower.includes('absent') || statusLower.includes('tidak')) {
      return <XCircle size={18} style={{ color: '#c41e3a' }} />;
    } else if (statusLower.includes('late') || statusLower.includes('terlambat')) {
      return <Clock size={18} style={{ color: '#f39c12' }} />;
    }
    return null;
  };

  const getStatusBadgeColor = (status: string | undefined) => {
    if (!status) return '#f5f5f5';
    const statusLower = String(status).toLowerCase();
    if (statusLower.includes('present') || statusLower.includes('hadir')) {
      return '#e8f5e9';
    } else if (statusLower.includes('absent') || statusLower.includes('tidak')) {
      return '#ffebee';
    } else if (statusLower.includes('late') || statusLower.includes('terlambat')) {
      return '#fff3e0';
    }
    return '#f5f5f5';
  };

  return (
    <div className="attendance-page">
      <div className="attendance-page-header">
        <div>
          <span className="attendance-badge">History</span>
          <h1>Attendance History</h1>
          <p>Riwayat kehadiran Anda, termasuk check-in dan check-out setiap hari.</p>
        </div>
        <div className="attendance-status-card">
          <CalendarDays size={22} />
          <div>
            <p>Status</p>
            <strong>{status}</strong>
          </div>
        </div>
      </div>

      <Card className="attendance-history-card" glass>
        <div className="attendance-action-row">
          <Button variant="primary" size="sm" onClick={() => void loadHistory()} disabled={loading}>
            {loading ? 'Memuat...' : 'Refresh History'}
          </Button>
        </div>

        {error && (
          <div style={{ padding: '1rem', backgroundColor: '#ffebee', borderRadius: '0.5rem', marginBottom: '1rem', color: '#c41e3a', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        {history.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {history.map((record, idx) => (
              <div
                key={idx}
                style={{
                  padding: '1rem',
                  backgroundColor: getStatusBadgeColor(record.status),
                  borderRadius: '0.75rem',
                  border: '1px solid rgba(0, 0, 0, 0.05)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '1rem',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    {getStatusIcon(record.status)}
                    <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                      {formatDate(record.date)}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: '#666' }}>
                      {record.status}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '2rem', fontSize: '0.9rem', color: '#555' }}>
                    <div>
                      <span style={{ fontWeight: 500 }}>Check In:</span>{' '}
                      <span style={{ color: '#2e7d32', fontWeight: 600 }}>
                        {formatTime(record.check_in)}
                      </span>
                    </div>
                    <div>
                      <span style={{ fontWeight: 500 }}>Check Out:</span>{' '}
                      <span style={{ color: '#1565c0', fontWeight: 600 }}>
                        {formatTime(record.check_out)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
            <CalendarDays size={32} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
            <p style={{ margin: 0 }}>Data history belum tersedia.</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AttendanceHistoryPage;
