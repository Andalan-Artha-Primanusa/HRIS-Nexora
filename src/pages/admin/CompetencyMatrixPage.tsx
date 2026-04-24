import React, { useState, useEffect } from 'react';
import { Search, Download, Award, Users, TrendingUp } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { trainingService } from '@/features/training/api/training.service';
import '@/shared/styles/CrudPage.css';

const CompetencyMatrixPage: React.FC = () => {
  const [competencies, setCompetencies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await trainingService.getCompetencies();
        const competenciesArray = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
        setCompetencies(competenciesArray);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getLevelColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'expert': return '#8b5cf6';
      case 'advanced': return '#2563eb';
      case 'intermediate': return '#10b981';
      default: return '#64748b';
    }
  };

  const expertCount = competencies.filter(c => c.level?.toLowerCase() === 'expert').length;
  const advancedCount = competencies.filter(c => c.level?.toLowerCase() === 'advanced').length;
  const intermediateCount = competencies.filter(c => c.level?.toLowerCase() === 'intermediate').length;

  return (
    <div className="crud-page">
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-badge">Competency</span>
          <h1>Competency Matrix</h1>
          <p>Mapping employee skills, technical expertise, and core competencies.</p>
        </div>
        <div className="page-header-actions">
          <Button variant="outline" size="md">
            <Download size={16} />
            Export Matrix
          </Button>
          <Button variant="primary" size="md">
            <Award size={16} />
            Assign Skills
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
          <div className="summary-card__change">Total skills</div>
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
              <Award size={20} />
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
              <h3>Skill Inventory</h3>
              <span className="wuw-count-badge">{competencies.length} Total</span>
            </div>
            <div className="search-box">
              <Search size={18} />
              <input type="text" placeholder="Search skills..." />
            </div>
          </div>
        </div>

        <div className="wuw-table-area">
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Competency Name</th>
                  <th>Category</th>
                  <th>Required Level</th>
                  <th>Assigned Employees</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} style={{ textAlign: 'center' }}>Loading...</td></tr>
                ) : competencies.length === 0 ? (
                  <tr><td colSpan={4} style={{ textAlign: 'center' }}>No competencies found.</td></tr>
                ) : (
                  competencies.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <div className="cell-name">
                          <div className="cell-avatar" style={{ background: getLevelColor(c.level) + '20', color: getLevelColor(c.level) }}>
                            <Award size={16} />
                          </div>
                          <div className="cell-stacked">
                            <span className="cell-name-text">{c.name}</span>
                          </div>
                        </div>
                      </td>
                      <td>{c.category || '-'}</td>
                      <td>
                        <span style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600, background: getLevelColor(c.level) + '20', color: getLevelColor(c.level) }}>
                          {c.level || 'N/A'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Users size={14} color="#64748b" />
                          {c.employee_count || c.assigned_count || 0}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompetencyMatrixPage;