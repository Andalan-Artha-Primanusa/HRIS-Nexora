import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Alert } from '@/shared/ui/Alert';
import { getAllLocations, deleteLocation } from '@/features/location/api/location.service';
import type { LocationItem } from '@/features/location/types/location.types';
import { BarChart3, Edit3, MapPin, Plus, RefreshCw, Trash2 } from 'lucide-react';
import '../admin/AdminCrudPages.css';
import './LocationsPage.css';

const LocationsPage = () => {
  const navigate = useNavigate();
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'error' | 'info'>('error');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const withCoordinateCount = locations.filter((location) => {
    const lat = parseFloat(String(location.latitude || 0));
    const lng = parseFloat(String(location.longitude || 0));
    return lat !== 0 && lng !== 0;
  }).length;

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
      <Card className="locations-hero" glass>
        <div className="crud-header locations-header">
          <div className="crud-header-copy">
            <p className="crud-page-badge">Location Center</p>
            <div className="crud-header-title-row">
              <span className="crud-header-icon"><MapPin size={18} /></span>
              <h1>Location Management</h1>
            </div>
            <p>Kelola lokasi absensi dan radius untuk setiap tempat kerja dengan tampilan yang rapi, konsisten, dan mudah dipindai.</p>
          </div>
        </div>
      </Card>

      <div className="locations-summary-grid">
        <Card className="locations-summary-card" glass>
          <div className="locations-summary-header">
            <div>
              <span className="locations-summary-label">Total Lokasi</span>
              <p className="locations-summary-subtitle">Semua lokasi terdaftar</p>
            </div>
            <span className="locations-summary-icon locations-summary-icon--blue">
              <BarChart3 size={18} />
            </span>
          </div>
          <div className="locations-summary-value">{locations.length}</div>
          <div className="locations-summary-change">Data lokasi aktif</div>
        </Card>

        <Card className="locations-summary-card" glass>
          <div className="locations-summary-header">
            <div>
              <span className="locations-summary-label">Dengan Koordinat</span>
              <p className="locations-summary-subtitle">Latitude dan longitude valid</p>
            </div>
            <span className="locations-summary-icon locations-summary-icon--green">
              <MapPin size={18} />
            </span>
          </div>
          <div className="locations-summary-value">{withCoordinateCount}</div>
          <div className="locations-summary-change">Lokasi siap dipakai absensi</div>
        </Card>
      </div>

      <Card className="crud-card locations-actions-card" glass>
        <div className="locations-toolbar">
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/locations/create')}
            disabled={loading}
          >
            <Plus size={18} />
            Buat Lokasi Baru
          </Button>
          <Button
            variant="secondary"
            size="md"
            onClick={() => void loadLocations()}
            disabled={loading}
          >
            <RefreshCw size={16} />
            {loading ? 'Memuat...' : 'Segarkan'}
          </Button>
        </div>
      </Card>

      {alertMessage && (
        <Alert
          type={alertType}
          message={alertMessage}
          onClose={() => setAlertMessage('')}
          dismissible
        />
      )}

      <Card className="crud-card locations-table-card" glass>
        {locations.length > 0 ? (
          <div className="crud-table-wrap">
            <table className="crud-table locations-table">
              <thead>
                <tr>
                  <th>Nama Lokasi</th>
                  <th>Latitude</th>
                  <th>Longitude</th>
                  <th>Radius</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {locations.map((location, idx) => {
                  const loc = location as any;
                  return (
                    <tr key={String(loc.id ?? idx)}>
                      <td>
                        <div className="locations-name-cell">
                          <MapPin size={16} className="locations-name-icon" />
                          <strong>{String(loc.name || '—')}</strong>
                        </div>
                      </td>
                      <td>{parseFloat(String(loc.latitude || 0)).toFixed(6)}</td>
                      <td>{parseFloat(String(loc.longitude || 0)).toFixed(6)}</td>
                      <td>{String(loc.radius || 0)}m</td>
                      <td>
                        <div className="locations-row-actions">
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
                            className={deleteConfirm === String(loc.id) ? 'locations-delete-btn is-confirming' : 'locations-delete-btn'}
                          >
                            <Trash2 size={14} />
                          </Button>
                          {deleteConfirm === String(loc.id) && (
                            <span className="locations-confirm-delete">
                              Hapus?
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeleteConfirm(null)}
                                disabled={loading}
                                className="locations-cancel-delete"
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
          <div className="locations-empty-state">
            <MapPin size={48} className="locations-empty-icon" />
            <p>Belum ada lokasi. Buat lokasi baru untuk memulai.</p>
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/locations/create')}
            >
              <Plus size={18} />
              Buat Lokasi Pertama
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default LocationsPage;
