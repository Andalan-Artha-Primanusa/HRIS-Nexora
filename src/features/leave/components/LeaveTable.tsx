import React from 'react';
import { Eye, Check, X, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/shared/ui/Button';

interface LeaveTableProps {
  items: any[];
  onView: (item: any) => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  isAdmin?: boolean;
}

const getLeaveTypeLabel = (type: string) => {
  const typeMap: Record<string, string> = {
    annual: 'Cuti Tahunan',
    sick: 'Cuti Sakit',
    personal: 'Cuti Pribadi',
    maternity: 'Cuti Melahirkan',
    unpaid: 'Cuti Tanpa Gaji',
  };
  return typeMap[type?.toLowerCase()] || type;
};

const formatDate = (date: any) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const LeaveTable: React.FC<LeaveTableProps> = ({ items, onView, onApprove, onReject, onEdit, onDelete, isAdmin }) => {
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Karyawan</th>
            <th>Tipe Cuti</th>
            <th>Periode</th>
            <th>Durasi</th>
            <th>Status</th>
            <th className="th-center">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => {
            const status = String(item.status || 'pending').toLowerCase();
            const empName = item.employee?.full_name || item.employee_name || item.user?.name || `EMP-${item.employee_id}`;
            
            return (
              <tr key={item.id || index}>
                <td>
                  <div className="cell-name">
                    <div className="cell-avatar">{empName.charAt(0).toUpperCase()}</div>
                    <div className="cell-stacked">
                      <span className="cell-name-text">{empName}</span>
                      <span className="cell-stacked__sub">ID: {item.employee_id || item.id}</span>
                    </div>
                  </div>
                </td>
                <td><span className="cell-tag">{getLeaveTypeLabel(item.type)}</span></td>
                <td>
                  <div className="cell-stacked">
                    <span className="cell-stacked__main">{formatDate(item.start_date)}</span>
                    <span className="cell-stacked__sub">s/d {formatDate(item.end_date)}</span>
                  </div>
                </td>
                <td><strong>{item.total_days || 1}</strong> Hari</td>
                <td>
                  <span className={`badge-soft badge-soft--${status === 'approved' ? 'green' : status === 'rejected' ? 'red' : 'orange'}`} style={{ borderRadius: '999px' }}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </span>
                </td>
                <td>
                  <div className="cell-actions">
                    <Button variant="ghost" size="sm" onClick={() => onView(item)} title="Lihat Detail">
                      <Eye size={18} color="#8b5cf6" />
                    </Button>
                    
                    {isAdmin && status === 'pending' && (
                      <>
                        <Button variant="ghost" size="sm" onClick={() => onApprove?.(String(item.id))} title="Setujui">
                          <Check size={18} color="#10b981" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => onReject?.(String(item.id))} title="Tolak">
                          <X size={18} color="#ef4444" />
                        </Button>
                      </>
                    )}

                    {!isAdmin && status === 'pending' && onEdit && (
                       <Button variant="ghost" size="sm" onClick={() => onEdit(String(item.id))} title="Edit">
                         <Pencil size={18} color="#2563eb" />
                       </Button>
                    )}

                    {onDelete && (
                       <Button variant="ghost" size="sm" onClick={() => onDelete(String(item.id))} title="Hapus">
                         <Trash2 size={18} color="#ef4444" />
                       </Button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
