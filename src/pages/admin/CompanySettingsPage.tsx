import React, { useState, useEffect } from 'react';
import { RefreshCw, Save, Building2, Mail, Phone, MapPin, Globe, Clock, User, Briefcase } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { api } from '@/shared/api/httpClient';
import '@/shared/styles/CrudPage.css';
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
    { key: 'general', label: 'General', icon: Building2 },
    { key: 'contact', label: 'Contact', icon: MapPin },
    { key: 'business', label: 'Business', icon: Briefcase },
  ];

  return (
    <div className="crud-page settings-page">
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-badge">Settings</span>
          <h1>Company Settings</h1>
          <p>Manage your company information and preferences.</p>
        </div>
        <div className="page-header-actions">
          <Button variant="outline" size="md" onClick={fetchData} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </Button>
          <Button variant="primary" size="md" onClick={handleSave} disabled={saving}>
            <Save size={16} />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <div className="summary-grid">
        <Card className="summary-card" glass>
          <div className="summary-card__header">
            <div>
              <span className="summary-card__label">Company Name</span>
              <p className="summary-card__subtitle">Primary identifier</p>
            </div>
            <span className="summary-card__icon summary-card__icon--blue">
              <Building2 size={20} />
            </span>
          </div>
          <div className="summary-card__value summary-card__value--blue">{company.name || 'Not set'}</div>
          <div className="summary-card__change">{company.code || 'No code'}</div>
        </Card>

        <Card className="summary-card" glass>
          <div className="summary-card__header">
            <div>
              <span className="summary-card__label">Industry</span>
              <p className="summary-card__subtitle">Business sector</p>
            </div>
            <span className="summary-card__icon summary-card__icon--green">
              <Briefcase size={20} />
            </span>
          </div>
          <div className="summary-card__value summary-card__value--green">{company.industry || 'Not set'}</div>
          <div className="summary-card__change">Industry type</div>
        </Card>

        <Card className="summary-card" glass>
          <div className="summary-card__header">
            <div>
              <span className="summary-card__label">Employees</span>
              <p className="summary-card__subtitle">Total count</p>
            </div>
            <span className="summary-card__icon summary-card__icon--orange">
              <User size={20} />
            </span>
          </div>
          <div className="summary-card__value summary-card__value--orange">{company.employee_count}</div>
          <div className="summary-card__change">Active staff</div>
        </Card>
      </div>

      <div className="white-unified-wrapper">
        <div className="wuw-header">
          <div className="wuw-header-top">
            <div className="wuw-title-area">
              <h3>Company Information</h3>
            </div>
            <div className="settings-tabs">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  className={`settings-tab ${activeTab === tab.key ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  <tab.icon size={16} />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="wuw-table-area">
          {loading ? (
            <div className="settings-loading">
              <RefreshCw size={32} className="animate-spin" />
              <p>Loading company data...</p>
            </div>
          ) : (
            <div className="settings-form">
              {activeTab === 'general' && (
                <div className="form-grid">
                  <div className="form-group">
                    <label>Company Name <span className="required">*</span></label>
                    <input
                      type="text"
                      value={company.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      placeholder="Enter company name"
                    />
                  </div>
                  <div className="form-group">
                    <label>Company Code</label>
                    <input
                      type="text"
                      value={company.code}
                      onChange={(e) => handleChange('code', e.target.value)}
                      placeholder="e.g., COMP"
                    />
                  </div>
                  <div className="form-group">
                    <label>Industry</label>
                    <select
                      value={company.industry}
                      onChange={(e) => handleChange('industry', e.target.value)}
                    >
                      <option value="">Select industry</option>
                      <option value="technology">Technology</option>
                      <option value="manufacturing">Manufacturing</option>
                      <option value="retail">Retail</option>
                      <option value="finance">Finance</option>
                      <option value="healthcare">Healthcare</option>
                      <option value="education">Education</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Founded Year</label>
                    <input
                      type="text"
                      value={company.founded_year}
                      onChange={(e) => handleChange('founded_year', e.target.value)}
                      placeholder="e.g., 2020"
                    />
                  </div>
                  <div className="form-group">
                    <label>Tax ID / NPWP</label>
                    <input
                      type="text"
                      value={company.tax_id}
                      onChange={(e) => handleChange('tax_id', e.target.value)}
                      placeholder="Enter tax ID"
                    />
                  </div>
                  <div className="form-group">
                    <label>Number of Employees</label>
                    <input
                      type="number"
                      value={company.employee_count}
                      onChange={(e) => handleChange('employee_count', parseInt(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'contact' && (
                <div className="form-grid">
                  <div className="form-group">
                    <label>Email Address</label>
                    <div className="input-with-icon">
                      <Mail size={18} />
                      <input
                        type="email"
                        value={company.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        placeholder="company@email.com"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <div className="input-with-icon">
                      <Phone size={18} />
                      <input
                        type="text"
                        value={company.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        placeholder="+62 xxx"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Website</label>
                    <div className="input-with-icon">
                      <Globe size={18} />
                      <input
                        type="text"
                        value={company.website}
                        onChange={(e) => handleChange('website', e.target.value)}
                        placeholder="https://company.com"
                      />
                    </div>
                  </div>
                  <div className="form-group full-width">
                    <label>Address</label>
                    <div className="input-with-icon">
                      <MapPin size={18} />
                      <input
                        type="text"
                        value={company.address}
                        onChange={(e) => handleChange('address', e.target.value)}
                        placeholder="Enter full address"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>City</label>
                    <input
                      type="text"
                      value={company.city}
                      onChange={(e) => handleChange('city', e.target.value)}
                      placeholder="City"
                    />
                  </div>
                  <div className="form-group">
                    <label>Country</label>
                    <input
                      type="text"
                      value={company.country}
                      onChange={(e) => handleChange('country', e.target.value)}
                      placeholder="Country"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'business' && (
                <div className="form-grid">
                  <div className="info-card">
                    <div className="info-icon">
                      <Clock size={24} />
                    </div>
                    <div className="info-content">
                      <h4>Company Profile</h4>
                      <p>Your company profile information is used for legal documents, contracts, and official communications.</p>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Business Type</label>
                    <select value={company.industry} onChange={(e) => handleChange('industry', e.target.value)}>
                      <option value="">Select type</option>
                      <option value="pt">PT (Perseroan Terbatas)</option>
                      <option value="cv">CV (Commanditaire Vennootschap)</option>
                      <option value="individual">Individual / Sole Proprietor</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Fiscal Year Start</label>
                    <select>
                      <option value="1">January</option>
                      <option value="4">April</option>
                      <option value="7">July</option>
                      <option value="10">October</option>
                    </select>
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