import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Alert } from '@/shared/ui/Alert';
import { getAllLocations, deleteLocation } from '@/features/location/api/location.service';
import type { LocationItem } from '@/features/location/types/location.types';
import { BarChart3, MapPin, Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react';
import '@/shared/styles/CrudPage.css';
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

  const summaryCards = [
    {
      label: 'Total Lokasi',
      subtitle: 'Semua lokasi terdaftar',
      value: String(locations.length),
      change: 'Data lokasi aktif',
      tone: 'blue' as const,
      icon: BarChart3,
    },
    {
      label: 'Dengan Koordinat',
      subtitle: 'Latitude dan longitude valid',
      value: String(withCoordinateCount),
      change: 'Lokasi siap dipakai absensi',
      tone: 'green' as const,
      icon: MapPin,
    },
  ];

  return (
    <div className="crud-page">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-badge">Location Center</span>
          <h1>Location Management</h1>
          <p>Kelola lokasi absensi dan radius untuk setiap tempat kerja dengan tampilan yang rapi, konsisten, dan mudah dipindai.</p>
        </div>
        <div className="page-header-actions">
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/locations/create')}
            disabled={loading}
          >
            <Plus size={16} />
            Buat Lokasi Baru
          </Button>
          <Button
            variant="outline"
            size="md"
            onClick={() => void loadLocations()}
            disabled={loading}
            style={{ borderColor: "#2563eb", color: "#2563eb" }}
          >
            <RefreshCw size={16} />
            {loading ? 'Memuat...' : 'Segarkan'}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-grid">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} className="summary-card" glass>
              <div className="summary-card__header">
                <div>
                  <span className="summary-card__label">{card.label}</span>
                  <p className="summary-card__subtitle">{card.subtitle}</p>
                </div>
                <span className={`summary-card__icon summary-card__icon--${card.tone}`}>
                  <Icon size={20} />
                </span>
              </div>
              <div className={`summary-card__value summary-card__value--${card.tone}`}>{card.value}</div>
              <div className="summary-card__change">{card.change}</div>
            </Card>
          );
        })}
      </div>

      {alertMessage && (
        <Alert
          type={alertType}
          message={alertMessage}
          onClose={() => setAlertMessage('')}
          dismissible
        />
      )}

      {/* Table */}
      <Card className="table-card" glass>
        <div className="table-header-bar">
          <h3>Data Lokasi</h3>
          <span className="table-count">{locations.length} lokasi</span>
        </div>

        {locations.length > 0 ? (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nama Lokasi</th>
                  <th>Latitude</th>
                  <th>Longitude</th>
                  <th>Radius</th>
                  <th className="th-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {locations.map((location, idx) => {
                  const loc = location as any;
                  return (
                    <tr key={String(loc.id ?? idx)}>
                      <td>
                        <div className="cell-name">
                          <div className="cell-avatar">
                            <MapPin size={14} />
                          </div>
                          <span className="cell-name-text">{String(loc.name || '—')}</span>
                        </div>
                      </td>
                      <td>{parseFloat(String(loc.latitude || 0)).toFixed(6)}</td>
                      <td>{parseFloat(String(loc.longitude || 0)).toFixed(6)}</td>
                      <td><span className="cell-tag">{String(loc.radius || 0)}m</span></td>
                      <td>
                        <div className="cell-actions">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/locations/edit/${loc.id}`)}
                            disabled={loading || deleteConfirm === String(loc.id)}
                            title="Edit"
                          >
                            <Pencil size={15} />
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
                            style={{ color: deleteConfirm === String(loc.id) ? '#ef4444' : undefined }}
                            title="Hapus"
                          >
                            <Trash2 size={15} />
                          </Button>
                          {deleteConfirm === String(loc.id) && (
                            <span style={{ fontSize: '0.8rem', color: '#ef4444', display: 'flex', alignItems: 'center' }}>
                              Hapus?{' '}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeleteConfirm(null)}
                                disabled={loading}
                                style={{ padding: '0 0.5rem' }}
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
          <div className="table-card-inner">
            <div className="empty-state">
              <MapPin size={32} style={{ opacity: 0.4 }} />
              <p>Belum ada lokasi. Buat lokasi baru untuk memulai.</p>
              <Button
                variant="primary"
                size="md"
                onClick={() => navigate('/locations/create')}
              >
                <Plus size={16} />
                Buat Lokasi Pertama
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default LocationsPage;
