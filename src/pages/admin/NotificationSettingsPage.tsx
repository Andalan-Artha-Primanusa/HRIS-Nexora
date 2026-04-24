import React, { useState, useEffect } from 'react';
import { RefreshCw, Save, Bell, Mail, MessageSquare, CheckCircle, ToggleLeft, ToggleRight } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { api } from '@/shared/api/httpClient';
import '@/shared/styles/CrudPage.css';

interface NotificationSetting {
  id: string;
  name: string;
  description: string;
  email_enabled: boolean;
  push_enabled: boolean;
  in_app_enabled: boolean;
}

const NotificationSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<NotificationSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/notification-settings');
      const data = response.data;
      const settingsArray = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
      setSettings(settingsArray);
    } catch (err) {
      console.error(err);
      setSettings([
        { id: 'leave_request', name: 'Leave Request', description: 'Notifikasi pengajuan cuti', email_enabled: true, push_enabled: true, in_app_enabled: true },
        { id: 'leave_approval', name: 'Leave Approval', description: 'Notifikasi persetujuan cuti', email_enabled: true, push_enabled: true, in_app_enabled: true },
        { id: 'payroll_ready', name: 'Payroll Ready', description: 'Notifikasi slip gaji ready', email_enabled: true, push_enabled: false, in_app_enabled: true },
        { id: 'announcement', name: 'Announcement', description: 'Pengumuman perusahaan', email_enabled: true, push_enabled: true, in_app_enabled: true },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleSetting = (id: string, field: 'email_enabled' | 'push_enabled' | 'in_app_enabled') => {
    setSettings(prev => prev.map(s => s.id === id ? { ...s, [field]: !s[field] } : s));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/notification-settings', { settings });
      alert('Notification settings saved!');
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const activeCount = settings.filter(s => s.in_app_enabled).length;

  return (
    <div className="crud-page">
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-badge">Settings</span>
          <h1>Pengaturan Notifikasi</h1>
          <p>Kelola preferensi notifikasi untuk berbagai события.</p>
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
              <span className="summary-card__label">Total Notifikasi</span>
              <p className="summary-card__subtitle">Semua jenis</p>
            </div>
            <span className="summary-card__icon summary-card__icon--blue">
              <Bell size={20} />
            </span>
          </div>
          <div className="summary-card__value summary-card__value--blue">{settings.length}</div>
          <div className="summary-card__change">Notification Types</div>
        </Card>

        <Card className="summary-card" glass>
          <div className="summary-card__header">
            <div>
              <span className="summary-card__label">Aktif</span>
              <p className="summary-card__subtitle">Notifikasi aktif</p>
            </div>
            <span className="summary-card__icon summary-card__icon--green">
              <CheckCircle size={20} />
            </span>
          </div>
          <div className="summary-card__value summary-card__value--green">{activeCount}</div>
          <div className="summary-card__change">Active</div>
        </Card>

        <Card className="summary-card" glass>
          <div className="summary-card__header">
            <div>
              <span className="summary-card__label">Email</span>
              <p className="summary-card__subtitle">Via email</p>
            </div>
            <span className="summary-card__icon summary-card__icon--orange">
              <Mail size={20} />
            </span>
          </div>
          <div className="summary-card__value summary-card__value--orange">
            {settings.filter(s => s.email_enabled).length}
          </div>
          <div className="summary-card__change">Email Enabled</div>
        </Card>
      </div>

      <div className="white-unified-wrapper">
        <div className="wuw-header">
          <div className="wuw-header-top">
            <div className="wuw-title-area">
              <h3>Pengaturan Notifikasi</h3>
              <span className="wuw-count-badge">{settings.length} Total</span>
            </div>
          </div>
        </div>

        <div className="wuw-table-area">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>Loading...</div>
          ) : settings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
              <Bell size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
              <p>Belum ada pengaturan notifikasi.</p>
            </div>
          ) : (
            <div style={{ padding: '1rem' }}>
              {settings.map((setting) => (
                <Card key={setting.id} glass style={{ padding: '1.5rem', marginBottom: '1rem', borderRadius: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <h4 style={{ margin: 0, fontWeight: 700, color: '#1e293b' }}>{setting.name}</h4>
                      <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#64748b' }}>{setting.description}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                        <Mail size={18} color={setting.email_enabled ? '#2563eb' : '#94a3b8'} />
                        <button 
                          onClick={() => toggleSetting(setting.id, 'email_enabled')}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                        >
                          {setting.email_enabled ? <ToggleRight size={24} color="#2563eb" /> : <ToggleLeft size={24} color="#94a3b8" />}
                        </button>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                        <MessageSquare size={18} color={setting.push_enabled ? '#2563eb' : '#94a3b8'} />
                        <button 
                          onClick={() => toggleSetting(setting.id, 'push_enabled')}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                        >
                          {setting.push_enabled ? <ToggleRight size={24} color="#2563eb" /> : <ToggleLeft size={24} color="#94a3b8" />}
                        </button>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                        <Bell size={18} color={setting.in_app_enabled ? '#2563eb' : '#94a3b8'} />
                        <button 
                          onClick={() => toggleSetting(setting.id, 'in_app_enabled')}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                        >
                          {setting.in_app_enabled ? <ToggleRight size={24} color="#2563eb" /> : <ToggleLeft size={24} color="#94a3b8" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationSettingsPage;