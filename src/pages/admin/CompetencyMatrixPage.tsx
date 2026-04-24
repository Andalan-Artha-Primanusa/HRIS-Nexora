import React, { useState, useEffect } from 'react';
import { Search, Download, Award, Users, TrendingUp, Plus, RefreshCw, Edit, Trash2, Target, Star } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { trainingService } from '@/features/training/api/training.service';
import '@/shared/styles/CrudPage.css';
import './CompetencyMatrixPage.css';

const CompetencyMatrixPage: React.FC = () => {
  const [competencies, setCompetencies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');

  const fetchData = async () => {
    setLoading(true);
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

  useEffect(() => {
    fetchData();
  }, []);

  const filteredCompetencies = competencies.filter(c => {
    const matchesSearch = 
      c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = levelFilter === 'all' || c.level?.toLowerCase() === levelFilter;
    return matchesSearch && matchesLevel;
  });

  const expertCount = competencies.filter(c => c.level?.toLowerCase() === 'expert').length;
  const advancedCount = competencies.filter(c => c.level?.toLowerCase() === 'advanced').length;
  const intermediateCount = competencies.filter(c => c.level?.toLowerCase() === 'intermediate').length;

  const getLevelColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'expert': return { color: '#8b5cf6', bg: '#f5f3ff', label: 'Expert' };
      case 'advanced': return { color: '#2563eb', bg: '#eff6ff', label: 'Advanced' };
      case 'intermediate': return { color: '#10b981', bg: '#ecfdf5', label: 'Intermediate' };
      case 'beginner': return { color: '#f59e0b', bg: '#fffbeb', label: 'Beginner' };
      default: return { color: '#64748b', bg: '#f1f5f9', label: 'Unknown' };
    }
  };

  const levelFilters = [
    { key: 'all', label: 'All Levels' },
    { key: 'expert', label: 'Expert' },
    { key: 'advanced', label: 'Advanced' },
    { key: 'intermediate', label: 'Intermediate' },
    { key: 'beginner', label: 'Beginner' },
  ];

  return (
    <div className="crud-page competency-page">
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-badge">Competency</span>
          <h1>Competency Matrix</h1>
          <p>Manage employee skills, technical expertise, and core competencies.</p>
        </div>
        <div className="page-header-actions">
          <Button variant="outline" size="md" onClick={fetchData} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </Button>
          <Button variant="outline" size="md">
            <Download size={16} />
            Export
          </Button>
          <Button variant="primary" size="md">
            <Plus size={16} />
            Add Competency
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
          <div className="summary-card__change">Skills</div>
        </Card>

        <Card className="summary-card" glass>
          <div className="summary-card__header">
            <div>
              <span className="summary-card__label">Expert</span>
              <p className="summary-card__subtitle">Expert level skills</p>
            </div>
            <span className="summary-card__icon summary-card__icon--purple">
              <Star size={20} />
            </span>
          </div>
          <div className="summary-card__value summary-card__value--purple">{expertCount}</div>
          <div className="summary-card__change">Expert skills</div>
        </Card>

        <Card className="summary-card" glass>
          <div className="summary-card__header">
            <div>
              <span className="summary-card__label">Advanced</span>
              <p className="summary-card__subtitle">Advanced level</p>
            </div>
            <span className="summary-card__icon summary-card__icon--green">
              <TrendingUp size={20} />
            </span>
          </div>
          <div className="summary-card__value summary-card__value--green">{advancedCount}</div>
          <div className="summary-card__change">Advanced skills</div>
        </Card>
      </div>

      <div className="white-unified-wrapper">
        <div className="wuw-header">
          <div className="wuw-header-top">
            <div className="wuw-title-area">
              <h3>Skill Inventory</h3>
              <span className="wuw-count-badge">{filteredCompetencies.length} skills</span>
            </div>
            <div className="header-actions">
              <div className="search-box">
                <Search size={18} />
                <input 
                  type="text" 
                  placeholder="Search skills..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="level-filters">
            {levelFilters.map(filter => (
              <button
                key={filter.key}
                className={`level-filter ${levelFilter === filter.key ? 'active' : ''}`}
                onClick={() => setLevelFilter(filter.key)}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div className="wuw-table-area">
          {loading ? (
            <div className="loading-state">
              <RefreshCw size={32} className="animate-spin" />
              <p>Loading competencies...</p>
            </div>
          ) : filteredCompetencies.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <Award size={48} />
              </div>
              <h4>No competencies found</h4>
              <p>Add your first competency to build the skill matrix.</p>
              <Button variant="primary">
                <Plus size={16} /> Add Competency
              </Button>
            </div>
          ) : (
            <div className="competency-grid">
              {filteredCompetencies.map((comp) => {
                const levelStyle = getLevelColor(comp.level);
                return (
                  <Card key={comp.id} className="competency-card" glass>
                    <div className="competency-header">
                      <div 
                        className="competency-icon"
                        style={{ background: levelStyle.bg, color: levelStyle.color }}
                      >
                        <Target size={20} />
                      </div>
                      <div className="competency-info">
                        <h4>{comp.name}</h4>
                        <span className="competency-category">{comp.category || 'General'}</span>
                      </div>
                      <span 
                        className="competency-level"
                        style={{ background: levelStyle.bg, color: levelStyle.color }}
                      >
                        {levelStyle.label}
                      </span>
                    </div>
                    
                    <p className="competency-description">{comp.description || 'No description provided.'}</p>
                    
                    <div className="competency-meta">
                      <div className="meta-item">
                        <Users size={14} />
                        <span>{comp.employee_count || comp.assigned_count || 0} assigned</span>
                      </div>
                      {comp.required_for && (
                        <div className="meta-item">
                          <Target size={14} />
                          <span>Required for: {comp.required_for}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="competency-actions">
                      <Button variant="ghost" size="sm">
                        <Edit size={16} /> Edit
                      </Button>
                      <Button variant="ghost" size="sm" danger>
                        <Trash2 size={16} /> Delete
                      </Button>
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

export default CompetencyMatrixPage;