import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Scale, Users, Calendar, Info, ShieldCheck, AlertCircle } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { performanceService } from '@/features/performance/api/performance.service';

const CalibrationFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    title: '',
    date: '',
    period: '2024-H1',
    description: '',
    status: 'scheduled',
    participants: [] as string[],
    facilitator: ''
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      const fetchSession = async () => {
        try {
          const res = await performanceService.getCalibrationSessions();
          const session = res.find((s: any) => String(s.id) === id);
          if (session) {
            setFormData({
              title: session.title,
              date: session.date,
              period: session.period || '2024-H1',
              description: session.description || '',
              status: session.status,
              participants: session.participants || [],
              facilitator: session.facilitator || ''
            });
          }
        } catch (err) {
          console.error(err);
        }
      };
      fetchSession();
    }
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Mock save logic
      console.log('Saving calibration session:', formData);
      setTimeout(() => {
        navigate('/performance/calibration');
      }, 1000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="crud-page">
      <div className="crud-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Button variant="ghost" onClick={() => navigate('/performance/calibration')} style={{ padding: '8px' }}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <span className="reimb-badge reimb-badge-admin">Performance</span>
            <h1>{isEdit ? 'Edit Calibration Session' : 'New Calibration Session'}</h1>
            <p>Define meeting details, participants, and performance period.</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="outline" onClick={() => navigate('/performance/calibration')}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={loading}>
            <Save size={18} style={{ marginRight: '8px' }} />
            {loading ? 'Saving...' : 'Save Session'}
          </Button>
        </div>
      </div>

      <div className="crud-content-grid" style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Card glass style={{ padding: '2rem' }}>
            <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Info size={18} color="#2563eb" />
              Session Details
            </h3>
            <div className="crud-form-grid">
              <label className="crud-form-full">
                Session Title
                <input 
                  type="text" 
                  className="crud-input" 
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Q2 Engineering Performance Review"
                />
              </label>
              <label>
                Scheduled Date
                <input 
                  type="date" 
                  className="crud-input" 
                  value={formData.date}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                />
              </label>
              <label>
                Review Period
                <select 
                  className="crud-input"
                  value={formData.period}
                  onChange={e => setFormData({ ...formData, period: e.target.value })}
                >
                  <option value="2024-H1">2024 H1</option>
                  <option value="2024-Q1">2024 Q1</option>
                  <option value="2023-YearEnd">2023 Year End</option>
                </select>
              </label>
              <label className="crud-form-full">
                Description & Agenda
                <textarea 
                  className="crud-input" 
                  rows={4}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Outline the goals and criteria for this calibration session..."
                />
              </label>
            </div>
          </Card>

          <Card glass style={{ padding: '2rem' }}>
            <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={18} color="#2563eb" />
              Participants & Access
            </h3>
            <div className="crud-form-grid">
              <label className="crud-form-full">
                Facilitator (HR Admin)
                <input 
                  type="text" 
                  className="crud-input" 
                  value={formData.facilitator}
                  onChange={e => setFormData({ ...formData, facilitator: e.target.value })}
                  placeholder="Assign an HR lead for this session"
                />
              </label>
              <label className="crud-form-full">
                Participating Managers
                <div style={{ padding: '1.5rem', border: '1px dashed #cbd5e1', borderRadius: '12px', textAlign: 'center', color: '#64748b' }}>
                  <Users size={24} style={{ marginBottom: '8px', opacity: 0.5 }} />
                  <p style={{ fontSize: '0.85rem', margin: 0 }}>Click to select managers involved in this calibration.</p>
                  <Button variant="ghost" size="sm" style={{ marginTop: '0.5rem' }}>Select Managers</Button>
                </div>
              </label>
            </div>
          </Card>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Card glass style={{ padding: '1.5rem', background: '#eff6ff' }}>
            <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', color: '#1e40af' }}>Calibration Status</h3>
            <select 
              className="crud-input"
              value={formData.status}
              onChange={e => setFormData({ ...formData, status: e.target.value })}
              style={{ background: 'white' }}
            >
              <option value="scheduled">Scheduled</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '10px' }}>
              <div style={{ padding: '8px', background: 'white', borderRadius: '8px' }}>
                <ShieldCheck size={18} color="#10b981" />
              </div>
              <p style={{ fontSize: '0.8rem', color: '#1e3a8a', margin: 0 }}>
                Calibration ensures objective evaluation across different departments.
              </p>
            </div>
          </Card>

          <Card glass style={{ padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem', fontSize: '1rem' }}>Guidelines</h3>
            <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>Ensure all participants have completed preliminary reviews.</li>
              <li>Use bell-curve or absolute criteria as predefined by policy.</li>
              <li>Document all adjustments made to original ratings.</li>
            </ul>
          </Card>

          <Card glass style={{ padding: '1.5rem', border: '1px solid #fee2e2' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <AlertCircle size={20} color="#ef4444" />
              <div>
                <h4 style={{ margin: '0 0 4px', color: '#991b1b', fontSize: '0.9rem' }}>Important</h4>
                <p style={{ margin: 0, color: '#991b1b', fontSize: '0.8rem', opacity: 0.8 }}>
                  Starting a session will notify all selected managers.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CalibrationFormPage;
