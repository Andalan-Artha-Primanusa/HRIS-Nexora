import React, { useState, useEffect } from 'react';
import { Search, Download, Award, Users, TrendingUp, Plus, RefreshCw, Edit, Trash2, Target, Star, BookTemplate } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { trainingService } from '@/features/training/api/training.service';
import '@/shared/styles/CrudPage.css';
import '@/pages/dashboard/overview/OverviewPage.css';
import '@/pages/payroll/PayrollShared.css';
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
      <Card className="hero-card">
        <div className="hero-card-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <Target size={16} />
              <span>Kompetensi</span>
            </div>
            <h1 className="hero-title">Matriks Kompetensi</h1>
            <p className="hero-subtitle">
              Kelola keterampilan, keahlian teknis, dan kompetensi inti karyawan.
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn-outline" onClick={fetchData} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Segarkan
            </button>
            <button className="btn-primary" onClick={() => {}}>
              <Download size={16} />
              Ekspor
            </button>
          </div>
        </div>
      </Card>

      <div className="leave-requests-wrapper">
        <div className="leave-summary-card">
          <div className="leave-summary-header">
            <div>
              <p className="leave-summary-label">Total Kompetensi</p>
              <p className="leave-summary-subtitle">Seluruh kompetensi karyawan</p>
            </div>
            <div className="leave-summary-icon-wrapper leave-icon-blue">
              <Award size={28} />
            </div>
          </div>
          <div className="leave-summary-value leave-value-blue">{competencies.length}</div>
          <p className="leave-summary-trend">Kompetensi</p>
        </div>

        <div className="leave-summary-card">
          <div className="leave-summary-header">
            <div>
              <p className="leave-summary-label">Ahli</p>
              <p className="leave-summary-subtitle">Tingkat ahli</p>
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
              <p className="leave-summary-label">Mahir</p>
              <p className="leave-summary-subtitle">Tingkat mahir</p>
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