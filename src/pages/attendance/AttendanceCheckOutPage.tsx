import { useEffect, useState } from 'react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { api } from '@/shared/api/httpClient';
import { CheckCircle2, MapPin, AlertCircle } from 'lucide-react';
import './AttendancePages.css';

const AttendanceCheckOutPage = () => {
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [status, setStatus] = useState('Mendeteksi lokasi GPS...');
  const [loading, setLoading] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [checkOutTime, setCheckOutTime] = useState('');

  // Auto-capture GPS location on page load
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
          setStatus('Lokasi GPS terdeteksi. Siap untuk check out.');
          setLocationError('');
        },
        (error) => {
          setLocationError(`Error: ${error.message}`);
          setStatus('Gagal mendeteksi lokasi GPS');
        }
      );
    } else {
      setLocationError('Geolocation tidak didukung oleh browser ini');
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
      const result = await api.post('/attendance/check-out', {
        latitude,
        longitude,
      });
      setCheckOutTime(now.toLocaleString('id-ID'));
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
        {locationError && (
          <div style={{ padding: '1rem', backgroundColor: '#ffe0e0', borderRadius: '0.5rem', marginBottom: '1rem', color: '#c41e3a', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <AlertCircle size={20} />
            {locationError}
          </div>
        )}

        {successMessage && (
          <div style={{ padding: '1rem', backgroundColor: successMessage.startsWith('✓') ? '#e8f5e9' : '#ffebee', borderRadius: '0.5rem', marginBottom: '1rem', color: successMessage.startsWith('✓') ? '#2e7d32' : '#c41e3a', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            {successMessage}
          </div>
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
