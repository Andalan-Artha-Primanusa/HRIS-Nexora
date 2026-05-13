import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Gift, Shield, DollarSign } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { showToast } from '@/shared/ui/toast';
import { benefitService } from '@/features/benefits/api/benefit.service';
import '@/shared/styles/CrudPage.css';

const BenefitFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Health',
    amount: 0,
    frequency: 'Monthly',
    description: '',
    status: 'Active'
  });

  useEffect(() => {
    if (isEdit) {
      const fetchBenefit = async () => {
        setFetching(true);
        try {
          const data = await benefitService.getBenefit(id);
          setFormData(data.data || data);
        } catch (err) {
          console.error(err);
        } finally {
          setFetching(false);
        }
      };
      fetchBenefit();
    }
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) {
        await benefitService.updateBenefit(id, formData);
        showToast('Benefit berhasil diperbarui', 'success');
      } else {
        await benefitService.createBenefit(formData);
        showToast('Benefit berhasil dibuat', 'success');
      }
      navigate('/compensation/benefits');
    } catch (err: any) {
      console.error(err);
      showToast(err?.response?.data?.message || err?.message || 'Gagal menyimpan benefit', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (fetching) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading benefit details...</div>;

  return (
    <div className="crud-page">
      <div className="crud-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
           <Button variant="ghost" onClick={() => navigate('/compensation/benefits')}>
              <ArrowLeft size={20} />
           </Button>
           <div>
              <span className="reimb-badge reimb-badge-admin">Compensation</span>
              <h1>{isEdit ? 'Edit Benefit' : 'Create New Benefit'}</h1>
              <p>Define perks, insurance plans, and employee bonuses.</p>
           </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <Card glass style={{ padding: '2rem' }}>
                 <h3 style={{ margin: '0 0 1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Gift size={20} color="#2563eb" /> Benefit Basic Info
                 </h3>
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                       <label>Benefit Name</label>
                       <input name="name" value={formData.name} onChange={handleChange} className="form-control" required placeholder="e.g. Premium Health Insurance" />
                    </div>
                    <div className="form-group">
                       <label>Category</label>
                       <select name="type" value={formData.type} onChange={handleChange} className="form-control">
                          <option>Health</option>
                          <option>Insurance</option>
                          <option>Bonus</option>
                          <option>Allowance</option>
                          <option>Other</option>
                       </select>
                    </div>
                    <div className="form-group">
                       <label>Frequency</label>
                       <select name="frequency" value={formData.frequency} onChange={handleChange} className="form-control">
                          <option>Monthly</option>
                          <option>Quarterly</option>
                          <option>Annual</option>
                          <option>One-time</option>
                       </select>
                    </div>
                 </div>
              </Card>

              <Card glass style={{ padding: '2rem' }}>
                 <h3 style={{ margin: '0 0 1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Shield size={20} color="#2563eb" /> Description & Eligibility
                 </h3>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div className="form-group">
                       <label>Full Description</label>
                       <textarea name="description" value={formData.description} onChange={handleChange} className="form-control" rows={6} placeholder="Describe what this benefit covers..." />
                    </div>
                 </div>
              </Card>
           </div>

           <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <Card glass style={{ padding: '2rem' }}>
                 <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.1rem' }}>Value & Status</h3>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div className="form-group">
                       <label>Monetary Value</label>
                       <div style={{ position: 'relative' }}>
                          <DollarSign size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                          <input name="amount" type="number" value={formData.amount} onChange={handleChange} className="form-control" style={{ paddingLeft: '40px' }} placeholder="0" />
                       </div>
                    </div>
                    <div className="form-group">
                       <label>Status</label>
                       <select name="status" value={formData.status} onChange={handleChange} className="form-control">
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                          <option value="Draft">Draft</option>
                       </select>
                    </div>
                 </div>
              </Card>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                 <Button type="submit" variant="primary" size="lg" disabled={loading} style={{ width: '100%', height: '54px' }}>
                    <Save size={18} style={{ marginRight: '8px' }} />
                    {loading ? 'Saving...' : 'Save Benefit'}
                 </Button>
                 <Button type="button" variant="ghost" onClick={() => navigate('/compensation/benefits')} style={{ width: '100%' }}>
                    Cancel
                 </Button>
              </div>
           </div>
        </div>
      </form>
    </div>
  );
};

export default BenefitFormPage;
