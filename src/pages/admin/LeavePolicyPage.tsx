import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  ShieldCheck, 
  Clock, 
  RefreshCw, 
  ArrowRight, 
  BookOpen
} from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { api } from '@/shared/api/httpClient';
import './AdminLeavePages.css';

interface LeavePolicy {
  id: number;
  name: string;
  policy_code: string;
  entitlement_type: string;
  entitlement_value: number;
  max_carryover_days: number;
  is_paid: boolean;
  active: boolean;
}

const LeavePolicyPage: React.FC = () => {
  const [policies, setPolicies] = useState<LeavePolicy[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPolicies = async () => {
    setLoading(true);
    console.log('Fetching policies from /leave-policies for Rules view...');
    try {
      const response = await api.get('/leave-policies');
      console.log('Leave Policies (Rules) Response Raw:', response);

      let data = response.data;
      if (data && typeof data === 'object') {
        if (Array.isArray(data.data)) data = data.data;
        else if (data.data && Array.isArray(data.data.data)) data = data.data.data;
        else if (Array.isArray(data.items)) data = data.items;
        else if (data.status === 'success' && Array.isArray(data.data)) data = data.data;
      }

      setPolicies(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching leave policies:', error);
      setPolicies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  return (
    <div className="admin-leave-page">
      <div className="admin-leave-header">
        <div>
          <span className="policy-badge policy-badge-paid" style={{ marginBottom: '1rem', background: 'linear-gradient(135deg, #7c3aed, #5b21b6)', color: 'white', border: 'none' }}>
            <ShieldCheck size={14} /> Governance
          </span>
          <h1>Leave Policies & Rules</h1>
          <p>Define the regulatory framework and entitlement rules for all leave categories.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
           <button onClick={() => { window.alert('Refreshing policies...'); fetchPolicies(); }} className="btn-refresh" style={{ 
              padding: '10px', 
              borderRadius: '12px', 
              border: '1px solid #e2e8f0', 
              background: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} color="#64748b" />
          </button>
          <button className="btn-add-policy" style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }} onClick={() => console.log('Configure Policy clicked')}>
            <Plus size={20} />
            Configure Policy
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {loading ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem' }}>
            <RefreshCw size={40} className="animate-spin" color="#7c3aed" />
            <p style={{ marginTop: '1rem', color: '#64748b', fontWeight: 500 }}>Fetching company policies...</p>
          </div>
        ) : policies.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
            No policies defined yet.
          </div>
        ) : policies.map((policy) => (
          <Card key={policy.id} glass className="leave-policy-card" style={{ padding: '1.5rem', borderRadius: '24px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: '#f5f3ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BookOpen size={24} />
                </div>
                <span className={`policy-badge ${policy.is_paid ? 'policy-badge-paid' : 'policy-badge-unpaid'}`} style={{ fontSize: '0.65rem' }}>
                  {policy.is_paid ? 'PAID' : 'UNPAID'}
                </span>
              </div>
              
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' }}>{policy.name}</h3>
              <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>
                Internal code: <span className="policy-code">{policy.policy_code}</span>
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '16px' }}>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Entitlement</div>
                  <div style={{ fontWeight: 800, color: '#1e293b', fontSize: '1.1rem' }}>{policy.entitlement_value} Days</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '16px' }}>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Carryover</div>
                  <div style={{ fontWeight: 800, color: '#1e293b', fontSize: '1.1rem' }}>{policy.max_carryover_days} Days</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#64748b', marginBottom: '1.5rem' }}>
                <Clock size={14} />
                <span>Accrual Mode: <strong style={{ color: '#475569' }}>{(policy.entitlement_type || 'fixed').toUpperCase()}</strong></span>
              </div>
            </div>

            <button style={{ 
              width: '100%', 
              padding: '12px', 
              borderRadius: '12px', 
              border: '1px solid #e2e8f0', 
              background: 'white', 
              color: '#7c3aed', 
              fontWeight: 700, 
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}>
              Adjust Rules <ArrowRight size={16} />
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default LeavePolicyPage;
