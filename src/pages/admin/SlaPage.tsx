import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle2, AlertCircle, BarChart3, ArrowLeft, RefreshCw } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import '@/shared/styles/CrudPage.css';

const SlaPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [stats] = useState({
    avg_response_time: '2.4 hrs',
    avg_resolution_time: '18.5 hrs',
    sla_compliance: '94.2%',
    on_time_resolution: 145,
    breached_tickets: 8
  });

  const fetchData = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => setLoading(false), 800);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="crud-page">
      <div className="crud-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Button variant="ghost" onClick={() => navigate('/hr-requests')}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <span className="reimb-badge reimb-badge-admin">Analytics</span>
            <h1>Service Level Agreement (SLA)</h1>
            <p>Performance metrics for HR support and service delivery.</p>
          </div>
        </div>
        <Button variant="ghost" onClick={fetchData}>
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </Button>
      </div>

      <div className="summary-grid">
        <Card glass className="summary-card">
          <div className="summary-card__header">
            <span className="summary-card__label">SLA Compliance</span>
            <div className="summary-card__icon summary-card__icon--blue"><CheckCircle2 size={20} /></div>
          </div>
          <div className="summary-card__value">{stats.sla_compliance}</div>
          <div className="summary-card__change" style={{ color: '#10b981' }}>+1.2% from last month</div>
        </Card>

        <Card glass className="summary-card">
          <div className="summary-card__header">
            <span className="summary-card__label">Avg. Response Time</span>
            <div className="summary-card__icon summary-card__icon--orange"><Clock size={20} /></div>
          </div>
          <div className="summary-card__value">{stats.avg_response_time}</div>
          <div className="summary-card__change">Target: 4.0 hrs</div>
        </Card>

        <Card glass className="summary-card">
          <div className="summary-card__header">
            <span className="summary-card__label">Breached Tickets</span>
            <div className="summary-card__icon summary-card__icon--red"><AlertCircle size={20} /></div>
          </div>
          <div className="summary-card__value">{stats.breached_tickets}</div>
          <div className="summary-card__change" style={{ color: '#ef4444' }}>Needs immediate attention</div>
        </Card>
      </div>

      <Card glass style={{ padding: '2rem' }}>
        <h3 style={{ margin: '0 0 1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <BarChart3 size={20} color="#2563eb" /> Resolution Performance
        </h3>
        <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', borderRadius: '12px', color: '#94a3b8' }}>
          [ SLA Performance Chart - Placeholder ]
        </div>
      </Card>
    </div>
  );
};

export default SlaPage;
