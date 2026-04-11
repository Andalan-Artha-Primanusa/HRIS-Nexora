import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Alert } from '@/shared/ui/Alert';
import { getAllLocations, deleteLocation } from '@/features/location/api/location.service';
import type { LocationItem } from '@/features/location/types/location.types';
import { MapPin, Trash2, Edit3, Plus } from 'lucide-react';
import '../admin/AdminCrudPages.css';

const LocationsPage = () => {
  const navigate = useNavigate();
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'error' | 'info'>('error');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const loadLocations = async () => {
    setLoading(true);
    setAlertMessage('');

    try {
      const result = await getAllLocations();
      setLocations(result.items);
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Gagal memuat locations';
      setAlertMessage(message);
      setAlertType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      await deleteLocation(id);
      await loadLocations();
      setDeleteConfirm(null);
      setAlertMessage('Location berhasil dihapus.');
      setAlertType('success');
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Gagal menghapus location';
      setAlertMessage(message);
      setAlertType('error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadLocations();
  }, []);

  return (
    <div className="crud-page">
      <div className="crud-header">
        <div>
          <h1>Location Management</h1>
          <p>Kelola lokasi absensi dan radius untuk setiap tempat kerja.</p>
        </div>
      </div>

      {/* Statistics Card */}
      <Card className="crud-card" glass style={{ marginBottom: '2rem' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#0066cc' }}>
              {locations.length}
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>
              Total Lokasi
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#2e7d32' }}>
              {locations.filter((l) => {
                const lat = parseFloat(String(l.latitude || 0));
                const lng = parseFloat(String(l.longitude || 0));
                return lat !== 0 && lng !== 0;
              }).length}
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>
              dengan Koordinat
            </div>
          </div>
        </div>
      </Card>

      {/* Create Button */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem' }}>
        <Button
          variant="primary"
          size="md"
          onClick={() => navigate('/locations/create')}
          disabled={loading}
        >
          <Plus size={18} style={{ marginRight: '0.5rem' }} />
          Buat Lokasi Baru
        </Button>
        <Button
          variant="secondary"
          size="md"
          onClick={() => void loadLocations()}
          disabled={loading}
        >
          {loading ? 'Memuat...' : 'Refresh'}
        </Button>
      </div>

      {/* Error Message */}
      {alertMessage && (
        <Alert 
          type={alertType} 
          message={alertMessage}
          onClose={() => setAlertMessage('')}
          dismissible
        />
      )}

      {/* Locations Table */}
      <Card className="crud-card" glass>
        {locations.length > 0 ? (
          <div className="crud-table-wrap">
            <table className="crud-table">
              <thead>
                <tr>
                  <th>Nama Lokasi</th>
                  <th>Latitude</th>
                  <th>Longitude</th>
                  <th>Radius</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {locations.map((location, idx) => {
                  const loc = location as any;
                  return (
                  <tr key={String(loc.id ?? idx)}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <MapPin size={16} style={{ color: '#0066cc' }} />
                        <strong>{String(loc.name || '—')}</strong>
                      </div>
                    </td>
                    <td>{parseFloat(String(loc.latitude || 0)).toFixed(6)}</td>
                    <td>{parseFloat(String(loc.longitude || 0)).toFixed(6)}</td>
                    <td>{String(loc.radius || 0)}m</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/locations/edit/${loc.id}`)}
                          disabled={loading || deleteConfirm === String(loc.id)}
                        >
                          <Edit3 size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (deleteConfirm === String(loc.id)) {
                              void handleDelete(String(loc.id));
                            } else {
                              setDeleteConfirm(String(loc.id));
                            }
                          }}
                          disabled={loading}
                          style={{
                            color: deleteConfirm === String(loc.id) ? '#c41e3a' : 'var(--color-text-secondary)',
                          }}
                        >
                          <Trash2 size={14} />
                        </Button>
                        {deleteConfirm === String(loc.id) && (
                          <span
                            style={{
                              fontSize: '0.8rem',
                              color: '#c41e3a',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                          >
                            Hapus?{' '}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteConfirm(null)}
                              disabled={loading}
                              style={{ padding: '0 0.5rem', color: 'var(--color-text-secondary)' }}
                            >
                              Batal
                            </Button>
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <MapPin size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
            <p style={{ color: 'var(--color-text-disabled)', marginBottom: '1rem' }}>Belum ada lokasi. Buat lokasi baru untuk memulai.</p>
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/locations/create')}
            >
              <Plus size={18} style={{ marginRight: '0.5rem' }} />
              Buat Lokasi Pertama
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default LocationsPage;
