import React, { useState, useEffect } from 'react';
import { RefreshCw, Save, Building2, Mail, Phone, MapPin, Globe, Clock, User, Briefcase, Settings, Calendar, Landmark, Info, ShieldCheck } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { api } from '@/shared/api/httpClient';
import '@/shared/styles/CrudPage.css';
import '@/pages/dashboard/overview/OverviewPage.css';
import '@/pages/payroll/PayrollShared.css';
import './CompanySettingsPage.css';

const CompanySettingsPage: React.FC = () => {
  const [company, setCompany] = useState({
    name: '',
    code: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    city: '',
    country: '',
    tax_id: '',
    industry: '',
    employee_count: 0,
    founded_year: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/company');
      const data = response.data;
      const companyData = Array.isArray(data) ? data[0] : data.data || data;
      if (companyData) {
        setCompany({
          name: companyData.name || '',
          code: companyData.code || '',
          email: companyData.email || '',
          phone: companyData.phone || '',
          website: companyData.website || '',
          address: companyData.address || '',
          city: companyData.city || '',
          country: companyData.country || '',
          tax_id: companyData.tax_id || '',
          industry: companyData.industry || '',
          employee_count: companyData.employee_count || 0,
          founded_year: companyData.founded_year || '',
        });
      }
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
      await api.put('/company/1', company);
      alert('Company settings saved successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: string, value: string | number) => {
    setCompany(prev => ({ ...prev, [field]: value }));
  };

  const tabs = [
    { key: 'general', label: 'General Info', icon: Building2 },
    { key: 'contact', label: 'Contact Details', icon: Mail },
    { key: 'business', label: 'Business & Legal', icon: Landmark },
  ];

  return (
    <div className="crud-page settings-page">
      <Card className="hero-card" style={{ marginBottom: '2rem' }}>
        <div className="hero-card-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <Settings size={16} />
              <span>System Administration</span>
            </div>
            <h1 className="hero-title">Company Settings</h1>
            <p className="hero-subtitle">
              Manage your organization's core identity, contact information, and business parameters.
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn-outline" onClick={fetchData} disabled={loading} style={{ background: 'white' }}>
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              {loading ? 'Memuat...' : 'Refresh'}
            </button>
            <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ boxShadow: '0 10px 20px rgba(37, 99, 235, 0.2)' }}>
              <Save size={16} />
              {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </div>
      </Card>

      <div className="settings-summary-grid">
        <Card className="summary-card">
          <div className="summary-card__header">
            <div>
              <span className="summary-card__label">Company Identity</span>
              <p className="summary-card__subtitle">Primary registration name</p>
            </div>
            <span className="summary-card__icon summary-card__icon--blue">
              <Building2 size={20} />
            </span>
          </div>
          <div className="summary-card__value summary-card__value--blue">{company.name || 'Not set'}</div>
          <div className="summary-card__change">{company.code || 'NO-CODE'} • {company.founded_year || 'Year not set'}</div>
        </Card>

        <Card className="summary-card">
          <div className="summary-card__header">
            <div>
              <span className="summary-card__label">Industry Sector</span>
              <p className="summary-card__subtitle">Business classification</p>
            </div>
            <span className="summary-card__icon summary-card__icon--green">
              <Briefcase size={20} />
            </span>
          </div>
          <div className="summary-card__value summary-card__value--green">{company.industry || 'Not set'}</div>
          <div className="summary-card__change">Standard Business Type</div>
        </Card>

        <Card className="summary-card">
          <div className="summary-card__header">
            <div>
              <span className="summary-card__label">Workforce Size</span>
              <p className="summary-card__subtitle">Total active personnel</p>
            </div>
            <span className="summary-card__icon summary-card__icon--orange">
              <User size={20} />
            </span>
          </div>
          <div className="summary-card__value summary-card__value--orange">{company.employee_count}</div>
          <div className="summary-card__change">Registered Employees</div>
        </Card>
      </div>

      <div className="white-unified-wrapper" style={{ marginTop: '2rem' }}>
        <div className="wuw-header">
          <div className="wuw-header-top" style={{ marginBottom: 0 }}>
            <div className="wuw-title-area">
              <h3>Detailed Configuration</h3>
            </div>
            <div className="settings-tabs-container">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  className={`settings-nav-tab ${activeTab === tab.key ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  <tab.icon size={18} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="settings-content-area">
          {loading ? (
            <div className="settings-loading-state">
              <RefreshCw size={48} className="animate-spin" color="#2563eb" />
              <p>Synchronizing company data...</p>
            </div>
          ) : (
            <div className="settings-form-wrapper">
              {activeTab === 'general' && (
                <div className="form-grid-layout">
                  <div className="form-group-item">
                    <label>Company Name <span className="text-danger">*</span></label>
                    <div className="input-icon-wrapper">
                      <Building2 size={18} className="field-icon" />
                      <input
                        type="text"
                        value={company.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        placeholder="Enter official company name"
                        className="premium-input"
                      />
                    </div>
                  </div>
                  <div className="form-group-item">
                    <label>Company Code</label>
                    <div className="input-icon-wrapper">
                      <Globe size={18} className="field-icon" />
                      <input
                        type="text"
                        value={company.code}
                        onChange={(e) => handleChange('code', e.target.value)}
                        placeholder="e.g., MAH-ID"
                        className="premium-input"
                      />
                    </div>
                  </div>
                  <div className="form-group-item">
                    <label>Industry</label>
                    <div className="input-icon-wrapper">
                      <Briefcase size={18} className="field-icon" />
                      <select
                        value={company.industry}
                        onChange={(e) => handleChange('industry', e.target.value)}
                        className="premium-input"
                      >
                        <option value="">Select industry</option>
                        <option value="technology">Technology & Software</option>
                        <option value="manufacturing">Manufacturing</option>
                        <option value="retail">Retail & E-commerce</option>
                        <option value="finance">Banking & Finance</option>
                        <option value="healthcare">Healthcare & Biotech</option>
                        <option value="education">Education</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group-item">
                    <label>Founded Year</label>
                    <div className="input-icon-wrapper">
                      <Calendar size={18} className="field-icon" />
                      <input
                        type="text"
                        value={company.founded_year}
                        onChange={(e) => handleChange('founded_year', e.target.value)}
                        placeholder="e.g., 2024"
                        className="premium-input"
                      />
                    </div>
                  </div>
                  <div className="form-group-item">
                    <label>Tax ID / NPWP</label>
                    <div className="input-icon-wrapper">
                      <ShieldCheck size={18} className="field-icon" />
                      <input
                        type="text"
                        value={company.tax_id}
                        onChange={(e) => handleChange('tax_id', e.target.value)}
                        placeholder="00.000.000.0-000.000"
                        className="premium-input"
                      />
                    </div>
                  </div>
                  <div className="form-group-item">
                    <label>Total Workforce</label>
                    <div className="input-icon-wrapper">
                      <User size={18} className="field-icon" />
                      <input
                        type="number"
                        value={company.employee_count}
                        onChange={(e) => handleChange('employee_count', parseInt(e.target.value) || 0)}
                        placeholder="0"
                        className="premium-input"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'contact' && (
                <div className="form-grid-layout">
                  <div className="form-group-item">
                    <label>Email Address</label>
                    <div className="input-icon-wrapper">
                      <Mail size={18} className="field-icon" />
                      <input
                        type="email"
                        value={company.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        placeholder="hello@company.com"
                        className="premium-input"
                      />
                    </div>
                  </div>
                  <div className="form-group-item">
                    <label>Phone Number</label>
                    <div className="input-icon-wrapper">
                      <Phone size={18} className="field-icon" />
                      <input
                        type="text"
                        value={company.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        placeholder="+62 xxx"
                        className="premium-input"
                      />
                    </div>
                  </div>
                  <div className="form-group-item">
                    <label>Website URL</label>
                    <div className="input-icon-wrapper">
                      <Globe size={18} className="field-icon" />
                      <input
                        type="text"
                        value={company.website}
                        onChange={(e) => handleChange('website', e.target.value)}
                        placeholder="https://www.company.com"
                        className="premium-input"
                      />
                    </div>
                  </div>
                  <div className="form-group-item full-width">
                    <label>Full Address</label>
                    <div className="input-icon-wrapper">
                      <MapPin size={18} className="field-icon" />
                      <input
                        type="text"
                        value={company.address}
                        onChange={(e) => handleChange('address', e.target.value)}
                        placeholder="Street name, building, floor..."
                        className="premium-input"
                      />
                    </div>
                  </div>
                  <div className="form-group-item">
                    <label>City</label>
                    <div className="input-icon-wrapper">
                      <MapPin size={18} className="field-icon" />
                      <input
                        type="text"
                        value={company.city}
                        onChange={(e) => handleChange('city', e.target.value)}
                        placeholder="e.g. Jakarta"
                        className="premium-input"
                      />
                    </div>
                  </div>
                  <div className="form-group-item">
                    <label>Country</label>
                    <div className="input-icon-wrapper">
                      <Globe size={18} className="field-icon" />
                      <input
                        type="text"
                        value={company.country}
                        onChange={(e) => handleChange('country', e.target.value)}
                        placeholder="e.g. Indonesia"
                        className="premium-input"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'business' && (
                <div className="form-grid-layout">
                  <div className="status-info-banner">
                    <div className="banner-icon">
                      <Info size={24} />
                    </div>
                    <div className="banner-text">
                      <h4>Verification & Legal Identity</h4>
                      <p>Detailed legal information helps in generating accurate payroll reports and compliance documents.</p>
                    </div>
                  </div>
                  <div className="form-group-item">
                    <label>Business Legal Entity</label>
                    <div className="input-icon-wrapper">
                      <Landmark size={18} className="field-icon" />
                      <select 
                        value={company.industry} 
                        onChange={(e) => handleChange('industry', e.target.value)}
                        className="premium-input"
                      >
                        <option value="">Select type</option>
                        <option value="pt">PT (Perseroan Terbatas)</option>
                        <option value="cv">CV (Commanditaire Vennootschap)</option>
                        <option value="individual">Sole Proprietorship</option>
                        <option value="foundation">Foundation / NGO</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group-item">
                    <label>Fiscal Year Cycle Start</label>
                    <div className="input-icon-wrapper">
                      <Clock size={18} className="field-icon" />
                      <select className="premium-input">
                        <option value="1">January</option>
                        <option value="4">April</option>
                        <option value="7">July</option>
                        <option value="10">October</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanySettingsPage;