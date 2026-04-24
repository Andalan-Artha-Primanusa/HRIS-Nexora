import React, { useState, useEffect } from 'react';
import { RefreshCw, GraduationCap, Clock, CheckCircle, BookOpen, Play } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { api } from '@/shared/api/httpClient';
import '@/shared/styles/CrudPage.css';

const MyTrainingsPage: React.FC = () => {
  const [trainings, setTrainings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/my/trainings');
      const data = response.data;
      const trainingsArray = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
      setTrainings(trainingsArray);
    } catch (error) {
      console.error('Error fetching my trainings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const completedTrainings = trainings.filter(t => t.status === 'completed');
  const inProgressTrainings = trainings.filter(t => t.status === 'in_progress' || t.status === 'ongoing');
  const upcomingTrainings = trainings.filter(t => t.status === 'upcoming' || t.status === 'scheduled');

  const getStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return { icon: CheckCircle, color: '#10b981', bg: '#ecfdf5' };
      case 'in_progress': case 'ongoing': return { icon: Play, color: '#f59e0b', bg: '#fffbeb' };
      case 'upcoming': case 'scheduled': return { icon: Clock, color: '#6366f1', bg: '#eef2ff' };
      default: return { icon: Clock, color: '#64748b', bg: '#f1f5f9' };
    }
  };

  return (
    <div className="crud-page">
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-badge">ESS</span>
          <h1>My Trainings</h1>
          <p>Track your training enrollments, progress, and completed courses.</p>
        </div>
        <div className="page-header-actions">
          <Button variant="outline" size="md" onClick={fetchData} disabled={loading}>
            <RefreshCw size={16} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="summary-grid">
        <Card className="summary-card" glass>
          <div className="summary-card__header">
            <div>
              <span className="summary-card__label">Total Enrollments</span>
              <p className="summary-card__subtitle">All trainings</p>
            </div>
            <span className="summary-card__icon summary-card__icon--blue">
              <GraduationCap size={20} />
            </span>
          </div>
          <div className="summary-card__value summary-card__value--blue">{trainings.length}</div>
          <div className="summary-card__change">Enrolled programs</div>
        </Card>

        <Card className="summary-card" glass>
          <div className="summary-card__header">
            <div>
              <span className="summary-card__label">In Progress</span>
              <p className="summary-card__subtitle">Active trainings</p>
            </div>
            <span className="summary-card__icon summary-card__icon--orange">
              <Play size={20} />
            </span>
          </div>
          <div className="summary-card__value summary-card__value--orange">{inProgressTrainings.length}</div>
          <div className="summary-card__change">Ongoing</div>
        </Card>

        <Card className="summary-card" glass>
          <div className="summary-card__header">
            <div>
              <span className="summary-card__label">Completed</span>
              <p className="summary-card__subtitle">Finished trainings</p>
            </div>
            <span className="summary-card__icon summary-card__icon--green">
              <CheckCircle size={20} />
            </span>
          </div>
          <div className="summary-card__value summary-card__value--green">{completedTrainings.length}</div>
          <div className="summary-card__change">Completed</div>
        </Card>
      </div>

      <div className="white-unified-wrapper">
        <div className="wuw-header">
          <div className="wuw-header-top">
            <div className="wuw-title-area">
              <h3>My Training History</h3>
              <span className="wuw-count-badge">{trainings.length} Total</span>
            </div>
          </div>
        </div>

        <div className="wuw-table-area">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>Loading...</div>
          ) : trainings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
              <GraduationCap size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
              <p>No training enrollments yet.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {trainings.map((training) => {
                const statusStyle = getStatusStyle(training.status);
                const StatusIcon = statusStyle.icon;
                return (
                  <Card key={training.id} glass style={{ padding: '1.5rem', borderRadius: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
                      <div style={{ padding: '10px', background: statusStyle.bg, borderRadius: '10px', color: statusStyle.color }}>
                        <BookOpen size={20} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: 0, fontWeight: 700, color: '#1e293b' }}>{training.program?.title || training.title || 'Training'}</h4>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>{training.category || training.program?.category}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600, background: statusStyle.bg, color: statusStyle.color }}>
                        <StatusIcon size={12} style={{ marginRight: '4px' }} />
                        {training.status || 'Pending'}
                      </span>
                      {training.progress !== undefined && (
                        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{training.progress}%</span>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyTrainingsPage;