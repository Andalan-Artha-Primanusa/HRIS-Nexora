import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { TrainingCard } from '@/features/training/components/TrainingCard';
import { trainingService } from '@/features/training/api/training.service';
import type { TrainingProgram } from '@/features/training/types/training.types';

const TrainingProgramsPage: React.FC = () => {
  const navigate = useNavigate();
  const [programs, setPrograms] = useState<TrainingProgram[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await trainingService.getPrograms();
      setPrograms(Array.isArray(data) ? data : data.data || []);
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
      <div className="crud-header">
        <div>
          <span className="reimb-badge reimb-badge-admin">L&D</span>
          <h1>Training & Development</h1>
          <p>Manage employee training programs, certifications, and skill development.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="ghost" onClick={fetchData} disabled={loading}>
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </Button>
          <Button variant="primary" onClick={() => navigate('/training/programs/create')}>
            <Plus size={18} style={{ marginRight: '8px' }} />
            New Program
          </Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {loading ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem' }}>Loading programs...</div>
        ) : programs.length === 0 ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem' }}>No training programs found.</div>
        ) : programs.map((program) => (
          <div key={program.id} onClick={() => navigate(`/training/programs/edit/${program.id}`)} style={{ cursor: 'pointer' }}>
             <TrainingCard program={program} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrainingProgramsPage;

