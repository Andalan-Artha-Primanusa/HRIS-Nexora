import { useEffect, useRef, useState } from 'react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { showToast } from '@/shared/ui/toast';
import { api } from '@/shared/api/httpClient';
import { CheckCircle2, MapPin, Clock, LogOut, RefreshCw } from 'lucide-react';
import '@/pages/dashboard/overview/OverviewPage.css';
import '@/pages/payroll/PayrollShared.css';
import './AttendancePages.css';

const AttendanceCheckOutPage = () => {
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [status, setStatus] = useState('Mendeteksi lokasi GPS...');
  const [loading, setLoading] = useState(false);

  const gpsFired = useRef(false);

  const detectGPS = (force = false) => {
    if (gpsFired.current && !force) return;
    gpsFired.current = true;
    setStatus('Mendeteksi lokasi GPS...');

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
          setStatus('Lokasi GPS terdeteksi. Siap untuk check out.');
        },
        (error) => {
          let msg = 'Gagal mendeteksi lokasi GPS';
          if (error.code === 1) msg = 'Akses lokasi ditolak oleh browser. Silakan izinkan akses lokasi.';
          if (error.code === 2) msg = 'Lokasi tidak tersedia.';
          if (error.code === 3) msg = 'Waktu deteksi lokasi habis.';

          showToast(msg, 'error');
          setStatus('Gagal mendeteksi lokasi GPS');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
      );
    } else {
      showToast('Geolocation tidak didukung oleh browser ini', 'error');
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
    try {
      const now = new Date();
      const response = await api.post('/attendance/check-out', {
        latitude,
        longitude,
      });
      setStatus('Check-out berhasil');

      const overtimeReq = response.data?.data?.overtime_request;
      let msg = `Anda telah berhasil check-out pada ${now.toLocaleTimeString('id-ID')}`;
      if (overtimeReq) {
        const mins = overtimeReq.overtime_minutes || 0;
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        msg += ` | Lembur terdeteksi: ${h}j ${m}m - Menunggu Persetujuan`;
      }

      showToast(msg, 'success');
    } catch (error: any) {
      setStatus('Check-out gagal');
      showToast(error.response?.data?.message || error.message || 'Terjadi kesalahan', 'error');
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
            <button className="btn-outline" onClick={() => detectGPS(true)}>
              <Clock size={16} />
              Deteksi Lokasi
            </button>
          </div>
        </div>
      </Card>

      <div className="attendance-status-card">
        <CheckCircle2 size={22} />
        <div>
          <p>Status</p>
          <strong>{status}</strong>
        </div>
      </div>

      <Card className="attendance-form-card attendance-check-card" glass>
        <div className="attendance-form-grid">
          <div className="attendance-field">
            <label className="attendance-field-label" htmlFor="attendance-checkout-latitude">
              <span className="attendance-field-icon">
                <MapPin size={16} />
              </span>
              <span>Latitude (GPS)</span>
            </label>
            <input id="attendance-checkout-latitude" value={latitude?.toFixed(6) || 'Mendeteksi...'} disabled />
          </div>

          <div className="attendance-field">
            <label className="attendance-field-label" htmlFor="attendance-checkout-longitude">
              <span className="attendance-field-icon">
                <MapPin size={16} />
              </span>
              <span>Longitude (GPS)</span>
            </label>
            <input id="attendance-checkout-longitude" value={longitude?.toFixed(6) || 'Mendeteksi...'} disabled />
          </div>
        </div>

        <div className="attendance-action-row">
          <Button
            variant="outline"
            size="md"
            onClick={() => detectGPS(true)}
            disabled={loading}
          >
            <RefreshCw size={16} />
            Refresh GPS
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handleCheckOut}
            disabled={loading || latitude === null || longitude === null}
          >
            <LogOut size={16} />
            {loading ? 'Mengirim...' : 'Check Out Sekarang'}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AttendanceCheckOutPage;
