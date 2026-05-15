import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Plus, RefreshCw, Users, Calendar, Edit2, Shield } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { engagementService } from '@/features/engagement/api/engagement.service';
import type { EngagementSurvey } from '@/features/engagement/types/engagement.types';
import { useAuthStore } from '@/app/store/auth.store';
import { RBACUtils } from '@/shared/hooks/rbac';
import '@/shared/styles/CrudPage.css';

const EngagementSurveysPage: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const canAccess = RBACUtils.hasPermission(user, ['employee.view', 'admin.access']);
  if (!canAccess) {
    return (
      <div className="crud-page"><Card className="hero-card"><div className="hero-card-inner"><div className="hero-content"><div className="hero-badge"><Shield size={16} /><span>Admin Center</span></div><h1 className="hero-title">Akses Ditolak</h1><p className="hero-subtitle">Anda tidak memiliki izin untuk mengakses halaman ini.</p></div></div></Card></div>
    );
  }
  const navigate = useNavigate();
  const [surveys, setSurveys] = useState<EngagementSurvey[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await engagementService.getSurveys();
      setSurveys(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error('Error fetching surveys:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="crud-page">
      <div className="crud-header">
        <div>
          <span className="reimb-badge reimb-badge-admin">Engagement</span>
          <h1>Engagement Surveys</h1>
          <p>Collect feedback and measure employee satisfaction.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="ghost" onClick={fetchData} disabled={loading}>
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </Button>
          <Button variant="primary" onClick={() => navigate('/engagement/surveys/create')}>
            <Plus size={18} style={{ marginRight: '8px' }} />
            Create Survey
          </Button>
        </div>
      </div>

      <div className="crud-table-wrap">
        <table className="crud-table">
          <thead>
            <tr>
              <th>Survey Title</th>
              <th>Status</th>
              <th>Period</th>
              <th>Responses</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {surveys.map((survey) => (
              <tr key={survey.id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{survey.title}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{survey.description}</div>
                </td>
                <td>
                  <span className={`status-pill status-${survey.status?.toLowerCase()}`}>
                    {survey.status}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}>
                    <Calendar size={14} color="#64748b" />
                    {new Date(survey.start_date).toLocaleDateString()} - {new Date(survey.end_date).toLocaleDateString()}
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Users size={14} color="#64748b" />
                    <span style={{ fontWeight: 600 }}>{survey.total_responses}</span>
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/engagement/surveys/edit/${survey.id}`)}>
                      <Edit2 size={16} style={{ marginRight: '4px' }} />
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/engagement/analytics/${survey.id}`)}>
                      <BarChart3 size={16} style={{ marginRight: '4px' }} />
                      Analytics
                    </Button>
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

export default EngagementSurveysPage;

