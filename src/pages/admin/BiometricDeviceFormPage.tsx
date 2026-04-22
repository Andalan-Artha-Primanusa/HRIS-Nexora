import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Globe, Hash, Shield, MonitorCog } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { biometricService } from '@/features/biometric/api/biometric.service';
import '@/shared/styles/CrudPage.css';

const BiometricDeviceFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    ip_address: '',
    port: 4370,
    location: '',
    status: 'online'
  });

  useEffect(() => {
    if (isEdit) {
      const fetchDevice = async () => {
        setFetching(true);
        try {
          const res = await biometricService.getDevice(id);
          setFormData(res.data || res);
        } catch (err) {
          console.error(err);
        } finally {
          setFetching(false);
        }
      };
      fetchDevice();
    }
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) {
        await biometricService.updateDevice(id, formData);
      } else {
        await biometricService.registerDevice(formData);
      }
      navigate('/admin/biometric-devices');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (fetching) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading device details...</div>;

  return (
    <div className="crud-page">
      <div className="crud-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
           <Button variant="ghost" onClick={() => navigate('/admin/biometric-devices')}>
              <ArrowLeft size={20} />
           </Button>
           <div>
              <span className="reimb-badge reimb-badge-admin">Hardware</span>
              <h1>{isEdit ? 'Edit Device' : 'Register Biometric Device'}</h1>
              <p>Configure network settings and physical location for attendance terminals.</p>
           </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <Card glass style={{ padding: '2rem' }}>
                 <h3 style={{ margin: '0 0 1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <MonitorCog size={20} color="#2563eb" /> Network Configuration
                 </h3>
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                       <label>Device Name</label>
                       <input name="name" value={formData.name} onChange={handleChange} className="form-control" required placeholder="e.g. ZKTeco - Lobby Office" />
                    </div>
                    <div className="form-group">
                       <label>IP Address</label>
                       <div style={{ position: 'relative' }}>
                          <Globe size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                          <input name="ip_address" value={formData.ip_address} onChange={handleChange} className="form-control" style={{ paddingLeft: '40px' }} required placeholder="192.168.1.XX" />
                       </div>
                    </div>
                    <div className="form-group">
                       <label>Port</label>
                       <div style={{ position: 'relative' }}>
                          <Hash size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                          <input name="port" type="number" value={formData.port} onChange={handleChange} className="form-control" style={{ paddingLeft: '40px' }} placeholder="4370" />
                       </div>
                    </div>
                 </div>
              </Card>

              <Card glass style={{ padding: '2rem' }}>
                 <h3 style={{ margin: '0 0 1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Shield size={20} color="#2563eb" /> Security & Location
                 </h3>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div className="form-group">
                       <label>Physical Location</label>
                       <input name="location" value={formData.location} onChange={handleChange} className="form-control" placeholder="e.g. Building A, Floor 2" />
                    </div>
                 </div>
              </Card>
           </div>

           <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <Card glass style={{ padding: '2rem' }}>
                 <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.1rem' }}>Device Status</h3>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div className="form-group">
                       <label>Status</label>
                       <select name="status" value={formData.status} onChange={handleChange} className="form-control">
                          <option value="online">Online / Active</option>
                          <option value="offline">Offline / Maintenance</option>
                       </select>
                    </div>
                 </div>
              </Card>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                 <Button type="submit" variant="primary" size="lg" disabled={loading} style={{ width: '100%', height: '54px' }}>
                    <Save size={18} style={{ marginRight: '8px' }} />
                    {loading ? 'Registering...' : 'Save Device'}
                 </Button>
                 <Button type="button" variant="ghost" onClick={() => navigate('/admin/biometric-devices')} style={{ width: '100%' }}>
                    Cancel
                 </Button>
              </div>
           </div>
        </div>
      </form>
    </div>
  );
};

export default BiometricDeviceFormPage;
