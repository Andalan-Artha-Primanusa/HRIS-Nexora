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
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-badge">Workforce</span>
          <h1>Aturan Lembur</h1>
          <p>Konfigurasi pengganda gaji dan batasan jam lembur.</p>
        </div>
        <div className="page-header-actions">
          <Button variant="outline" size="md" onClick={fetchData} disabled={loading}>
            <RefreshCw size={16} />
            Refresh
          </Button>
          <Button variant="primary" size="md" onClick={() => navigate('/workforce/overtime-rules/create')}>
            <Plus size={16} />
            Buat Aturan
          </Button>
        </div>
      </div>

      <div className="summary-grid">
        <Card className="summary-card" glass>
          <div className="summary-card__header">
            <div>
              <span className="summary-card__label">Aturan Aktif</span>
              <p className="summary-card__subtitle">Total aturan</p>
            </div>
            <span className="summary-card__icon summary-card__icon--green">
              <Clock size={20} />
            </span>
          </div>
          <div className="summary-card__value summary-card__value--green">{activeRules.length}</div>
          <div className="summary-card__change">Active</div>
        </Card>

        <Card className="summary-card" glass>
          <div className="summary-card__header">
            <div>
              <span className="summary-card__label">Avg Multiplier</span>
              <p className="summary-card__subtitle">Rata-rata</p>
            </div>
            <span className="summary-card__icon summary-card__icon--blue">
              <DollarSign size={20} />
            </span>
          </div>
          <div className="summary-card__value summary-card__value--blue">1.5x</div>
          <div className="summary-card__change">Multiplier</div>
        </Card>

        <Card className="summary-card" glass>
          <div className="summary-card__header">
            <div>
              <span className="summary-card__label">Max Hours/Day</span>
              <p className="summary-card__subtitle">Batas harian</p>
            </div>
            <span className="summary-card__icon summary-card__icon--orange">
              <Clock size={20} />
            </span>
          </div>
          <div className="summary-card__value summary-card__value--orange">4h</div>
          <div className="summary-card__change">Hours</div>
        </Card>
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