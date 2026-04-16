import { useEffect, useState } from 'react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Alert } from '@/shared/ui/Alert';
import { api } from '@/shared/api/httpClient';
import { CheckCircle2, MapPin } from 'lucide-react';
import './AttendancePages.css';

const AttendanceCheckInPage = () => {
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [status, setStatus] = useState('Mendeteksi lokasi GPS...');
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'error' | 'info'>('info');

  const detectGPS = () => {
    setStatus('Mendeteksi lokasi GPS...');
    setAlertMessage('');
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
          setStatus('Lokasi GPS terdeteksi. Siap untuk check in.');
          setAlertMessage('');
        },
        (error) => {
          let msg = 'Gagal mendeteksi lokasi GPS';
          if (error.code === 1) msg = 'Akses lokasi ditolak oleh browser. Silakan izinkan akses lokasi.';
          if (error.code === 2) msg = 'Lokasi tidak tersedia.';
          if (error.code === 3) msg = 'Waktu deteksi lokasi habis.';
          
          setAlertMessage(msg);
          setAlertType('error');
          setStatus('Gagal mendeteksi lokasi GPS');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setAlertMessage('Geolocation tidak didukung oleh browser ini');
      setAlertType('error');
      setStatus('Browser tidak mendukung GPS');
    }
  };

  useEffect(() => {
    detectGPS();
  }, []);

  const handleCheckIn = async () => {
    if (latitude === null || longitude === null) {
      setStatus('Lokasi GPS belum terdeteksi');
      return;
    }

    setLoading(true);
    setStatus('Mengirim check-in...');
    setAlertMessage('');

    try {
      const now = new Date();
      await api.post('/attendance/check-in', {
        latitude,
        longitude,
      });

      setStatus('Check-in berhasil');
      setAlertMessage(`Anda telah berhasil check-in pada ${now.toLocaleTimeString('id-ID')}`);
      setAlertType('success');
    } catch (error: any) {
      setStatus('Check-in gagal');
      const message = error.response?.data?.message || error.message || 'Terjadi kesalahan';
      setAlertMessage(message);
      setAlertType('error');
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
            variant="outline" 
            size="md" 
            onClick={detectGPS} 
            disabled={loading}
          >
            Refresh GPS
          </Button>
          <Button 
            variant="primary" 
            size="md" 
            onClick={handleCheckIn} 
            disabled={loading || latitude === null || longitude === null}
          >
            {loading ? 'Mengirim...' : 'Check In Sekarang'}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AttendanceCheckInPage;
