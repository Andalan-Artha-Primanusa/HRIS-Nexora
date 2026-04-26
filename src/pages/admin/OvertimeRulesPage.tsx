import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Clock, RefreshCw, Edit, Trash2, DollarSign, Search, Timer } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { workforceService } from '@/features/workforce/api/workforce.service';
import '@/shared/styles/CrudPage.css';
import '@/pages/dashboard/overview/OverviewPage.css';
import '@/pages/payroll/PayrollShared.css';

const OvertimeRulesPage: React.FC = () => {
  const navigate = useNavigate();
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await workforceService.getOvertimeRules();
      const rulesArray = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
      setRules(rulesArray);
    } catch (err) {
      console.error(err);
      setRules([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const activeRules = rules.filter(r => r.status === 'active');

  return (
    <div className="crud-page">
      <Card className="hero-card">
        <div className="hero-card-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <Timer size={16} />
              <span>Workforce</span>
            </div>
            <h1 className="hero-title">Aturan Lembur</h1>
            <p className="hero-subtitle">
              Konfigurasi pengganda gaji dan batasan jam lembur.
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn-outline" onClick={fetchData} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Segarkan
            </button>
            <button className="btn-primary" onClick={() => navigate('/workforce/overtime-rules/create')}>
              <Plus size={16} />
              Buat Aturan
            </button>
          </div>
        </div>
      </Card>

      <div className="leave-requests-wrapper">
        <div className="leave-summary-card">
          <div className="leave-summary-header">
            <div>
              <p className="leave-summary-label">Aturan Aktif</p>
              <p className="leave-summary-subtitle">Total aturan</p>
            </div>
            <div className="leave-summary-icon-wrapper leave-icon-green">
              <Clock size={28} />
            </div>
          </div>
          <div className="leave-summary-value leave-value-green">{activeRules.length}</div>
          <p className="leave-summary-trend">Aturan Aktif</p>
        </div>

        <div className="leave-summary-card">
          <div className="leave-summary-header">
            <div>
              <p className="leave-summary-label">Rata-rata</p>
              <p className="leave-summary-subtitle">Multiplier</p>
            </div>
            <div className="leave-summary-icon-wrapper leave-icon-blue">
              <DollarSign size={28} />
            </div>
          </div>
          <div className="leave-summary-value leave-value-blue">1.5x</div>
          <p className="leave-summary-trend">Multiplier</p>
        </div>

        <div className="leave-summary-card">
          <div className="leave-summary-header">
            <div>
              <p className="leave-summary-label">Max Hours/Day</p>
              <p className="leave-summary-subtitle">Batas harian</p>
            </div>
            <div className="leave-summary-icon-wrapper leave-icon-orange">
              <Timer size={28} />
            </div>
          </div>
          <div className="leave-summary-value leave-value-orange">4h</div>
          <p className="leave-summary-trend">Jam Harian</p>
        </div>
      </div>

      <div className="white-unified-wrapper">
        <div className="wuw-header">
          <div className="wuw-header-top">
            <div className="wuw-title-area">
              <h3>Daftar Kebijakan Lembur</h3>
              <span className="wuw-count-badge">{rules.length} Total</span>
            </div>
            <div className="search-box">
              <Search size={18} />
              <input type="text" placeholder="Search..." />
            </div>
          </div>
        </div>

        <div className="wuw-table-area">
          <div className="table-wrap">
            <table className="data-table">
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
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem' }}>Loading...</td></tr>
                ) : rules.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                      <Clock size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                      <p>Belum ada aturan lembur.</p>
                    </td>
                  </tr>
                ) : rules.map((rule) => (
                  <tr key={rule.id}>
                    <td>
                      <div className="cell-stacked">
                        <span className="cell-name-text">{rule.name}</span>
                        <span className="cell-email">CODE: {rule.code || 'OT-DFT'}</span>
                      </div>
                    </td>
                    <td><span style={{ fontWeight: 700, color: '#16a34a' }}>{rule.multiplier}x</span></td>
                    <td>{rule.max_hours_per_day || 0} Jam</td>
                    <td>{rule.eligibility || 'Semua Staff'}</td>
                    <td>
                      <span className={`status-badge ${(rule.status || 'active') === 'active' ? 'status-active' : 'status-default'}`}>
                        {rule.status || 'Active'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="action-btn-group">
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/workforce/overtime-rules/edit/${rule.id}`)}><Edit size={16} /></Button>
                        <Button variant="ghost" size="sm" danger><Trash2 size={16} /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OvertimeRulesPage;