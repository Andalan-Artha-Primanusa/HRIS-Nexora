import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, BookOpen, Calendar, ChevronLeft } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { trainingService } from '@/features/training/api/training.service';
import '@/shared/styles/CrudPage.css';
import '../dashboard/overview/OverviewPage.css';

const TrainingFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    mode: string;
    provider: string;
    start_date: string;
    end_date: string;
    budget: number;
    status: string;
  }>({
    title: '',
    description: '',
    mode: 'offline',
    provider: 'Internal',
    start_date: '',
    end_date: '',
    budget: 1000000,
    status: 'active'
  });

  useEffect(() => {
    if (!isEdit) return;
    const fetchTraining = async () => {
      setFetching(true);
      try {
        const data = await trainingService.getProgram(id);
        const trainingData = data?.data || data || {};
        setFormData({
          title: trainingData.title || '',
          description: trainingData.description || '',
          mode: trainingData.mode || 'offline',
          provider: trainingData.provider || 'Internal',
          start_date: trainingData.start_date ? trainingData.start_date.split('T')[0] : '',
          end_date: trainingData.end_date ? trainingData.end_date.split('T')[0] : '',
          budget: trainingData.budget ? Number(trainingData.budget) : 1000000,
          status: trainingData.status || 'active'
        });
      } catch (err) {
        console.error(err);
      } finally {
        setFetching(false);
      }
    };
    fetchTraining();
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Build payload exactly matching backend expectation
      const apiData = {
        title: formData.title.trim(),
        mode: formData.mode,
        description: formData.description.trim(),
        provider: formData.provider.trim() || 'Internal',
        start_date: formData.start_date,
        end_date: formData.end_date,
        budget: Number(formData.budget) || 1000000,
        status: formData.status
      };

      console.log('Submitting training create/update payload:', apiData);

      if (isEdit) {
        await trainingService.updateProgram(id, apiData as any);
      } else {
        await trainingService.createProgram(apiData as any);
      }
      navigate('/training/programs');
    } catch (err: any) {
      // Better logging for validation errors (422)
      console.error('Error details:', err?.response?.data || err?.message || err);
      if (err?.response?.status === 422) {
        console.error('Validation error payload:', err.response.data);
      }
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
      <Card className="hero-card" style={{ marginBottom: '2rem' }}>
        <div className="hero-card-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <BookOpen size={16} />
              <span>Training Center</span>
            </div>
            <h1 className="hero-title">{isEdit ? 'Edit Training Program' : 'Develop New Program'}</h1>
            <p className="hero-subtitle">Design curricula, set schedules, and manage enrollments.</p>
          </div>
          <div className="hero-actions">
            <button type="button" className="btn-outline" onClick={() => navigate('/training/programs')} disabled={loading}>
              <ChevronLeft size={18} />
              Back
            </button>
          </div>
        </div>
      </Card>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Card glass style={{ padding: '2rem' }}>
            <h3 style={{ margin: '0 0 1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <BookOpen size={20} color="#2563eb" /> Program Details
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group">
                <label>Program Title</label>
                <input name="title" value={formData.title} onChange={handleChange} className="form-control" required placeholder="e.g. Pelatihan Leadership" />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} className="form-control" rows={5} placeholder="Deskripsi program pelatihan" />
              </div>
            </div>
          </Card>

          <Card glass style={{ padding: '2rem' }}>
            <h3 style={{ margin: '0 0 1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Calendar size={20} color="#2563eb" /> Schedule & Provider
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Start Date</label>
                  <div style={{ position: 'relative' }}>
                    <Calendar size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input name="start_date" type="date" value={formData.start_date} onChange={handleChange} className="form-control" style={{ paddingLeft: '40px' }} required />
                  </div>
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <div style={{ position: 'relative' }}>
                    <Calendar size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input name="end_date" type="date" value={formData.end_date} onChange={handleChange} className="form-control" style={{ paddingLeft: '40px' }} required />
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Mode</label>
                  <select name="mode" value={formData.mode} onChange={handleChange} className="form-control">
                    <option value="offline">offline</option>
                    <option value="online">online</option>
                    <option value="hybrid">hybrid</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Provider</label>
                  <input name="provider" value={formData.provider} onChange={handleChange} className="form-control" placeholder="Internal or External provider" />
                </div>
              </div>
            </div>
          </Card>

          <Card glass style={{ padding: '2rem' }}>
            <h3 style={{ margin: '0 0 1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Save size={20} color="#2563eb" /> Budget & Status
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Budget</label>
                <input name="budget" type="number" value={formData.budget} onChange={handleChange} className="form-control" />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select name="status" value={formData.status} onChange={handleChange} className="form-control">
                  <option value="active">active</option>
                  <option value="draft">draft</option>
                  <option value="completed">completed</option>
                  <option value="cancelled">cancelled</option>
                </select>
              </div>
            </div>
          </Card>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Button type="submit" variant="primary" size="lg" disabled={loading} style={{ width: '100%', height: '54px', borderRadius: '12px' }}>
              <Save size={18} style={{ marginRight: '8px' }} />
              {loading ? 'Saving...' : 'Save Program'}
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate('/training/programs')}
              style={{
                width: '100%',
                height: '50px',
                borderRadius: '12px',
                background: '#f1f5f9',
                color: '#475569',
                border: '1px solid #cbd5e1',
                fontWeight: 600
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default TrainingFormPage;
