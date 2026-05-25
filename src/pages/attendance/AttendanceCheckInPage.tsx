import { useEffect, useRef, useState } from 'react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { showToast } from '@/shared/ui/toast';
import { api } from '@/shared/api/httpClient';
import { CheckCircle2, MapPin, Building2, Clock, LogIn, Navigation, RefreshCw } from 'lucide-react';
import type { LocationItem } from '@/features/location/types/location.types';
import { getActiveLocations } from '@/features/location/api/location.service';
import '@/pages/dashboard/overview/OverviewPage.css';
import '@/pages/payroll/PayrollShared.css';
import './AttendancePages.css';

const getTextValue = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  }
  return '';
};

const getRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' ? (value as Record<string, unknown>) : {};

const AttendanceCheckInPage = () => {
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [status, setStatus] = useState('Mendeteksi lokasi GPS...');
  const [loading, setLoading] = useState(false);

  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<string>('');
  const [userDepartment, setUserDepartment] = useState<string>('');
  // const user = useAuthStore((state) => state.user);

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
          setStatus('Lokasi GPS terdeteksi. Siap untuk check in.');
        },
        (error) => {
          let msg = 'Gagal mendeteksi lokasi GPS';
          if (error.code === 1) msg = 'Akses lokasi ditolak oleh browser. Silakan izinkan akses lokasi.';
          if (error.code === 2) msg = 'Lokasi tidak tersedia.';
          if (error.code === 3) msg = 'Waktu deteksi lokasi habis.';
          
          showToast(msg, 'error');
          setStatus('Gagal mendeteksi lokasi GPS');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      showToast('Geolocation tidak didukung oleh browser ini', 'error');
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
        const department = getRecord(employeeData?.department);
        const departmentRel = getRecord(employeeData?.department_rel ?? employeeData?.departmentRel);
        const dept = getTextValue(
          department.name,
          departmentRel.name,
          employeeData?.department_name,
          typeof employeeData?.department === 'string' ? employeeData.department : '',
        );
        const assignedLocationId = employeeData?.location_id;
        
        setUserDepartment(dept);

        // 2. Get all active locations
        const locsRes = await getActiveLocations();
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
          showToast(reason, 'info');
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

    try {
      const now = new Date();
      await api.post('/attendance/check-in', {
        latitude,
        longitude,
        location_id: selectedLocationId,
      });

      setStatus('Check-in berhasil');
      showToast(`Anda telah berhasil melakukan absensi masuk pada ${now.toLocaleTimeString('id-ID')}`, 'success');
    } catch (error: any) {
      setStatus('Check-in gagal');
      const message = error.response?.data?.message || error.message || 'Terjadi kesalahan';
      showToast(message, 'error');
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
              <LogIn size={16} />
              <span>Kehadiran</span>
            </div>
            <h1 className="hero-title">Absensi Check In</h1>
            <p className="hero-subtitle">
              Pilih lokasi kerja Anda dan sistem akan memvalidasi posisi GPS Anda.
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
          <p>Lokasi Terdeteksi</p>
          <strong>{status}</strong>
        </div>
      </div>

      <Card className="attendance-form-card attendance-check-card" glass>
        <div className="attendance-form-section">
          <label className="attendance-field-label" htmlFor="attendance-location">
            <span className="attendance-field-icon"><Building2 size={16} /></span>
            <span>
              Tujuan Lokasi Kerja
              <small>Sesuai departemen: {userDepartment || 'Belum terdeteksi'}</small>
            </span>
          </label>
          <select 
            id="attendance-location"
            className="attendance-select"
            value={selectedLocationId}
            onChange={(e) => setSelectedLocationId(e.target.value)}
            disabled={loading || locations.length === 0}
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
          <div className="attendance-field">
            <label className="attendance-field-label" htmlFor="attendance-latitude">
              <span className="attendance-field-icon"><MapPin size={16} /></span>
              <span>Latitude (GPS)</span>
            </label>
            <input id="attendance-latitude" value={latitude?.toFixed(6) || 'Mendeteksi...'} disabled />
          </div>
          <div className="attendance-field">
            <label className="attendance-field-label" htmlFor="attendance-longitude">
              <span className="attendance-field-icon"><MapPin size={16} /></span>
              <span>Longitude (GPS)</span>
            </label>
            <input id="attendance-longitude" value={longitude?.toFixed(6) || 'Mendeteksi...'} disabled />
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
            onClick={handleCheckIn} 
            disabled={loading || latitude === null || longitude === null || !selectedLocationId}
          >
            <Navigation size={16} />
            {loading ? 'Mengirim...' : 'Check In Sekarang'}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AttendanceCheckInPage;
