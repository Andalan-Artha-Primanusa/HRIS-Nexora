import React from 'react';
import { X, Clock, MapPin, Calendar } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';

interface AttendanceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: any;
}

export const AttendanceDetailModal: React.FC<AttendanceDetailModalProps> = ({ isOpen, onClose, item }) => {
  if (!isOpen || !item) return null;

  const formatDate = (date: any) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
  };

  const formatTime = (time: any) => {
    if (!time) return '--:--';
    return new Date(time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="modal-overlay">
      <Card className="modal-content" glass style={{ width: '100%', maxWidth: '600px', padding: 0, overflow: 'hidden' }}>
        <div className="modal-header" style={{ padding: '1.5rem', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
              <Clock size={20} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#1e3a8a' }}>Detail Kehadiran</h2>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Informasi lengkap log masuk/pulang</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}><X size={20} /></Button>
        </div>

        <div className="modal-body" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="detail-group">
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Karyawan</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700 }}>
                  {String(item.employee?.full_name || 'E').charAt(0)}
                </div>
                <div>
                   <div style={{ fontWeight: 600, color: '#1e293b' }}>{item.employee?.full_name || item.employee_name || 'Unknown'}</div>
                   <div style={{ fontSize: '0.75rem', color: '#64748b' }}>ID: {item.employee_id}</div>
                </div>
              </div>
            </div>

            <div className="detail-group">
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Tanggal</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: '#1e293b' }}>
                <Calendar size={16} color="#64748b" />
                {formatDate(item.date || item.created_at)}
              </div>
            </div>

            <div className="detail-group" style={{ background: '#f0fdf4', padding: '1rem', borderRadius: '12px' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#166534', fontWeight: 700, marginBottom: '0.5rem' }}>Check In</label>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#166534' }}>{formatTime(item.check_in || item.clock_in)}</div>
              {item.lat_in && (
                <div style={{ fontSize: '0.75rem', color: '#15803d', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={12} /> {item.lat_in}, {item.long_in}
                </div>
              )}
            </div>

            <div className="detail-group" style={{ background: '#fef2f2', padding: '1rem', borderRadius: '12px' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#991b1b', fontWeight: 700, marginBottom: '0.5rem' }}>Check Out</label>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#991b1b' }}>{formatTime(item.check_out || item.clock_out)}</div>
              {item.lat_out && (
                <div style={{ fontSize: '0.75rem', color: '#b91c1c', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={12} /> {item.lat_out}, {item.long_out}
                </div>
              )}
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
             <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', fontWeight: 700, marginBottom: '0.5rem' }}>Metadata & Status</label>
             <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ fontSize: '0.85rem', color: '#334155' }}><strong>Status:</strong> {item.status || 'Success'}</div>
                <div style={{ fontSize: '0.85rem', color: '#334155' }}><strong>Device:</strong> {item.device_id || 'Mobile App'}</div>
                <div style={{ fontSize: '0.85rem', color: '#334155' }}><strong>Source:</strong> GPS/Biometric</div>
             </div>
          </div>
        </div>

        <div className="modal-footer" style={{ padding: '1.25rem', borderTop: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'flex-end', background: 'rgba(255,255,255,0.5)' }}>
          <Button variant="outline" onClick={onClose}>Tutup</Button>
        </div>
      </Card>
    </div>
  );
};
