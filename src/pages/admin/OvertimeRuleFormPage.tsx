import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Clock, DollarSign, ShieldCheck, Settings, Users, Info } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { workforceService } from '@/features/workforce/api/workforce.service';
import '@/shared/styles/CrudPage.css';

const OvertimeRuleFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    multiplier: 1.5,
    max_hours_per_day: 4,
    max_hours_per_week: 14,
    eligibility: 'All Staff',
    description: '',
    status: 'Active'
  });

  useEffect(() => {
    if (isEdit) {
      const fetchRule = async () => {
        setFetching(true);
        try {
          const res = await workforceService.getOvertimeRule(id);
          setFormData(res.data || res);
        } catch (err) {
          console.error(err);
        } finally {
          setFetching(false);
        }
      };
      fetchRule();
    }
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) {
        await workforceService.updateOvertimeRule(id, formData);
      } else {
        await workforceService.createOvertimeRule(formData);
      }
      navigate('/workforce/overtime-rules');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (fetching) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading rule details...</div>;

  return (
    <div className="crud-page">
      <div className="crud-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
           <Button variant="ghost" onClick={() => navigate('/workforce/overtime-rules')}>
              <ArrowLeft size={20} />
           </Button>
           <div>
              <span className="reimb-badge reimb-badge-admin">Workforce</span>
              <h1>{isEdit ? 'Edit Overtime Rule' : 'Create Overtime Rule'}</h1>
              <p>Define calculation multipliers and labor law compliance limits.</p>
           </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <Card glass style={{ padding: '2rem' }}>
                 <h3 style={{ margin: '0 0 1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Settings size={20} color="#2563eb" /> Rule Basics
                 </h3>
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                       <label>Rule Name</label>
                       <input name="name" value={formData.name} onChange={handleChange} className="form-control" required placeholder="e.g. Standard Weekday Overtime" />
                    </div>
                    <div className="form-group">
                       <label>Multiplier (x Hourly Rate)</label>
                       <div style={{ position: 'relative' }}>
                          <DollarSign size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                          <input name="multiplier" type="number" step="0.1" value={formData.multiplier} onChange={handleChange} className="form-control" style={{ paddingLeft: '40px' }} required />
                       </div>
                    </div>
                    <div className="form-group">
                       <label>Eligibility Group</label>
                       <select name="eligibility" value={formData.eligibility} onChange={handleChange} className="form-control">
                          <option>All Staff</option>
                          <option>Permanent Only</option>
                          <option>Contract Only</option>
                          <option>Specific Department</option>
                       </select>
                    </div>
                 </div>
              </Card>

              <Card glass style={{ padding: '2rem' }}>
                 <h3 style={{ margin: '0 0 1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Clock size={20} color="#2563eb" /> Limits & Caps
                 </h3>
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                    <div className="form-group">
                       <label>Max Hours (Per Day)</label>
                       <input name="max_hours_per_day" type="number" value={formData.max_hours_per_day} onChange={handleChange} className="form-control" />
                    </div>
                    <div className="form-group">
                       <label>Max Hours (Per Week)</label>
                       <input name="max_hours_per_week" type="number" value={formData.max_hours_per_week} onChange={handleChange} className="form-control" />
                    </div>
                 </div>
                 <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '1rem' }}>
                    <Info size={14} style={{ marginRight: '4px', display: 'inline' }} /> 
                    System will trigger a warning or auto-reject if these limits are exceeded.
                 </p>
              </Card>
           </div>

           <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <Card glass style={{ padding: '2rem' }}>
                 <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.1rem' }}>Status</h3>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div className="form-group">
                       <label>Rule Status</label>
                       <select name="status" value={formData.status} onChange={handleChange} className="form-control">
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                       </select>
                    </div>
                 </div>
              </Card>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                 <Button type="submit" variant="primary" size="lg" disabled={loading} style={{ width: '100%', height: '54px' }}>
                    <Save size={18} style={{ marginRight: '8px' }} />
                    {loading ? 'Saving...' : 'Save Overtime Rule'}
                 </Button>
                 <Button type="button" variant="ghost" onClick={() => navigate('/workforce/overtime-rules')} style={{ width: '100%' }}>
                    Cancel
                 </Button>
              </div>
           </div>
        </div>
      </form>
    </div>
  );
};

export default OvertimeRuleFormPage;
