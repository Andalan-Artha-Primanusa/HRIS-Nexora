import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { LoadingState, EmptyState } from "@/shared/ui/DataStateDisplay";
import { getAllLeaves, deleteLeaveRequest, approveLeave, rejectLeave } from '@/features/leave/api/leave.service';
import type { LeaveItem } from '@/features/leave/types/leave.types';
import { LeaveSummary } from '@/features/leave/components/LeaveSummary';
import { LeaveTable } from '@/features/leave/components/LeaveTable';
import { LeaveDetailModal } from '@/features/leave/components/LeaveDetailModal';
import { Plus, RefreshCw, Search, Filter } from 'lucide-react';
import { showToast } from '@/shared/ui/toast';
import '@/shared/styles/CrudPage.css';

const LeaveRequestsPage = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<LeaveItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [selectedDetail, setSelectedDetail] = useState<any | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const loadLeaves = async () => {
    setLoading(true);
    try {
      const result = await getAllLeaves();
      setItems(result.items);
    } catch (err: any) {
      showToast(err.message || 'Gagal memuat pengajuan cuti', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    setLoading(true);
    try {
      await approveLeave(id, { note: 'Approved via Management' });
      showToast('Pengajuan cuti disetujui', 'success');
      await loadLeaves();
      setIsDetailModalOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Gagal menyetujui', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (id: string) => {
    const reason = window.prompt("Berikan alasan penolakan:");
    if (reason === null) return;
    setLoading(true);
    try {
      await rejectLeave(id, { note: reason || 'Rejected via Management' });
      showToast('Pengajuan cuti ditolak', 'success');
      await loadLeaves();
      setIsDetailModalOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Gagal menolak', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus pengajuan ini?")) return;
    setLoading(true);
    try {
      await deleteLeaveRequest(id);
      showToast('Pengajuan berhasil dihapus', 'success');
      await loadLeaves();
    } catch (err: any) {
      showToast(err.message || 'Gagal menghapus', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetail = (item: any) => {
    setSelectedDetail(item);
    setIsDetailModalOpen(true);
  };

  useEffect(() => {
    void loadLeaves();
  }, []);

  const stats = useMemo(() => {
    const total = items.length;
    const pending = items.filter(i => String((i as any).status || '').toLowerCase() === 'pending').length;
    const approved = items.filter(i => String((i as any).status || '').toLowerCase() === 'approved').length;
    const rejected = items.filter(i => String((i as any).status || '').toLowerCase() === 'rejected').length;
    return { total, pending, approved, rejected };
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item: any) => {
      const q = searchQuery.toLowerCase();
      const name = String(item.employee?.full_name || item.employee_name || item.user?.name || '').toLowerCase();
      const id = String(item.employee_id || item.id || '').toLowerCase();
      const status = String((item as any).status || '').toLowerCase();

      const matchesSearch = name.includes(q) || id.includes(q);
      const matchesStatus = !filterStatus || status === filterStatus.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [items, searchQuery, filterStatus]);

  return (
    <div className="crud-page">
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-badge">Leave Admin</span>
          <h1>Manajemen Pengajuan Cuti</h1>
          <p>Kelola permohonan izin dan cuti karyawan dalam satu dashboard terpadu.</p>
        </div>
        <div className="page-header-actions">
          <Button variant="outline" size="md" onClick={() => void loadLeaves()} disabled={loading} style={{ borderColor: "#2563eb", color: "#2563eb" }}>
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            {loading ? "Memuat..." : "Segarkan"}
          </Button>
          <Button variant="primary" size="md" onClick={() => navigate('/leave/requests/create')}>
            <Plus size={16} />
            Buat Request
          </Button>
        </div>
      </div>

      <LeaveSummary stats={stats} />

      <Card className="table-card" glass>
        <div className="table-header-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '300px' }}>
            <div className="search-box" style={{ flex: 1 }}>
              <Search size={18} />
              <input
                type="text"
                placeholder="Cari nama atau ID karyawan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Filter size={18} color="#64748b" />
              <select 
                className="form-control" 
                style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">Semua Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
          <span className="table-count" style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Menampilkan <strong>{filteredItems.length}</strong> pengajuan
          </span>
        </div>

        {loading && items.length === 0 ? (
          <div className="table-card-inner"><LoadingState message="Memuat data cuti..." /></div>
        ) : filteredItems.length === 0 ? (
          <div className="table-card-inner">
            <EmptyState
              icon=""
              title="Tidak ada pengajuan"
              message="Tidak ada data pengajuan cuti yang sesuai."
            />
          </div>
        ) : (
          <LeaveTable 
            items={filteredItems} 
            onView={handleOpenDetail}
            onApprove={handleApprove}
            onReject={handleReject}
            onEdit={(id) => navigate(`/leave/requests/edit/${id}`)}
            onDelete={handleDelete}
            isAdmin={true}
          />
        )}
      </Card>

      <LeaveDetailModal 
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        item={selectedDetail}
        onApprove={handleApprove}
        onReject={handleReject}
        isAdmin={true}
      />
    </div>
  );
};

export default LeaveRequestsPage;

