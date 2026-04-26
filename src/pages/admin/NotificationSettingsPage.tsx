import React, { useState, useEffect } from 'react';
import { RefreshCw, Save, Bell, Mail, MessageSquare, Smartphone, CheckCircle, XCircle, Clock, AlertTriangle, Settings, Info, ShieldCheck, UserCheck } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { api } from '@/shared/api/httpClient';
import '@/shared/styles/CrudPage.css';
import '@/pages/dashboard/overview/OverviewPage.css';
import '@/pages/payroll/PayrollShared.css';
import './NotificationSettingsPage.css';

interface NotificationSetting {
  id: string;
  name: string;
  description: string;
  channels: {
    email: boolean;
    push: boolean;
    in_app: boolean;
  };
  category: 'leave' | 'payroll' | 'announcement' | 'system' | 'approval';
}

const NotificationSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<NotificationSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const defaultSettings: NotificationSetting[] = [
    {
      id: 'leave_request',
      name: 'Leave Request',
      description: 'When employees submit leave requests',
      category: 'leave',
      channels: { email: true, push: true, in_app: true }
    },
    {
      id: 'leave_approval',
      name: 'Leave Approval',
      description: 'When leave requests are approved or rejected',
      category: 'approval',
      channels: { email: true, push: true, in_app: true }
    },
    {
      id: 'payroll_ready',
      name: 'Payroll Ready',
      description: 'When payroll is ready for review',
      category: 'payroll',
      channels: { email: true, push: false, in_app: true }
    },
    {
      id: 'payroll_paid',
      name: 'Payroll Paid',
      description: 'When salary has been disbursed',
      category: 'payroll',
      channels: { email: true, push: true, in_app: true }
    },
    {
      id: 'announcement',
      name: 'Company Announcement',
      description: 'Important company announcements and updates',
      category: 'announcement',
      channels: { email: true, push: true, in_app: true }
    },
    {
      id: 'overtime_request',
      name: 'Overtime Request',
      description: 'When overtime requests need approval',
      category: 'approval',
      channels: { email: true, push: true, in_app: true }
    },
    {
      id: 'reimbursement',
      name: 'Reimbursement',
      description: 'Reimbursement request status updates',
      category: 'approval',
      channels: { email: true, push: false, in_app: true }
    },
    {
      id: 'attendance_alert',
      name: 'Attendance Alert',
      description: 'Attendance-related notifications',
      category: 'system',
      channels: { email: false, push: true, in_app: true }
    },
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/notification-settings');
      const data = response.data;
      const settingsArray = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
      if (settingsArray.length > 0) {
        setSettings(settingsArray);
      } else {
        setSettings(defaultSettings);
      }
    } catch (err) {
      console.error(err);
      setSettings(defaultSettings);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleChannel = (settingId: string, channel: 'email' | 'push' | 'in_app') => {
    setSettings(prev => prev.map(s => 
      s.id === settingId 
        ? { ...s, channels: { ...s.channels, [channel]: !s.channels[channel] } }
        : s
    ));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/notification-settings', { settings });
      alert('Notification settings saved successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const filteredSettings = activeCategory === 'all' 
    ? settings 
    : settings.filter(s => s.category === activeCategory);

  const categories = [
    { key: 'all', label: 'All', icon: Bell },
    { key: 'leave', label: 'Leave', icon: Clock },
    { key: 'payroll', label: 'Payroll', icon: CheckCircle },
    { key: 'approval', label: 'Approvals', icon: UserCheck },
    { key: 'announcement', label: 'Announcements', icon: MessageSquare },
    { key: 'system', label: 'System', icon: ShieldCheck },
  ];

  const emailEnabledCount = settings.reduce((acc, s) => acc + (s.channels.email ? 1 : 0), 0);
  const pushEnabledCount = settings.reduce((acc, s) => acc + (s.channels.push ? 1 : 0), 0);

  return (
    <div className="crud-page notification-page">
      <Card className="hero-card" style={{ marginBottom: '2rem' }}>
        <div className="hero-card-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <Bell size={16} />
              <span>Communication Center</span>
            </div>
            <h1 className="hero-title">Notification Settings</h1>
            <p className="hero-subtitle">
              Configure how you receive notifications across different channels and business processes.
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
              <span className="summary-card__label">Total Notifications</span>
              <p className="summary-card__subtitle">Configured triggers</p>
            </div>
            <span className="summary-card__icon summary-card__icon--blue">
              <Bell size={20} />
            </span>
          </div>
          <div className="summary-card__value summary-card__value--blue">{settings.length}</div>
          <div className="summary-card__change">Active notification types</div>
        </Card>

        <Card className="summary-card">
          <div className="summary-card__header">
            <div>
              <span className="summary-card__label">Email Channel</span>
              <p className="summary-card__subtitle">Via SMTP service</p>
            </div>
            <span className="summary-card__icon summary-card__icon--green">
              <Mail size={20} />
            </span>
          </div>
          <div className="summary-card__value summary-card__value--green">{emailEnabledCount}</div>
          <div className="summary-card__change">Enabled for triggers</div>
        </Card>

        <Card className="summary-card">
          <div className="summary-card__header">
            <div>
              <span className="summary-card__label">Mobile Push</span>
              <p className="summary-card__subtitle">App push notifications</p>
            </div>
            <span className="summary-card__icon summary-card__icon--orange">
              <Smartphone size={20} />
            </span>
          </div>
          <div className="summary-card__value summary-card__value--orange">{pushEnabledCount}</div>
          <div className="summary-card__change">Active mobile endpoints</div>
        </Card>
      </div>

      <div className="white-unified-wrapper" style={{ marginTop: '2rem' }}>
        <div className="wuw-header">
          <div className="wuw-header-top" style={{ marginBottom: 0 }}>
            <div className="wuw-title-area">
              <h3>Notification Preferences</h3>
              <span className="wuw-count-badge">{filteredSettings.length} modules</span>
            </div>
            <div className="settings-tabs-container">
              {categories.map(cat => (
                <button
                  key={cat.key}
                  className={`settings-nav-tab ${activeCategory === cat.key ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat.key)}
                >
                  <cat.icon size={16} />
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="settings-content-area">
          {loading ? (
            <div className="settings-loading-state">
              <RefreshCw size={48} className="animate-spin" color="#2563eb" />
              <p>Synchronizing preferences...</p>
            </div>
          ) : (
            <div className="notification-list-premium">
              <div className="notification-header-row-premium">
                <div className="notification-info-col">Notification Type</div>
                <div className="notification-channels-col">
                  <span>Email</span>
                  <span>Push</span>
                  <span>In-App</span>
                </div>
              </div>

              {filteredSettings.map((setting) => (
                <div key={setting.id} className="notification-item-premium">
                  <div className="notification-info-col">
                    <div className="notification-icon-premium">
                      <Bell size={18} />
                    </div>
                    <div className="notification-text-premium">
                      <h4>{setting.name}</h4>
                      <p>{setting.description}</p>
                    </div>
                  </div>
                  <div className="notification-channels-col">
                    {(['email', 'push', 'in_app'] as const).map(channel => {
                      const isEnabled = setting.channels[channel];
                      return (
                        <button
                          key={channel}
                          className={`channel-pill-toggle ${isEnabled ? 'enabled' : ''}`}
                          onClick={() => toggleChannel(setting.id, channel)}
                        >
                          {isEnabled ? <CheckCircle size={18} /> : <XCircle size={18} />}
                          <span className="channel-pill-label">{channel === 'in_app' ? 'App' : channel === 'push' ? 'Push' : 'Mail'}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationSettingsPage;