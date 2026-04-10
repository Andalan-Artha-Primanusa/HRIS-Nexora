import { useEffect, useState } from 'react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Alert } from '@/shared/ui/Alert';
import { api } from '@/shared/api/httpClient';
import { CheckCircle2, MapPin } from 'lucide-react';
import './AttendancePages.css';

const AttendanceCheckOutPage = () => {
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [status, setStatus] = useState('Mendeteksi lokasi GPS...');
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'error' | 'info'>('info');

  // Auto-capture GPS location on page load
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
          setStatus('Lokasi GPS terdeteksi. Siap untuk check out.');
          setAlertMessage('');
        },
        (error) => {
          setAlertMessage(error.message);
          setAlertType('error');
          setStatus('Gagal mendeteksi lokasi GPS');
        }
      );
    } else {
      setAlertMessage('Geolocation tidak didukung oleh browser ini');
      setAlertType('error');
      setStatus('Browser tidak mendukung GPS');
    }
  }, []);

  const handleCheckOut = async () => {
    if (latitude === null || longitude === null) {
      setStatus('Lokasi GPS belum terdeteksi');
      return;
    }

    setLoading(true);
    setStatus('Mengirim check-out...');
    setSuccessMessage('');

    try {
      const now = new Date();
      await api.post('/attendance/check-out', {
        latitude,
        longitude,
      });
      setStatus('Check-out berhasil');
      setSuccessMessage(`✓ Anda telah berhasil check-out pada ${now.toLocaleTimeString('id-ID')}`);
    } catch (error: any) {
      setStatus('Check-out gagal');
      setSuccessMessage(`✗ ${error.response?.data?.message || error.message || 'Terjadi kesalahan'}`);
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
          <p>Lokasi akan secara otomatis ditangkap dari GPS perangkat Anda.</p>
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
        {alertMessage && (
          <Alert 
            type={alertType} 
            message={alertMessage}
            onClose={() => setAlertMessage('')}
            dismissible
          />
        )}

        <div className="attendance-form-grid">
          <label>
            <MapPin size={18} style={{ display: 'inline', marginRight: '0.5rem' }} />
            Latitude (GPS)
            <input value={latitude?.toFixed(6) || 'Mendeteksi...'} disabled style={{ backgroundColor: '#f5f5f5' }} />
          </label>
          <label>
            <MapPin size={18} style={{ display: 'inline', marginRight: '0.5rem' }} />
            Longitude (GPS)
            <input value={longitude?.toFixed(6) || 'Mendeteksi...'} disabled style={{ backgroundColor: '#f5f5f5' }} />
          </label>
        </div>

        <div className="attendance-action-row">
          <Button 
            variant="primary" 
            size="md" 
            onClick={handleCheckOut} 
            disabled={loading || latitude === null || longitude === null}
          >
            {loading ? 'Mengirim...' : 'Check Out Sekarang'}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AttendanceCheckOutPage;
