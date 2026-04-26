import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, RefreshCw, GraduationCap, Calendar, Users, BookOpen, Search, Clock, Award, Edit, Trash2, BookTemplate, CheckCircle } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { trainingService } from '@/features/training/api/training.service';
import type { TrainingProgram } from '@/features/training/types/training.types';
import '@/shared/styles/CrudPage.css';
import '@/pages/dashboard/overview/OverviewPage.css';
import '@/pages/payroll/PayrollShared.css';
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
      <Card className="hero-card">
        <div className="hero-card-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <GraduationCap size={16} />
              <span>L & D</span>
            </div>
            <h1 className="hero-title">Program Pelatihan</h1>
            <p className="hero-subtitle">
              Kelola program pelatihan karyawan, sertifikasi, dan pengembangan keterampilan.
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn-outline" onClick={fetchData} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Segarkan
            </button>
            <button className="btn-primary" onClick={() => navigate('/training/programs/create')}>
              <Plus size={16} />
              Tambah Program
            </button>
          </div>
        </div>
      </Card>

      <div className="leave-requests-wrapper">
        <div className="leave-summary-card">
          <div className="leave-summary-header">
            <div>
              <p className="leave-summary-label">Total Program</p>
              <p className="leave-summary-subtitle">Seluruh program pelatihan</p>
            </div>
            <div className="leave-summary-icon-wrapper leave-icon-blue">
              <GraduationCap size={28} />
            </div>
          </div>
          <div className="leave-summary-value leave-value-blue">{programs.length}</div>
          <p className="leave-summary-trend">Program Pelatihan</p>
        </div>

        <div className="leave-summary-card">
          <div className="leave-summary-header">
            <div>
              <p className="leave-summary-label">Aktif</p>
              <p className="leave-summary-subtitle">Program yang sedang aktif</p>
            </div>
            <div className="leave-summary-icon-wrapper leave-icon-green">
              <CheckCircle size={28} />
            </div>
          </div>
          <div className="leave-summary-value leave-value-green">{activePrograms}</div>
          <p className="leave-summary-trend">Program Aktif</p>
        </div>

        <div className="leave-summary-card">
          <div className="leave-summary-header">
            <div>
              <p className="leave-summary-label">Terdaftar</p>
              <p className="leave-summary-subtitle">Total peserta</p>
            </div>
            <div className="leave-summary-icon-wrapper leave-icon-orange">
              <Users size={28} />
            </div>
          </div>
          <div className="leave-summary-value leave-value-orange">{totalEnrolled}</div>
          <p className="leave-summary-trend">Karyawan Terdaftar</p>
        </div>
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