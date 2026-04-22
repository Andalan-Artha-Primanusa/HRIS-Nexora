import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, MessageSquare, Clock, User, AlertCircle, RefreshCw } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { requestService } from '@/features/requests/api/requests.service';

const HrRequestFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState<any>({
    subject: '',
    category: '',
    priority: 'normal',
    status: 'pending',
    assigned_to: '',
    description: '',
    employeeName: ''
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEdit) {
      const fetchRequest = async () => {
        setLoading(true);
        try {
          const res = await requestService.getRequests();
          const req = Array.isArray(res) ? res.find((r: any) => String(r.id) === id) : res.data?.find((r: any) => String(r.id) === id);
          if (req) {
            setFormData({
              subject: req.subject || '',
              category: req.category || '',
              priority: req.priority || 'normal',
              status: req.status || 'pending',
              assigned_to: req.assigned_to?.name || '',
              description: req.description || 'No description provided.',
              employeeName: req.employee?.full_name || 'System'
            });
          }
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchRequest();
    }
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSaving(true);
    try {
      await requestService.updateStatus(id, formData.status);
      navigate('/hr-requests');
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="crud-page">
      <div className="crud-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Button variant="ghost" onClick={() => navigate('/hr-requests')} style={{ padding: '8px' }}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <span className="reimb-badge reimb-badge-admin">Service Desk</span>
            <h1>Respond to HR Request</h1>
            <p>Update ticket status and provide resolution.</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="outline" onClick={() => navigate('/hr-requests')}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={saving || loading}>
            <Save size={18} style={{ marginRight: '8px' }} />
            {saving ? 'Saving...' : 'Save Updates'}
          </Button>
        </div>
      </div>

      {loading ? (
        <Card glass style={{ padding: '4rem', textAlign: 'center' }}>
          <RefreshCw size={32} className="animate-spin" color="#94a3b8" style={{ margin: '0 auto 1rem' }} />
          <p>Loading ticket details...</p>
        </Card>
      ) : (
        <div className="crud-content-grid" style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <Card glass style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
                <div style={{ padding: '12px', background: '#eff6ff', borderRadius: '12px' }}>
                  <MessageSquare size={24} color="#2563eb" />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.25rem' }}>{formData.subject}</h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '6px', fontSize: '0.85rem', color: '#64748b' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><User size={14} /> {formData.employeeName}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14} /> Requested recently</span>
                  </div>
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem' }}>
                <h4 style={{ margin: '0 0 12px', fontSize: '0.9rem', color: '#64748b', textTransform: 'uppercase' }}>Description</h4>
                <p style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: '1.6', color: '#1e293b' }}>
                  {formData.description}
                </p>
              </div>

              <div className="crud-form-grid">
                <label className="crud-form-full">
                  Admin Response / Resolution Notes
                  <textarea 
                    className="crud-input" 
                    rows={4}
                    placeholder="Enter your resolution or reply to the employee..."
                  />
                </label>
              </div>
            </Card>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <Card glass style={{ padding: '1.5rem', background: '#f8fafc' }}>
              <h3 style={{ margin: '0 0 1.5rem', fontSize: '1rem' }}>Ticket Properties</h3>
              
              <div className="crud-form-grid" style={{ gridTemplateColumns: '1fr', gap: '1rem' }}>
                <label>
                  Status
                  <select 
                    className="crud-input" 
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </label>
                
                <label>
                  Priority
                  <select 
                    className="crud-input" 
                    value={formData.priority}
                    onChange={e => setFormData({ ...formData, priority: e.target.value })}
                    disabled
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                  </select>
                </label>

                <label>
                  Category
                  <input 
                    type="text" 
                    className="crud-input" 
                    value={formData.category}
                    disabled
                  />
                </label>
              </div>
            </Card>

            <Card glass style={{ padding: '1.5rem', border: '1px solid #fee2e2' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <AlertCircle size={20} color="#ef4444" />
                <div>
                  <h4 style={{ margin: '0 0 4px', color: '#991b1b', fontSize: '0.9rem' }}>SLA Warning</h4>
                  <p style={{ margin: 0, color: '#991b1b', fontSize: '0.8rem', opacity: 0.8 }}>
                    High priority requests should be resolved within 24 hours.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default HrRequestFormPage;
