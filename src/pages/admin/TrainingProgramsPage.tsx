import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, RefreshCw, GraduationCap, Calendar, Users, BookOpen } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { trainingService } from '@/features/training/api/training.service';
import type { TrainingProgram } from '@/features/training/types/training.types';
import '@/shared/styles/CrudPage.css';

const TrainingProgramsPage: React.FC = () => {
  const navigate = useNavigate();
  const [programs, setPrograms] = useState<TrainingProgram[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="crud-page">
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-badge">L&D</span>
          <h1>Training & Development</h1>
          <p>Manage employee training programs, certifications, and skill development.</p>
        </div>
        <div className="page-header-actions">
          <Button variant="outline" size="md" onClick={fetchData} disabled={loading}>
            <RefreshCw size={16} />
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
              <p className="summary-card__subtitle">All training programs</p>
            </div>
            <span className="summary-card__icon summary-card__icon--blue">
              <GraduationCap size={20} />
            </span>
          </div>
          <div className="summary-card__value summary-card__value--blue">{programs.length}</div>
          <div className="summary-card__change">Active programs</div>
        </Card>

        <Card className="summary-card" glass>
          <div className="summary-card__header">
            <div>
              <span className="summary-card__label">Scheduled</span>
              <p className="summary-card__subtitle">Upcoming trainings</p>
            </div>
            <span className="summary-card__icon summary-card__icon--green">
              <Calendar size={20} />
            </span>
          </div>
          <div className="summary-card__value summary-card__value--green">
            {programs.filter(p => p.status === 'active').length}
          </div>
          <div className="summary-card__change">Active sessions</div>
        </Card>

        <Card className="summary-card" glass>
          <div className="summary-card__header">
            <div>
              <span className="summary-card__label">Participants</span>
              <p className="summary-card__subtitle">Enrolled employees</p>
            </div>
            <span className="summary-card__icon summary-card__icon--orange">
              <Users size={20} />
            </span>
          </div>
          <div className="summary-card__value summary-card__value--orange">
            {programs.reduce((sum, p) => sum + (p.enrolled_count || 0), 0)}
          </div>
          <div className="summary-card__change">Total enrolled</div>
        </Card>
      </div>

      <div className="white-unified-wrapper">
        <div className="wuw-header">
          <div className="wuw-header-top">
            <div className="wuw-title-area">
              <h3>Daftar Program</h3>
              <span className="wuw-count-badge">{programs.length} Total</span>
            </div>
          </div>
        </div>

        <div className="wuw-table-area">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {loading ? (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem' }}>Loading programs...</div>
            ) : programs.length === 0 ? (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem' }}>No training programs found.</div>
            ) : programs.map((program) => (
              <Card key={program.id} glass style={{ padding: '1.5rem', borderRadius: '16px', cursor: 'pointer' }} onClick={() => navigate(`/training/programs/edit/${program.id}`)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
                  <div style={{ padding: '10px', background: 'linear-gradient(135deg, #f5f3ff, #ede9fe)', borderRadius: '10px', color: '#8b5cf6' }}>
                    <BookOpen size={20} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: 0, fontWeight: 700, color: '#1e293b' }}>{program.title}</h4>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>{program.category}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#64748b' }}>
                  <span>{program.duration || '0h'} duration</span>
                  <span>{program.enrolled_count || 0} enrolled</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainingProgramsPage;