import React, { useState, useEffect, useMemo } from 'react';
import { RefreshCw, Wallet, Search, Filter, Clock, CheckCircle, XCircle, Eye, Trash2, FileText, History } from 'lucide-react';
import { Card, CardHeader, ConfirmDialog } from '@/shared/ui';
import { LoadingState, EmptyState } from '@/shared/ui/DataStateDisplay';
import {
  getAllReimbursements,
  getReimbursementStatistics,
  approveReimbursement,
  rejectReimbursement,
  deleteReimbursement,
} from '@/features/reimbursement/api/reimbursement.service';
import type { ReimbursementItem } from '@/features/reimbursement/types/reimbursement.types';
import '@/shared/styles/CrudPage.css';
import '@/pages/dashboard/overview/OverviewPage.css';
import './AdminReimbursementsPage.css';
import { showToast } from '@/shared/ui/toast';
import { ApprovalHistoryModal } from "@/shared/components/ApprovalHistoryModal";

const formatDateTime = (input: string) => {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return input;
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(date);
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
};

const AdminReimbursementsPage: React.FC = () => {
  const [items, setItems] = useState<ReimbursementItem[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter & Pagination State
  const [activeTab, setActiveTab] = useState<"Semua" | "Draft" | "Submitted" | "Approved" | "Rejected" | "Paid">("Semua");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [historyModal, setHistoryModal] = useState<{ module: string; id: number | string } | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ReimbursementItem | null>(null);
  const [actionNote, setActionNote] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<ReimbursementItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [reimbData, statsData] = await Promise.all([
        getAllReimbursements({}),
        getReimbursementStatistics()
      ]);
      setItems(reimbData.items || []);
      setStats(statsData.payload);
    } catch (error) {
      console.error('Failed to fetch reimbursements:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Filter Logic
  const filteredItems = useMemo(() => {
    return (items || []).filter(item => {
      const searchStr = searchQuery.toLowerCase();
      const titleMatch = (item.title || '').toLowerCase().includes(searchStr);
      const reasonMatch = (item.description || '').toLowerCase().includes(searchStr);
      const empMatch = (item.employee?.user?.name || item.employee_name || '').toLowerCase().includes(searchStr);
      const textMatch = titleMatch || reasonMatch || empMatch;

      let statusMatch = true;
      if (activeTab === "Draft") statusMatch = item.status === 'draft';
      else if (activeTab === "Submitted") statusMatch = item.status === 'submitted';
      else if (activeTab === "Approved") statusMatch = item.status === 'approved';
      else if (activeTab === "Rejected") statusMatch = item.status === 'rejected';
      else if (activeTab === "Paid") statusMatch = item.status === 'paid';

      return textMatch && statusMatch;
    });
  }, [items, searchQuery, activeTab]);

  // Sort by expense date (newest first)
  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      const dateA = new Date(a.expense_date || 0).getTime();
      const dateB = new Date(b.expense_date || 0).getTime();
      return dateB - dateA;
    });
  }, [filteredItems]);

  // Paginate
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedItems.slice(startIndex, startIndex + pageSize);
  }, [sortedItems, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedItems.length / pageSize);

  // Summary Cards
  const summaryCards = useMemo(() => [
    {
      label: "Total Klaim",
      subtitle: "Seluruh klaim imbalan",
      value: String(items.length),
      change: "Data tersimpan",
      tone: "blue" as const,
      icon: Wallet,
    },
    {
      label: "Hasil Filter",
      subtitle: "Klaim sesuai pencarian",
      value: String(sortedItems.length),
      change: `${paginatedItems.length} data per halaman`,
      tone: "green" as const,
      icon: Search,
    },
    {
      label: "Pending",
      subtitle: "Menunggu persetujuan",
      value: String(items.filter(i => i.status === 'submitted').length),
      change: "Perlu ditinjau",
      tone: "orange" as const,
      icon: Clock,
    },
    {
      label: "Disetujui",
      subtitle: "Klaim yang disetujui",
      value: String(items.filter(i => i.status === 'approved').length),
      change: "Siap dibayar",
      tone: "purple" as const,
      icon: CheckCircle,
    },
  ], [items, sortedItems.length, paginatedItems.length]);

  const clearFilters = () => {
    setSearchQuery('');
    setActiveTab("Semua");
    setCurrentPage(1);
  };

  const handleViewDetail = (item: ReimbursementItem) => {
    setSelectedItem(item);
    setShowDetailModal(true);
  };

  const handleApprove = (item: ReimbursementItem) => {
    setSelectedItem(item);
    setActionNote('');
    setShowApproveModal(true);
  };

  const handleReject = (item: ReimbursementItem) => {
    setSelectedItem(item);
    setActionNote('');
    setShowRejectModal(true);
  };

  const confirmApprove = async () => {
    if (!selectedItem) return;
    try {
      await approveReimbursement(String(selectedItem.id), { note: actionNote });
      setShowApproveModal(false);
      fetchData();
    } catch (error: any) {
      console.error('Failed to approve:', error);
      showToast(error?.response?.data?.message || error?.message || 'Gagal menyetujui klaim', 'error');
    }
  };

  const confirmReject = async () => {
    if (!selectedItem || !actionNote.trim()) return;
    try {
      await rejectReimbursement(String(selectedItem.id), { note: actionNote });
      setShowRejectModal(false);
      fetchData();
    } catch (error: any) {
      console.error('Failed to reject:', error);
      showToast(error?.response?.data?.message || error?.message || 'Gagal menolak klaim', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      await deleteReimbursement(String(deleteTarget.id));
      showToast('Klaim reimbursement berhasil dihapus', 'success');
      setDeleteTarget(null);
      fetchData();
    } catch (error: any) {
      console.error('Failed to delete:', error);
      showToast(error?.response?.data?.message || error?.message || 'Gagal menghapus klaim', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; class: string }> = {
      'draft': { label: 'Draft', class: 'badge-soft--gray' },
      'submitted': { label: 'Submitted', class: 'badge-soft--yellow' },
      'approved': { label: 'Approved', class: 'badge-soft--green' },
      'rejected': { label: 'Rejected', class: 'badge-soft--red' },
      'paid': { label: 'Paid', class: 'badge-soft--blue' },
    };
    const info = statusMap[status] || { label: status, class: 'badge-soft--gray' };
    return (
      <span className={`badge-soft ${info.class}`}>
        {info.label}
      </span>
    );
  };

  return (
    <div className="crud-page reimbursement-page">
      {/* Header */}
      <Card className="hero-card">
        <div className="hero-card-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <Wallet size={16} />
              <span>Pusat Admin</span>
            </div>
            <h1 className="hero-title">Pengelolaan Imbalan</h1>
            <p className="hero-subtitle">
              Tinjau, setujui, dan kelola klaim imbalan di seluruh perusahaan.
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn-outline" onClick={fetchData} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Segarkan
            </button>
          </div>
        </div>
      </Card>

      {/* Summary Cards */}
      {stats && (
        <div className="reimb-summary-wrapper">
          {summaryCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="reimb-summary-card">
                <div className="reimb-summary-header">
                  <div>
                    <p className="reimb-summary-label">{card.label}</p>
                    <p className="reimb-summary-subtitle">{card.subtitle}</p>
                  </div>
                  <div className={`reimb-summary-icon-wrapper reimb-icon-${card.tone}`}>
                    <Icon size={28} />
                  </div>
                </div>
                <div className={`reimb-summary-value reimb-value-${card.tone}`}>{card.value}</div>
                <p className="reimb-summary-trend">{card.change}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Analytics Title Card */}
      <Card className="analytics-title-card">
        <div className="analytics-title-inner">
          <div className="analytics-icon">
            <FileText size={24} />
          </div>
          <div>
            <h2 className="analytics-title">Daftar Klaim</h2>
            <p className="analytics-subtitle">Kelola dan tinjau semua klaim imbalan</p>
          </div>
        </div>
      </Card>

      {/* Control Section */}
      <Card className="control-section-card">
        <div className="control-section-inner">
          {/* Tabs */}
          <div className="elyra-tabs">
            {(["Semua", "Draft", "Submitted", "Approved", "Rejected", "Paid"] as const).map((tab) => (
              <button
                key={tab}
                className={`elyra-tab ${activeTab === tab ? "active" : ""}`}
                onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search & Filter */}
          <div className="control-actions">
            <div className="search-box">
              <div className="search-icon-inside"><Search size={18} /></div>
              <input
                type="text"
                placeholder="Cari klaim..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="search-input-pill"
              />
            </div>
            <button
              className={`filter-btn-rounded ${showFilters ? "active" : ""}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={18} />
              <span>Filter</span>
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="filter-dropdown">
            <div className="filter-row">
              {(searchQuery || activeTab !== "Semua") && (
                <button className="btn-clear-filter" onClick={clearFilters}>
                  Hapus Filter
                </button>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* Table Section */}
      <div className="table-section">
        <div className="wuw-table-area">
          {loading && <LoadingState message="Memuat klaim..." />}

          {!loading && paginatedItems.length === 0 && (
            <div style={{ padding: '5rem 0' }}>
              <EmptyState
                title="Pencarian Kosong"
                message="Kami tidak menemukan klaim yang sesuai dengan kriteria Anda."
                actionLabel="Bersihkan Filter"
                onAction={clearFilters}
              />
            </div>
          )}

          {!loading && paginatedItems.length > 0 && (
            <>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '400px' }}>Klaim</th>
                      <th>Kategori</th>
                      <th>Nominal</th>
                      <th>Tanggal</th>
                      <th className="th-center">Status</th>
                      <th className="th-center" style={{ width: '180px' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedItems.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <div className="cell-name">
                            <div className="cell-avatar">
                              {(item.title || 'R').charAt(0).toUpperCase()}
                            </div>
                            <div className="cell-stacked">
                              <span className="cell-name-text">{item.title}</span>
                              <span className="cell-stacked__sub">
                                {item.employee?.user?.name || item.employee_name || 'Unknown'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td><span className="badge-soft badge-soft--blue">{item.category || "-"}</span></td>
                        <td><span style={{ color: '#1e293b', fontWeight: 700 }}>{formatCurrency(item.amount)}</span></td>
                        <td>
                          <div className="cell-stacked">
                            <span className="cell-stacked__main" style={{ fontSize: '0.85rem' }}>{item.expense_date ? formatDateTime(item.expense_date) : "-"}</span>
                            <span className="cell-stacked__sub">Tanggal klaim</span>
                          </div>
                        </td>
                        <td className="td-center">
                          {getStatusBadge(item.status)}
                        </td>
                        <td className="td-center">
                          <div className="action-btn-group">
                            <button
                              className="action-btn action-btn-view"
                              onClick={() => handleViewDetail(item)}
                              title="Lihat Detail"
                            >
                              <Eye size={16} />
                            </button>
                            <button className="action-btn" style={{ color: '#8b5cf6', background: '#f5f3ff' }} onClick={() => setHistoryModal({ module: 'reimbursement', id: item.id })} title="Riwayat Approval"><History size={16} /></button>
                            {item.status === 'submitted' && (
                              <>
                                <button
                                  className="action-btn action-btn-approve"
                                  onClick={() => handleApprove(item)}
                                  title="Setujui"
                                >
                                  <CheckCircle size={16} />
                                </button>
                                <button
                                  className="action-btn action-btn-reject"
                                  onClick={() => handleReject(item)}
                                  title="Tolak"
                                >
                                  <XCircle size={16} />
                                </button>
                              </>
                            )}
                            <button
                              className="action-btn action-btn-delete"
                              onClick={() => setDeleteTarget(item)}
                              title="Hapus"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="table-pagination">
                <div className="pagination-info">
                  Menampilkan <strong>{paginatedItems.length}</strong> dari <strong>{sortedItems.length}</strong> klaim
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

      {/* Detail Modal */}
      {showDetailModal && selectedItem && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Detail Klaim</h3>
              <button className="modal-close" onClick={() => setShowDetailModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <span className="detail-label">Judul</span>
                <span className="detail-value">{selectedItem.title}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Deskripsi</span>
                <span className="detail-value">{selectedItem.description || '-'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Kategori</span>
                <span className="detail-value">{selectedItem.category}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Nominal</span>
                <span className="detail-value" style={{ fontWeight: 700, color: '#1e293b' }}>{formatCurrency(selectedItem.amount)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Tanggal</span>
                <span className="detail-value">{selectedItem.expense_date ? formatDateTime(selectedItem.expense_date) : '-'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Status</span>
                <span className="detail-value">{getStatusBadge(selectedItem.status)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Karyawan</span>
                <span className="detail-value">{selectedItem.employee?.user?.name || selectedItem.employee_name || '-'}</span>
              </div>
              {selectedItem.note && (
                <div className="detail-row">
                  <span className="detail-label">Catatan</span>
                  <span className="detail-value">{selectedItem.note}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Approve Modal */}
      {showApproveModal && selectedItem && (
        <div className="modal-overlay" onClick={() => setShowApproveModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Setujui Klaim</h3>
              <button className="modal-close" onClick={() => setShowApproveModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p>Apakah Anda yakin ingin menyetujui klaim <strong>"{selectedItem.title}"</strong>?</p>
              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label>Catatan (Opsional)</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  placeholder="Tambahkan catatan..."
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-outline" onClick={() => setShowApproveModal(false)}>Batal</button>
              <button className="btn-primary" onClick={confirmApprove}>
                <CheckCircle size={16} style={{ marginRight: '8px' }} />
                Setujui
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedItem && (
        <div className="modal-overlay" onClick={() => setShowRejectModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Tolak Klaim</h3>
              <button className="modal-close" onClick={() => setShowRejectModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p>Apakah Anda yakin ingin menolak klaim <strong>"{selectedItem.title}"</strong>?</p>
              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label>Alasan Penolakan <span style={{ color: '#ef4444' }}>*</span></label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  placeholder="Masukkan alasan penolakan..."
                  required
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-outline" onClick={() => setShowRejectModal(false)}>Batal</button>
              <button className="btn-danger" onClick={confirmReject} disabled={!actionNote.trim()}>
                <XCircle size={16} style={{ marginRight: '8px' }} />
                Tolak
              </button>
            </div>
          </div>
        </div>
      )}

      {historyModal && (
        <ApprovalHistoryModal
          isOpen={!!historyModal}
          onClose={() => setHistoryModal(null)}
          module={historyModal.module}
          moduleId={historyModal.id}
        />
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Hapus Klaim Reimbursement"
        message={`Klaim "${String(deleteTarget?.title || "ini")}" akan dihapus. Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus"
        cancelLabel="Batal"
        loading={deleting}
        onConfirm={() => void handleDelete()}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default AdminReimbursementsPage;
