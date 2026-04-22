import React from 'react';
import { X, Calendar, User, FileText, Info, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';

interface LeaveDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: any;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  isAdmin?: boolean;
}

export const LeaveDetailModal: React.FC<LeaveDetailModalProps> = ({ isOpen, onClose, item, onApprove, onReject, isAdmin }) => {
  if (!isOpen || !item) return null;

  const formatDate = (date: any) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
  };

  const status = String(item.status || 'pending').toLowerCase();

  return (
    <div className="modal-overlay">
      <Card className="modal-content" glass style={{ width: '100%', maxWidth: '600px', padding: 0, overflow: 'hidden' }}>
        <div className="modal-header" style={{ padding: '1.5rem', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#f0f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0ea5e9' }}>
              <Calendar size={20} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#1e3a8a' }}>Detail Pengajuan Cuti</h2>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Informasi permohonan izin karyawan</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}><X size={20} /></Button>
        </div>

        <div className="modal-body" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div className="detail-group">
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Pemohon</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                  {String(item.employee?.full_name || 'E').charAt(0)}
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: '#1e293b' }}>{item.employee?.full_name || item.employee_name || 'Unknown'}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.employee?.position || 'Employee'}</div>
                </div>
              </div>
            </div>

            <div className="detail-group">
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Status</label>
              <span className={`badge-soft badge-soft--${status === 'approved' ? 'green' : status === 'rejected' ? 'red' : 'orange'}`} style={{ borderRadius: '999px', padding: '0.25rem 0.75rem' }}>
                {status.toUpperCase()}
              </span>
            </div>
          </div>

          <div style={{ padding: '1.25rem', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Mulai</label>
                <div style={{ fontWeight: 600, color: '#1e293b' }}>{formatDate(item.start_date)}</div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Berakhir</label>
                <div style={{ fontWeight: 600, color: '#1e293b' }}>{formatDate(item.end_date)}</div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Durasi</label>
                <div style={{ fontWeight: 600, color: '#1e293b' }}>{item.total_days || 1} Hari Kerja</div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Jenis Cuti</label>
                <div style={{ fontWeight: 600, color: '#2563eb' }}>{item.type?.toUpperCase()}</div>
              </div>
            </div>
          </div>

          <div className="detail-group">
            <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Alasan / Keperluan</label>
            <div style={{ padding: '1rem', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '0.9rem', color: '#334155', lineHeight: 1.6 }}>
              {item.reason || 'Tidak ada alasan yang disertakan.'}
            </div>
          </div>

          {item.notes && (
            <div className="detail-group" style={{ marginTop: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Catatan Admin</label>
              <div style={{ padding: '0.75rem', background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '12px', fontSize: '0.85rem', color: '#92400e' }}>
                {item.notes}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer" style={{ padding: '1.25rem', borderTop: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', background: 'rgba(255,255,255,0.5)' }}>
          <Button variant="outline" onClick={onClose}>Tutup</Button>
          {isAdmin && status === 'pending' && (
            <>
              <Button variant="outline" style={{ color: '#ef4444', borderColor: '#ef4444' }} onClick={() => onReject?.(String(item.id))}>Tolak</Button>
              <Button variant="primary" onClick={() => onApprove?.(String(item.id))}>Setujui Cuti</Button>
            </>
          )}
        </div>
      </Card>
    </div>
  );
};
