import React, { useState, useEffect } from 'react';
import { RefreshCw, Award, TrendingUp, Users, CheckCircle, Clock, Target, Star } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { trainingService } from '@/features/training/api/training.service';
import '@/shared/styles/CrudPage.css';
import '@/pages/dashboard/overview/OverviewPage.css';
import '@/pages/payroll/PayrollShared.css';

const MyCompetenciesPage: React.FC = () => {
  const [competencies, setCompetencies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await trainingService.getMyCompetencies();
      const competenciesArray = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
      setCompetencies(competenciesArray);
    } catch (error) {
      console.error('Error fetching my competencies:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getLevelColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'expert': return { color: '#8b5cf6', bg: '#f5f3ff' };
      case 'advanced': return { color: '#2563eb', bg: '#eff6ff' };
      case 'intermediate': return { color: '#10b981', bg: '#ecfdf5' };
      case 'beginner': return { color: '#f59e0b', bg: '#fffbeb' };
      default: return { color: '#64748b', bg: '#f1f5f9' };
    }
  };

  const expertCount = competencies.filter(c => c.level?.toLowerCase() === 'expert').length;
  const advancedCount = competencies.filter(c => c.level?.toLowerCase() === 'advanced').length;
  const inProgressCount = competencies.filter(c => c.status === 'in_progress' || c.status === 'ongoing').length;

  return (
    <div className="crud-page">
      <Card className="hero-card">
        <div className="hero-card-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <Target size={16} />
              <span>Layanan Mandiri</span>
            </div>
            <h1 className="hero-title">Kompetensi Saya</h1>
            <p className="hero-subtitle">
              Lihat inventaris keterampilan, sertifikasi, dan tingkat kompetensi Anda.
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn-outline" onClick={fetchData} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Segarkan
            </button>
          </div>
        </div>
      </Card>

      <div className="leave-requests-wrapper">
        <div className="leave-summary-card">
          <div className="leave-summary-header">
            <div>
              <p className="leave-summary-label">Total Kompetensi</p>
              <p className="leave-summary-subtitle">Seluruh kompetensi</p>
            </div>
            <div className="leave-summary-icon-wrapper leave-icon-blue">
              <Award size={28} />
            </div>
          </div>
          <div className="leave-summary-value leave-value-blue">{competencies.length}</div>
          <p className="leave-summary-trend">Total Kompetensi</p>
        </div>

        <div className="leave-summary-card">
          <div className="leave-summary-header">
            <div>
              <p className="leave-summary-label">Tingkat Ahli</p>
              <p className="leave-summary-subtitle">Keahlian ahli</p>
            </div>
            <div className="leave-summary-icon-wrapper" style={{ background: '#f5f3ff' }}>
              <Star size={28} color="#8b5cf6" />
            </div>
          </div>
          <div className="leave-summary-value" style={{ color: '#8b5cf6' }}>{expertCount}</div>
          <p className="leave-summary-trend">Keahlian Ahli</p>
        </div>

        <div className="leave-summary-card">
          <div className="leave-summary-header">
            <div>
              <p className="leave-summary-label">Tingkat Mahir</p>
              <p className="leave-summary-subtitle">Keahlian mahir</p>
            </div>
            <div className="leave-summary-icon-wrapper leave-icon-green">
              <TrendingUp size={28} />
            </div>
          </div>
          <div className="leave-summary-value leave-value-green">{advancedCount}</div>
          <p className="leave-summary-trend">Keahlian Mahir</p>
        </div>
      </div>

      <div className="white-unified-wrapper">
        <div className="wuw-header">
          <div className="wuw-header-top">
            <div className="wuw-title-area">
              <h3>My Skill Inventory</h3>
              <span className="wuw-count-badge">{competencies.length} Total</span>
            </div>
          </div>
        </div>

        <div className="wuw-table-area">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>Loading...</div>
          ) : competencies.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
              <Award size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
              <p>No competencies assigned yet.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {competencies.map((comp) => {
                const levelStyle = getLevelColor(comp.level);
                return (
                  <Card key={comp.id} glass style={{ padding: '1.5rem', borderRadius: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
                      <div style={{ padding: '10px', background: levelStyle.bg, borderRadius: '10px', color: levelStyle.color }}>
                        <Award size={20} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: 0, fontWeight: 700, color: '#1e293b' }}>{comp.name || comp.skill_name}</h4>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>{comp.category}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600, background: levelStyle.bg, color: levelStyle.color }}>
                        {comp.level || 'N/A'}
                      </span>
                      {comp.verified && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#10b981' }}>
                          <CheckCircle size={12} />
                          Verified
                        </span>
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

export default MyCompetenciesPage;