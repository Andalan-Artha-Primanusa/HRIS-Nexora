import { useEffect, useState } from 'react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Alert } from '@/shared/ui/Alert';
import { api } from '@/shared/api/httpClient';
import { CheckCircle2, MapPin, Clock, LogOut } from 'lucide-react';
import '@/pages/dashboard/overview/OverviewPage.css';
import '@/pages/payroll/PayrollShared.css';
import './AttendancePages.css';

const AttendanceCheckOutPage = () => {
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
          setStatus('Lokasi GPS terdeteksi. Siap untuk check out.');
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

  const handleCheckOut = async () => {
    if (latitude === null || longitude === null) {
      setStatus('Lokasi GPS belum terdeteksi');
      return;
    }

    setLoading(true);
    setStatus('Mengirim check-out...');
    setAlertMessage('');

    try {
      const now = new Date();
      const response = await api.post('/attendance/check-out', {
        latitude,
        longitude,
      });
      setStatus('Check-out berhasil');

      const overtimeReq = response.data?.data?.overtime_request;
      let msg = `✓ Anda telah berhasil check-out pada ${now.toLocaleTimeString('id-ID')}`;
      if (overtimeReq) {
        const mins = overtimeReq.overtime_minutes || 0;
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        msg += ` | ⏰ Lembur terdeteksi: ${h}j ${m}m — Menunggu Persetujuan`;
      }

      setAlertMessage(msg);
      setAlertType('success');
    } catch (error: any) {
      setStatus('Check-out gagal');
      setAlertMessage(`✗ ${error.response?.data?.message || error.message || 'Terjadi kesalahan'}`);
      setAlertType('error');
    } finally {
      setLoading(false);
    }
  };

return (
    <div className="crud-page attendance-page">
      <Card className="hero-card">
        <div className="hero-card-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <LogOut size={16} />
              <span>Kehadiran</span>
            </div>
            <h1 className="hero-title">Absensi Check Out</h1>
            <p className="hero-subtitle">
              Lokasi akan secara otomatis ditangkap dari GPS perangkat Anda.
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn-outline" onClick={detectGPS}>
              <Clock size={16} />
              Deteksi Lokasi
            </button>
          </div>
        </div>
      </Card>

<Card className="attendance-form-card" glass>
        <div className="attendance-status-card">
          <CheckCircle2 size={22} />
          <div>
            <p>Status</p>
            <strong>{status}</strong>
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
