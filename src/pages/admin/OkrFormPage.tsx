import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Target, TrendingUp, Calendar, User, ListChecks } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { performanceService } from '@/features/performance/api/performance.service';
import '@/shared/styles/CrudPage.css';

const OkrFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    period: string;
    status: 'draft' | 'in-progress' | 'completed' | 'cancelled';
    owner_id: string | number;
    progress: number;
    key_results: any[];
  }>({
    title: '',
    description: '',
    period: 'Q2 2024',
    status: 'in-progress',
    owner_id: '',
    progress: 0,
    key_results: []
  });

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const { getAllEmployees } = await import('@/features/employee/api/employee.service');
        const data = await getAllEmployees();
        setEmployees(data);
      } catch (err) {
        console.error('Failed to load employees', err);
      }
    };
    loadEmployees();

    if (isEdit) {
      const fetchOkr = async () => {
        setFetching(true);
        try {
          const data = await performanceService.getOkr(id);
          setFormData(data.data || data);
        } catch (err) {
          console.error(err);
        } finally {
          setFetching(false);
        }
      };
      fetchOkr();
    }
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) {
        await performanceService.updateOkr(id, formData);
      } else {
        await performanceService.createOkr(formData);
      }
      navigate('/performance/okrs');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (fetching) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading OKR details...</div>;

  return (
    <div className="crud-page">
      <div className="crud-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
           <Button variant="ghost" onClick={() => navigate('/performance/okrs')}>
              <ArrowLeft size={20} />
           </Button>
           <div>
              <span className="reimb-badge reimb-badge-admin">Performance</span>
              <h1>{isEdit ? 'Edit OKR' : 'Define New OKR'}</h1>
              <p>Set ambitious goals and track measurable key results.</p>
           </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <Card glass style={{ padding: '2rem' }}>
                 <h3 style={{ margin: '0 0 1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Target size={20} color="#2563eb" /> Objective Details
                 </h3>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div className="form-group">
                       <label>Objective Title</label>
                       <input name="title" value={formData.title} onChange={handleChange} className="form-control" required placeholder="e.g. Expand Market Share in Southeast Asia" />
                    </div>
                    <div className="form-group">
                       <label>Description</label>
                       <textarea name="description" value={formData.description} onChange={handleChange} className="form-control" rows={4} placeholder="Describe the purpose and impact of this objective..." />
                    </div>
                 </div>
              </Card>

              <Card glass style={{ padding: '2rem' }}>
                 <h3 style={{ margin: '0 0 1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <ListChecks size={20} color="#2563eb" /> Key Results
                 </h3>
                 <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem' }}>
                    Key results should be measurable and time-bound. (Coming soon: dynamic key result list)
                 </p>
                 <div style={{ padding: '2rem', border: '2px dashed #e2e8f0', borderRadius: '12px', textAlign: 'center', color: '#94a3b8' }}>
                    Click to add a measurable key result
                 </div>
              </Card>
           </div>

           <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <Card glass style={{ padding: '2rem' }}>
                 <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.1rem' }}>Timeline & Owner</h3>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div className="form-group">
                       <label>Period</label>
                       <div style={{ position: 'relative' }}>
                          <Calendar size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                          <select name="period" value={formData.period} onChange={handleChange} className="form-control" style={{ paddingLeft: '40px' }}>
                             <option>Q1 2024</option>
                             <option>Q2 2024</option>
                             <option>Q3 2024</option>
                             <option>Q4 2024</option>
                             <option>Annual 2024</option>
                          </select>
                       </div>
                    </div>
                    <div className="form-group">
                        <label>Owner (Employee)</label>
                        <div style={{ position: 'relative' }}>
                           <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                           <select name="owner_id" value={formData.owner_id} onChange={handleChange} className="form-control" style={{ paddingLeft: '40px' }}>
                              <option value="">-- Select Owner --</option>
                              {employees.map(emp => (
                                 <option key={emp.id} value={emp.id}>{emp.full_name} ({emp.employee_code || emp.id})</option>
                              ))}
                           </select>
                        </div>
                    </div>
                    <div className="form-group">
                       <label>Current Progress (%)</label>
                       <div style={{ position: 'relative' }}>
                          <TrendingUp size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                          <input name="progress" type="number" min="0" max="100" value={formData.progress} onChange={handleChange} className="form-control" style={{ paddingLeft: '40px' }} />
                       </div>
                    </div>
                 </div>
              </Card>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                 <Button type="submit" variant="primary" size="lg" disabled={loading} style={{ width: '100%', height: '54px' }}>
                    <Save size={18} style={{ marginRight: '8px' }} />
                    {loading ? 'Saving...' : 'Save OKR'}
                 </Button>
                 <Button type="button" variant="ghost" onClick={() => navigate('/performance/okrs')} style={{ width: '100%' }}>
                    Cancel
                 </Button>
              </div>
           </div>
        </div>
      </form>
    </div>
  );
};

export default OkrFormPage;
