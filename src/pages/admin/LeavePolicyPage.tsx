import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  ShieldCheck, 
  Clock, 
  BookOpen,
  Edit,
  Trash2,
  Eye,
  RefreshCw
} from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
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
           <Button variant="outline" size="md" onClick={fetchPolicies} disabled={loading} style={{ borderColor: "#2563eb", color: "#2563eb" }}>
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            Refresh
          </Button>
          <Button variant="primary" size="md" onClick={() => window.location.href = '/leave/policy/create'}>
            <Plus size={20} />
            Configure Policy
          </Button>
        </div>
      </div>

      <Card glass style={{ padding: '0', borderRadius: '24px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="leave-type-table">
            <thead>
              <tr>
                <th>Kebijakan</th>
                <th>Kode</th>
                <th>Tahun</th>
                <th>Jatah (Hari)</th>
                <th>Carryover</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '4rem' }}>
                    <RefreshCw size={32} className="animate-spin" color="#7c3aed" />
                    <p style={{ marginTop: '1rem', color: '#64748b' }}>Memuat kebijakan...</p>
                  </td>
                </tr>
              ) : policies.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
                    Belum ada kebijakan yang dikonfigurasi.
                  </td>
                </tr>
              ) : policies.map((policy) => (
                <tr key={policy.id} className="leave-policy-row">
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ 
                        width: '40px', 
                        height: '40px', 
                        borderRadius: '12px', 
                        background: '#f5f3ff', 
                        color: '#7c3aed',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <ShieldCheck size={20} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: '#1e293b' }}>{policy.name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Tipe: {policy.entitlement_type?.toUpperCase() || 'FIXED'}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="policy-code">{policy.policy_code}</span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: '#1e3a8a' }}>{policy.year}</span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 800, color: '#1e293b' }}>{policy.entitlement_value} Hari</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b' }}>
                      <Clock size={14} />
                      <span>{policy.max_carryover_days} Hari</span>
                    </div>
                  </td>
                  <td>
                    <span className={`policy-badge ${policy.is_paid ? 'policy-badge-paid' : 'policy-badge-unpaid'}`}>
                      {policy.is_paid ? 'PAID' : 'UNPAID'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="action-btn-group">
                      <button 
                        className="action-btn action-btn-edit" 
                        onClick={() => window.location.href = `/leave/policy/edit/${policy.id}`}
                        title="Edit Kebijakan"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        className="action-btn action-btn-delete" 
                        onClick={() => {
                          if (window.confirm('Hapus kebijakan ini?')) {
                            void api.delete(`/leave-policies/${policy.id}`).then(() => void fetchPolicies());
                          }
                        }}
                        title="Hapus Kebijakan"
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
      </Card>

      <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        <Card glass style={{ padding: '1.5rem', borderRadius: '20px', borderLeft: '4px solid #7c3aed' }}>
          <h4 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={18} color="#7c3aed" /> Compliance Mode
          </h4>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
            Seluruh kebijakan ini akan diterapkan secara otomatis pada perhitungan saldo cuti karyawan.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default LeavePolicyPage;
