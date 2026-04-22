import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Box, Tag, User, Calendar, Shield, Hash } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { assetService } from '@/features/assets/api/asset.service';
import '@/shared/styles/CrudPage.css';

const AssetFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Hardware',
    serial_number: '',
    purchase_date: '',
    status: 'Available',
    assigned_to: '',
    warranty_expiry: '',
    description: ''
  });

  useEffect(() => {
    if (isEdit) {
      const fetchAsset = async () => {
        setFetching(true);
        try {
          const data = await assetService.getAsset(id);
          setFormData(data.data || data);
        } catch (err) {
          console.error(err);
        } finally {
          setFetching(false);
        }
      };
      fetchAsset();
    }
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) {
        await assetService.updateAsset(id, formData);
      } else {
        await assetService.createAsset(formData);
      }
      navigate('/inventory/assets');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (fetching) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading asset details...</div>;

  return (
    <div className="crud-page">
      <div className="crud-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
           <Button variant="ghost" onClick={() => navigate('/inventory/assets')}>
              <ArrowLeft size={20} />
           </Button>
           <div>
              <span className="reimb-badge reimb-badge-admin">Inventory</span>
              <h1>{isEdit ? 'Edit Asset' : 'Register New Asset'}</h1>
              <p>Track hardware, software, and company property.</p>
           </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <Card glass style={{ padding: '2rem' }}>
                 <h3 style={{ margin: '0 0 1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Box size={20} color="#2563eb" /> Asset Identification
                 </h3>
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                       <label>Asset Name</label>
                       <input name="name" value={formData.name} onChange={handleChange} className="form-control" required placeholder="e.g. MacBook Pro M3 - IT-001" />
                    </div>
                    <div className="form-group">
                       <label>Category</label>
                       <select name="category" value={formData.category} onChange={handleChange} className="form-control">
                          <option>Hardware</option>
                          <option>Software License</option>
                          <option>Furniture</option>
                          <option>Vehicle</option>
                       </select>
                    </div>
                    <div className="form-group">
                       <label>Serial Number / ID Tag</label>
                       <div style={{ position: 'relative' }}>
                          <Hash size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                          <input name="serial_number" value={formData.serial_number} onChange={handleChange} className="form-control" style={{ paddingLeft: '40px' }} placeholder="e.g. SN12345678" />
                       </div>
                    </div>
                 </div>
              </Card>

              <Card glass style={{ padding: '2rem' }}>
                 <h3 style={{ margin: '0 0 1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Shield size={20} color="#2563eb" /> Lifecycle & Warranty
                 </h3>
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                    <div className="form-group">
                       <label>Purchase Date</label>
                       <div style={{ position: 'relative' }}>
                          <Calendar size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                          <input name="purchase_date" type="date" value={formData.purchase_date} onChange={handleChange} className="form-control" style={{ paddingLeft: '40px' }} />
                       </div>
                    </div>
                    <div className="form-group">
                       <label>Warranty Expiry</label>
                       <div style={{ position: 'relative' }}>
                          <Shield size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                          <input name="warranty_expiry" type="date" value={formData.warranty_expiry} onChange={handleChange} className="form-control" style={{ paddingLeft: '40px' }} />
                       </div>
                    </div>
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                       <label>Notes / Description</label>
                       <textarea name="description" value={formData.description} onChange={handleChange} className="form-control" rows={4} placeholder="Additional details about the asset..." />
                    </div>
                 </div>
              </Card>
           </div>

           <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <Card glass style={{ padding: '2rem' }}>
                 <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.1rem' }}>Assignment</h3>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div className="form-group">
                       <label>Status</label>
                       <select name="status" value={formData.status} onChange={handleChange} className="form-control">
                          <option>Available</option>
                          <option>Assigned</option>
                          <option>Maintenance</option>
                          <option>Disposed</option>
                       </select>
                    </div>
                    <div className="form-group">
                       <label>Assign to Employee</label>
                       <div style={{ position: 'relative' }}>
                          <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                          <input name="assigned_to" value={formData.assigned_to} onChange={handleChange} className="form-control" style={{ paddingLeft: '40px' }} placeholder="Employee ID or Name" />
                       </div>
                    </div>
                 </div>
              </Card>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                 <Button type="submit" variant="primary" size="lg" disabled={loading} style={{ width: '100%', height: '54px' }}>
                    <Save size={18} style={{ marginRight: '8px' }} />
                    {loading ? 'Saving...' : 'Save Asset Record'}
                 </Button>
                 <Button type="button" variant="ghost" onClick={() => navigate('/inventory/assets')} style={{ width: '100%' }}>
                    Cancel
                 </Button>
              </div>
           </div>
        </div>
      </form>
    </div>
  );
};

export default AssetFormPage;
