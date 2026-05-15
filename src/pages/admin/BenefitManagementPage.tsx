import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gift, Plus, RefreshCw, Heart, Shield, Zap } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { benefitService } from '@/features/benefits/api/benefit.service';
import { useAuthStore } from '@/app/store/auth.store';
import { RBACUtils } from '@/shared/hooks/rbac';

const BenefitManagementPage: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const canAccess = RBACUtils.hasPermission(user, 'payroll.view');
  if (!canAccess) {
    return (
      <div className="crud-page"><Card className="hero-card"><div className="hero-card-inner"><div className="hero-content"><div className="hero-badge"><Shield size={16} /><span>Admin Center</span></div><h1 className="hero-title">Akses Ditolak</h1><p className="hero-subtitle">Anda tidak memiliki izin untuk mengakses halaman ini.</p></div></div></Card></div>
    );
  }
  const navigate = useNavigate();
  const [benefits, setBenefits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await benefitService.getBenefits();
      setBenefits(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getBenefitIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'health': return <Heart size={24} color="#ef4444" />;
      case 'insurance': return <Shield size={24} color="#2563eb" />;
      case 'bonus': return <Zap size={24} color="#f59e0b" />;
      default: return <Gift size={24} color="#8b5cf6" />;
    }
  };

  return (
    <div className="crud-page">
      <div className="crud-header">
        <div>
          <span className="reimb-badge reimb-badge-admin">Compensation</span>
          <h1>Benefits Management</h1>
          <p>Configure and assign employee benefits, insurance, and perks.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="ghost" onClick={fetchData}>
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </Button>
          <Button variant="primary" onClick={() => navigate('/compensation/benefits/create')}>
            <Plus size={18} style={{ marginRight: '8px' }} />
            New Benefit
          </Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {loading ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem' }}>Loading...</div>
        ) : benefits.length === 0 ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem' }}>No benefits configured.</div>
        ) : benefits.map((benefit) => (
          <Card key={benefit.id} glass style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                 <div style={{ padding: '10px', background: '#f8fafc', borderRadius: '12px' }}>
                    {getBenefitIcon(benefit.type)}
                 </div>
                 <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e3a8a' }}>{benefit.name}</h3>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Category: {benefit.type}</div>
                 </div>
              </div>
            </div>

            <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem', lineHeight: 1.5 }}>
               {benefit.description || 'No description provided for this benefit.'}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: '#64748b' }}>Monthly Value</span>
                  <span style={{ fontWeight: 700, color: '#1e293b' }}>Rp {benefit.amount?.toLocaleString() || 0}</span>
               </div>
               <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: '#64748b' }}>Assigned Count</span>
                  <span style={{ fontWeight: 600 }}>{benefit.assigned_count || 0} Employees</span>
               </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
               <Button variant="primary" style={{ flex: 1 }}>Assign Now</Button>
               <Button variant="outline" onClick={() => navigate(`/compensation/benefits/edit/${benefit.id}`)}>Edit</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BenefitManagementPage;

