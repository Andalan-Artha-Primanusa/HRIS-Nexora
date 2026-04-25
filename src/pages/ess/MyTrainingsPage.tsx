import React, { useState, useEffect } from 'react';
import { RefreshCw, GraduationCap, Clock, CheckCircle, BookOpen, Play, BookTemplate } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { api } from '@/shared/api/httpClient';
import '@/shared/styles/CrudPage.css';
import '@/pages/dashboard/overview/OverviewPage.css';
import '@/pages/payroll/PayrollShared.css';

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
      <Card className="hero-card">
        <div className="hero-card-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <BookTemplate size={16} />
              <span>Layanan Mandiri</span>
            </div>
            <h1 className="hero-title">Pelatihan Saya</h1>
            <p className="hero-subtitle">
              Lacak pendaftaran pelatihan, kemajuan, dan kursus yang telah selesai.
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn-outline" onClick={fetchData} disabled={loading}>
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Segarkan
            </button>
          </div>
        </div>
      </Card>

      <div className="leave-requests-wrapper">
        <div className="leave-summary-card">
          <div className="leave-summary-header">
            <div>
              <p className="leave-summary-label">Total Pendaftaran</p>
              <p className="leave-summary-subtitle">Seluruh pelatihan</p>
            </div>
            <div className="leave-summary-icon-wrapper leave-icon-blue">
              <GraduationCap size={28} />
            </div>
          </div>
          <div className="leave-summary-value leave-value-blue">{trainings.length}</div>
          <p className="leave-summary-trend">Total Pelatihan</p>
        </div>

        <div className="leave-summary-card">
          <div className="leave-summary-header">
            <div>
              <p className="leave-summary-label">Sedang Berlangsung</p>
              <p className="leave-summary-subtitle">Pelatihan aktif</p>
            </div>
            <div className="leave-summary-icon-wrapper leave-icon-orange">
              <Play size={28} />
            </div>
          </div>
          <div className="leave-summary-value leave-value-orange">{inProgressTrainings.length}</div>
          <p className="leave-summary-trend">Sedang Berlangsung</p>
        </div>

        <div className="leave-summary-card">
          <div className="leave-summary-header">
            <div>
              <p className="leave-summary-label">Selesai</p>
              <p className="leave-summary-subtitle">Pelatihan selesai</p>
            </div>
            <div className="leave-summary-icon-wrapper leave-icon-green">
              <CheckCircle size={28} />
            </div>
          </div>
          <div className="leave-summary-value leave-value-green">{completedTrainings.length}</div>
          <p className="leave-summary-trend">Pelatihan Selesai</p>
        </div>
      </div>

      <div className="white-unified-wrapper">
        <div className="wuw-header">
          <div className="wuw-header-top">
            <div className="wuw-title-area">
              <h3>Daftar Pelatihan</h3>
              <span className="wuw-count-badge">{trainings.length} pelatihan</span>
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