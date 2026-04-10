import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { createLocation } from '@/features/location/api/location.service';
import { MapPin, AlertCircle, Check, ArrowLeft } from 'lucide-react';
import './LocationForm.css';

const CreateLocationPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    latitude: '',
    longitude: '',
    radius: '100',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [locationDetected, setLocationDetected] = useState(false);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            latitude: position.coords.latitude.toFixed(6),
            longitude: position.coords.longitude.toFixed(6),
          }));
          setLocationDetected(true);
          setError('');
        },
        (err) => {
          setError(`GPS Error: ${err.message}`);
          setLocationDetected(false);
        }
      );
    } else {
      setError('Geolocation tidak didukung oleh browser ini');
      setLocationDetected(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('Nama lokasi wajib diisi');
      return false;
    }
    if (!formData.latitude) {
      setError('Latitude wajib diisi');
      return false;
    }
    if (!formData.longitude) {
      setError('Longitude wajib diisi');
      return false;
    }
    if (!formData.radius || parseFloat(formData.radius) <= 0) {
      setError('Radius harus lebih dari 0');
      return false;
    }
    return true;
  };

  const handleCreateLocation = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await createLocation({
        name: formData.name,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        radius: parseFloat(formData.radius),
      });

      setSuccess('✓ Lokasi berhasil dibuat!');
      setTimeout(() => {
        navigate('/locations');
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Gagal membuat lokasi');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/locations');
  };

  return (
    <div className="location-form-container">
      {/* Header */}
      <div className="location-form-header">
        <button className="location-back-button" onClick={handleCancel} aria-label="Kembali">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1>Buat Lokasi Baru</h1>
          <p>Tambahkan lokasi absensi dengan koordinat GPS dan radius</p>
        </div>
      </div>

      {/* Form Card */}
      <Card className="location-form-card" glass>
        {error && (
          <div className="location-alert location-alert-error">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="location-alert location-alert-success">
            <Check size={20} />
            <span>{success}</span>
          </div>
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
                    ✓ Terdeteksi
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
                    ✓ Terdeteksi
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
  );
};

export default CreateLocationPage;
