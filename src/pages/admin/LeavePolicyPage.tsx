import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  ShieldCheck, 
  Clock, 
  Edit,
  Trash2,
  RefreshCw,
  CalendarDays
} from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { api } from '@/shared/api/httpClient';
import '@/shared/styles/CrudPage.css';
import '@/pages/dashboard/overview/OverviewPage.css';
import '@/pages/payroll/PayrollShared.css';
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
    <div className="crud-page">
      <Card className="hero-card">
        <div className="hero-card-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <CalendarDays size={16} />
              <span>Governance</span>
            </div>
            <h1 className="hero-title">Leave Policies & Rules</h1>
            <p className="hero-subtitle">
              Tentukan kerangka regulasi dan aturan hak cuti untuk semua kategori.
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn-outline" onClick={fetchPolicies} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Segarkan
            </button>
            <button className="btn-primary" onClick={() => window.location.href = '/leave/policy/create'}>
              <Plus size={16} />
              Konfigurasi Policy
            </button>
          </div>
        </div>
      </Card>

      <div className="leave-requests-wrapper">
        <div className="leave-summary-card">
          <div className="leave-summary-header">
            <div>
              <p className="leave-summary-label">Total Policies</p>
              <p className="leave-summary-subtitle">Semua aturan</p>
            </div>
            <div className="leave-summary-icon-wrapper leave-icon-purple">
              <ShieldCheck size={28} />
            </div>
          </div>
          <div className="leave-summary-value leave-value-purple">{policies.length}</div>
          <p className="leave-summary-trend">Policies</p>
        </div>

        <div className="leave-summary-card">
          <div className="leave-summary-header">
            <div>
              <p className="leave-summary-label">Paid Leave</p>
              <p className="leave-summary-subtitle">Cuti berbayar</p>
            </div>
            <div className="leave-summary-icon-wrapper leave-icon-green">
              <Clock size={28} />
            </div>
          </div>
          <div className="leave-summary-value leave-value-green">{policies.filter(p => p.is_paid).length}</div>
          <p className="leave-summary-trend">Paid</p>
        </div>

        <div className="leave-summary-card">
          <div className="leave-summary-header">
            <div>
              <p className="leave-summary-label">Active Policies</p>
              <p className="leave-summary-subtitle">Policies aktif</p>
            </div>
            <div className="leave-summary-icon-wrapper leave-icon-blue">
              <ShieldCheck size={28} />
            </div>
          </div>
          <div className="leave-summary-value leave-value-blue">{policies.filter(p => p.active).length}</div>
          <p className="leave-summary-trend">Active</p>
        </div>
      </div>

      <div className="white-unified-wrapper">
        <div className="wuw-header">
          <div className="wuw-header-top">
            <div className="wuw-title-area">
              <h3>Daftar Kebijakan Cuti</h3>
              <span className="wuw-count-badge">{policies.length} Total</span>
            </div>
          </div>
        </div>

        <div className="wuw-table-area">
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
        </div>

        <div className="leave-requests-wrapper" style={{ marginTop: '2rem' }}>
          <div className="leave-summary-card">
            <div className="leave-summary-header">
              <div>
                <p className="leave-summary-label">Compliance Mode</p>
                <p className="leave-summary-subtitle">Otomatis diterapkan</p>
              </div>
              <div className="leave-summary-icon-wrapper leave-icon-purple">
                <ShieldCheck size={28} />
              </div>
            </div>
            <p className="leave-summary-trend" style={{ fontSize: '0.85rem', lineHeight: 1.5 }}>
              Seluruh kebijakan ini akan diterapkan secara otomatis pada perhitungan saldo cuti karyawan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeavePolicyPage;
