import React, { useState, useEffect } from 'react';
import { RefreshCw, Award, TrendingUp, Users, CheckCircle, Clock } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { trainingService } from '@/features/training/api/training.service';
import '@/shared/styles/CrudPage.css';

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
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-badge">ESS</span>
          <h1>My Competencies</h1>
          <p>View your skill inventory, certifications, and competency levels.</p>
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
              <span className="summary-card__label">Total Skills</span>
              <p className="summary-card__subtitle">All competencies</p>
            </div>
            <span className="summary-card__icon summary-card__icon--blue">
              <Award size={20} />
            </span>
          </div>
          <div className="summary-card__value summary-card__value--blue">{competencies.length}</div>
          <div className="summary-card__change">Skills assigned</div>
        </Card>

        <Card className="summary-card" glass>
          <div className="summary-card__header">
            <div>
              <span className="summary-card__label">Expert Level</span>
              <p className="summary-card__subtitle">Expert skills</p>
            </div>
            <span className="summary-card__icon summary-card__icon--purple">
              <TrendingUp size={20} />
            </span>
          </div>
          <div className="summary-card__value summary-card__value--purple">{expertCount}</div>
          <div className="summary-card__change">Expert level</div>
        </Card>

        <Card className="summary-card" glass>
          <div className="summary-card__header">
            <div>
              <span className="summary-card__label">Advanced</span>
              <p className="summary-card__subtitle">Advanced skills</p>
            </div>
            <span className="summary-card__icon summary-card__icon--green">
              <CheckCircle size={20} />
            </span>
          </div>
          <div className="summary-card__value summary-card__value--green">{advancedCount}</div>
          <div className="summary-card__change">Advanced level</div>
        </Card>
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