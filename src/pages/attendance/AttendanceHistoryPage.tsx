import { useEffect, useState } from 'react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { api } from '@/shared/api/httpClient';
import { CalendarDays, Clock } from 'lucide-react';
import './AttendancePages.css';

const AttendanceHistoryPage = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [responseText, setResponseText] = useState('');
  const [status, setStatus] = useState('Memuat riwayat attendance...');
  const [loading, setLoading] = useState(false);

  const loadHistory = async () => {
    setLoading(true);
    setStatus('Mengambil data history...');

    try {
      const result = await api.get('/attendance/history');
      const payload = result.data?.data ?? result.data;
      setHistory(Array.isArray(payload) ? payload : [payload]);
      setResponseText(JSON.stringify(payload, null, 2));
      setStatus('History attendance berhasil dimuat.');
    } catch (error: any) {
      setStatus('Gagal memuat history.');
      setResponseText(JSON.stringify(error.response?.data ?? error.message ?? 'Terjadi kesalahan', null, 2));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadHistory();
  }, []);

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
          <Button variant="secondary" size="sm" onClick={() => setResponseText('')}>
            Clear Response
          </Button>
        </div>

        <div className="attendance-table-wrapper">
          {history.length > 0 ? (
            <table className="attendance-table">
              <thead>
                <tr>
                  {Object.keys(history[0]).map((column) => (
                    <th key={column}>{column}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.map((row, idx) => (
                  <tr key={idx}>
                    {Object.values(row).map((value, cellIdx) => (
                      <td key={`${idx}-${cellIdx}`}>{String(value)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="attendance-empty">Data history belum tersedia.</p>
          )}
        </div>

        <div className="attendance-response-panel">
          <h2>Raw Response</h2>
          <pre>{responseText || 'Response akan tampil di sini.'}</pre>
        </div>
      </Card>
    </div>
  );
};

export default AttendanceHistoryPage;
