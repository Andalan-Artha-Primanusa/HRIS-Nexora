import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Globe, Hash, Shield, MonitorCog } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { biometricService } from '@/features/biometric/api/biometric.service';
import '@/shared/styles/CrudPage.css';
import "../dashboard/overview/OverviewPage.css";

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
      <Card className="hero-card" style={{ marginBottom: '2rem' }}>
        <div className="hero-card-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <MonitorCog size={16} />
              <span>Hardware Control</span>
            </div>
            <h1 className="hero-title">{isEdit ? 'Edit Device' : 'Register Biometric Device'}</h1>
            <p className="hero-subtitle">
              Configure network settings and physical location for attendance terminals.
            </p>
          </div>
          <div className="hero-actions">
            <button type="button" className="btn-outline" onClick={() => navigate('/admin/biometric-devices')}>
              <ArrowLeft size={16} style={{ marginRight: '8px' }} />
              Kembali
            </button>
          </div>
        </div>
      </Card>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <Card glass style={{ padding: '2.5rem', borderRadius: '32px' }}>
                 <h3 style={{ margin: '0 0 2rem', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.25rem', fontWeight: 800, color: '#1e3a8a' }}>
                    <MonitorCog size={24} color="#2563eb" /> Network Configuration
                 </h3>
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', gridColumn: '1 / -1' }}>
                       <label style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b' }}>Device Name <span style={{ color: '#ef4444' }}>*</span></label>
                       <input 
                         name="name" 
                         value={formData.name} 
                         onChange={handleChange} 
                         required 
                         placeholder="e.g. ZKTeco - Lobby Office"
                         style={{ width: '100%', padding: '0 16px', height: '50px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '1rem', color: '#0f172a', transition: 'all 0.2s', boxSizing: 'border-box' }}
                       />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                       <label style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b' }}>IP Address <span style={{ color: '#ef4444' }}>*</span></label>
                       <div style={{ position: 'relative' }}>
                          <Globe size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                          <input 
                            name="ip_address" 
                            value={formData.ip_address} 
                            onChange={handleChange} 
                            style={{ width: '100%', padding: '0 16px 0 46px', height: '50px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '1rem', color: '#0f172a', transition: 'all 0.2s', boxSizing: 'border-box' }}
                            required 
                            placeholder="192.168.1.XX" 
                          />
                       </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                       <label style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b' }}>Port</label>
                       <div style={{ position: 'relative' }}>
                          <Hash size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                          <input 
                            name="port" 
                            type="number" 
                            value={formData.port} 
                            onChange={handleChange} 
                            style={{ width: '100%', padding: '0 16px 0 46px', height: '50px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '1rem', color: '#0f172a', transition: 'all 0.2s', boxSizing: 'border-box' }}
                            placeholder="4370" 
                          />
                       </div>
                    </div>
                 </div>
              </Card>

              <Card glass style={{ padding: '2.5rem', borderRadius: '32px' }}>
                 <h3 style={{ margin: '0 0 2rem', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.25rem', fontWeight: 800, color: '#1e3a8a' }}>
                    <Shield size={24} color="#2563eb" /> Security & Location
                 </h3>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                       <label style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b' }}>Physical Location</label>
                       <input 
                         name="location" 
                         value={formData.location} 
                         onChange={handleChange} 
                         style={{ width: '100%', padding: '0 16px', height: '50px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '1rem', color: '#0f172a', transition: 'all 0.2s', boxSizing: 'border-box' }}
                         placeholder="e.g. Building A, Floor 2" 
                       />
                    </div>
                 </div>
              </Card>
           </div>

           <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <Card glass style={{ padding: '2rem', borderRadius: '28px' }}>
                 <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.1rem', fontWeight: 800, color: '#1e3a8a' }}>Device Status</h3>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                       <label style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b' }}>Status</label>
                       <select 
                         name="status" 
                         value={formData.status} 
                         onChange={handleChange}
                         style={{ width: '100%', padding: '0 16px', height: '50px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '1rem', color: '#0f172a', transition: 'all 0.2s', boxSizing: 'border-box' }}
                       >
                          <option value="online">Online / Active</option>
                          <option value="offline">Offline / Maintenance</option>
                       </select>
                    </div>
                 </div>
              </Card>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                 <Button type="submit" variant="primary" size="lg" disabled={loading} style={{ width: '100%', height: '60px', borderRadius: '20px', fontWeight: 800, fontSize: '1.1rem', boxShadow: '0 10px 20px rgba(37, 99, 235, 0.2)' }}>
                    <Save size={20} style={{ marginRight: '10px' }} />
                    {loading ? 'Processing...' : (isEdit ? 'Update Device' : 'Register Device')}
                 </Button>
                 <Button type="button" onClick={() => navigate('/admin/biometric-devices')} style={{ width: '100%', height: '54px', borderRadius: '20px', fontWeight: 700, background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1' }}>
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
