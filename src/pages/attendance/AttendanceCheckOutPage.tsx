import { useState } from 'react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { api } from '@/shared/api/httpClient';
import { Clock, CheckCircle2 } from 'lucide-react';
import './AttendancePages.css';

const AttendanceCheckOutPage = () => {
  const [responseText, setResponseText] = useState('');
  const [status, setStatus] = useState('Siap melakukan check out');
  const [loading, setLoading] = useState(false);

  const handleCheckOut = async () => {
    setLoading(true);
    setStatus('Mengirim check-out...');
    setResponseText('');

    try {
      const result = await api.post('/attendance/check-out');
      setStatus('Check-out berhasil');
      setResponseText(JSON.stringify(result.data ?? result.data?.data, null, 2));
    } catch (error: any) {
      setStatus('Check-out gagal');
      setResponseText(JSON.stringify(error.response?.data ?? error.message ?? 'Terjadi kesalahan', null, 2));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="attendance-page">
      <div className="attendance-page-header">
        <div>
          <span className="attendance-badge">Check Out</span>
          <h1>Attendance Check Out</h1>
          <p>Catat jam pulang Anda dengan satu klik ke API check-out tanpa data lokasi.</p>
        </div>
        <div className="attendance-status-card">
          <CheckCircle2 size={22} />
          <div>
            <p>Status</p>
            <strong>{status}</strong>
          </div>
        </div>
      </div>

      <Card className="attendance-form-card" glass>
        <div className="attendance-action-row">
          <Button variant="primary" size="md" onClick={handleCheckOut} disabled={loading}>
            {loading ? 'Mengirim...' : 'Check Out Sekarang'}
          </Button>
          <Button variant="secondary" size="md" onClick={() => setResponseText('')}>
            Clear Response
          </Button>
        </div>

        <div className="attendance-response-panel">
          <h2>Response</h2>
          <pre>{responseText || 'Response akan tampil di sini.'}</pre>
        </div>
      </Card>
    </div>
  );
};

export default AttendanceCheckOutPage;
