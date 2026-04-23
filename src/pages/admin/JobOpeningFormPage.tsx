import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Briefcase, MapPin, DollarSign, FileText } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { recruitmentService } from '@/features/recruitment/api/recruitment.service';
import type { JobOpening } from '@/features/recruitment/types/recruitment.types';
import '@/shared/styles/CrudPage.css';

const JobOpeningFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [formData, setFormData] = useState<Partial<JobOpening>>({
    title: '',
    department: '',
    location: '',
    type: 'full-time',
    status: 'open',
    salary_range: '',
    description: '',
    requirements: ''
  });

  useEffect(() => {
    if (isEdit) {
      const fetchJob = async () => {
        setFetching(true);
        try {
          const data = await recruitmentService.getJobOpening(id);
          setFormData(data.data || data);
        } catch (err) {
          console.error(err);
        } finally {
          setFetching(false);
        }
      };
      fetchJob();
    }
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) {
        await recruitmentService.updateJobOpening(id, formData);
      } else {
        await recruitmentService.createJobOpening(formData);
      }
      navigate('/recruitment/openings');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (fetching) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading job details...</div>;

  return (
    <div className="crud-page">
      <div className="crud-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
           <Button variant="ghost" onClick={() => navigate('/recruitment/openings')}>
              <ArrowLeft size={20} />
           </Button>
           <div>
              <span className="reimb-badge reimb-badge-admin">Recruitment</span>
              <h1>{isEdit ? 'Edit Job Opening' : 'Post New Job'}</h1>
              <p>Configure role details, requirements, and compensation.</p>
           </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <Card glass style={{ padding: '2rem' }}>
                 <h3 style={{ margin: '0 0 1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Briefcase size={20} color="#2563eb" /> Job Basic Info
                 </h3>
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                       <label>Job Title</label>
                       <input name="title" value={formData.title} onChange={handleChange} className="form-control" required placeholder="e.g. Senior Software Engineer" />
                    </div>
                    <div className="form-group">
                       <label>Department</label>
                       <input name="department" value={formData.department} onChange={handleChange} className="form-control" required placeholder="e.g. Engineering" />
                    </div>
                    <div className="form-group">
                       <label>Location</label>
                       <div style={{ position: 'relative' }}>
                          <MapPin size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                          <input name="location" value={formData.location} onChange={handleChange} className="form-control" style={{ paddingLeft: '40px' }} placeholder="e.g. Remote / Jakarta" />
                       </div>
                    </div>
                 </div>
              </Card>

              <Card glass style={{ padding: '2rem' }}>
                 <h3 style={{ margin: '0 0 1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FileText size={20} color="#2563eb" /> Description & Requirements
                 </h3>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div className="form-group">
                       <label>Full Description</label>
                       <textarea name="description" value={formData.description} onChange={handleChange} className="form-control" rows={6} placeholder="Describe the role and responsibilities..." />
                    </div>
                    <div className="form-group">
                       <label>Requirements</label>
                       <textarea name="requirements" value={formData.requirements} onChange={handleChange} className="form-control" rows={6} placeholder="List qualifications and skills needed..." />
                    </div>
                 </div>
              </Card>
           </div>

           <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <Card glass style={{ padding: '2rem' }}>
                 <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.1rem' }}>Configuration</h3>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div className="form-group">
                       <label>Employment Type</label>
                       <select name="type" value={formData.type} onChange={handleChange} className="form-control">
                          <option value="full-time">Full-time</option>
                          <option value="part-time">Part-time</option>
                          <option value="contract">Contract</option>
                          <option value="remote">Remote</option>
                       </select>
                    </div>
                    <div className="form-group">
                       <label>Salary Range</label>
                       <div style={{ position: 'relative' }}>
                          <DollarSign size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                          <input name="salary_range" value={formData.salary_range} onChange={handleChange} className="form-control" style={{ paddingLeft: '40px' }} placeholder="e.g. 15M - 25M" />
                       </div>
                    </div>
                    <div className="form-group">
                       <label>Status</label>
                       <select name="status" value={formData.status} onChange={handleChange} className="form-control">
                          <option value="open">Active / Open</option>
                          <option value="draft">Draft</option>
                          <option value="closed">Closed</option>
                       </select>
                    </div>
                 </div>
              </Card>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                 <Button type="submit" variant="primary" size="lg" disabled={loading} style={{ width: '100%', height: '54px' }}>
                    <Save size={18} style={{ marginRight: '8px' }} />
                    {loading ? 'Saving...' : 'Save Job Posting'}
                 </Button>
                 <Button type="button" variant="ghost" onClick={() => navigate('/recruitment/openings')} style={{ width: '100%' }}>
                    Discard Changes
                 </Button>
              </div>
           </div>
        </div>
      </form>
    </div>
  );
};

export default JobOpeningFormPage;
