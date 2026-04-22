import { useEffect, useState } from 'react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Alert } from '@/shared/ui/Alert';
import { api } from '@/shared/api/httpClient';
import { CheckCircle2, MapPin, Building2 } from 'lucide-react';
import type { LocationItem } from '@/features/location/types/location.types';
import { getAllLocations } from '@/features/location/api/location.service';
// import { useAuthStore } from '@/app/store/auth.store';
import './AttendancePages.css';

const AttendanceCheckInPage = () => {
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [status, setStatus] = useState('Mendeteksi lokasi GPS...');
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'error' | 'info'>('info');
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<string>('');
  const [userDepartment, setUserDepartment] = useState<string>('');
  // const user = useAuthStore((state) => state.user);

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

    // Fetch User Profile and Locations
    const initData = async () => {
      try {
        // 1. Get user profile for department and direct location assignment
        const profileRes = await api.get('/me');
        const employeeData = profileRes.data?.data?.employee;
        const dept = employeeData?.department || '';
        const assignedLocationId = employeeData?.location_id;
        
        setUserDepartment(dept);

        // 2. Get all locations
        const locsRes = await getAllLocations();
        const allLocs = locsRes.items;
        
        // 3. Filtering Logic:
        // Priority 1: Direct assignment (location_id)
        // Priority 2: Department-based matches + "All Departments"
        
        let filtered: LocationItem[] = [];
        
        if (assignedLocationId) {
          // If employee has a direct assignment, show it plus global locations
          filtered = allLocs.filter(loc => 
            String(loc.id) === String(assignedLocationId) || 
            loc.department === 'All Departments'
          );
          
          // Ensure the assigned one is first
          filtered.sort((a) => String(a.id) === String(assignedLocationId) ? -1 : 1);
        } else {
          // Fallback to department-based filtering
          filtered = allLocs.filter(loc => 
            !loc.department || 
            loc.department === 'All Departments' || 
            loc.department === dept
          );
        }

        setLocations(filtered);
        
        if (filtered.length > 0) {
          // If we have an assigned location, select it. otherwise select the first one.
          const defaultLoc = assignedLocationId 
            ? filtered.find(l => String(l.id) === String(assignedLocationId)) || filtered[0]
            : filtered[0];
          setSelectedLocationId(String(defaultLoc.id));
        } else {
          const reason = assignedLocationId 
            ? `Lokasi penugasan Anda (ID: ${assignedLocationId}) tidak ditemukan.`
            : `Departemen Anda (${dept || 'Belum diatur'}) belum memiliki lokasi absensi yang ditugaskan.`;
          setAlertMessage(reason);
          setAlertType('warning' as any);
        }
      } catch (err) {
        console.error('Failed to initialize attendance data:', err);
      }
    };

    void initData();
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
        location_id: selectedLocationId,
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
          <p>Pilih lokasi kerja Anda dan sistem akan memvalidasi posisi GPS Anda.</p>
        </div>
        <div className="attendance-status-card">
          <CheckCircle2 size={22} />
          <div>
            <p>Lokasi Terdeteksi</p>
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

        <div className="attendance-form-section">
          <label className="attendance-label">
            <Building2 size={18} style={{ display: 'inline', marginRight: '0.5rem' }} />
            Tujuan Lokasi Kerja (Sesuai Departemen: {userDepartment || '...'})
          </label>
          <select 
            className="attendance-input"
            value={selectedLocationId}
            onChange={(e) => setSelectedLocationId(e.target.value)}
            disabled={loading || locations.length === 0}
            style={{ width: '100%', marginBottom: '1.5rem', appearance: 'auto' }}
          >
            {locations.length === 0 ? (
              <option value="">Tidak ada lokasi tersedia</option>
            ) : (
              locations.map(loc => (
                <option key={loc.id} value={loc.id}>
                  {loc.name} ({loc.radius}m radius)
                </option>
              ))
            )}
          </select>
        </div>

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
            disabled={loading || latitude === null || longitude === null || !selectedLocationId}
          >
            {loading ? 'Mengirim...' : 'Check In Sekarang'}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AttendanceCheckInPage;
