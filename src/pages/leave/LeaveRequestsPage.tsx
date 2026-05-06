import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader } from '@/shared/ui';
import { LoadingState, EmptyState } from "@/shared/ui/DataStateDisplay";
import { getAllLeaves, deleteLeaveRequest, approveLeave, rejectLeave } from '@/features/leave/api/leave.service';
import type { LeaveItem } from '@/features/leave/types/leave.types';
import { LeaveSummary } from '@/features/leave/components/LeaveSummary';
import { LeaveTable } from '@/features/leave/components/LeaveTable';
import { LeaveDetailModal } from '@/features/leave/components/LeaveDetailModal';
import { Plus, RefreshCw, Search, Calendar } from 'lucide-react';
import { showToast } from '@/shared/ui/toast';
import { useAuthStore } from '@/app/store/auth.store';
import '@/shared/styles/CrudPage.css';
import '@/pages/dashboard/overview/OverviewPage.css';
import './LeaveShared.css';

const LeaveRequestsPage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user) as any;
  const isAdmin = user?.roles?.some((r: any) => ['super_admin', 'admin', 'hr', 'manager'].includes(r.name?.toLowerCase())) || false;
  
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
      {/* Header - Same style as Dashboard */}
      <Card className="hero-card">
        <div className="hero-card-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <Calendar size={16} />
              <span>Pusat Cuti</span>
            </div>
            <h1 className="hero-title">Manajemen Pengajuan Cuti</h1>
            <p className="hero-subtitle">Kelola permohonan izin dan cuti karyawan dalam satu dashboard terpadu.</p>
          </div>
          <div className="hero-actions">
            <button className="btn-outline" onClick={() => void loadLeaves()}>
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Segarkan
            </button>
            <button className="btn-primary" onClick={() => navigate('/leave/requests/create')}>
              <Plus size={16} />
              Buat Request
            </button>
          </div>
        </div>
      </Card>

      <LeaveSummary stats={stats} />

      {/* Analytics Title Card */}
      <Card className="analytics-title-card">
        <div className="analytics-title-inner">
          <div className="analytics-icon">
            <Calendar size={24} />
          </div>
          <div>
            <h2 className="analytics-title">Daftar Pengajuan Cuti</h2>
            <p className="analytics-subtitle">Kelola semua pengajuan cuti karyawan</p>
          </div>
        </div>
      </Card>

      {/* Control Section */}
      <Card className="control-section-card">
        <div className="control-section-inner">
          <div className="control-actions">
            <div className="search-box">
              <div className="search-icon-inside"><Search size={18} /></div>
              <input
                type="text"
                placeholder="Cari nama atau ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input-pill"
              />
            </div>
          </div>
          <select 
            className="control-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">Semua Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </Card>

      {/* Table Section */}
      <div className="table-section">
        <div className="table-wrap">
          {loading && items.length === 0 ? (
            <LoadingState message="Memuat data cuti..." />
          ) : filteredItems.length === 0 ? (
            <div className="empty-state">
              <EmptyState title="Tidak ada pengajuan" message="Tidak ada data pengajuan cuti yang sesuai." />
            </div>
          ) : (
            <LeaveTable 
              items={filteredItems} 
              onView={handleOpenDetail}
              onApprove={handleApprove}
              onReject={handleReject}
              onEdit={(id) => navigate(`/leave/requests/edit/${id}`)}
              onDelete={handleDelete}
              isAdmin={isAdmin}
            />
          )}
        </div>
      </div>

      <LeaveDetailModal 
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        item={selectedDetail}
        onApprove={handleApprove}
        onReject={handleReject}
        isAdmin={isAdmin}
      />
    </div>
  );
};

export default LeaveRequestsPage;

