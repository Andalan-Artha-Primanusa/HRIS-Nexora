import React, { useState, useEffect } from 'react';
import { RefreshCw, Bell, Mail, MessageSquare, Smartphone, CheckCircle, XCircle, Clock, Settings, ShieldCheck, UserCheck } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { showToast } from '@/shared/ui/toast';
import { api } from '@/shared/api/httpClient';
import '@/shared/styles/CrudPage.css';
import '@/pages/dashboard/overview/OverviewPage.css';
import '@/pages/payroll/PayrollShared.css';
import './NotificationSettingsPage.css';

interface NotificationSetting {
  id: number;
  category: string;
  label: string;
  description: string;
  email: boolean;
  push: boolean;
  in_app: boolean;
  // Kita tambahkan ini untuk filtering UI jika diperlukan
  group?: 'leave' | 'payroll' | 'announcement' | 'system' | 'approval';
}

const NotificationSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<NotificationSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [_saving, setSaving] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const defaultSettings: NotificationSetting[] = [
    {
      id: 1,
      category: 'Absensi',
      label: 'Kehadiran & Absensi',
      description: 'Notifikasi saat karyawan melakukan check-in, check-out, atau terlambat.',
      in_app: true,
      email: true,
      push: true,
      group: 'system'
    },
    {
      id: 2,
      category: 'Payroll',
      label: 'Penggajian & Slip Gaji',
      description: 'Notifikasi saat payroll diproses, slip gaji tersedia, atau ada revisi gaji.',
      in_app: true,
      email: true,
      push: false,
      group: 'payroll'
    },
    {
      id: 3,
      category: 'Cuti',
      label: 'Manajemen Cuti',
      description: 'Notifikasi pengajuan cuti baru, persetujuan, atau penolakan cuti.',
      in_app: true,
      email: true,
      push: true,
      group: 'leave'
    }
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

  const toggleChannel = async (category: string, channel: 'email' | 'push' | 'in_app') => {
    const setting = settings.find(s => s.category === category);
    if (!setting) return;

    const currentValue = setting[channel];

    // Update optimistik di UI
    setSettings(prev => prev.map(s => 
      s.category === category 
        ? { ...s, [channel]: !currentValue }
        : s
    ));

    try {
      await api.put(`/notification-settings/${category}`, {
        channel,
        enabled: !currentValue
      });
    } catch (err) {
      console.error(err);
      // Revert jika gagal
      setSettings(prev => prev.map(s => 
        s.category === category 
          ? { ...s, [channel]: currentValue }
          : s
      ));
    }
  };

  const _handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/notification-settings', { settings });
      showToast('Pengaturan notifikasi berhasil disimpan!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Gagal menyimpan pengaturan', 'error');
    } finally {
      setSaving(false);
    }
  };

  const filteredSettings = activeCategory === 'all' 
    ? settings 
    : settings.filter(s => s.group === activeCategory || s.category.toLowerCase().includes(activeCategory.toLowerCase()));

  const categories = [
    { key: 'all', label: 'All', icon: Bell },
    { key: 'leave', label: 'Leave', icon: Clock },
    { key: 'payroll', label: 'Payroll', icon: CheckCircle },
    { key: 'approval', label: 'Approvals', icon: UserCheck },
    { key: 'announcement', label: 'Announcements', icon: MessageSquare },
    { key: 'system', label: 'System', icon: ShieldCheck },
  ];

  const emailEnabledCount = settings.reduce((acc, s) => acc + (s.email ? 1 : 0), 0);
  const pushEnabledCount = settings.reduce((acc, s) => acc + (s.push ? 1 : 0), 0);
  const appEnabledCount = settings.reduce((acc, s) => acc + (s.in_app ? 1 : 0), 0);

  const summaryCards = [
    {
      label: "Total Triggers",
      subtitle: "Kategori Notifikasi",
      value: String(settings.length),
      change: "Pemicu Aktif",
      tone: "blue" as const,
      icon: Bell,
    },
    {
      label: "Email Channel",
      subtitle: "Via SMTP Service",
      value: String(emailEnabledCount),
      change: "Email Terdaftar",
      tone: "green" as const,
      icon: Mail,
    },
    {
      label: "Push Notification",
      subtitle: "Browser & Mobile",
      value: String(pushEnabledCount),
      change: "Real-time Alerts",
      tone: "orange" as const,
      icon: Smartphone,
    },
    {
      label: "In-App Feed",
      subtitle: "Dashboard Bell",
      value: String(appEnabledCount),
      change: "Internal Feed",
      tone: "purple" as const,
      icon: CheckCircle,
    },
  ];

  return (
    <div className="crud-page training-page notification-page">
      {/* Header */}
      <Card className="hero-card">
        <div className="hero-card-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <ShieldCheck size={16} />
              <span>System Security</span>
            </div>
            <h1 className="hero-title">Pengaturan Notifikasi</h1>
            <p className="hero-subtitle">
              Konfigurasikan bagaimana sistem mengirimkan pemberitahuan untuk setiap aktivitas bisnis di HRIS.
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn-outline" onClick={fetchData} disabled={loading} style={{ background: 'white' }}>
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              {loading ? 'Memuat...' : 'Segarkan'}
            </button>
          </div>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="training-summary-wrapper">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="training-summary-card">
              <div className="training-summary-header">
                <div>
                  <p className="training-summary-label">{card.label}</p>
                  <p className="training-summary-subtitle">{card.subtitle}</p>
                </div>
                <div className={`training-summary-icon-wrapper training-icon-${card.tone}`}>
                  <Icon size={28} />
                </div>
              </div>
              <div className={`training-summary-value training-value-${card.tone}`}>{card.value}</div>
              <p className="training-summary-trend">{card.change}</p>
            </div>
          );
        })}
      </div>

      {/* Analytics Title Card */}
      <Card className="analytics-title-card">
        <div className="analytics-title-inner">
          <div className="analytics-icon">
            <Settings size={24} />
          </div>
          <div>
            <h2 className="analytics-title">Konfigurasi Channel</h2>
            <p className="analytics-subtitle">Aktifkan atau matikan saluran komunikasi per kategori</p>
          </div>
        </div>
      </Card>

      {/* Control Section */}
      <Card className="control-section-card">
        <div className="control-section-inner">
          <div className="elyra-tabs">
            {categories.map((cat) => (
              <button
                key={cat.key}
                className={`elyra-tab ${activeCategory === cat.key ? "active" : ""}`}
                onClick={() => setActiveCategory(cat.key)}
              >
                <cat.icon size={16} style={{ marginRight: '8px' }} />
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Table Section */}
      <div className="table-section">
        <div className="wuw-table-area">
          {loading ? (
            <div className="settings-loading-state" style={{ padding: '5rem 0' }}>
              <RefreshCw size={48} className="animate-spin" color="#2563eb" />
              <p style={{ marginTop: '1rem', color: '#64748b' }}>Sinkronisasi preferensi...</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: '400px' }}>Tipe Notifikasi</th>
                    <th className="th-center" style={{ width: '150px' }}>Email</th>
                    <th className="th-center" style={{ width: '150px' }}>Push</th>
                    <th className="th-center" style={{ width: '150px' }}>In-App</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSettings.map((setting) => (
                    <tr key={setting.category}>
                      <td>
                        <div className="cell-name">
                          <div className="cell-avatar">
                            <Bell size={18} />
                          </div>
                          <div className="cell-stacked">
                            <span className="cell-name-text">{setting.label}</span>
                            <span className="cell-stacked__sub">{setting.description}</span>
                          </div>
                        </div>
                      </td>
                      <td className="td-center">
                        <button
                          className={`channel-pill-toggle ${setting.email ? 'enabled' : ''}`}
                          onClick={() => toggleChannel(setting.category, 'email')}
                        >
                          {setting.email ? <CheckCircle size={18} /> : <XCircle size={18} />}
                          <span className="channel-pill-label">Email</span>
                        </button>
                      </td>
                      <td className="td-center">
                        <button
                          className={`channel-pill-toggle ${setting.push ? 'enabled' : ''}`}
                          onClick={() => toggleChannel(setting.category, 'push')}
                        >
                          {setting.push ? <CheckCircle size={18} /> : <XCircle size={18} />}
                          <span className="channel-pill-label">Push</span>
                        </button>
                      </td>
                      <td className="td-center">
                        <button
                          className={`channel-pill-toggle ${setting.in_app ? 'enabled' : ''}`}
                          onClick={() => toggleChannel(setting.category, 'in_app')}
                        >
                          {setting.in_app ? <CheckCircle size={18} /> : <XCircle size={18} />}
                          <span className="channel-pill-label">App</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationSettingsPage;