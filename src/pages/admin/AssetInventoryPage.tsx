import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, RefreshCw, Package, Search, Filter, Laptop, Monitor, Smartphone, Briefcase, Calendar, User, Tag, Trash2, Pencil, CheckCircle2, AlertCircle, XCircle, TrendingUp, Clock } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { LoadingState, EmptyState } from '@/shared/ui/DataStateDisplay';
import { assetService } from '@/features/assets/api/asset.service';
import '@/shared/styles/CrudPage.css';
import '@/pages/dashboard/overview/OverviewPage.css';
import './AssetInventoryPage.css';

const formatDateTime = (input: string) => {
  if (!input) return 'N/A';
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return input;
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(date);
};

const getAssetIcon = (category: string) => {
  const c = category?.toLowerCase() || '';
  if (c.includes('laptop') || c.includes('macbook') || c.includes('electronics')) return Laptop;
  if (c.includes('mobile') || c.includes('phone') || c.includes('smartphone')) return Smartphone;
  if (c.includes('monitor') || c.includes('display')) return Monitor;
  return Briefcase;
};

const AssetInventoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter & Pagination State
  const [activeTab, setActiveTab] = useState<"Semua" | "Available" | "Assigned" | "Maintenance" | "Retired">("Semua");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [showFilters, setShowFilters] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await assetService.getAssets();
      
      // assetService.getAssets() returns api.get('/assets').data
      // So response = { success, message, data: { current_page, data: [...], total } }
      // The assets array is in response.data.data
      let assetsArray: any[] = [];
      
      if (response?.data?.data && Array.isArray(response.data.data)) {
        // Paginated response structure
        assetsArray = response.data.data;
      } else if (response?.data && Array.isArray(response.data)) {
        // Direct array in response.data
        assetsArray = response.data;
      } else if (Array.isArray(response)) {
        // Direct array response
        assetsArray = response;
      }
      
      console.log('Assets loaded:', assetsArray.length, 'items');
      setAssets(assetsArray);
    } catch (error) {
      console.error('Failed to fetch assets:', error);
      setAssets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter Logic
  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      const searchStr = searchQuery.toLowerCase();
      const nameMatch = asset.name?.toLowerCase().includes(searchStr);
      const codeMatch = asset.code?.toLowerCase().includes(searchStr);
      const serialMatch = asset.serial_number?.toLowerCase().includes(searchStr);
      const brandMatch = asset.brand?.toLowerCase().includes(searchStr);
      const textMatch = nameMatch || codeMatch || serialMatch || brandMatch;

      let statusMatch = true;
      if (activeTab === "Available") statusMatch = asset.status?.toLowerCase() === 'available';
      else if (activeTab === "Assigned") statusMatch = asset.status?.toLowerCase() === 'assigned';
      else if (activeTab === "Maintenance") statusMatch = asset.status?.toLowerCase() === 'maintenance';
      else if (activeTab === "Retired") statusMatch = asset.status?.toLowerCase() === 'retired';

      return textMatch && statusMatch;
    });
  }, [assets, searchQuery, activeTab]);

  // Sort by purchase date (newest first)
  const sortedAssets = useMemo(() => {
    return [...filteredAssets].sort((a, b) => {
      const dateA = new Date(a.purchase_date || 0).getTime();
      const dateB = new Date(b.purchase_date || 0).getTime();
      return dateB - dateA;
    });
  }, [filteredAssets]);

  // Paginate
  const paginatedAssets = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedAssets.slice(startIndex, startIndex + pageSize);
  }, [sortedAssets, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedAssets.length / pageSize);

  // Summary Cards
  const summaryCards = useMemo(() => [
    {
      label: "Total Aset",
      subtitle: "Seluruh aset perusahaan",
      value: String(assets.length),
      change: "Data aset tersimpan",
      tone: "blue" as const,
      icon: Package,
    },
    {
      label: "Hasil Filter",
      subtitle: "Aset sesuai pencarian",
      value: String(sortedAssets.length),
      change: `${paginatedAssets.length} data per halaman`,
      tone: "green" as const,
      icon: Search,
    },
    {
      label: "Tersedia",
      subtitle: "Aset yang tersedia",
      value: String(assets.filter(a => a.status?.toLowerCase() === 'available').length),
      change: "Siap digunakan",
      tone: "orange" as const,
      icon: CheckCircle2,
    },
    {
      label: "Digunakan",
      subtitle: "Aset yang sedang digunakan",
      value: String(assets.filter(a => a.status?.toLowerCase() === 'assigned').length),
      change: "Dalam penggunaan",
      tone: "purple" as const,
      icon: User,
    },
  ], [assets, sortedAssets.length, paginatedAssets.length]);

  const clearFilters = () => {
    setSearchQuery('');
    setActiveTab("Semua");
    setCurrentPage(1);
  };

  const handleDelete = async (id: string | number, name: string) => {
    if (!window.confirm(`Hapus aset "${name}"? Tindakan ini tidak dapat dibatalkan.`)) return;
    try {
      await assetService.deleteAsset(id);
      fetchData();
    } catch (error) {
      console.error('Failed to delete asset:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; class: string }> = {
      'available': { label: 'Tersedia', class: 'badge-soft--green' },
      'assigned': { label: 'Digunakan', class: 'badge-soft--blue' },
      'maintenance': { label: 'Maintenance', class: 'badge-soft--yellow' },
      'retired': { label: 'Retired', class: 'badge-soft--gray' },
    };
    const info = statusMap[status?.toLowerCase()] || { label: status, class: 'badge-soft--gray' };
    return (
      <span className={`badge-soft ${info.class}`}>
        {info.label}
      </span>
    );
  };

  return (
    <div className="crud-page asset-page">
      {/* Header */}
      <Card className="hero-card">
        <div className="hero-card-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <Package size={16} />
              <span>Inventaris Perusahaan</span>
            </div>
            <h1 className="hero-title">Aset & Properti</h1>
            <p className="hero-subtitle">
              Pantau distribusi, kondisi, dan status kepemilikan aset perusahaan secara terpusat.
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn-outline" onClick={() => fetchData()} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Segarkan
            </button>
            <button className="btn-primary" onClick={() => navigate('/inventory/assets/create')}>
              <Plus size={16} />
              Tambah Aset
            </button>
          </div>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="asset-summary-wrapper">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="asset-summary-card">
              <div className="asset-summary-header">
                <div>
                  <p className="asset-summary-label">{card.label}</p>
                  <p className="asset-summary-subtitle">{card.subtitle}</p>
                </div>
                <div className={`asset-summary-icon-wrapper asset-icon-${card.tone}`}>
                  <Icon size={28} />
                </div>
              </div>
              <div className={`asset-summary-value asset-value-${card.tone}`}>{card.value}</div>
              <p className="asset-summary-trend">{card.change}</p>
            </div>
          );
        })}
      </div>

      {/* Analytics Title Card */}
      <Card className="analytics-title-card">
        <div className="analytics-title-inner">
          <div className="analytics-icon">
            <Package size={24} />
          </div>
          <div>
            <h2 className="analytics-title">Daftar Aset</h2>
            <p className="analytics-subtitle">Kelola dan lihat semua aset perusahaan</p>
          </div>
        </div>
      </Card>

      {/* Control Section */}
      <Card className="control-section-card">
        <div className="control-section-inner">
          {/* Tabs */}
          <div className="elyra-tabs">
            {(["Semua", "Available", "Assigned", "Maintenance", "Retired"] as const).map((tab) => (
              <button
                key={tab}
                className={`elyra-tab ${activeTab === tab ? "active" : ""}`}
                onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search & Filter */}
          <div className="control-actions">
            <div className="search-box">
              <div className="search-icon-inside"><Search size={18} /></div>
              <input
                type="text"
                placeholder="Cari aset..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="search-input-pill"
              />
            </div>
            <button
              className={`filter-btn-rounded ${showFilters ? "active" : ""}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={18} />
              <span>Filter</span>
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="filter-dropdown">
            <div className="filter-row">
              {(searchQuery || activeTab !== "Semua") && (
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
          {loading && <LoadingState message="Memuat aset..." />}

          {!loading && paginatedAssets.length === 0 && (
            <div style={{ padding: '5rem 0' }}>
              <EmptyState
                title="Pencarian Kosong"
                message="Kami tidak menemukan aset yang sesuai dengan kriteria Anda."
                actionLabel="Bersihkan Filter"
                onAction={clearFilters}
              />
            </div>
          )}

          {!loading && paginatedAssets.length > 0 && (
            <>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '400px' }}>Aset</th>
                      <th>Kode</th>
                      <th>Kategori</th>
                      <th>Brand</th>
                      <th>Tanggal Beli</th>
                      <th className="th-center">Status</th>
                      <th className="th-center" style={{ width: '120px' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedAssets.map((asset) => {
                      const IconComponent = getAssetIcon(asset.category);
                      const holderName = asset.current_holder?.user?.name ||
                                        asset.current_holder?.full_name ||
                                        asset.current_holder?.name ||
                                        'Tersedia di Gudang';
                      return (
                        <tr key={asset.id}>
                          <td>
                            <div className="cell-name">
                              <div className="cell-avatar">
                                <IconComponent size={20} />
                              </div>
                              <div className="cell-stacked">
                                <span className="cell-name-text">{asset.name}</span>
                                <span className="cell-stacked__sub">{asset.serial_number || 'No SN'}</span>
                              </div>
                            </div>
                          </td>
                          <td><span style={{ color: '#475569', fontWeight: 600 }}>{asset.code || "-"}</span></td>
                          <td><span className="badge-soft badge-soft--purple">{asset.category || "-"}</span></td>
                          <td><span style={{ color: '#64748b', fontWeight: 500 }}>{asset.brand || "-"}</span></td>
                          <td>
                            <div className="cell-stacked">
                              <span className="cell-stacked__main" style={{ fontSize: '0.85rem' }}>{formatDateTime(asset.purchase_date)}</span>
                              <span className="cell-stacked__sub">Tanggal beli</span>
                            </div>
                          </td>
                          <td className="td-center">
                            {getStatusBadge(asset.status)}
                          </td>
                          <td className="td-center">
                            <div className="action-btn-group">
                              <button
                                className="action-btn action-btn-edit"
                                onClick={() => navigate(`/inventory/assets/edit/${asset.id}`)}
                                title="Edit"
                              >
                                <Pencil size={16} />
                              </button>
                              <button
                                className="action-btn action-btn-delete"
                                onClick={() => handleDelete(asset.id, asset.name)}
                                title="Hapus"
                              >
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
                  Menampilkan <strong>{paginatedAssets.length}</strong> dari <strong>{sortedAssets.length}</strong> aset
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
    </div>
  );
};

export default AssetInventoryPage;
