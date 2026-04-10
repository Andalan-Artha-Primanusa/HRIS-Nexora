import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Alert } from '@/shared/ui/Alert';
import { getLocationDetail, updateLocation } from '@/features/location/api/location.service';
import type { LocationUpdatePayload } from '@/features/location/types/location.types';
import { MapPin, ArrowLeft } from 'lucide-react';
import './LocationForm.css';

const EditLocationPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    latitude: '',
    longitude: '',
    radius: '100',
  });
  const [loading, setLoading] = useState(true);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'error' | 'info'>('info');

  useEffect(() => {
    const loadDetail = async () => {
      if (!id) {
        setAlertMessage('Location ID tidak ditemukan');
        setAlertType('error');
        setLoading(false);
        return;
      }

      try {
        const result = await getLocationDetail(id);
        const payload = result.payload as Record<string, any>;
        
        setFormData({
          name: payload.name || '',
          latitude: String(payload.latitude || ''),
          longitude: String(payload.longitude || ''),
          radius: String(payload.radius || '100'),
        });
        setAlertMessage('');
      } catch (err: any) {
        const message = err.response?.data?.message || err.message || 'Gagal memuat data lokasi';
        setAlertMessage(message);
        setAlertType('error');
      } finally {
        setLoading(false);
      }
    };

    void loadDetail();
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    if (!formData.radius || parseFloat(formData.radius) <= 0) {
      setAlertMessage('Radius harus lebih dari 0');
      setAlertType('error');
      return false;
    }
    return true;
  };

  const handleUpdateLocation = async () => {
    if (!validateForm() || !id) return;

    setLoading(true);
    setAlertMessage('');

    try {
      const payload: LocationUpdatePayload = {
        name: formData.name,
        radius: parseFloat(formData.radius),
      };

      await updateLocation(id, payload);
      setAlertMessage('Lokasi berhasil diupdate!');
      setAlertType('success');
      setTimeout(() => {
        navigate('/locations');
      }, 1500);
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Gagal mengupdate lokasi';
      setAlertMessage(message);
      setAlertType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/locations');
  };

  if (loading && !formData.name) {
    return (
      <div className="location-form-container">
        <div className="location-form-header">
          <button className="location-back-button" onClick={handleCancel} aria-label="Kembali">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1>Edit Lokasi</h1>
            <p>Memuat data lokasi...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="location-form-container">
      {/* Header */}
      <div className="location-form-header">
        <button className="location-back-button" onClick={handleCancel} aria-label="Kembali">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1>Edit Lokasi</h1>
          <p>Perbarui informasi lokasi absensi</p>
        </div>
      </div>

      {/* Form Card */}
      <Card className="location-form-card" glass>
        {alertMessage && (
          <Alert 
            type={alertType} 
            message={alertMessage}
            onClose={() => setAlertMessage('')}
            dismissible
          />
        )}

        <form className="location-form" onSubmit={(e) => { e.preventDefault(); void handleUpdateLocation(); }}>
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
                  disabled
                />
                <span className="location-badge location-badge-success">
                  ✓ Tetap
                </span>
              </div>
              <p className="location-hint">Tidak dapat dirubah setelah pembuatan</p>
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
                  disabled
                />
                <span className="location-badge location-badge-success">
                  ✓ Tetap
                </span>
              </div>
              <p className="location-hint">Tidak dapat dirubah setelah pembuatan</p>
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
              onClick={handleUpdateLocation}
              disabled={loading}
            >
              {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
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
        <h3 className="location-info-title">Informasi Lokasi</h3>
        <div className="location-info-grid">
          <div className="location-info-item">
            <span className="location-info-label">Nama</span>
            <span className="location-info-value">{formData.name || '—'}</span>
          </div>
          <div className="location-info-item">
            <span className="location-info-label">Radius</span>
            <span className="location-info-value">{formData.radius} m</span>
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

export default EditLocationPage;
