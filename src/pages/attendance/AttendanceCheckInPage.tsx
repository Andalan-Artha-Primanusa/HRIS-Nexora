import { useState } from 'react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { api } from '@/shared/api/httpClient';
import { MapPin, CheckCircle2 } from 'lucide-react';
import './AttendancePages.css';

const AttendanceCheckInPage = () => {
  const [latitude, setLatitude] = useState('-6.200000');
  const [longitude, setLongitude] = useState('106.816666');
  const [responseText, setResponseText] = useState('');
  const [status, setStatus] = useState('Siap melakukan check in');
  const [loading, setLoading] = useState(false);

  const handleCheckIn = async () => {
    setLoading(true);
    setStatus('Mengirim check-in...');
    setResponseText('');

    try {
      const result = await api.post('/attendance/check-in', {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      });

      setStatus('Check-in berhasil');
      setResponseText(JSON.stringify(result.data ?? result.data?.data, null, 2));
    } catch (error: any) {
      setStatus('Check-in gagal');
      setResponseText(JSON.stringify(error.response?.data ?? error.message ?? 'Terjadi kesalahan', null, 2));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="attendance-page">
      <div className="attendance-page-header">
        <div>
          <span className="attendance-badge">Check In</span>
          <h1>Attendance Check In</h1>
          <p>Masukkan koordinat lokasi saat ini, kemudian tekan tombol untuk mencatat kehadiran.</p>
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
        <div className="attendance-form-grid">
          <label>
            Latitude
            <input value={latitude} onChange={(e) => setLatitude(e.target.value)} />
          </label>
          <label>
            Longitude
            <input value={longitude} onChange={(e) => setLongitude(e.target.value)} />
          </label>
        </div>

        <div className="attendance-action-row">
          <Button variant="primary" size="md" onClick={handleCheckIn} disabled={loading}>
            {loading ? 'Mengirim...' : 'Check In Sekarang'}
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

export default AttendanceCheckInPage;
