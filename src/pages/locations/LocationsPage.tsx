import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, ConfirmDialog } from '@/shared/ui';
import { Button } from '@/shared/ui/Button';
import { LoadingState, EmptyState } from '@/shared/ui/DataStateDisplay';
import { getAllLocations, deleteLocation } from '@/features/location/api/location.service';
import type { LocationItem } from '@/features/location/types/location.types';
import { MapPinned, Pencil, Plus, RefreshCw, Trash2, MapPin, Search, Filter } from 'lucide-react';
import '@/shared/styles/CrudPage.css';
import '@/pages/dashboard/overview/OverviewPage.css';
import './LocationsPage.css';

const LocationsPage = () => {
  const navigate = useNavigate();
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<LocationItem | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Search & Filter State
  const [searchText, setSearchText] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // Extract unique departments for filter
  const uniqueDepartments = useMemo(() => {
    return Array.from(new Set(locations.map((loc) => (loc as any).department).filter(Boolean))).sort();
  }, [locations]);

  // Filter & Paginate Logic
  const filteredLocations = useMemo(() => {
    return locations.filter((location) => {
      const loc = location as any;
      const searchStr = searchText.toLowerCase();
      const nameMatch = loc.name?.toLowerCase().includes(searchStr);
      const idMatch = String(loc.id).includes(searchStr);
      const textMatch = !searchText || nameMatch || idMatch;

      const deptMatch = !selectedDepartment || loc.department === selectedDepartment;

      return textMatch && deptMatch;
    });
  }, [locations, searchText, selectedDepartment]);

  const paginatedLocations = filteredLocations;

  const [totalPages, setTotalPages] = useState(1);

  const withCoordinateCount = locations.filter((location) => {
    const lat = parseFloat(String((location as any).latitude || 0));
    const lng = parseFloat(String((location as any).longitude || 0));
    return lat !== 0 && lng !== 0;
  }).length;

  const locationSummaryCards = useMemo(
    () => [
      {
        label: 'Total Lokasi',
        subtitle: 'Semua lokasi terdaftar',
        value: String(locations.length),
        change: 'Data lokasi aktif',
        tone: 'blue' as const,
        icon: MapPinned,
      },
      {
        label: 'Hasil Filter',
        subtitle: 'Lokasi sesuai pencarian',
        value: String(filteredLocations.length),
        change: `${paginatedLocations.length} data per halaman`,
        tone: 'green' as const,
        icon: Search,
      },
      {
        label: 'Dengan Koordinat',
        subtitle: 'Latitude dan longitude valid',
        value: String(withCoordinateCount),
        change: 'Lokasi siap absensi',
        tone: 'orange' as const,
        icon: MapPin,
      },
    ],
    [locations.length, filteredLocations.length, paginatedLocations.length, withCoordinateCount]
  );

  const clearFilters = () => {
    setSearchText('');
    setSelectedDepartment('');
    setCurrentPage(1);
  };

  const loadLocations = async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const result = await getAllLocations();
      setLocations(result.items);
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Gagal memuat locations';
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      await deleteLocation(String((deleteTarget as any).id));
      await loadLocations();
      setErrorMessage(null);
      setDeleteTarget(null);
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Gagal menghapus location';
      setErrorMessage(message);
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    void loadLocations();
  }, []);

  // Reset page on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, selectedDepartment]);

  return (
    <div className="crud-page">
      {/* Header */}
      <Card className="hero-card">
        <div className="hero-card-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <MapPinned size={16} />
              <span>Location Center</span>
            </div>
            <h1 className="hero-title">Daftar Lokasi</h1>
            <p className="hero-subtitle">Kelola lokasi absensi dan radius untuk setiap tempat kerja.</p>
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

      {/* Summary Cards */}
      <div className="employee-summary-wrapper">
        {locationSummaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="employee-summary-card">
              <div className="employee-summary-header">
                <div>
                  <p className="employee-summary-label">{card.label}</p>
                  <p className="employee-summary-subtitle">{card.subtitle}</p>
                </div>
                <div className={`employee-summary-icon-wrapper employee-icon-${card.tone}`}>
                  <Icon size={28} />
                </div>
              </div>
              <div className={`employee-summary-value employee-value-${card.tone}`}>{card.value}</div>
              <p className="employee-summary-trend">{card.change}</p>
            </div>
          );
        })}
      </div>

      {/* Analytics Title Card */}
      <Card className="analytics-title-card">
        <CardHeader
          icon={MapPinned}
          title="Daftar Lokasi"
          subtitle="Kelola dan lihat semua lokasi"
          iconColor="#1d4ed8"
          iconBgColor="#dbeafe"
        />
      </Card>

      {/* Control Section */}
      <Card className="control-section-card">
        <div className="control-section-inner">
          <div className="control-actions">
            <div className="search-box">
              <div className="search-icon-inside">
                <Search size={18} />
              </div>
              <input
                type="text"
                placeholder="Cari lokasi..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="search-input-pill"
              />
            </div>
            <button className={`filter-btn-rounded ${showFilters ? 'active' : ''}`} onClick={() => setShowFilters(!showFilters)}>
              <Filter size={18} />
              <span>Filter</span>
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="filter-dropdown">
            <div className="filter-row">
              <div className="filter-group">
                <label>Departemen</label>
                <select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)} className="filter-select-premium">
                  <option value="">Semua Departemen</option>
                  {uniqueDepartments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
              {(searchText || selectedDepartment) && (
                <button className="btn-clear-filter" onClick={clearFilters}>
                  Hapus Filter
                </button>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* Table Section */}
      <div className="table-section">
        <div className="wuw-table-area">
          {loading && <LoadingState message="Memuat lokasi..." />}

          {!loading && errorMessage && (
            <div className="error-state-container">
              <div className="error-state">
                <p className="error-state-title">Koneksi Terputus</p>
                <p className="error-state-message">{errorMessage}</p>
                <button className="btn-primary" onClick={() => void loadLocations()}>
                  Coba Lagi
                </button>
              </div>
            </div>
          )}

          {!loading && !errorMessage && paginatedLocations.length === 0 && (
            <div style={{ padding: '5rem 0' }}>
              <EmptyState
                title="Lokasi Kosong"
                message={searchText || selectedDepartment ? 'Tidak ada lokasi yang sesuai dengan kriteria Anda.' : 'Belum ada lokasi. Buat lokasi baru untuk memulai.'}
                actionLabel="Buat Lokasi Baru"
                onAction={() => navigate('/locations/create')}
              />
            </div>
          )}

          {!loading && !errorMessage && paginatedLocations.length > 0 && (
            <>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '400px' }}>Nama Lokasi</th>
                      <th>Departemen</th>
                      <th>Latitude</th>
                      <th>Longitude</th>
                      <th>Radius</th>
                      <th className="th-center" style={{ width: '120px' }}>
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedLocations.map((location, idx) => {
                      const loc = location as any;
                      return (
                        <tr key={String(loc.id ?? idx)}>
                          <td>
                            <div className="cell-name">
                              <div className="cell-avatar">
                                {loc.name ? loc.name.charAt(0).toUpperCase() : <MapPin size={14} />}
                              </div>
                              <div className="cell-stacked">
                                <span className="cell-name-text">{loc.name || 'N/A'}</span>
                                <span className="cell-stacked__sub">{loc.id}</span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="badge-soft badge-soft--blue">{String(loc.department || 'All Departments')}</span>
                          </td>
                          <td>{parseFloat(String(loc.latitude || 0)).toFixed(6)}</td>
                          <td>{parseFloat(String(loc.longitude || 0)).toFixed(6)}</td>
                          <td>
                            <span className="badge-soft badge-soft--orange">{String(loc.radius || 0)}m</span>
                          </td>
                          <td className="td-center">
                            <div className="action-btn-group">
                              <button className="action-btn action-btn-edit" onClick={() => navigate(`/locations/edit/${loc.id}`)} title="Edit">
                                <Pencil size={16} />
                              </button>
                              <button className="action-btn action-btn-delete" onClick={() => setDeleteTarget(location)} title="Hapus">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="table-pagination">
                <div className="pagination-info">
                  Menampilkan <strong>{paginatedLocations.length}</strong> dari <strong>{filteredLocations.length}</strong> lokasi
                </div>
                <div className="pagination-controls">
                  <button
                    className="pagination-btn"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    ‹
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    className="pagination-btn"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    ›
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Hapus Lokasi"
        message={`Lokasi "${String((deleteTarget as any)?.name || "ini")}" akan dihapus. Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus"
        cancelLabel="Batal"
        loading={deleting}
        onConfirm={() => void handleDelete()}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default LocationsPage;
