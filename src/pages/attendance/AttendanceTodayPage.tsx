import { useEffect, useState } from 'react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { api } from '@/shared/api/httpClient';
import { CalendarDays, Clock } from 'lucide-react';
import './AttendancePages.css';

const AttendanceTodayPage = () => {
  const [today, setToday] = useState<Record<string, any> | null>(null);
  const [responseText, setResponseText] = useState('');
  const [status, setStatus] = useState('Memuat data hari ini...');
  const [loading, setLoading] = useState(false);

  const loadToday = async () => {
    setLoading(true);
    setStatus('Mengambil data hari ini...');

    try {
      const result = await api.get('/attendance/today');
      const payload = result.data?.data ?? result.data;
      setToday(payload);
      setResponseText(JSON.stringify(payload, null, 2));
      setStatus('Attendance hari ini berhasil dimuat.');
    } catch (error: any) {
      setStatus('Gagal memuat data hari ini.');
      setResponseText(JSON.stringify(error.response?.data ?? error.message ?? 'Terjadi kesalahan', null, 2));
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
          <Button variant="secondary" size="sm" onClick={() => setResponseText('')}>
            Clear Response
          </Button>
        </div>

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

        <div className="attendance-response-panel">
          <h2>Raw Response</h2>
          <pre>{responseText || 'Response akan tampil di sini.'}</pre>
        </div>
      </Card>
    </div>
  );
};

export default AttendanceTodayPage;
