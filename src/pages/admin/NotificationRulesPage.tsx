import React from 'react';
import { Bell, Plus, Settings, Clock, Zap, Shield } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { useAuthStore } from '@/app/store/auth.store';
import { RBACUtils } from '@/shared/hooks/rbac';

const NotificationRulesPage: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const canAccess = RBACUtils.hasPermission(user, 'admin.email.manage');
  if (!canAccess) {
    return (
      <div className="crud-page"><Card className="hero-card"><div className="hero-card-inner"><div className="hero-content"><div className="hero-badge"><Shield size={16} /><span>Admin Center</span></div><h1 className="hero-title">Akses Ditolak</h1><p className="hero-subtitle">Anda tidak memiliki izin untuk mengakses halaman ini.</p></div></div></Card></div>
    );
  }
  return (
    <div className="crud-page">
      <div className="crud-header">
        <div>
          <span className="reimb-badge reimb-badge-admin">Enterprise Ops</span>
          <h1>Automated Notification Rules</h1>
          <p>Define triggers and schedules for system-wide email and push notifications.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="primary">
            <Plus size={18} style={{ marginRight: '8px' }} />
            New Rule
          </Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        {[
          { name: 'Document Expiry Alert', trigger: 'Document expires in 30 days', channel: 'Email', icon: <Clock /> },
          { name: 'Probation End Reminder', trigger: 'Probation ends in 14 days', channel: 'Manager Push', icon: <Bell /> },
          { name: 'Birthday Wishes', trigger: 'Employee Birthday', channel: 'General Channel', icon: <Zap /> },
        ].map((rule, i) => (
          <Card key={i} glass style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                 <div style={{ padding: '10px', background: '#eff6ff', borderRadius: '12px', color: '#2563eb' }}>
                    {rule.icon}
                 </div>
                 <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e3a8a' }}>{rule.name}</h3>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Channel: {rule.channel}</div>
                 </div>
              </div>
              <div className="status-pill status-approved">Active</div>
            </div>

            <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem' }}>
               <strong>Trigger:</strong> {rule.trigger}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
               <Button variant="outline" style={{ flex: 1 }}>Edit Logic</Button>
               <Button variant="ghost"><Settings size={18} /></Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default NotificationRulesPage;
