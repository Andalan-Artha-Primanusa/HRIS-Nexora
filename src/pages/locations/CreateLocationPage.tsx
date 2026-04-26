import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/shared/api/httpClient';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Alert } from '@/shared/ui/Alert';
import { createLocation } from '@/features/location/api/location.service';
import { MapPin, ArrowLeft, Save, MapPinned } from 'lucide-react';
import '@/shared/styles/CrudPage.css';
import '@/pages/dashboard/overview/OverviewPage.css';
import '@/pages/payroll/PayrollShared.css';
import './LocationForm.css';

const CreateLocationPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    latitude: '',
    longitude: '',
    radius: '100',
    department: '',
  });
  const [departments, setDepartments] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'error' | 'info'>('info');
  const [locationDetected, setLocationDetected] = useState(false);

  useEffect(() => {
    // Detect GPS
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            latitude: position.coords.latitude.toFixed(6),
            longitude: position.coords.longitude.toFixed(6),
          }));
          setLocationDetected(true);
          setAlertMessage('');
        },
        (err) => {
          setAlertMessage(`Gagal mendeteksi lokasi: ${err.message}`);
          setAlertType('error');
          setLocationDetected(false);
        }
      );
    } else {
      setAlertMessage('Geolocation tidak didukung oleh browser ini');
      setAlertType('error');
      setLocationDetected(false);
    }

    // Fetch Departments for selection
    const fetchDepartments = async () => {
      try {
        const response = await api.get('/organization/master-data');
        if (response.data && response.data.data && Array.isArray(response.data.data.departments)) {
          setDepartments(response.data.data.departments);
          if (response.data.data.departments.length > 0) {
            setFormData(prev => ({ ...prev, department: response.data.data.departments[0] }));
          }
        }
      } catch (err) {
        console.error('Failed to fetch departments:', err);
      }
    };

    void fetchDepartments();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setAlertMessage('Nama lokasi wajib diisi');
      setAlertType('error');
      return false;
    }
    if (!formData.department) {
      setAlertMessage('Departemen wajib dipilih');
      setAlertType('error');
      return false;
    }
    if (!formData.latitude) {
      setAlertMessage('Latitude wajib diisi');
      setAlertType('error');
      return false;
    }
    if (!formData.longitude) {
      setAlertMessage('Longitude wajib diisi');
      setAlertType('error');
      return false;
    }
    if (!formData.radius || parseFloat(formData.radius) <= 0) {
      setAlertMessage('Radius harus lebih dari 0');
      setAlertType('error');
      return false;
    }
    return true;
  };

  const handleCreateLocation = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setAlertMessage('');

    try {
      await createLocation({
        name: formData.name,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        radius: parseFloat(formData.radius),
        department: formData.department,
      });

      setAlertMessage('Lokasi berhasil dibuat!');
      setAlertType('success');
      setTimeout(() => {
        navigate('/locations');
      }, 1500);
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Gagal membuat lokasi';
      setAlertMessage(message);
      setAlertType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/locations');
  };

  return (
    <div className="crud-page">
      <Card className="hero-card">
        <div className="hero-card-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <MapPinned size={16} />
              <span>Location Center</span>
            </div>
            <h1 className="hero-title">Buat Lokasi Baru</h1>
            <p className="hero-subtitle">
              Tambahkan lokasi absensi dengan koordinat GPS dan radius.
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn-outline" onClick={handleCancel}>
              <ArrowLeft size={16} />
              Kembali
            </button>
            <button className="btn-primary" onClick={() => void handleCreateLocation()} disabled={loading}>
              <Save size={16} />
              {loading ? 'Menyimpan...' : 'Simpan Lokasi'}
            </button>
          </div>
        </div>
      </Card>

      <div className="white-unified-wrapper" style={{ maxWidth: '800px', margin: '0 auto' }}>
        {alertMessage && (
          <Alert 
            type={alertType} 
            message={alertMessage}
            onClose={() => setAlertMessage('')}
            dismissible
          />
        )}

        <form className="location-form" onSubmit={(e) => { e.preventDefault(); void handleCreateLocation(); }}>
          {/* Nama Lokasi */}
          <div className="location-form-group">
            <label htmlFor="name" className="location-label">
              Nama Lokasi
              <span className="location-required">*</span>
            </label>
            <input
              id="name"
              type="text"
              name="name"
              className="location-input"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Contoh: Office Jakarta Pusat, Warehouse Bandung"
              disabled={loading}
            />
            <p className="location-hint">Berikan nama yang deskriptif untuk lokasi ini</p>
          </div>

          {/* Departemen */}
          <div className="location-form-group">
            <label htmlFor="department" className="location-label">
              Departemen
              <span className="location-required">*</span>
            </label>
            <select
              id="department"
              name="department"
              className="location-input"
              value={formData.department}
              onChange={handleInputChange}
              disabled={loading}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}
            >
              <option value="">Pilih Departemen</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
              <option value="All Departments">All Departments (Global)</option>
            </select>
            <p className="location-hint">Pilih departemen yang memiliki akses ke lokasi ini</p>
          </div>

          {/* GPS Coordinates */}
          <div className="location-form-row">
            <div className="location-form-group location-form-group-half">
              <label htmlFor="latitude" className="location-label">
                <MapPin size={16} />
                Latitude
                <span className="location-required">*</span>
              </label>
              <div className="location-input-wrapper">
                <input
                  id="latitude"
                  type="text"
                  name="latitude"
                  className="location-input"
                  value={formData.latitude}
                  onChange={handleInputChange}
                  placeholder="-6.200000"
                  disabled
                />
                {locationDetected && (
                  <span className="location-badge location-badge-success">
                    Terdeteksi
                  </span>
                )}
              </div>
            </div>

            <div className="location-form-group location-form-group-half">
              <label htmlFor="longitude" className="location-label">
                <MapPin size={16} />
                Longitude
                <span className="location-required">*</span>
              </label>
              <div className="location-input-wrapper">
                <input
                  id="longitude"
                  type="text"
                  name="longitude"
                  className="location-input"
                  value={formData.longitude}
                  onChange={handleInputChange}
                  placeholder="106.816666"
                  disabled
                />
                {locationDetected && (
                  <span className="location-badge location-badge-success">
                    Terdeteksi
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Radius */}
          <div className="location-form-group">
            <label htmlFor="radius" className="location-label">
              Radius Absensi
              <span className="location-required">*</span>
            </label>
            <div className="location-input-wrapper">
              <input
                id="radius"
                type="number"
                name="radius"
                className="location-input"
                value={formData.radius}
                onChange={handleInputChange}
                placeholder="100"
                min="1"
                disabled={loading}
              />
              <span className="location-unit">meter</span>
            </div>
            <p className="location-hint">Jarak maksimal karyawan dari lokasi untuk check-in</p>
          </div>

          {/* Action Buttons */}
          <div className="location-form-actions">
            <Button 
              variant="primary"
              size="lg"
              onClick={handleCreateLocation}
              disabled={loading}
            >
              {loading ? 'Membuat...' : 'Buat Lokasi'}
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={handleCancel}
              disabled={loading}
            >
              Batal
            </Button>
          </div>
        </form>
      </Card>

      {/* Info Preview */}
      <Card className="location-info-card" glass>
        <h3 className="location-info-title">Preview Lokasi</h3>
        <div className="location-info-grid">
          <div className="location-info-item">
            <span className="location-info-label">Nama</span>
            <span className="location-info-value">{formData.name || '—'}</span>
          </div>
          <div className="location-info-item">
            <span className="location-info-label">Departemen</span>
            <span className="location-info-value">{formData.department || '—'}</span>
          </div>
          <div className="location-info-item">
            <span className="location-info-label">Latitude</span>
            <span className="location-info-value">
              {formData.latitude ? parseFloat(formData.latitude).toFixed(6) : '—'}
            </span>
          </div>
          <div className="location-info-item">
            <span className="location-info-label">Longitude</span>
            <span className="location-info-value">
              {formData.longitude ? parseFloat(formData.longitude).toFixed(6) : '—'}
            </span>
          </div>
          <div className="location-info-item">
            <span className="location-info-label">Radius</span>
            <span className="location-info-value">{formData.radius} m</span>
          </div>
        </div>

        {formData.latitude && formData.longitude && (
          <a
            href={`https://maps.google.com/?q=${formData.latitude},${formData.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="location-maps-link"
          >
            Buka di Google Maps →
          </a>
        )}
        </Card>
      </div>
    </div>
  );
};

export default CreateLocationPage;
