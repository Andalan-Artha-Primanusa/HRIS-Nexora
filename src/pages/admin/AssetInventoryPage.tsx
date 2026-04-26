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
    if (c?.includes('laptop') || c?.includes('macbook') || c?.includes('electronics')) return <Laptop size={22} />;
    if (c?.includes('mobile') || c?.includes('phone')) return <Smartphone size={22} />;
    if (c?.includes('monitor') || c?.includes('display')) return <Monitor size={22} />;
    return <Briefcase size={22} />;
  };

  const getStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'available': return { bg: '#dcfce7', text: '#16a34a' };
      case 'assigned': return { bg: '#dbeafe', text: '#1d4ed8' };
      case 'maintenance': return { bg: '#fef3c7', text: '#b45309' };
      case 'retired': return { bg: '#f1f5f9', text: '#64748b' };
      default: return { bg: '#f1f5f9', text: '#64748b' };
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

      <div className="white-unified-wrapper">
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

        <div className="wuw-table-area">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '5rem', color: '#94a3b8' }}>
              <RefreshCw size={36} className="animate-spin" style={{ marginBottom: '1rem', opacity: 0.4 }} />
              <p>Loading inventory...</p>
            </div>
          ) : filteredAssets.length === 0 ? (
            <Card glass style={{ textAlign: 'center', padding: '5rem' }}>
              <Briefcase size={48} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
              <h3 style={{ color: '#475569' }}>No assets found</h3>
              <p style={{ color: '#94a3b8' }}>Try changing the filter or adding a new asset.</p>
            </Card>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
              {filteredAssets.map((asset) => {
                const statusStyle = getStatusStyle(asset.status);
                return (
                  <Card key={asset.id} glass style={{ padding: '1.75rem', borderRadius: '24px', border: '1px solid rgba(226,232,240,0.5)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                      <div style={{ display: 'flex', gap: '14px' }}>
                        <div style={{ padding: '12px', background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)', borderRadius: '14px', color: '#475569', border: '1px solid #e2e8f0' }}>
                          {getAssetIcon(asset.category)}
                        </div>
                        <div>
                          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>{asset.name}</h3>
                          <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '3px' }}>
                            {asset.code || '—'} {asset.brand ? ` | ${asset.brand}` : ''}
                          </div>
                        </div>
                      </div>
                      <span style={{ padding: '5px 12px', borderRadius: '8px', fontSize: '0.73rem', fontWeight: 700, textTransform: 'uppercase', background: statusStyle.bg, color: statusStyle.text }}>
                        {asset.status}
                      </span>
                    </div>

                    <div style={{ background: 'rgba(248,250,252,0.6)', borderRadius: '14px', padding: '1.1rem', marginBottom: '1.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                        <span style={{ color: '#94a3b8' }}>Purchase Date</span>
                        <span style={{ fontWeight: 600, color: '#475569' }}>{asset.purchase_date || 'N/A'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                        <span style={{ color: '#94a3b8' }}>Serial No.</span>
                        <span style={{ fontWeight: 600, color: '#475569' }}>{asset.serial_number || 'N/A'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                        <span style={{ color: '#94a3b8' }}>Holder</span>
                        <span style={{ fontWeight: 600, color: '#475569' }}>
                          {asset.current_holder?.user?.name || asset.current_holder?.full_name || asset.current_holder?.name || 'In Stock'}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.65rem' }}>
                      {asset.status?.toLowerCase() === 'available' ? (
                        <Button variant="primary" style={{ flex: 1.4, height: '42px', borderRadius: '10px' }} onClick={() => navigate('/assets/assignments')}>
                          Assign <ArrowRight size={15} style={{ marginLeft: '6px' }} />
                        </Button>
                      ) : (
                        <Button variant="outline" style={{ flex: 1.4, height: '42px', borderRadius: '10px' }} onClick={() => navigate('/assets/assignments')}>
                          View Assignment
                        </Button>
                      )}
                      <Button variant="ghost" onClick={() => navigate(`/inventory/assets/edit/${asset.id}`)} style={{ height: '42px', width: '42px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                        <Pencil size={16} />
                      </Button>
                      <Button variant="ghost" onClick={() => handleDelete(asset.id, asset.name)} disabled={deletingId === asset.id} style={{ height: '42px', width: '42px', borderRadius: '10px', background: '#fef2f2', border: '1px solid #fecaca', color: '#ef4444' }}>
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </Card>
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