import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { getAllLeaves, deleteLeaveRequest, approveLeave, rejectLeave } from '@/features/leave/api/leave.service';
import type { LeaveItem } from '@/features/leave/types/leave.types';
import { AlertCircle, Trash2, Edit3, Plus, Eye, Check, X, BarChart3, Clock3, CircleCheckBig, CircleX, RefreshCw } from 'lucide-react';
import '@/shared/styles/CrudPage.css';

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
      return date.toLocaleDateString('id-ID', { year: 'numeric', month: '2-digit', day: '2-digit' });
    } catch {
      return dateString;
    }
  };

  const leaveSummaryCards = [
    { label: 'Total Pengajuan', subtitle: 'Semua request cuti yang tercatat', value: items.length, change: 'Seluruh data yang tersedia', tone: 'blue', icon: BarChart3 },
    { label: 'Menunggu Persetujuan', subtitle: 'Request yang perlu ditinjau', value: items.filter((i) => (i as any).status === 'pending').length, change: 'Prioritas approval hari ini', tone: 'orange', icon: Clock3 },
    { label: 'Disetujui', subtitle: 'Pengajuan yang sudah lolos', value: items.filter((i) => (i as any).status === 'approved').length, change: 'Status final yang selesai', tone: 'green', icon: CircleCheckBig },
    { label: 'Ditolak', subtitle: 'Request yang tidak disetujui', value: items.filter((i) => (i as any).status === 'rejected').length, change: 'Perlu revisi atau tindak lanjut', tone: 'red', icon: CircleX },
  ];

  return (
    <div className="crud-page">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-badge">Leave Center</span>
          <h1>Pengajuan Cuti</h1>
          <p>Kelola pengajuan cuti dengan tampilan yang rapi, konsisten, dan mudah dipindai.</p>
        </div>
        <div className="page-header-actions">
          <Button variant="primary" size="md" onClick={() => navigate('/leave/requests/create')} disabled={loading}>
            <Plus size={16} />
            Buat Pengajuan
          </Button>
          <Button variant="outline" size="md" onClick={() => void loadLeaves()} disabled={loading} style={{ borderColor: "#2563eb", color: "#2563eb" }}>
            <RefreshCw size={16} />
            Segarkan
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-grid">
        {leaveSummaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} className="summary-card" glass>
              <div className="summary-card__header">
                <div>
                  <span className="summary-card__label">{card.label}</span>
                  <p className="summary-card__subtitle">{card.subtitle}</p>
                </div>
                <span className={`summary-card__icon summary-card__icon--${card.tone}`}>
                  <Icon size={20} />
                </span>
              </div>
              <div className={`summary-card__value summary-card__value--${card.tone}`}>{card.value}</div>
              <div className="summary-card__change">{card.change}</div>
            </Card>
          );
        })}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="page-alert page-alert--error">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Table */}
      <Card className="table-card" glass>
        <div className="table-header-bar">
          <h3>Data Pengajuan Cuti</h3>
          <span className="table-count">{items.length} pengajuan</span>
        </div>

        {items.length > 0 ? (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Tipe Cuti</th>
                  <th>Dari - Ke</th>
                  <th>Hari</th>
                  <th>Alasan</th>
                  <th>Status</th>
                  <th className="th-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => {
                  const leave = item as any;
                  const status = leave.status || 'pending';
                  return (
                    <tr key={String(leave.id ?? idx)}>
                      <td>
                        <div className="cell-id">{idx + 1}</div>
                        <div className="cell-sub">ID: {leave.id}</div>
                      </td>
                      <td><span className="cell-tag">{getLeaveTypeLabel(leave.type)}</span></td>
                      <td>
                        <div className="cell-date">{formatDate(leave.start_date)}</div>
                        <div className="cell-date-sub">hingga {formatDate(leave.end_date)}</div>
                      </td>
                      <td><strong>{leave.total_days}</strong> hari</td>
                      <td className="leave-table-reason" title={leave.reason}>
                        {leave.reason ? leave.reason.substring(0, 40) + (leave.reason.length > 40 ? '...' : '') : '-'}
                      </td>
                      <td>
                        <span className={`status-badge status-badge--${status}`}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                      </td>
                      <td>
                        <div className="cell-actions">
                          <Button variant="outline" size="sm" onClick={() => navigate(`/leave/requests/view/${leave.id}`)} disabled={loading} title="Lihat detail">
                            <Eye size={14} />
                          </Button>
                          {status === 'pending' && (
                            <>
                              <Button variant="outline" size="sm" onClick={() => handleApprove(String(leave.id))} disabled={loading} title="Setujui" style={{ color: '#10b981', borderColor: '#10b981' }}>
                                <Check size={14} />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => handleReject(String(leave.id))} disabled={loading} title="Tolak" style={{ color: '#ef4444', borderColor: '#ef4444' }}>
                                <X size={14} />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => navigate(`/leave/requests/edit/${leave.id}`)} disabled={loading} title="Edit">
                                <Edit3 size={14} />
                              </Button>
                            </>
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
                            style={{ color: deleteConfirm === String(leave.id) ? '#ef4444' : undefined }}
                            title="Hapus"
                          >
                            <Trash2 size={14} />
                          </Button>
                          {deleteConfirm === String(leave.id) && (
                            <span style={{ fontSize: '0.8rem', color: '#ef4444', display: 'flex', alignItems: 'center' }}>
                              Hapus?{' '}
                              <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(null)} disabled={loading} style={{ padding: '0 0.5rem' }}>
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
          <div className="table-card-inner">
            <div className="empty-state">
              <p>Belum ada pengajuan cuti. Buat pengajuan baru untuk memulai.</p>
              <Button variant="primary" size="md" onClick={() => navigate('/leave/requests/create')}>
                <Plus size={18} />
                Buat Pengajuan Pertama
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default LeaveRequestsPage;
