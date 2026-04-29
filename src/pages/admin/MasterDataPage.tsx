import React, { useEffect, useMemo, useState } from 'react';
import { Plus, RefreshCw, Edit, Trash2, Search, Building2, Users, MapPin, Briefcase, Database, CheckCircle, XCircle } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { LoadingState, ErrorState, EmptyState } from '@/shared/ui/DataStateDisplay';
import { api } from '@/shared/api/httpClient';
import '@/shared/styles/CrudPage.css';
import '@/pages/dashboard/overview/OverviewPage.css';
import '@/pages/payroll/PayrollShared.css';
import './MasterDataPage.css';

interface MasterDataItem {
  id: number;
  name: string;
  code: string;
  description: string;
  is_active: boolean;
  parent_id?: number;
  // Position fields
  level?: string;
  department_id?: number;
  // Location fields
  address?: string;
  timezone?: string;
  latitude?: string;
  longitude?: string;
  radius?: string;
}

const MasterDataPage: React.FC = () => {
  const [departments, setDepartments] = useState<MasterDataItem[]>([]);
  const [positions, setPositions] = useState<MasterDataItem[]>([]);
  const [locations, setLocations] = useState<MasterDataItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'department' | 'position' | 'location'>('department');

  // Search & Filter
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MasterDataItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    is_active: true,
    // Position fields
    level: 'Mid',
    department_id: '',
    // Location fields
    address: '',
    timezone: 'Asia/Jakarta',
    latitude: '',
    longitude: '',
    radius: '',
  });

  const fetchData = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const [deptRes, posRes, locRes] = await Promise.all([
        api.get('/departments'),
        api.get('/positions'),
        api.get('/locations')
      ]);

      const deptData = Array.isArray(deptRes.data) ? deptRes.data : Array.isArray(deptRes.data?.data) ? deptRes.data.data : [];
      const posData = Array.isArray(posRes.data) ? posRes.data : Array.isArray(posRes.data?.data) ? posRes.data.data : [];
      const locData = Array.isArray(locRes.data) ? locRes.data : Array.isArray(locRes.data?.data) ? locRes.data.data : [];

      setDepartments(deptData);
      setPositions(posData);
      setLocations(locData);
    } catch (err) {
      console.error(err);
      setErrorMessage('Gagal memuat master data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getCurrentData = () => {
    switch (activeTab) {
      case 'department': return departments;
      case 'position': return positions;
      case 'location': return locations;
      default: return [];
    }
  };

  const setCurrentData = (data: MasterDataItem[]) => {
    switch (activeTab) {
      case 'department': setDepartments(data); break;
      case 'position': setPositions(data); break;
      case 'location': setLocations(data); break;
    }
  };

  const getApiEndpoint = () => {
    switch (activeTab) {
      case 'department': return '/departments';
      case 'position': return '/positions';
      case 'location': return '/locations';
    }
  };

  const currentData = getCurrentData();

  // Filter & Sort & Paginate
  const filteredData = useMemo(() => {
    return currentData.filter((item) => {
      const searchStr = searchText.toLowerCase();
      const nameMatch = item.name?.toLowerCase().includes(searchStr);
      const codeMatch = item.code?.toLowerCase().includes(searchStr);
      return nameMatch || codeMatch;
    });
  }, [currentData, searchText]);

  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      const nameA = a.name?.toLowerCase() || '';
      const nameB = b.name?.toLowerCase() || '';
      return nameA.localeCompare(nameB);
    });
  }, [filteredData]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  const clearFilters = () => {
    setSearchText('');
    setCurrentPage(1);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, activeTab]);

  const handleOpenModal = (item?: MasterDataItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        code: item.code || '',
        description: item.description || '',
        is_active: item.is_active,
        level: item.level || 'Mid',
        department_id: item.department_id?.toString() || '',
        address: item.address || '',
        timezone: item.timezone || 'Asia/Jakarta',
        latitude: item.latitude || '',
        longitude: item.longitude || '',
        radius: item.radius || '',
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        code: '',
        description: '',
        is_active: true,
        level: 'Mid',
        department_id: '',
        address: '',
        timezone: 'Asia/Jakarta',
        latitude: '',
        longitude: '',
        radius: '',
      });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      const endpoint = getApiEndpoint();
      
      if (editingItem) {
        await api.put(`${endpoint}/${editingItem.id}`, formData);
      } else {
        await api.post(endpoint, formData);
      }
      
      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to save');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm(`Are you sure you want to delete this ${activeTab}?`)) {
      try {
        const endpoint = getApiEndpoint();
        await api.delete(`${endpoint}/${id}`);
        fetchData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const tabs = [
    { key: 'department', label: 'Departments', icon: Building2, data: departments },
    { key: 'position', label: 'Positions', icon: Briefcase, data: positions },
    { key: 'location', label: 'Locations', icon: MapPin, data: locations },
  ] as const;

  const activeTabData = tabs.find(t => t.key === activeTab);

  // Summary stats
  const totalCount = departments.length + positions.length + locations.length;
  const activeCount = currentData.filter((item) => item.is_active).length;

  const summaryCards = useMemo(
    () => [
      {
        label: 'Total Data',
        subtitle: 'Semua master data',
        value: String(totalCount),
        change: 'Data tersimpan di sistem',
        tone: 'blue' as const,
        icon: Database,
      },
      {
        label: 'Hasil Filter',
        subtitle: 'Data sesuai pencarian',
        value: String(sortedData.length),
        change: `${paginatedData.length} data per halaman`,
        tone: 'green' as const,
        icon: Search,
      },
      {
        label: activeTab === 'department' ? 'Departemen' : activeTab === 'position' ? 'Posisi' : 'Lokasi',
        subtitle: `Total ${activeTab}`,
        value: String(currentData.length),
        change: 'Data aktif',
        tone: activeTab === 'department' ? 'orange' as const : activeTab === 'position' ? 'purple' as const : 'red' as const,
        icon: activeTabData?.icon || Database,
      },
      {
        label: 'Status Active',
        subtitle: 'Data berstatus aktif',
        value: String(activeCount),
        change: 'Siap digunakan',
        tone: 'green' as const,
        icon: CheckCircle,
      },
    ],
    [totalCount, activeCount, currentData.length, sortedData.length, paginatedData.length, activeTab]
  );

  return (
    <div className="crud-page">
      {/* Header */}
      <Card className="hero-card">
        <div className="hero-card-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <Database size={16} />
              <span>Organization</span>
            </div>
            <h1 className="hero-title">Master Data</h1>
            <p className="hero-subtitle">
              Kelola data inti organisasi: departemen, posisi, dan lokasi.
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn-outline" onClick={fetchData} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Segarkan
            </button>
            <button className="btn-primary" onClick={() => handleOpenModal()}>
              <Plus size={16} />
              Tambah {activeTab === 'department' ? 'Departemen' : activeTab === 'position' ? 'Posisi' : 'Lokasi'}
            </button>
          </div>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="employee-summary-wrapper">
        {summaryCards.map((card) => {
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
        <div className="analytics-title-inner">
          <div className="analytics-icon">
            <Database size={24} />
          </div>
          <div>
            <h2 className="analytics-title">{activeTabData?.label}</h2>
            <p className="analytics-subtitle">Kelola dan lihat semua {activeTab}</p>
          </div>
        </div>
      </Card>

      {/* Control Section */}
      <Card className="control-section-card">
        <div className="control-section-inner">
          {/* Tabs */}
          <div className="elyra-tabs">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                className={`elyra-tab ${activeTab === tab.key ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.key as any)}
              >
                <tab.icon size={16} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="control-actions">
            <div className="search-box">
              <div className="search-icon-inside"><Search size={18} /></div>
              <input
                type="text"
                placeholder={`Cari ${activeTab}...`}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="search-input-pill"
              />
            </div>
            {(searchText) && (
              <button className="btn-clear-filter" onClick={clearFilters}>
                Hapus Filter
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Table Section */}
      <div className="table-section">
        <div className="wuw-table-area">
          {loading && <LoadingState message={`Memuat ${activeTab}...`} />}
          {!loading && errorMessage && <ErrorState message="Koneksi Terputus" error={errorMessage} onRetry={fetchData} />}

          {!loading && !errorMessage && paginatedData.length === 0 && (
            <div style={{ padding: '5rem 0' }}>
              <EmptyState
                title="Pencarian Kosong"
                message="Kami tidak menemukan data yang sesuai dengan kriteria Anda."
                actionLabel="Bersihkan Filter"
                onAction={clearFilters}
              />
            </div>
          )}

          {!loading && !errorMessage && paginatedData.length > 0 && (
            <>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Nama</th>
                      <th>Kode</th>
                      <th>Deskripsi</th>
                      <th>Status</th>
                      <th className="th-center" style={{ width: '120px' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <div className="cell-name">
                            <div className="cell-avatar">
                              {activeTab === 'department' && <Building2 size={18} />}
                              {activeTab === 'position' && <Briefcase size={18} />}
                              {activeTab === 'location' && <MapPin size={18} />}
                            </div>
                            <div className="cell-stacked">
                              <span className="cell-name-text">{item.name}</span>
                              <span className="cell-stacked__sub">{item.code || '-'}</span>
                            </div>
                          </div>
                        </td>
                        <td><span className="badge-soft badge-soft--blue">{item.code || '-'}</span></td>
                        <td className="cell-description">{item.description || '-'}</td>
                        <td>
                          <span className={`badge-soft badge-soft--${item.is_active ? 'green' : 'red'}`}>
                            {item.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="td-center">
                          <div className="action-btn-group">
                            <button
                              className="action-btn action-btn-edit"
                              onClick={() => handleOpenModal(item)}
                              title="Edit"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              className="action-btn action-btn-delete"
                              onClick={() => handleDelete(item.id)}
                              title="Hapus"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="table-pagination">
                <div className="pagination-info">
                  Menampilkan <strong>{paginatedData.length}</strong> dari <strong>{sortedData.length}</strong> data
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

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingItem ? `Edit ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}` : `Add New ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Name <span className="required">*</span></label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={`Enter ${activeTab} name`}
                />
              </div>
              
              <div className="form-group">
                <label>Code</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g., DEPT-001"
                />
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={`Describe this ${activeTab}...`}
                  rows={3}
                />
              </div>

              {activeTab === 'position' && (
                <>
                  <div className="form-group">
                    <label>Level</label>
                    <select
                      value={formData.level}
                      onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    >
                      <option value="Junior">Junior</option>
                      <option value="Mid">Mid</option>
                      <option value="Senior">Senior</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Department</label>
                    <select
                      value={formData.department_id}
                      onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {activeTab === 'location' && (
                <>
                  <div className="form-group">
                    <label>Address</label>
                    <textarea
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Enter full address"
                      rows={3}
                    />
                  </div>
                  <div className="form-group">
                    <label>Timezone</label>
                    <select
                      value={formData.timezone}
                      onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                    >
                      <option value="Asia/Jakarta">Asia/Jakarta</option>
                      <option value="Asia/Singapore">Asia/Singapore</option>
                      <option value="UTC">UTC</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Latitude <span className="required">*</span></label>
                    <input
                      type="number"
                      step="any"
                      value={formData.latitude}
                      onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                      placeholder="-6.200000"
                    />
                  </div>
                  <div className="form-group">
                    <label>Longitude <span className="required">*</span></label>
                    <input
                      type="number"
                      step="any"
                      value={formData.longitude}
                      onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                      placeholder="106.816666"
                    />
                  </div>
                  <div className="form-group">
                    <label>Radius (meters) <span className="required">*</span></label>
                    <input
                      type="number"
                      value={formData.radius}
                      onChange={(e) => setFormData({ ...formData, radius: e.target.value })}
                      placeholder="100"
                    />
                  </div>
                </>
              )}
              
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
                <span>Active</span>
              </label>
            </div>
            <div className="modal-footer">
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleSave}>
                {editingItem ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterDataPage;