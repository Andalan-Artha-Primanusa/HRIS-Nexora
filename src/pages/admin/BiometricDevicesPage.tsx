import React, { useState, useEffect } from 'react';
import { Cpu, Plus, Radio, Activity } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { biometricService } from '@/features/biometric/api/biometric.service';

const BiometricDevicesPage: React.FC = () => {
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await biometricService.getDevices();
      setDevices(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await biometricService.syncAttendance();
      alert('Attendance synchronization completed successfully.');
    } catch (err) {
      console.error(err);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="crud-page">
      <div className="crud-header">
        <div>
          <span className="reimb-badge reimb-badge-admin">Hardware Integration</span>
          <h1>Biometric Devices</h1>
          <p>Manage fingerprint/facial recognition scanners and synchronize attendance logs.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="outline" onClick={handleSync} disabled={syncing}>
            <Activity size={18} style={{ marginRight: '8px' }} className={syncing ? 'animate-pulse' : ''} />
            {syncing ? 'Syncing...' : 'Sync Now'}
          </Button>
          <Button variant="primary">
            <Plus size={18} style={{ marginRight: '8px' }} />
            Register Device
          </Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {loading ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem' }}>Loading devices...</div>
        ) : devices.length === 0 ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem' }}>No biometric devices registered.</div>
        ) : devices.map((device) => (
          <Card key={device.id} glass style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                 <div style={{ padding: '10px', background: '#eff6ff', borderRadius: '12px', color: '#2563eb' }}>
                    <Cpu size={24} />
                 </div>
                 <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e3a8a' }}>{device.name}</h3>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>IP: {device.ip_address}</div>
                 </div>
              </div>
              <span style={{ 
                padding: '4px 8px', 
                borderRadius: '20px', 
                background: device.status === 'online' ? '#dcfce7' : '#fee2e2',
                color: device.status === 'online' ? '#166534' : '#ef4444',
                fontSize: '0.7rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Radio size={12} className={device.status === 'online' ? 'animate-pulse' : ''} />
                {device.status?.toUpperCase()}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: '#64748b' }}>Model</span>
                  <span style={{ fontWeight: 600 }}>{device.model || 'ZKTeco F22'}</span>
               </div>
               <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: '#64748b' }}>Last Sync</span>
                  <span style={{ fontWeight: 600 }}>{device.last_sync ? new Date(device.last_sync).toLocaleString() : 'Never'}</span>
               </div>
               <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: '#64748b' }}>Logs Count</span>
                  <span style={{ fontWeight: 600 }}>{device.logs_count || 0} Records</span>
               </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
               <Button variant="outline" style={{ flex: 1 }}>Configure</Button>
               <Button variant="ghost" style={{ color: '#ef4444' }}>Unregister</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BiometricDevicesPage;
