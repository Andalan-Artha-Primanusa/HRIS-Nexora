import React, { useState, useEffect } from 'react';
import { RefreshCw, Save, Bell, Mail, MessageSquare, Smartphone, CheckCircle, XCircle, Clock, AlertTriangle, Settings } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { api } from '@/shared/api/httpClient';
import '@/shared/styles/CrudPage.css';
import '@/pages/dashboard/overview/OverviewPage.css';
import '@/pages/payroll/PayrollShared.css';
import './NotificationSettingsPage.css';

interface NotificationChannel {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  enabled: boolean;
}

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

  const toggleAllInCategory = (category: string, enabled: boolean) => {
    if (category === 'all') {
      setSettings(prev => prev.map(s => ({
        ...s,
        channels: { email: enabled, push: enabled, in_app: enabled }
      })));
    } else {
      setSettings(prev => prev.map(s => 
        s.category === category 
          ? { ...s, channels: { email: enabled, push: enabled, in_app: enabled } }
          : s
      ));
    }
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
    { key: 'approval', label: 'Approvals', icon: AlertTriangle },
    { key: 'announcement', label: 'Announcements', icon: MessageSquare },
    { key: 'system', label: 'System', icon: Bell },
  ];

  const channelIcons = {
    email: Mail,
    push: Smartphone,
    in_app: Bell,
  };

  const enabledCount = settings.reduce((acc, s) => acc + (s.channels.in_app ? 1 : 0), 0);
  const emailEnabledCount = settings.reduce((acc, s) => acc + (s.channels.email ? 1 : 0), 0);
  const pushEnabledCount = settings.reduce((acc, s) => acc + (s.channels.push ? 1 : 0), 0);

  return (
    <div className="crud-page notification-page">
      <Card className="hero-card">
        <div className="hero-card-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <Bell size={16} />
              <span>Settings</span>
            </div>
            <h1 className="hero-title">Notification Settings</h1>
            <p className="hero-subtitle">
              Configure how you receive notifications across different channels.
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn-outline" onClick={fetchData} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              {loading ? 'Memuat...' : 'Segarkan'}
            </button>
            <button className="btn-primary" onClick={handleSave} disabled={saving}>
              <Save size={16} />
              {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </div>
      </Card>

      <div className="white-unified-wrapper">
        <Card className="summary-card" glass>
          <div className="summary-card__header">
            <div>
              <span className="summary-card__label">Total Notifications</span>
              <p className="summary-card__subtitle">Configured</p>
            </div>
            <span className="summary-card__icon summary-card__icon--blue">
              <Bell size={20} />
            </span>
          </div>
          <div className="summary-card__value summary-card__value--blue">{settings.length}</div>
          <div className="summary-card__change">Notification types</div>
        </Card>

        <Card className="summary-card" glass>
          <div className="summary-card__header">
            <div>
              <span className="summary-card__label">Email Enabled</span>
              <p className="summary-card__subtitle">Via email</p>
            </div>
            <span className="summary-card__icon summary-card__icon--green">
              <Mail size={20} />
            </span>
          </div>
          <div className="summary-card__value summary-card__value--green">{emailEnabledCount}</div>
          <div className="summary-card__change">Active</div>
        </Card>

        <Card className="summary-card" glass>
          <div className="summary-card__header">
            <div>
              <span className="summary-card__label">Push Enabled</span>
              <p className="summary-card__subtitle">Mobile push</p>
            </div>
            <span className="summary-card__icon summary-card__icon--orange">
              <Smartphone size={20} />
            </span>
          </div>
          <div className="summary-card__value summary-card__value--orange">{pushEnabledCount}</div>
          <div className="summary-card__change">Active</div>
        </Card>
      </div>

      <div className="white-unified-wrapper">
        <div className="wuw-header">
          <div className="wuw-header-top">
            <div className="wuw-title-area">
              <h3>Notification Preferences</h3>
              <span className="wuw-count-badge">{filteredSettings.length} items</span>
            </div>
            <div className="category-filters">
              {categories.map(cat => (
                <button
                  key={cat.key}
                  className={`category-filter ${activeCategory === cat.key ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat.key)}
                >
                  <cat.icon size={14} />
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="wuw-table-area">
          {loading ? (
            <div className="notification-loading">
              <RefreshCw size={32} className="animate-spin" />
              <p>Loading notification settings...</p>
            </div>
          ) : (
            <div className="notification-list">
              <div className="notification-header-row">
                <div className="notification-info">Notification Type</div>
                <div className="notification-channels">
                  <div className="channel-header">
                    <Mail size={16} />
                    <span>Email</span>
                  </div>
                  <div className="channel-header">
                    <Smartphone size={16} />
                    <span>Push</span>
                  </div>
                  <div className="channel-header">
                    <Bell size={16} />
                    <span>In-App</span>
                  </div>
                </div>
              </div>

              {filteredSettings.map((setting) => (
                <div key={setting.id} className="notification-item">
                  <div className="notification-info">
                    <div className="notification-icon">
                      <Bell size={18} />
                    </div>
                    <div className="notification-text">
                      <h4>{setting.name}</h4>
                      <p>{setting.description}</p>
                    </div>
                  </div>
                  <div className="notification-channels">
                    {(['email', 'push', 'in_app'] as const).map(channel => {
                      const IconComponent = channelIcons[channel];
                      const isEnabled = setting.channels[channel];
                      return (
                        <button
                          key={channel}
                          className={`channel-toggle ${isEnabled ? 'enabled' : ''}`}
                          onClick={() => toggleChannel(setting.id, channel)}
                          title={`Toggle ${channel} notifications`}
                        >
                          {isEnabled ? (
                            <div className="toggle-on">
                              <CheckCircle size={20} />
                            </div>
                          ) : (
                            <div className="toggle-off">
                              <XCircle size={20} />
                            </div>
                          )}
                          <span className="channel-label">{channel === 'in_app' ? 'In-App' : channel === 'push' ? 'Push' : 'Email'}</span>
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