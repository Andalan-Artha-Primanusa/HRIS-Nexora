import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Laptop, Plus, RefreshCw, Monitor, Smartphone, Briefcase, User } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { assetService } from '@/features/assets/api/asset.service';

const AssetInventoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await assetService.getAssets();
      setAssets(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getAssetIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'laptop': return <Laptop size={24} />;
      case 'mobile': return <Smartphone size={24} />;
      case 'monitor': return <Monitor size={24} />;
      default: return <Briefcase size={24} />;
    }
  };

  return (
    <div className="crud-page">
      <div className="crud-header">
        <div>
          <span className="reimb-badge reimb-badge-admin">Inventory</span>
          <h1>Asset Management</h1>
          <p>Track company hardware, software licenses, and employee assignments.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="ghost" onClick={fetchData}>
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </Button>
          <Button variant="primary" onClick={() => navigate('/inventory/assets/create')}>
            <Plus size={18} style={{ marginRight: '8px' }} />
            Add Asset
          </Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {loading ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem' }}>Loading assets...</div>
        ) : assets.length === 0 ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem' }}>No assets found.</div>
        ) : assets.map((asset) => (
          <Card key={asset.id} glass style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                 <div style={{ padding: '10px', background: '#eff6ff', borderRadius: '12px', color: '#2563eb' }}>
                    {getAssetIcon(asset.category)}
                 </div>
                 <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e3a8a' }}>{asset.name}</h3>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>S/N: {asset.serial_number}</div>
                 </div>
              </div>
              <span className={`status-pill status-${asset.status?.toLowerCase() === 'available' ? 'approved' : 'pending'}`}>
                {asset.status}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: '#64748b' }}>Category</span>
                  <span style={{ fontWeight: 600 }}>{asset.category}</span>
               </div>
               <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: '#64748b' }}>Assigned To</span>
                  <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {asset.current_holder ? (
                      <><User size={14} /> {asset.current_holder.full_name}</>
                    ) : 'None'}
                  </span>
               </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
               {asset.status?.toLowerCase() === 'available' ? (
                 <Button variant="primary" style={{ flex: 1 }}>Assign Now</Button>
               ) : (
                 <Button variant="outline" style={{ flex: 1 }}>Return Asset</Button>
               )}
               <Button variant="ghost" onClick={() => navigate(`/inventory/assets/edit/${asset.id}`)}>Edit</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AssetInventoryPage;

