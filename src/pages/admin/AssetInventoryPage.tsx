import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Laptop, Plus, RefreshCw, Monitor, Smartphone, Briefcase,
  Search, Trash2, Pencil, Package, PackageOpen, ArrowRight,
  Filter, Tag, User, Calendar, CheckCircle2, AlertCircle,
  XCircle, Clock
} from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { assetService } from '@/features/assets/api/asset.service';
import '@/shared/styles/CrudPage.css';
import '@/pages/dashboard/overview/OverviewPage.css';
import '@/pages/payroll/PayrollShared.css';

const STATUS_FILTERS = [
  { id: 'All', label: 'Semua Aset', icon: Package },
  { id: 'available', label: 'Tersedia', icon: CheckCircle2 },
  { id: 'assigned', label: 'Digunakan', icon: User },
  { id: 'maintenance', label: 'Maintenance', icon: AlertCircle },
  { id: 'retired', label: 'Retired', icon: XCircle },
];

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
    if (!window.confirm(`Hapus aset "${name}"? Tindakan ini tidak dapat dibatalkan.`)) return;
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
    const c = category?.toLowerCase() || '';
    if (c.includes('laptop') || c.includes('macbook') || c.includes('electronics')) return <Laptop size={22} />;
    if (c.includes('mobile') || c.includes('phone') || c.includes('smartphone')) return <Smartphone size={22} />;
    if (c.includes('monitor') || c.includes('display')) return <Monitor size={22} />;
    return <Briefcase size={22} />;
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'available':   return { bg: '#dcfce7', color: '#166534', border: '#bbf7d0' };
      case 'assigned':    return { bg: '#eff6ff', color: '#1d4ed8', border: '#dbeafe' };
      case 'maintenance': return { bg: '#fff7ed', color: '#c2410c', border: '#ffedd5' };
      case 'retired':     return { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' };
      default:            return { bg: '#f8fafc', color: '#64748b', border: '#f1f5f9' };
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
    } catch (e) {
      return dateStr;
    }
  };

  const filteredAssets = assets.filter(asset =>
    asset.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.serial_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.brand?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = [
    { label: 'Total Aset', value: assets.length, color: '#2563eb', icon: Package },
    { label: 'Tersedia', value: assets.filter(a => a.status?.toLowerCase() === 'available').length, color: '#10b981', icon: CheckCircle2 },
    { label: 'Digunakan', value: assets.filter(a => a.status?.toLowerCase() === 'assigned').length, color: '#8b5cf6', icon: User },
  ];

  return (
    <div className="crud-page">
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
            <button className="btn-outline" onClick={() => fetchData(activeStatus)} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button className="btn-primary" onClick={() => navigate('/inventory/assets/create')}>
              <Plus size={16} />
              Tambah Aset
            </button>
          </div>
        </div>
      </Card>

      <div className="summary-grid" style={{ marginBottom: '2rem' }}>
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx} className="metric-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ 
                  width: '48px', height: '48px', 
                  borderRadius: '14px', 
                  background: `${stat.color}15`, 
                  color: stat.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Icon size={24} />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>{stat.label}</p>
                  <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#1e293b' }}>{stat.value}</h3>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '2rem' }}>
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }} className="no-scrollbar">
          {STATUS_FILTERS.map(filter => {
            const Icon = filter.icon;
            const isActive = activeStatus === filter.id;
            return (
              <button
                key={filter.id}
                onClick={() => setActiveStatus(filter.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 18px',
                  borderRadius: '12px',
                  border: '1px solid',
                  borderColor: isActive ? '#2563eb' : '#e2e8f0',
                  background: isActive ? '#eff6ff' : 'white',
                  color: isActive ? '#1d4ed8' : '#64748b',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap'
                }}
              >
                <Icon size={16} />
                {filter.label}
              </button>
            );
          })}
        </div>

        <div style={{ position: 'relative', width: '350px' }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Cari nama, kode, atau brand..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px 12px 48px',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              fontSize: '0.95rem',
              outline: 'none',
              boxSizing: 'border-box',
              background: 'white',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
            }}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '10rem 0', color: '#94a3b8' }}>
          <RefreshCw size={48} className="animate-spin" style={{ opacity: 0.2, marginBottom: '1rem' }} />
          <p style={{ fontWeight: 500 }}>Memuat data inventaris...</p>
        </div>
      ) : filteredAssets.length === 0 ? (
        <Card glass style={{ textAlign: 'center', padding: '6rem 2rem', borderRadius: '32px' }}>
          <div style={{ 
            width: '80px', height: '80px', 
            background: '#f8fafc', 
            borderRadius: '50%', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.5rem',
            color: '#cbd5e1'
          }}>
            <Package size={40} />
          </div>
          <h3 style={{ fontSize: '1.25rem', color: '#1e293b', marginBottom: '8px' }}>Tidak ada aset ditemukan</h3>
          <p style={{ color: '#64748b', maxWidth: '400px', margin: '0 auto' }}>
            Kami tidak menemukan aset yang sesuai dengan kriteria pencarian atau filter Anda.
          </p>
          <Button 
            variant="outline" 
            style={{ marginTop: '2rem', borderRadius: '12px' }}
            onClick={() => { setSearchTerm(''); setActiveStatus('All'); }}
          >
            Reset Filter
          </Button>
        </Card>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
          gap: '1.5rem' 
        }}>
          {filteredAssets.map((asset) => {
            const statusStyle = getStatusColor(asset.status);
            const holderName =
              asset.current_holder?.user?.name ||
              asset.current_holder?.full_name ||
              asset.current_holder?.name ||
              'Tersedia di Gudang';

            return (
              <Card 
                key={asset.id} 
                className="asset-card"
                style={{ 
                  borderRadius: '24px', 
                  padding: '24px', 
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  border: '1px solid #f1f5f9',
                  background: 'white',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ 
                    width: '56px', height: '56px', 
                    borderRadius: '16px', 
                    background: '#f1f5f9', 
                    color: '#334155',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.05)'
                  }}>
                    {getAssetIcon(asset.category)}
                  </div>
                  <span style={{ 
                    padding: '6px 12px', 
                    borderRadius: '20px', 
                    fontSize: '0.75rem', 
                    fontWeight: 800, 
                    textTransform: 'uppercase',
                    background: statusStyle.bg,
                    color: statusStyle.color,
                    border: `1px solid ${statusStyle.border}`
                  }}>
                    {asset.status}
                  </span>
                </div>

                <div>
                  <h4 style={{ margin: '0 0 4px', fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>{asset.name}</h4>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <Tag size={12} style={{ color: '#94a3b8' }} />
                    <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>{asset.code || 'NO-CODE'}</span>
                    <span style={{ color: '#cbd5e1' }}>•</span>
                    <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>{asset.brand || 'No Brand'}</span>
                  </div>
                </div>

                <div style={{ 
                  background: '#f8fafc', 
                  borderRadius: '16px', 
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Calendar size={14} style={{ color: '#94a3b8' }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Tgl Beli</p>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: '#334155', fontWeight: 600 }}>{formatDate(asset.purchase_date)}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <User size={14} style={{ color: '#94a3b8' }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Pemegang</p>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: '#334155', fontWeight: 600 }}>{holderName}</p>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                  <button 
                    onClick={() => navigate(`/inventory/assets/edit/${asset.id}`)}
                    style={{ 
                      flex: 1, 
                      height: '44px', 
                      borderRadius: '12px', 
                      background: '#fff', 
                      border: '1px solid #e2e8f0',
                      color: '#475569',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                    }}
                  >
                    <Pencil size={14} /> Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(asset.id, asset.name)}
                    disabled={deletingId === asset.id}
                    style={{ 
                      width: '44px', height: '44px', 
                      borderRadius: '12px', 
                      background: '#fff', 
                      border: '1px solid #fee2e2',
                      color: '#ef4444',
                      cursor: deletingId === asset.id ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      opacity: deletingId === asset.id ? 0.5 : 1
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AssetInventoryPage;