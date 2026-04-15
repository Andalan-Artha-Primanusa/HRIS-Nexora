import { useEffect, useState } from 'react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Alert } from '@/shared/ui/Alert';
import { LoadingState, EmptyState } from '@/shared/ui/DataStateDisplay';
import { api } from '@/shared/api/httpClient';
import { CalendarDays, CheckCircle2, Clock, RefreshCw, XCircle } from 'lucide-react';
import '@/shared/styles/CrudPage.css';

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
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'error' | 'info'>('error');

  const loadHistory = async () => {
    setLoading(true);
    setAlertMessage('');
    try {
      const result = await api.get('/attendance/history');
      const payload = result.data?.data ?? result.data;
      setHistory(Array.isArray(payload) ? payload : [payload]);
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Terjadi kesalahan';
      setAlertMessage(message);
      setAlertType('error');
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
      return <CheckCircle2 size={18} style={{ color: '#10b981' }} />;
    } else if (statusLower.includes('absent') || statusLower.includes('tidak')) {
      return <XCircle size={18} style={{ color: '#ef4444' }} />;
    } else if (statusLower.includes('late') || statusLower.includes('terlambat')) {
      return <Clock size={18} style={{ color: '#f59e0b' }} />;
    }
    return null;
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
      {/* Header */}
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-badge">History</span>
          <h1>Attendance History</h1>
          <p>Riwayat kehadiran Anda, termasuk check-in dan check-out setiap hari.</p>
        </div>
        <div className="page-header-actions">
          <Button variant="outline" size="md" onClick={() => void loadHistory()} disabled={loading} style={{ borderColor: "#2563eb", color: "#2563eb" }}>
            <RefreshCw size={16} />
            {loading ? 'Memuat...' : 'Segarkan'}
          </Button>
        </div>
      </div>

      {alertMessage && (
        <Alert
          type={alertType}
          message={alertMessage}
          onClose={() => setAlertMessage('')}
          dismissible
        />
      )}

      {/* Table */}
      <Card className="table-card" glass>
        <div className="table-header-bar">
          <h3>Riwayat Kehadiran</h3>
          <span className="table-count">{history.length} records</span>
        </div>

        {loading && <div className="table-card-inner"><LoadingState message="Memuat riwayat kehadiran..." /></div>}
        {!loading && history.length === 0 && (
          <div className="table-card-inner">
            <EmptyState
              icon={<CalendarDays size={34} />}
              title="Tidak ada data"
              message="Data history belum tersedia."
            />
          </div>
        )}

        {!loading && history.length > 0 && (
          <div className="table-card-inner">
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Tanggal</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Status</th>
                  </tr>
                </thead>
              <tbody>
                {history.map((record, idx) => (
                  <tr key={idx}>
                    <td>
                      <span style={{ fontWeight: 600, fontSize: "0.85rem" }}>{idx + 1}</span>
                    </td>
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
                      <span className={`status-badge status-badge--${getStatusClass(record.status)}`}>
                        {getStatusIcon(record.status)}
                        <span style={{ marginLeft: '0.35rem' }}>{record.status || '-'}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AttendanceHistoryPage;
