import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Calendar, MapPin, Info } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { workforceService } from '@/features/workforce/api/workforce.service';
import '@/shared/styles/CrudPage.css';

const HolidayFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    type: 'National Holiday',
    description: '',
    is_recurring: false,
    applicable_locations: ['All']
  });

  useEffect(() => {
    if (isEdit) {
      const fetchHoliday = async () => {
        setFetching(true);
        try {
          const res = await workforceService.getHoliday(id);
          setFormData(res.data || res);
        } catch (err) {
          console.error(err);
        } finally {
          setFetching(false);
        }
      };
      fetchHoliday();
    }
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) {
        await workforceService.updateHoliday(id, formData);
      } else {
        await workforceService.createHoliday(formData);
      }
      navigate('/workforce/holidays');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  if (fetching) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading holiday details...</div>;

  return (
    <div className="crud-page">
      <div className="crud-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
           <Button variant="ghost" onClick={() => navigate('/workforce/holidays')}>
              <ArrowLeft size={20} />
           </Button>
           <div>
              <span className="reimb-badge reimb-badge-admin">Workforce Policy</span>
              <h1>{isEdit ? 'Edit Holiday' : 'Add New Holiday'}</h1>
              <p>Configure company-wide or regional days off.</p>
           </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <Card glass style={{ padding: '2rem' }}>
                 <h3 style={{ margin: '0 0 1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Calendar size={20} color="#2563eb" /> Holiday Information
                 </h3>
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                       <label>Holiday Name</label>
                       <input name="name" value={formData.name} onChange={handleChange} className="form-control" required placeholder="e.g. Idul Fitri 1447H" />
                    </div>
                    <div className="form-group">
                       <label>Date</label>
                       <input name="date" type="date" value={formData.date} onChange={handleChange} className="form-control" required />
                    </div>
                    <div className="form-group">
                       <label>Type</label>
                       <select name="type" value={formData.type} onChange={handleChange} className="form-control">
                          <option>National Holiday</option>
                          <option>Company Holiday</option>
                          <option>Regional Holiday</option>
                          <option>Other</option>
                       </select>
                    </div>
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                       <label>Description (Optional)</label>
                       <textarea name="description" value={formData.description} onChange={handleChange} className="form-control" rows={3} placeholder="Brief details about the holiday..." />
                    </div>
                 </div>
              </Card>

              <Card glass style={{ padding: '2rem' }}>
                 <h3 style={{ margin: '0 0 1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <MapPin size={20} color="#2563eb" /> Applicable Locations
                 </h3>
                 <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                       <input type="checkbox" checked={formData.applicable_locations.includes('All')} onChange={() => {}} />
                       <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Apply to All Locations</span>
                    </div>
                 </div>
                 <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '1rem' }}>
                    <Info size={14} style={{ marginRight: '4px', display: 'inline' }} /> 
                    If unchecked, you can select specific branches or offices.
                 </p>
              </Card>
           </div>

           <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <Card glass style={{ padding: '2rem' }}>
                 <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.1rem' }}>Policy Settings</h3>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                       <input name="is_recurring" type="checkbox" checked={formData.is_recurring} onChange={handleChange} />
                       <label style={{ margin: 0 }}>Recurring Every Year</label>
                    </div>
                    <div className="form-group">
                       <label>Status</label>
                       <div style={{ padding: '0.5rem 0.75rem', background: '#ecfdf5', color: '#059669', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, display: 'inline-block' }}>
                          Active Policy
                       </div>
                    </div>
                 </div>
              </Card>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                 <Button type="submit" variant="primary" size="lg" disabled={loading} style={{ width: '100%', height: '54px' }}>
                    <Save size={18} style={{ marginRight: '8px' }} />
                    {loading ? 'Saving...' : 'Save Holiday'}
                 </Button>
                 <Button type="button" variant="ghost" onClick={() => navigate('/workforce/holidays')} style={{ width: '100%' }}>
                    Cancel
                 </Button>
              </div>
           </div>
        </div>
      </form>
    </div>
  );
};

export default HolidayFormPage;
