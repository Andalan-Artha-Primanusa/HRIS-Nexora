import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, DollarSign, Clock, ShieldCheck, RefreshCw, Trash2, Edit, AlertCircle } from 'lucide-react';
import { workforceService } from '@/features/workforce/api/workforce.service';
import './AdminWorkforcePages.css';

const OvertimeRulesPage: React.FC = () => {
  const navigate = useNavigate();
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await workforceService.getOvertimeRules();
      setRules(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="admin-workforce-page">
      <div className="workforce-header">
        <div className="workforce-header-content">
          <h1>Aturan Lembur</h1>
          <p>Konfigurasi pengganda gaji dan batasan jam lembur untuk memastikan efisiensi biaya dan kepatuhan hukum.</p>
        </div>
        <button className="wf-create-btn" onClick={() => navigate('/workforce/overtime-rules/create')}>
          <Plus size={28} />
          Buat Aturan Baru
        </button>
      </div>

      <div className="workforce-stats-grid">
        {[
          { label: 'Aturan Aktif', value: '08', color: '#10b981' },
          { label: 'Avg Multiplier', value: '1.5x', color: '#3b82f6' },
          { label: 'Max Hours/Day', value: '04h', color: '#f59e0b' },
          { label: 'Audit Status', value: 'Ready', color: '#6366f1' },
        ].map((stat, i) => (
          <div key={i} className="stat-card-premium">
             <div className="stat-value" style={{ color: stat.color }}>{stat.value}</div>
             <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="workforce-table-card">
        <div className="workforce-table-header">
           <h3 className="workforce-table-title">Daftar Kebijakan Lembur</h3>
           <button className="wf-action-btn" onClick={fetchData}>
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
           </button>
        </div>

        <table className="workforce-table">
          <thead>
            <tr>
              <th>Kebijakan</th>
              <th>Multiplier</th>
              <th>Batas Harian</th>
              <th>Kelayakan</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '10rem' }}><RefreshCw className="animate-spin" size={48} color="#2563eb" /></td></tr>
            ) : !Array.isArray(rules) || rules.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '10rem' }}>
                   <div style={{ opacity: 0.1, marginBottom: '2rem' }}><Clock size={100} /></div>
                   <h2 style={{ color: '#94a3b8', margin: 0 }}>Belum ada aturan lembur.</h2>
                </td>
              </tr>
            ) : rules.map((rule) => (
              <tr key={rule.id}>
                <td>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a' }}>{rule.name}</div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>CODE: {rule.code || 'OT-DFT'}</div>
                </td>
                <td>
                  <span style={{ color: '#16a34a', fontWeight: 900 }}>{rule.multiplier}x Basis</span>
                </td>
                <td>{rule.max_hours_per_day} Jam</td>
                <td>{rule.eligibility || 'Semua Staff'}</td>
                <td>
                  <span className={`status-pill status-${(rule.status || 'active').toLowerCase()}`}>
                    {rule.status || 'Active'}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                   <div className="wf-btn-group" style={{ justifyContent: 'flex-end' }}>
                      <button className="wf-action-btn" onClick={() => navigate(`/workforce/overtime-rules/edit/${rule.id}`)}>
                         <Edit size={22} />
                      </button>
                      <button className="wf-action-btn wf-action-btn-danger">
                         <Trash2 size={22} />
                      </button>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OvertimeRulesPage;
