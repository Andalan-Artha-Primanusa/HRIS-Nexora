import React, { useState, useEffect } from 'react';
import { RefreshCw, Save, Building2, Mail, Phone, MapPin, Globe, Clock } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { api } from '@/shared/api/httpClient';
import '@/shared/styles/CrudPage.css';

const CompanySettingsPage: React.FC = () => {
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/company');
      const data = response.data;
      setCompany(Array.isArray(data) ? data[0] : data.data || data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/company/${company?.id}`, company);
      alert('Company settings saved!');
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="crud-page">
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-badge">Settings</span>
          <h1>Pengaturan Perusahaan</h1>
          <p>Kelola informasi dasar dan konfigurasi perusahaan.</p>
        </div>
        <div className="page-header-actions">
          <Button variant="outline" size="md" onClick={fetchData} disabled={loading}>
            <RefreshCw size={16} />
            Refresh
          </Button>
          <Button variant="primary" size="md" onClick={handleSave} disabled={saving}>
            <Save size={16} />
            {saving ? 'Saving...' : 'Simpan'}
          </Button>
        </div>
      </div>

      <div className="summary-grid">
        <Card className="summary-card" glass>
          <div className="summary-card__header">
            <div>
              <span className="summary-card__label">Perusahaan</span>
              <p className="summary-card__subtitle">Status aktif</p>
            </div>
            <span className="summary-card__icon summary-card__icon--blue">
              <Building2 size={20} />
            </span>
          </div>
          <div className="summary-card__value summary-card__value--blue">{company?.name || 'Company'}</div>
          <div className="summary-card__change">Company Name</div>
        </Card>

        <Card className="summary-card" glass>
          <div className="summary-card__header">
            <div>
              <span className="summary-card__label">Email</span>
              <p className="summary-card__subtitle">Kontak utama</p>
            </div>
            <span className="summary-card__icon summary-card__icon--green">
              <Mail size={20} />
            </span>
          </div>
          <div className="summary-card__value summary-card__value--green">{company?.email || '-'}</div>
          <div className="summary-card__change">Email</div>
        </Card>

        <Card className="summary-card" glass>
          <div className="summary-card__header">
            <div>
              <span className="summary-card__label">Telepon</span>
              <p className="summary-card__subtitle">Nomor kontak</p>
            </div>
            <span className="summary-card__icon summary-card__icon--orange">
              <Phone size={20} />
            </span>
          </div>
          <div className="summary-card__value summary-card__value--orange">{company?.phone || '-'}</div>
          <div className="summary-card__change">Phone</div>
        </Card>
      </div>

      <div className="white-unified-wrapper">
        <div className="wuw-header">
          <div className="wuw-header-top">
            <div className="wuw-title-area">
              <h3>Informasi Perusahaan</h3>
            </div>
          </div>
        </div>

        <div className="wuw-table-area">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>Loading...</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', padding: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#374151' }}>Nama Perusahaan</label>
                <input 
                  type="text" 
                  value={company?.name || ''} 
                  onChange={(e) => setCompany({ ...company, name: e.target.value })}
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.95rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#374151' }}>Kode Perusahaan</label>
                <input 
                  type="text" 
                  value={company?.code || ''} 
                  onChange={(e) => setCompany({ ...company, code: e.target.value })}
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.95rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#374151' }}>Email</label>
                <input 
                  type="email" 
                  value={company?.email || ''} 
                  onChange={(e) => setCompany({ ...company, email: e.target.value })}
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.95rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#374151' }}>Telepon</label>
                <input 
                  type="text" 
                  value={company?.phone || ''} 
                  onChange={(e) => setCompany({ ...company, phone: e.target.value })}
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.95rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#374151' }}>Website</label>
                <input 
                  type="text" 
                  value={company?.website || ''} 
                  onChange={(e) => setCompany({ ...company, website: e.target.value })}
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.95rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#374151' }}>Alamat</label>
                <input 
                  type="text" 
                  value={company?.address || ''} 
                  onChange={(e) => setCompany({ ...company, address: e.target.value })}
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.95rem' }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanySettingsPage;