import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, RefreshCw, GraduationCap, Calendar, Users, BookOpen, Search, Clock, Award, Edit, Trash2 } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { trainingService } from '@/features/training/api/training.service';
import type { TrainingProgram } from '@/features/training/types/training.types';
import '@/shared/styles/CrudPage.css';
import './TrainingProgramsPage.css';

const TrainingProgramsPage: React.FC = () => {
  const navigate = useNavigate();
  const [programs, setPrograms] = useState<TrainingProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await trainingService.getPrograms();
      const programsArray = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
      setPrograms(programsArray);
    } catch (error) {
      console.error('Error fetching programs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredPrograms = programs.filter(p => 
    p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activePrograms = programs.filter(p => p.status === 'active').length;
  const totalEnrolled = programs.reduce((sum, p) => sum + (p.enrolled_count || 0), 0);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      technical: '#3b82f6',
      soft_skills: '#8b5cf6',
      leadership: '#f59e0b',
      compliance: '#ef4444',
      safety: '#10b981',
      other: '#64748b',
    };
    return colors[category?.toLowerCase()] || colors.other;
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this program?')) {
      try {
        await trainingService.updateTraining(id, { status: 'deleted' } as any);
        fetchData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="crud-page training-page">
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-badge">L&D</span>
          <h1>Training Programs</h1>
          <p>Manage employee training programs, certifications, and skill development.</p>
        </div>
        <div className="page-header-actions">
          <Button variant="outline" size="md" onClick={fetchData} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </Button>
          <Button variant="primary" size="md" onClick={() => navigate('/training/programs/create')}>
            <Plus size={16} />
            New Program
          </Button>
        </div>
      </div>

      <div className="summary-grid">
        <Card className="summary-card" glass>
          <div className="summary-card__header">
            <div>
              <span className="summary-card__label">Total Programs</span>
              <p className="summary-card__subtitle">All programs</p>
            </div>
            <span className="summary-card__icon summary-card__icon--blue">
              <GraduationCap size={20} />
            </span>
          </div>
          <div className="summary-card__value summary-card__value--blue">{programs.length}</div>
          <div className="summary-card__change">Programs</div>
        </Card>

        <Card className="summary-card" glass>
          <div className="summary-card__header">
            <div>
              <span className="summary-card__label">Active</span>
              <p className="summary-card__subtitle">Currently active</p>
            </div>
            <span className="summary-card__icon summary-card__icon--green">
              <Clock size={20} />
            </span>
          </div>
          <div className="summary-card__value summary-card__value--green">{activePrograms}</div>
          <div className="summary-card__change">Active programs</div>
        </Card>

        <Card className="summary-card" glass>
          <div className="summary-card__header">
            <div>
              <span className="summary-card__label">Enrolled</span>
              <p className="summary-card__subtitle">Total participants</p>
            </div>
            <span className="summary-card__icon summary-card__icon--orange">
              <Users size={20} />
            </span>
          </div>
          <div className="summary-card__value summary-card__value--orange">{totalEnrolled}</div>
          <div className="summary-card__change">Enrolled employees</div>
        </Card>
      </div>

      <div className="white-unified-wrapper">
        <div className="wuw-header">
          <div className="wuw-header-top">
            <div className="wuw-title-area">
              <h3>Program List</h3>
              <span className="wuw-count-badge">{filteredPrograms.length} programs</span>
            </div>
            <div className="search-box">
              <Search size={18} />
              <input 
                type="text" 
                placeholder="Search programs..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="wuw-table-area">
          {loading ? (
            <div className="loading-state">
              <RefreshCw size={32} className="animate-spin" />
              <p>Loading programs...</p>
            </div>
          ) : filteredPrograms.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <GraduationCap size={48} />
              </div>
              <h4>No programs found</h4>
              <p>Create your first training program to get started.</p>
              <Button variant="primary" onClick={() => navigate('/training/programs/create')}>
                <Plus size={16} /> Create Program
              </Button>
            </div>
          ) : (
            <div className="program-grid">
              {filteredPrograms.map((program) => (
                <Card key={program.id} className="program-card" glass>
                  <div className="program-header">
                    <div 
                      className="program-icon"
                      style={{ background: `${getCategoryColor(program.category)}20`, color: getCategoryColor(program.category) }}
                    >
                      <BookOpen size={20} />
                    </div>
                    <div className="program-info">
                      <h4>{program.title}</h4>
                      <span className="program-category" style={{ color: getCategoryColor(program.category) }}>
                        {program.category || 'Other'}
                      </span>
                    </div>
                    <span className={`program-status ${program.status === 'active' ? 'active' : 'inactive'}`}>
                      {program.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <p className="program-description">{program.description || 'No description provided.'}</p>
                  
                  <div className="program-meta">
                    <div className="meta-item">
                      <Clock size={14} />
                      <span>{program.duration || '0'} hours</span>
                    </div>
                    <div className="meta-item">
                      <Users size={14} />
                      <span>{program.enrolled_count || 0} enrolled</span>
                    </div>
                    {program.completion_rate && (
                      <div className="meta-item">
                        <Award size={14} />
                        <span>{program.completion_rate}% completion</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="program-actions">
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/training/programs/edit/${program.id}`)}>
                      <Edit size={16} /> Edit
                    </Button>
                    <Button variant="ghost" size="sm" danger onClick={(e) => handleDelete(program.id, e)}>
                      <Trash2 size={16} /> Delete
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrainingProgramsPage;