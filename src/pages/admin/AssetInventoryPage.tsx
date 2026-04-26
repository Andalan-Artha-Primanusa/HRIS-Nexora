import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Laptop, Plus, RefreshCw, Monitor, Smartphone, Briefcase,
  Search, Trash2, Pencil, Package, PackageOpen, ArrowRight
} from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { assetService } from '@/features/assets/api/asset.service';
import '@/shared/styles/CrudPage.css';
import '@/pages/dashboard/overview/OverviewPage.css';
import '@/pages/payroll/PayrollShared.css';

const STATUS_FILTERS = ['All', 'available', 'assigned', 'maintenance', 'retired'];

const AssetInventoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeStatus, setActiveStatus] = useState('All');
  const [deletingId, setDeletingId] = useState<string | number | null>(null);

  const extractArray = (res: any): any[] => {
    if (Array.isArray(res)) return res;
    if (res && typeof res === 'object') {
      if (Array.isArray(res.data)) return res.data;
      if (Array.isArray(res.items)) return res.items;
      if (Array.isArray(res.results)) return res.results;
      if (res.data && typeof res.data === 'object') {
        if (Array.isArray(res.data.items)) return res.data.items;
        if (Array.isArray(res.data.data)) return res.data.data;
      }
    }
    return [];
  };

  const fetchData = async (status?: string) => {
    setLoading(true);
    try {
      const params = status && status !== 'All' ? { status } : undefined;
      const response = await assetService.getAssets(params);
      setAssets(extractArray(response));
    } catch (err) {
      console.error(err);
      setAssets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(activeStatus);
  }, [activeStatus]);

  const handleDelete = async (id: string | number, name: string) => {
    if (!window.confirm(`Delete asset "${name}"? This action cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await assetService.deleteAsset(id);
      setAssets(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error('Failed to delete asset', err);
    } finally {
      setDeletingId(null);
    }
  };

  const getAssetIcon = (category: string) => {
    const c = category?.toLowerCase();
    if (c?.includes('laptop') || c?.includes('macbook') || c?.includes('electronics')) return <Laptop size={20} />;
    if (c?.includes('mobile') || c?.includes('phone')) return <Smartphone size={20} />;
    if (c?.includes('monitor') || c?.includes('display')) return <Monitor size={20} />;
    return <Briefcase size={20} />;
  };

  const getStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'available':   return { bg: '#dcfce7', color: '#166534' };
      case 'assigned':    return { bg: '#dbeafe', color: '#1d4ed8' };
      case 'maintenance': return { bg: '#fef3c7', color: '#b45309' };
      case 'retired':     return { bg: '#f1f5f9', color: '#64748b' };
      default:            return { bg: '#f1f5f9', color: '#64748b' };
    }
  };

  const filteredAssets = assets.filter(asset =>
    asset.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.serial_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.brand?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="crud-page">

      {/* ===== HERO CARD (tidak diubah) ===== */}
      <Card className="hero-card">
        <div className="hero-card-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <Package size={16} />
              <span>Pusat Aset</span>
            </div>
            <h1 className="hero-title">Asset Inventory</h1>
            <p className="hero-subtitle">
              Kelola dan pantau semua properti perusahaan secara real-time.
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn-outline" onClick={() => fetchData(activeStatus)} disabled={loading}>
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

      {/* ===== FILTER TABS ===== */}
      <div className="filter-tabs">
        {STATUS_FILTERS.map(status => (
          <button
            key={status}
            onClick={() => setActiveStatus(status)}
            className={`filter-tab ${activeStatus === status ? 'active' : ''}`}
          >
            {status === 'All' ? 'All Assets' : status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* ===== MAIN CONTENT WRAPPER ===== */}
      <div className="white-unified-wrapper">

        {/* Header / Search */}
        <div className="wuw-header">
          <div className="wuw-header-top">
            <div className="wuw-title-area">
              <h3>Daftar Asset</h3>
              <span className="wuw-count-badge">{filteredAssets.length} Total</span>
            </div>
            <div className="search-box">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search assets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Table / Card Area */}
        <div className="wuw-table-area">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '5rem', color: '#94a3b8' }}>
              <RefreshCw size={36} className="animate-spin" style={{ marginBottom: '1rem', opacity: 0.4 }} />
              <p>Loading inventory...</p>
            </div>
          ) : filteredAssets.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '5rem',
              background: 'white',
              borderRadius: '16px',
              border: '0.5px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
              color: '#94a3b8',
            }}>
              <Briefcase size={48} style={{ opacity: 0.3 }} />
              <h3 style={{ color: '#475569', margin: 0 }}>No assets found</h3>
              <p style={{ margin: 0 }}>Try changing the filter or adding a new asset.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {filteredAssets.map((asset) => {
                const statusStyle = getStatusStyle(asset.status);
                const holderName =
                  asset.current_holder?.user?.name ||
                  asset.current_holder?.full_name ||
                  asset.current_holder?.name ||
                  'In Stock';

                return (
                  <div
                    key={asset.id}
                    style={{
                      background: 'white',
                      borderRadius: '16px',
                      border: '0.5px solid #e2e8f0',
                      padding: '20px 24px',
                    }}
                  >
                    {/* Top row: icon + name + status */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                        <div style={{
                          width: '44px', height: '44px',
                          background: '#eff6ff',
                          border: '0.5px solid #bfdbfe',
                          borderRadius: '12px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#1d4ed8', flexShrink: 0,
                        }}>
                          {getAssetIcon(asset.category)}
                        </div>
                        <div>
                          <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 500, color: '#1e293b' }}>
                            {asset.name}
                          </h4>
                          <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#94a3b8' }}>
                            {[asset.code, asset.brand].filter(Boolean).join(' · ') || '—'}
                          </p>
                        </div>
                      </div>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        background: statusStyle.bg,
                        color: statusStyle.color,
                        flexShrink: 0,
                      }}>
                        {asset.status}
                      </span>
                    </div>

                    {/* Info rows */}
                    <div style={{
                      background: '#f8faff',
                      border: '0.5px solid #e0eaff',
                      borderRadius: '10px',
                      padding: '12px 16px',
                      marginBottom: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}>
                      {[
                        { label: 'Purchase Date', value: asset.purchase_date || 'N/A' },
                        { label: 'Serial No.',    value: asset.serial_number || 'N/A' },
                        { label: 'Holder',        value: holderName },
                      ].map(({ label, value }) => (
                        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                          <span style={{ color: '#94a3b8' }}>{label}</span>
                          <span style={{ fontWeight: 500, color: '#1e293b' }}>{value}</span>
                        </div>
                      ))}
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {asset.status?.toLowerCase() === 'available' ? (
                        <button
                          onClick={() => navigate('/assets/assignments')}
                          style={{
                            flex: 1,
                            height: '38px',
                            borderRadius: '10px',
                            background: '#1d4ed8',
                            color: 'white',
                            border: 'none',
                            fontSize: '13px',
                            fontWeight: 500,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                          }}
                        >
                          Assign <ArrowRight size={14} />
                        </button>
                      ) : (
                        <button
                          onClick={() => navigate('/assets/assignments')}
                          style={{
                            flex: 1,
                            height: '38px',
                            borderRadius: '10px',
                            background: 'white',
                            color: '#1d4ed8',
                            border: '0.5px solid #bfdbfe',
                            fontSize: '13px',
                            fontWeight: 500,
                            cursor: 'pointer',
                          }}
                        >
                          View Assignment
                        </button>
                      )}
                      <button
                        onClick={() => navigate(`/inventory/assets/edit/${asset.id}`)}
                        style={{
                          width: '38px', height: '38px',
                          borderRadius: '10px',
                          background: '#f8fafc',
                          border: '0.5px solid #e2e8f0',
                          color: '#475569',
                          cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(asset.id, asset.name)}
                        disabled={deletingId === asset.id}
                        style={{
                          width: '38px', height: '38px',
                          borderRadius: '10px',
                          background: '#fef2f2',
                          border: '0.5px solid #fecaca',
                          color: '#ef4444',
                          cursor: deletingId === asset.id ? 'not-allowed' : 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          opacity: deletingId === asset.id ? 0.5 : 1,
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssetInventoryPage;