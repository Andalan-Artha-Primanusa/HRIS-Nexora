import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, GraduationCap, Calendar, User, BookOpen, Clock, Globe } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { trainingService } from '@/features/training/api/training.service';
import '@/shared/styles/CrudPage.css';

const TrainingFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Technical',
    provider: '',
    duration: '',
    start_date: '',
    end_date: '',
    max_participants: 0,
    status: 'Planned'
  });

  useEffect(() => {
    if (isEdit) {
      const fetchTraining = async () => {
        setFetching(true);
        try {
          const data = await trainingService.getTraining(id);
          setFormData(data.data || data);
        } catch (err) {
          console.error(err);
        } finally {
          setFetching(false);
        }
      };
      fetchTraining();
    }
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) {
        await trainingService.updateTraining(id, formData);
      } else {
        await trainingService.createTraining(formData);
      }
      navigate('/training/programs');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (fetching) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading training details...</div>;

  return (
    <div className="crud-page">
      <div className="crud-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
           <Button variant="ghost" onClick={() => navigate('/training/programs')}>
              <ArrowLeft size={20} />
           </Button>
           <div>
              <span className="reimb-badge reimb-badge-admin">Training</span>
              <h1>{isEdit ? 'Edit Training Program' : 'Develop New Program'}</h1>
              <p>Design curricula, set schedules, and manage enrollments.</p>
           </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <Card glass style={{ padding: '2rem' }}>
                 <h3 style={{ margin: '0 0 1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <BookOpen size={20} color="#2563eb" /> Program Details
                 </h3>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div className="form-group">
                       <label>Program Title</label>
                       <input name="title" value={formData.title} onChange={handleChange} className="form-control" required placeholder="e.g. Advanced React & TypeScript Patterns" />
                    </div>
                    <div className="form-group">
                       <label>Description</label>
                       <textarea name="description" value={formData.description} onChange={handleChange} className="form-control" rows={6} placeholder="What will participants learn in this program?" />
                    </div>
                 </div>
              </Card>

              <Card glass style={{ padding: '2rem' }}>
                 <h3 style={{ margin: '0 0 1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Clock size={20} color="#2563eb" /> Schedule & Timeline
                 </h3>
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                    <div className="form-group">
                       <label>Start Date</label>
                       <div style={{ position: 'relative' }}>
                          <Calendar size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                          <input name="start_date" type="date" value={formData.start_date} onChange={handleChange} className="form-control" style={{ paddingLeft: '40px' }} />
                       </div>
                    </div>
                    <div className="form-group">
                       <label>End Date</label>
                       <div style={{ position: 'relative' }}>
                          <Calendar size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                          <input name="end_date" type="date" value={formData.end_date} onChange={handleChange} className="form-control" style={{ paddingLeft: '40px' }} />
                       </div>
                    </div>
                    <div className="form-group">
                       <label>Duration (e.g. 3 Days, 20 Hours)</label>
                       <input name="duration" value={formData.duration} onChange={handleChange} className="form-control" placeholder="e.g. 15 Hours" />
                    </div>
                    <div className="form-group">
                       <label>Max Participants</label>
                       <div style={{ position: 'relative' }}>
                          <Users size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                          <input name="max_participants" type="number" value={formData.max_participants} onChange={handleChange} className="form-control" style={{ paddingLeft: '40px' }} />
                       </div>
                    </div>
                 </div>
              </Card>
           </div>

           <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <Card glass style={{ padding: '2rem' }}>
                 <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.1rem' }}>Logistics</h3>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div className="form-group">
                       <label>Category</label>
                       <select name="category" value={formData.category} onChange={handleChange} className="form-control">
                          <option>Technical</option>
                          <option>Soft Skills</option>
                          <option>Leadership</option>
                          <option>Compliance</option>
                          <option>Onboarding</option>
                       </select>
                    </div>
                    <div className="form-group">
                       <label>Provider / Trainer</label>
                       <div style={{ position: 'relative' }}>
                          <Globe size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                          <input name="provider" value={formData.provider} onChange={handleChange} className="form-control" style={{ paddingLeft: '40px' }} placeholder="External Partner or Internal Team" />
                       </div>
                    </div>
                    <div className="form-group">
                       <label>Status</label>
                       <select name="status" value={formData.status} onChange={handleChange} className="form-control">
                          <option>Planned</option>
                          <option>Enrolling</option>
                          <option>In Progress</option>
                          <option>Completed</option>
                          <option>Cancelled</option>
                       </select>
                    </div>
                 </div>
              </Card>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                 <Button type="submit" variant="primary" size="lg" disabled={loading} style={{ width: '100%', height: '54px' }}>
                    <Save size={18} style={{ marginRight: '8px' }} />
                    {loading ? 'Saving...' : 'Save Program'}
                 </Button>
                 <Button type="button" variant="ghost" onClick={() => navigate('/training/programs')} style={{ width: '100%' }}>
                    Cancel
                 </Button>
              </div>
           </div>
        </div>
      </form>
    </div>
  );
};

export default TrainingFormPage;
