import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, CheckCircle2, XCircle, RefreshCw, Calendar, Search, ArrowLeftRight, History, Shield } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { LoadingState, ErrorState, EmptyState } from '@/shared/ui/DataStateDisplay';
import { workforceService } from '@/features/workforce/api/workforce.service';
import { useAuthStore } from '@/app/store/auth.store';
import { RBACUtils } from '@/shared/hooks/rbac';
import '@/shared/styles/CrudPage.css';
import '@/pages/dashboard/overview/OverviewPage.css';
import { showToast } from '@/shared/ui/toast';
import { ApprovalHistoryModal } from "@/shared/components/ApprovalHistoryModal";

const ShiftSwapsPage: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const canAccess = RBACUtils.hasPermission(user, 'attendance.view_all');
  if (!canAccess) {
    return (
      <div className="crud-page"><Card className="hero-card"><div className="hero-card-inner"><div className="hero-content"><div className="hero-badge"><Shield size={16} /><span>Admin Center</span></div><h1 className="hero-title">Akses Ditolak</h1><p className="hero-subtitle">Anda tidak memiliki izin untuk mengakses halaman ini.</p></div></div></Card></div>
    );
  }
  const navigate = useNavigate();
  const [swaps, setSwaps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState<"Semua" | "Pending" | "Approved" | "Rejected">("Semua");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [historyModal, setHistoryModal] = useState<{ module: string; id: number | string } | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await workforceService.getShiftSwaps();
      const swapsArray = Array.isArray(data?.items) ? data.items : [];
      setSwaps(swapsArray);
    } catch (err: any) {
      console.error(err);
      showToast(err?.response?.data?.message || err?.message || 'Gagal memuat data penukaran shift', 'error');
      setSwaps([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredSwaps = useMemo(() => {
    return swaps.filter((swap: any) => {
      const requester = String(swap?.requester?.full_name || '').toLowerCase();
      const target = String(swap?.target?.full_name || '').toLowerCase();
      const query = searchText.toLowerCase();
      const matchSearch = requester.includes(query) || target.includes(query);

      let statusMatch = true;
      if (activeTab === "Pending") statusMatch = swap.status === 'pending';
      else if (activeTab === "Approved") statusMatch = swap.status === 'approved';
      else if (activeTab === "Rejected") statusMatch = swap.status === 'rejected';

      return matchSearch && statusMatch;
    });
  }, [swaps, searchText, activeTab]);

  const paginatedSwaps = filteredSwaps;

  const [totalPages, setTotalPages] = useState(1);

  const summaryStats = useMemo(() => {
    const total = swaps.length;
    const pending = swaps.filter((s: any) => s.status === 'pending').length;
    const approved = swaps.filter((s: any) => s.status === 'approved').length;
    const rejected = swaps.filter((s: any) => s.status === 'rejected').length;

    return [
      { label: "Total Tukar", subtitle: "Seluruh penukaran", value: total, tone: "blue" as const },
      { label: "Pending", subtitle: "Menunggu persetujuan", value: pending, tone: "orange" as const },
      { label: "Disetujui", subtitle: "Penukaran disetujui", value: approved, tone: "green" as const },
      { label: "Ditolak", subtitle: "Penukaran ditolak", value: rejected, tone: "red" as const },
    ];
  }, [swaps]);

  const handleApprove = async (swap: any) => {
    try {
      if (swap.approval_flow_id) {
        await workforceService.approveShiftSwapFlow(swap.id);
      } else {
        await workforceService.approveShiftSwap(swap.id);
      }
      fetchData();
      showToast('Penukaran shift berhasil disetujui', 'success');
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || 'Gagal menyetujui';
      if (msg.includes('Approval flow') || msg.includes('No approval flow')) {
        showToast('Tidak bisa menyetujui karena belum ada alur persetujuan (approval flow) untuk Shift Swap. Silakan buat di menu Alur Persetujuan terlebih dahulu.', 'error');
      } else {
        showToast(msg, 'error');
      }
      console.error(error);
    }
  };

  const handleReject = async (swap: any) => {
    try {
      await workforceService.rejectShiftSwap(swap.id);
      fetchData();
      showToast('Penukaran shift berhasil ditolak', 'success');
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || 'Gagal menolak';
      showToast(msg, 'error');
      console.error(error);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, activeTab]);

  return (
    <div className="crud-page">
      <Card className="hero-card">
        <div className="hero-card-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <ArrowLeftRight size={16} />
              <span>Workforce</span>
            </div>
            <h1 className="hero-title">Tukar Shift</h1>
            <p className="hero-subtitle">
              Kelola permintaan penukaran jadwal kerja antar karyawan.
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn-outline" onClick={fetchData} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Segarkan
            </button>
            <button className="btn-primary" onClick={() => navigate('/workforce/shift-swaps/create')}>
              <Plus size={16} />
              Request Baru
            </button>
          </div>
        </div>
      </Card>

      <div className="employee-summary-wrapper">
        {summaryStats.map((card: any) => {
          const Icon = card.tone === "blue" ? ArrowLeftRight : card.tone === "green" ? CheckCircle2 : card.tone === "orange" ? Calendar : XCircle;
          return (
            <div key={card.label} className="employee-summary-card">
              <div className="employee-summary-header">
                <div>
                  <p className="employee-summary-label">{card.label}</p>
                  <p className="employee-summary-subtitle">{card.subtitle}</p>
                </div>
                <div className={`employee-summary-icon-wrapper employee-icon-${card.tone}`}>
                  <Icon size={28} />
                </div>
              </div>
              <div className={`employee-summary-value employee-value-${card.tone}`}>{card.value}</div>
              <p className="employee-summary-trend">{card.subtitle}</p>
            </div>
          );
        })}
      </div>

      <Card className="analytics-title-card">
        <div className="analytics-title-inner">
          <div className="analytics-icon">
            <ArrowLeftRight size={24} />
          </div>
          <div>
            <h2 className="analytics-title">Riwayat Penukaran Shift</h2>
            <p className="analytics-subtitle">Kelola dan lihat semua penukaran shift</p>
          </div>
        </div>
      </Card>

      <Card className="control-section-card">
        <div className="control-section-inner">
          <div className="elyra-tabs">
            {["Semua", "Pending", "Approved", "Rejected"].map((tab) => (
              <button
                key={tab}
                className={`elyra-tab ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab as "Semua" | "Pending" | "Approved" | "Rejected")}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="control-actions">
            <div className="search-box">
              <div className="search-icon-inside"><Search size={18} /></div>
              <input
                type="text"
                placeholder="Cari penukaran..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="search-input-pill"
              />
            </div>
          </div>
        </div>
      </Card>

      <div className="table-section">
        <div className="wuw-table-area">
          {loading && <LoadingState message="Memuat penukaran shift..." />}

          {!loading && paginatedSwaps.length === 0 && (
            <div style={{ padding: '5rem 0' }}>
              <EmptyState
                title="Belum Ada Penukaran"
                message={searchText || activeTab !== "Semua"
                  ? "Tidak ada penukaran yang sesuai dengan kriteria Anda."
                  : "Belum ada penukaran shift yang dibuat. Buat request pertama untuk memulai."}
                actionLabel="Request Baru"
                onAction={() => navigate('/workforce/shift-swaps/create')}
              />
            </div>
          )}

          {!loading && paginatedSwaps.length > 0 && (
            <>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '200px' }}>Requester</th>
                      <th style={{ textAlign: 'center' }}></th>
                      <th style={{ width: '200px' }}>Target</th>
                      <th>Tanggal & Shift</th>
                      <th className="th-center">Status</th>
                      <th className="th-center" style={{ width: '140px' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedSwaps.map((swap: any) => {
                      const statusClass = swap.status === 'approved' ? 'status-badge--approved' :
                        swap.status === 'pending' ? 'status-badge--pending' : 'status-badge--draft';
                      const statusLabel = swap.status === 'approved' ? 'Approved' :
                        swap.status === 'pending' ? 'Pending' : 'Rejected';

                      return (
                        <tr key={swap.id}>
                          <td>
                            <div className="cell-name">
                              <div className="cell-avatar">
                                {swap.requester?.full_name ? swap.requester.full_name.charAt(0).toUpperCase() : "R"}
                              </div>
                              <div className="cell-stacked">
                                <span className="cell-name-text">{swap.requester?.full_name || 'N/A'}</span>
                                <span className="cell-stacked__sub">{swap.requester_shift_name}</span>
                              </div>
                            </div>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <ArrowLeftRight size={20} color="#94a3b8" />
                          </td>
                          <td>
                            <div className="cell-name">
                              <div className="cell-avatar">
                                {swap.target?.full_name ? swap.target.full_name.charAt(0).toUpperCase() : "T"}
                              </div>
                              <div className="cell-stacked">
                                <span className="cell-name-text">{swap.target?.full_name || 'N/A'}</span>
                                <span className="cell-stacked__sub">{swap.target_shift_name}</span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Calendar size={16} color="#3b82f6" />
                              {swap.shift_date ? new Date(swap.shift_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' }) : '-'}
                            </div>
                            <div className="cell-email">{swap.shift_name}</div>
                          </td>
                          <td className="td-center">
                            <span className={`status-badge ${statusClass}`}>{statusLabel}</span>
                          </td>
                          <td className="td-center">
                            <div className="action-btn-group">
                              {swap.status === 'pending' && swap.can_act !== false && (
                                <>
                                  <button className="action-btn" style={{ color: '#10b981' }} onClick={() => handleApprove(swap)} title="Setujui"><CheckCircle2 size={16} /></button>
                                  <button className="action-btn" style={{ color: '#ef4444' }} onClick={() => handleReject(swap)} title="Tolak"><XCircle size={16} /></button>
                                </>
                              )}
                              <button className="action-btn" style={{ color: '#8b5cf6', background: '#f5f3ff' }} onClick={() => setHistoryModal({ module: 'shift_swap', id: swap.id })} title="Riwayat Approval"><History size={16} /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="table-pagination">
                <div className="pagination-info">
                  Menampilkan <strong>{paginatedSwaps.length}</strong> dari <strong>{filteredSwaps.length}</strong> penukaran
                </div>
                <div className="pagination-controls">
                  <button
                    className="pagination-btn"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    ‹
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    className="pagination-btn"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    ›
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      {historyModal && (
        <ApprovalHistoryModal
          isOpen={!!historyModal}
          onClose={() => setHistoryModal(null)}
          module={historyModal.module}
          moduleId={historyModal.id}
        />
      )}
    </div>
  );
};

export default ShiftSwapsPage;
