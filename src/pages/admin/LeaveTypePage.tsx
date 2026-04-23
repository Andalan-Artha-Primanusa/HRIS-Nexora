import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Calendar,
  Info,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  RefreshCw,
  FileText,
  Settings,
  ShieldCheck
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
  created_at?: string;
}

const LeaveTypePage: React.FC = () => {
  const [policies, setPolicies] = useState<LeavePolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchPolicies = async () => {
    setLoading(true);
    console.log('Fetching policies from /leave-policies...');
    try {
      const response = await api.get('/leave-policies');
      console.log('Leave Policies Response Raw:', response);
      
      let data = response.data;
      // Handle Laravel/Custom API response structures
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

  const filteredPolicies = policies.filter(p => 
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.policy_code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="admin-leave-page">
      <div className="admin-leave-header">
        <div>
          <span className="policy-badge policy-badge-paid" style={{ marginBottom: '1rem', background: 'linear-gradient(135deg, #2563eb, #1e40af)', color: 'white', border: 'none' }}>
            <Settings size={14} /> Master Data
          </span>
          <h1>Leave Types & Policies</h1>
          <p>Configure leave categories, entitlement rules, and company leave policies.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
           <button onClick={() => { window.alert('Refreshing list...'); fetchPolicies(); }} className="btn-refresh" style={{ 
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
          <button className="btn-add-policy" onClick={() => console.log('Add New Type clicked')}>
            <Plus size={20} />
            Add New Type
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input 
            type="text" 
            placeholder="Search leave types or codes..." 
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 12px 12px 48px',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              background: 'white',
              fontSize: '0.95rem',
              outline: 'none',
              transition: 'all 0.2s'
            }}
          />
        </div>
      </div>

      <Card glass style={{ padding: '0', borderRadius: '24px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="leave-type-table">
            <thead>
              <tr>
                <th>Leave Type</th>
                <th>Code</th>
                <th>Entitlement</th>
                <th>Carryover</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '4rem' }}>
                    <RefreshCw size={32} className="animate-spin" color="#2563eb" />
                    <p style={{ marginTop: '1rem', color: '#64748b' }}>Loading configurations...</p>
                  </td>
                </tr>
              ) : filteredPolicies.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
                    No leave types found.
                  </td>
                </tr>
              ) : filteredPolicies.map((policy) => (
                <tr key={policy.id} className="leave-policy-row">
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ 
                        width: '40px', 
                        height: '40px', 
                        borderRadius: '12px', 
                        background: policy.is_paid ? '#eff6ff' : '#fff1f2', 
                        color: policy.is_paid ? '#2563eb' : '#e11d48',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Calendar size={20} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: '#1e293b' }}>{policy.name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Updated {new Date().toLocaleDateString()}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="policy-code">{policy.policy_code}</span>
                  </td>
                  <td>
                    <div>
                      <span className="entitlement-value">{policy.entitlement_value}</span>
                      <span className="entitlement-unit">Days / Year</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'capitalize' }}>
                      {policy.entitlement_type || 'fixed'} Allotment
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569', fontWeight: 500 }}>
                      <Info size={14} color="#94a3b8" />
                      {policy.max_carryover_days} Days Max
                    </div>
                  </td>
                  <td>
                    <span className={`policy-badge ${policy.is_paid ? 'policy-badge-paid' : 'policy-badge-unpaid'}`}>
                      {policy.is_paid ? <CheckCircle size={12} /> : <XCircle size={12} />}
                      {policy.is_paid ? 'Paid Leave' : 'Unpaid Leave'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button style={{ padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', cursor: 'pointer' }}>
                        <Edit size={16} />
                      </button>
                      <button style={{ padding: '8px', borderRadius: '8px', border: '1px solid #fee2e2', background: '#fff1f2', color: '#e11d48', cursor: 'pointer' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      
      <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
        <Card glass style={{ padding: '1.5rem', borderRadius: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
            <div style={{ padding: '8px', borderRadius: '10px', background: '#f0fdf4', color: '#16a34a' }}>
              <ShieldCheck size={20} />
            </div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Auto-Renewal</h3>
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>
            Leave balances are automatically reset and updated based on policy cycles.
          </p>
        </Card>
        
        <Card glass style={{ padding: '1.5rem', borderRadius: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
            <div style={{ padding: '8px', borderRadius: '10px', background: '#eff6ff', color: '#2563eb' }}>
              <FileText size={20} />
            </div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Prorated Logic</h3>
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>
            New employees receive prorated leave amounts based on their join date.
          </p>
        </Card>

        <Card glass style={{ padding: '1.5rem', borderRadius: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
            <div style={{ padding: '8px', borderRadius: '10px', background: '#fff7ed', color: '#ea580c' }}>
              <Calendar size={20} />
            </div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Carryover Rules</h3>
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>
            Unused leave can be carried over to the next period as per policy limits.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default LeaveTypePage;
