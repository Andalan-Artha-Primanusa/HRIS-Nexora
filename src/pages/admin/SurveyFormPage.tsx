import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, MessageSquare, Calendar, Users, ListPlus, Send } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { engagementService } from '@/features/engagement/api/engagement.service';
import '@/shared/styles/CrudPage.css';

const SurveyFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    status: 'Draft',
    questions: []
  });

  useEffect(() => {
    if (isEdit) {
      const fetchSurvey = async () => {
        setFetching(true);
        try {
          const data = await engagementService.getSurvey(id);
          setFormData(data.data || data);
        } catch (err) {
          console.error(err);
        } finally {
          setFetching(false);
        }
      };
      fetchSurvey();
    }
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) {
        await engagementService.updateSurvey(id, formData);
      } else {
        await engagementService.createSurvey(formData);
      }
      navigate('/engagement/surveys');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (fetching) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading survey details...</div>;

  return (
    <div className="crud-page">
      <div className="crud-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
           <Button variant="ghost" onClick={() => navigate('/engagement/surveys')}>
              <ArrowLeft size={20} />
           </Button>
           <div>
              <span className="reimb-badge reimb-badge-admin">Engagement</span>
              <h1>{isEdit ? 'Edit Survey' : 'Create New Survey'}</h1>
              <p>Design feedback forms to listen to your employees.</p>
           </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <Card glass style={{ padding: '2rem' }}>
                 <h3 style={{ margin: '0 0 1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <MessageSquare size={20} color="#2563eb" /> Survey Content
                 </h3>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div className="form-group">
                       <label>Survey Title</label>
                       <input name="title" value={formData.title} onChange={handleChange} className="form-control" required placeholder="e.g. Employee Satisfaction Survey 2024" />
                    </div>
                    <div className="form-group">
                       <label>Introduction / Description</label>
                       <textarea name="description" value={formData.description} onChange={handleChange} className="form-control" rows={4} placeholder="Briefly explain the purpose of this survey..." />
                    </div>
                 </div>
              </Card>

              <Card glass style={{ padding: '2rem' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                       <ListPlus size={20} color="#2563eb" /> Questions
                    </h3>
                    <Button variant="outline" size="sm">Add Question</Button>
                 </div>
                 <div style={{ padding: '3rem', border: '2px dashed #e2e8f0', borderRadius: '12px', textAlign: 'center', color: '#94a3b8' }}>
                    No questions added yet. Click 'Add Question' to start building your survey.
                 </div>
              </Card>
           </div>

           <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <Card glass style={{ padding: '2rem' }}>
                 <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.1rem' }}>Settings & Schedule</h3>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div className="form-group">
                       <label>Status</label>
                       <select name="status" value={formData.status} onChange={handleChange} className="form-control">
                          <option value="Draft">Draft</option>
                          <option value="Active">Active / Published</option>
                          <option value="Closed">Closed</option>
                       </select>
                    </div>
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
                 </div>
              </Card>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                 <Button type="submit" variant="primary" size="lg" disabled={loading} style={{ width: '100%', height: '54px' }}>
                    <Save size={18} style={{ marginRight: '8px' }} />
                    {loading ? 'Saving...' : 'Save Survey'}
                 </Button>
                 {formData.status === 'Active' && (
                    <Button type="button" variant="outline" style={{ width: '100%' }}>
                       <Send size={18} style={{ marginRight: '8px' }} />
                       Send Invitations
                    </Button>
                 )}
              </div>
           </div>
        </div>
      </form>
    </div>
  );
};

export default SurveyFormPage;
