import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { getAllLeaves, deleteLeaveRequest, approveLeave, rejectLeave } from '@/features/leave/api/leave.service';
import type { LeaveItem } from '@/features/leave/types/leave.types';
import { AlertCircle, Trash2, Edit3, Plus, Eye, Check, X } from 'lucide-react';
import './LeavePages.css';

const LeaveRequestsPage = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<LeaveItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const loadLeaves = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await getAllLeaves();
      setItems(result.items);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Gagal memuat pengajuan cuti');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      await deleteLeaveRequest(id);
      await loadLeaves();
      setDeleteConfirm(null);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Gagal menghapus pengajuan cuti');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    setLoading(true);
    try {
      await approveLeave(id, { note: 'Approved' });
      await loadLeaves();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Gagal menyetujui pengajuan cuti');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (id: string) => {
    setLoading(true);
    try {
      await rejectLeave(id, { note: 'Rejected' });
      await loadLeaves();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Gagal menolak pengajuan cuti');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadLeaves();
  }, []);

  const getLeaveTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      annual: 'Cuti Tahunan',
      sick: 'Cuti Sakit',
      personal: 'Cuti Pribadi',
      maternity: 'Cuti Melahirkan',
      parental: 'Cuti Orang Tua',
      unpaid: 'Cuti Tanpa Gaji',
    };
    return typeMap[type] || type;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="leave-page">
      {/* Header */}
      <div className="leave-header">
        <div>
          <h1>Pengajuan Cuti</h1>
          <p>Kelola pengajuan cuti Anda dengan mudah</p>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={() => navigate('/leave/requests/create')}
          disabled={loading}
        >
          <Plus size={18} />
          Buat Pengajuan
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Card className="leave-card" glass style={{ marginBottom: '1.5rem' }}>
          <div className="leave-alert leave-alert-error">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        </Card>
      )}

      {/* Statistics Card */}
      <Card className="leave-card" glass style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1.5rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2563eb' }}>
              {items.length}
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>
              Total Pengajuan
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>
              {items.filter((i) => (i as any).status === 'pending').length}
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>
              Menunggu Persetujuan
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
              {items.filter((i) => (i as any).status === 'approved').length}
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>
              Disetujui
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ef4444' }}>
              {items.filter((i) => (i as any).status === 'rejected').length}
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>
              Ditolak
            </div>
          </div>
        </div>
      </Card>

      {/* Leaves Table */}
      <Card className="leave-card" glass>
        <>
          <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem' }}>
            <Button
              variant="outline"
              size="md"
              onClick={() => void loadLeaves()}
              disabled={loading}
            >
              Refresh
            </Button>
          </div>

          {items.length > 0 ? (
            <div className="leave-table-wrap">
              <table className="leave-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Tipe Cuti</th>
                    <th>Dari - Ke</th>
                    <th>Hari</th>
                    <th>Alasan</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => {
                    const leave = item as any;
                    const status = leave.status || 'pending';
                    return (
                      <tr key={String(leave.id ?? idx)}>
                        <td className="leave-table-id">{idx + 1}</td>
                        <td className="leave-table-type">{getLeaveTypeLabel(leave.type)}</td>
                        <td className="leave-table-dates">
                          <div>{formatDate(leave.start_date)}</div>
                          <div className="leave-table-dates-sub">hingga {formatDate(leave.end_date)}</div>
                        </td>
                        <td className="leave-table-days">{leave.total_days} hari</td>
                        <td className="leave-table-reason" title={leave.reason}>
                          {leave.reason ? leave.reason.substring(0, 40) + (leave.reason.length > 40 ? '...' : '') : '-'}
                        </td>
                        <td>
                          <span
                            className={`leave-status-badge leave-status-${status}`}
                          >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/leave/requests/view/${leave.id}`)}
                              disabled={loading}
                              title="Lihat detail"
                            >
                              <Eye size={14} />
                            </Button>
                            {status === 'pending' && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleApprove(String(leave.id))}
                                  disabled={loading}
                                  title="Setujui pengajuan"
                                  style={{ color: '#10b981', borderColor: '#10b981' }}
                                >
                                  <Check size={14} />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleReject(String(leave.id))}
                                  disabled={loading}
                                  title="Tolak pengajuan"
                                  style={{ color: '#ef4444', borderColor: '#ef4444' }}
                                >
                                  <X size={14} />
                                </Button>
                              </>
                            )}
                            {status === 'pending' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/leave/requests/edit/${leave.id}`)}
                                disabled={loading}
                                title="Edit pengajuan"
                              >
                                <Edit3 size={14} />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                if (deleteConfirm === String(leave.id)) {
                                  void handleDelete(String(leave.id));
                                } else {
                                  setDeleteConfirm(String(leave.id));
                                }
                              }}
                              disabled={loading}
                              style={{
                                color: deleteConfirm === String(leave.id) ? '#ef4444' : 'var(--color-text-secondary)',
                              }}
                              title="Hapus pengajuan"
                            >
                              <Trash2 size={14} />
                            </Button>
                            {deleteConfirm === String(leave.id) && (
                              <span style={{ fontSize: '0.8rem', color: '#ef4444', display: 'flex', alignItems: 'center' }}>
                                Hapus?{' '}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setDeleteConfirm(null)}
                                  disabled={loading}
                                  style={{ padding: '0 0.5rem', color: 'var(--color-text-secondary)' }}
                                >
                                  Batal
                                </Button>
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <p style={{ color: 'var(--color-text-disabled)', marginBottom: '1rem' }}>
                Belum ada pengajuan cuti. Buat pengajuan baru untuk memulai.
              </p>
              <Button
                variant="primary"
                size="md"
                onClick={() => navigate('/leave/requests/create')}
              >
                <Plus size={18} />
                Buat Pengajuan Pertama
              </Button>
            </div>
          )}
        </>
      </Card>
    </div>
  );
};

export default LeaveRequestsPage;
