import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Alert } from '@/shared/ui/Alert';
import { getAllLocations, deleteLocation } from '@/features/location/api/location.service';
import type { LocationItem } from '@/features/location/types/location.types';
import { BarChart3, MapPin, Pencil, Plus, RefreshCw, Trash2, MapPinned } from 'lucide-react';
import '@/shared/styles/CrudPage.css';
import '@/pages/dashboard/overview/OverviewPage.css';
import '@/pages/payroll/PayrollShared.css';
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
      <Card className="hero-card">
        <div className="hero-card-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <MapPinned size={16} />
              <span>Location Center</span>
            </div>
            <h1 className="hero-title">Location Management</h1>
            <p className="hero-subtitle">
              Kelola lokasi absensi dan radius untuk setiap tempat kerja.
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn-outline" onClick={() => void loadLocations()} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              {loading ? 'Memuat...' : 'Segarkan'}
            </button>
            <button className="btn-primary" onClick={() => navigate('/locations/create')} disabled={loading}>
              <Plus size={16} />
              Buat Lokasi Baru
            </button>
          </div>
        </div>
      </Card>

      <div className="leave-requests-wrapper">
        <div className="leave-summary-card">
          <div className="leave-summary-header">
            <div>
              <p className="leave-summary-label">Total Lokasi</p>
              <p className="leave-summary-subtitle">Semua lokasi terdaftar</p>
            </div>
            <div className="leave-summary-icon-wrapper leave-icon-blue">
              <BarChart3 size={28} />
            </div>
          </div>
          <div className="leave-summary-value leave-value-blue">{locations.length}</div>
          <p className="leave-summary-trend">Data lokasi aktif</p>
        </div>

        <div className="leave-summary-card">
          <div className="leave-summary-header">
            <div>
              <p className="leave-summary-label">Dengan Koordinat</p>
              <p className="leave-summary-subtitle">Latitude dan longitude valid</p>
            </div>
            <div className="leave-summary-icon-wrapper leave-icon-green">
              <MapPin size={28} />
            </div>
          </div>
          <div className="leave-summary-value leave-value-green">{withCoordinateCount}</div>
          <p className="leave-summary-trend">Lokasi siap absensi</p>
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

      <div className="white-unified-wrapper">
        <div className="wuw-header">
          <div className="wuw-header-top">
            <div className="wuw-title-area">
              <h3>Data Lokasi</h3>
              <span className="wuw-count-badge">{locations.length} lokasi</span>
            </div>
          </div>
        </div>

        <div className="wuw-table-area">
          {locations.length > 0 ? (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nama Lokasi</th>
                    <th>Departemen</th>
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
                            <span className="cell-name-text">{loc.name || "N/A"}</span>
                          </div>
                        </td>
                        <td>
                          <span className="cell-tag" style={{ backgroundColor: '#f0f4ff', color: '#1e40af' }}>
                            {String(loc.department || 'All Departments')}
                          </span>
                        </td>
                        <td>{parseFloat(String(loc.latitude || 0)).toFixed(6)}</td>
                        <td>{parseFloat(String(loc.longitude || 0)).toFixed(6)}</td>
                        <td><span className="cell-tag">{String(loc.radius || 0)}m</span></td>
                        <td>
                          <div className="action-btn-group">
                            <button
                              className="action-btn action-btn-edit"
                              onClick={() => navigate(`/locations/edit/${loc.id}`)}
                              disabled={loading || deleteConfirm === String(loc.id)}
                              title="Edit"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              className="action-btn action-btn-delete"
                              onClick={() => {
                                if (deleteConfirm === String(loc.id)) {
                                  void handleDelete(String(loc.id));
                                } else {
                                  setDeleteConfirm(String(loc.id));
                                }
                              }}
                              disabled={loading}
                              title="Hapus"
                            >
                              <Trash2 size={16} />
                            </button>
                            {deleteConfirm === String(loc.id) && (
                              <span style={{ fontSize: '0.8rem', color: '#ef4444', display: 'flex', alignItems: 'center' }}>
                                Hapus?{' '}
                                <button
                                  className="action-btn"
                                  onClick={() => setDeleteConfirm(null)}
                                  disabled={loading}
                                  style={{ padding: '4px 8px', fontSize: '0.75rem', background: '#f1f5f9', color: '#64748b' }}
                                >
                                  Batal
                                </button>
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
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationsPage;