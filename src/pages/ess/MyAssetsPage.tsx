import React, { useState, useEffect } from 'react';
import { Box, Briefcase, Calendar, ShieldCheck, Info, Package, RefreshCw } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { assetService } from '@/features/assets/api/asset.service';
import '@/shared/styles/CrudPage.css';
import '@/pages/dashboard/overview/OverviewPage.css';
import '@/pages/payroll/PayrollShared.css';

const MyAssetsPage: React.FC = () => {
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await assetService.getMyAssets();
      
      const extractArray = (res: any): any[] => {
        if (Array.isArray(res)) return res;
        if (res && typeof res === 'object') {
          if (Array.isArray(res.data)) return res.data;
          if (Array.isArray(res.items)) return res.items;
          if (res.data && typeof res.data === 'object') {
            if (Array.isArray(res.data.items)) return res.data.items;
            if (Array.isArray(res.data.data)) return res.data.data;
          }
        }
        return [];
      };

      setAssets(extractArray(response));
    } catch (err) {
      console.error(err);
      setAssets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="crud-page">
      <Card className="hero-card">
        <div className="hero-card-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <Package size={16} />
              <span>Employee Self Service</span>
            </div>
            <h1 className="hero-title">Aset Saya</h1>
            <p className="hero-subtitle">
              Daftar properti perusahaan yang saat ini ditugaskan kepada Anda.
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn-outline" onClick={fetchData} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Segarkan
            </button>
          </div>
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {loading ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem' }}>Loading your assets...</div>
        ) : assets.length === 0 ? (
          <Card glass style={{ gridColumn: '1/-1', textAlign: 'center', padding: '5rem' }}>
            <Box size={48} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
            <h3 style={{ color: '#475569' }}>No assets assigned</h3>
            <p style={{ color: '#64748b' }}>You currently don't have any company property assigned to your name.</p>
          </Card>
        ) : assets.map((asset) => (
          <Card key={asset.id} glass style={{ padding: '1.75rem', borderRadius: '24px' }}>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '1.5rem' }}>
              <div style={{ padding: '12px', background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)', borderRadius: '14px', color: '#2563eb', border: '1px solid #e2e8f0' }}>
                <Briefcase size={24} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>{asset.name}</h3>
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Code: {asset.code || 'N/A'}</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: 'rgba(248, 250, 252, 0.5)', padding: '1.25rem', borderRadius: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.9rem' }}>
                <Calendar size={16} color="#64748b" />
                <span style={{ color: '#64748b', width: '100px' }}>Assigned Date:</span>
                <span style={{ fontWeight: 600 }}>
                  {asset.assigned_at || asset.assignment_date || asset.created_at?.split('T')[0] || 'N/A'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.9rem' }}>
                <ShieldCheck size={16} color="#64748b" />
                <span style={{ color: '#64748b', width: '100px' }}>Serial Number:</span>
                <span style={{ fontWeight: 600 }}>{asset.serial_number || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '0.9rem' }}>
                <Info size={16} style={{ marginTop: '2px', color: '#64748b' }} />
                <span style={{ color: '#64748b', width: '100px' }}>Note:</span>
                <span style={{ fontWeight: 500, flex: 1 }}>{asset.assignment_note || 'Official property.'}</span>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#16a34a', fontSize: '0.85rem', fontWeight: 600 }}>
                 <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a' }}></div>
                 Currently in your possession
               </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MyAssetsPage;
