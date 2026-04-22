import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, TrendingUp, Users, Heart, ArrowLeft, RefreshCw, PieChart } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import '@/shared/styles/CrudPage.css';

const EngagementAnalyticsPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const fetchData = async () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 800);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="crud-page">
      <div className="crud-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Button variant="ghost" onClick={() => navigate('/engagement/surveys')}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <span className="reimb-badge reimb-badge-admin">Analytics</span>
            <h1>Engagement Insights</h1>
            <p>Analyze employee sentiment and survey participation trends.</p>
          </div>
        </div>
        <Button variant="ghost" onClick={fetchData}>
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </Button>
      </div>

      <div className="summary-grid">
        <Card glass className="summary-card">
          <div className="summary-card__header">
            <span className="summary-card__label">Overall eNPS</span>
            <div className="summary-card__icon summary-card__icon--blue"><Heart size={20} /></div>
          </div>
          <div className="summary-card__value">72</div>
          <div className="summary-card__change" style={{ color: '#10b981' }}>+5 from last quarter</div>
        </Card>

        <Card glass className="summary-card">
          <div className="summary-card__header">
            <span className="summary-card__label">Participation Rate</span>
            <div className="summary-card__icon summary-card__icon--green"><Users size={20} /></div>
          </div>
          <div className="summary-card__value">86%</div>
          <div className="summary-card__change">Target: 90%</div>
        </Card>

        <Card glass className="summary-card">
          <div className="summary-card__header">
            <span className="summary-card__label">Satisfaction Score</span>
            <div className="summary-card__icon summary-card__icon--purple"><TrendingUp size={20} /></div>
          </div>
          <div className="summary-card__value">4.2/5</div>
          <div className="summary-card__change">Stable</div>
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <Card glass style={{ padding: '2rem' }}>
          <h3 style={{ margin: '0 0 1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BarChart3 size={20} color="#2563eb" /> Sentiment by Department
          </h3>
          <div style={{ height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', borderRadius: '12px', color: '#94a3b8' }}>
            [ Sentiment Bar Chart ]
          </div>
        </Card>

        <Card glass style={{ padding: '2rem' }}>
          <h3 style={{ margin: '0 0 1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <PieChart size={20} color="#8b5cf6" /> Participation Breakdown
          </h3>
          <div style={{ height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', borderRadius: '12px', color: '#94a3b8' }}>
            [ Participation Pie Chart ]
          </div>
        </Card>
      </div>
    </div>
  );
};

export default EngagementAnalyticsPage;
