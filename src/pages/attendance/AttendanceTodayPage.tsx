import { useEffect, useState } from 'react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Alert } from '@/shared/ui/Alert';
import { api } from '@/shared/api/httpClient';
import { Clock } from 'lucide-react';
import './AttendancePages.css';

const AttendanceTodayPage = () => {
  const [today, setToday] = useState<Record<string, any> | null>(null);
  const [status, setStatus] = useState('Memuat data hari ini...');
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'error' | 'info'>('error');

  const loadToday = async () => {
    setLoading(true);
    setStatus('Mengambil data hari ini...');
    setAlertMessage('');

    try {
      const result = await api.get('/attendance/today');
      const payload = result.data?.data ?? result.data;
      setToday(payload);
      setStatus('Attendance hari ini berhasil dimuat.');
    } catch (error: any) {
      setStatus('Gagal memuat data hari ini.');
      const message = error.response?.data?.message || error.message || 'Terjadi kesalahan';
      setAlertMessage(message);
      setAlertType('error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadToday();
  }, []);

  return (
    <div className="attendance-page">
      <div className="attendance-page-header">
        <div>
          <span className="attendance-badge">Today</span>
          <h1>Attendance Today</h1>
          <p>Ringkasan kehadiran hari ini dan waktu kerja saat ini.</p>
        </div>
        <div className="attendance-status-card">
          <Clock size={22} />
          <div>
            <p>Status</p>
            <strong>{status}</strong>
          </div>
        </div>
      </div>

      <Card className="attendance-today-card" glass>
        <div className="attendance-action-row">
          <Button variant="primary" size="sm" onClick={() => void loadToday()} disabled={loading}>
            {loading ? 'Memuat...' : 'Refresh Today'}
          </Button>
        </div>

        {alertMessage && (
          <Alert 
            type={alertType} 
            message={alertMessage}
            onClose={() => setAlertMessage('')}
            dismissible
          />
        )}

        {today ? (
          <div className="attendance-today-grid">
            {Object.entries(today).map(([key, value]) => (
              <div key={key} className="attendance-today-item">
                <span className="attendance-key">{key}</span>
                <strong>{String(value)}</strong>
              </div>
            ))}
          </div>
        ) : (
          <p className="attendance-empty">Tidak ada data untuk hari ini.</p>
        )}
      </Card>
    </div>
  );
};

export default AttendanceTodayPage;
