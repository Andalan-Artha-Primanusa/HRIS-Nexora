import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, RefreshCw, Package, Search, Filter, Laptop, Monitor, Smartphone, Briefcase, User, Trash2, Pencil, CheckCircle2, X, ArrowDownToLine, ArrowUpFromLine, Handshake, Box, CheckCircle, XCircle, History } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { LoadingState, EmptyState } from '@/shared/ui/DataStateDisplay';
import { assetService } from '@/features/assets/api/asset.service';
import { AssignAssetModal } from '@/features/assets/components/AssignAssetModal';
import { ReturnAssetModal } from '@/features/assets/components/ReturnAssetModal';
import { api } from '@/shared/api/httpClient';
import '@/shared/styles/CrudPage.css';
import '@/pages/dashboard/overview/OverviewPage.css';
import '@/pages/employee/EmployeesPage.css';
import './AssetInventoryPage.css';
import './AssetAssignmentsPage.css';
import { showToast } from '@/shared/ui/toast';
import { ApprovalHistoryModal } from "@/shared/components/ApprovalHistoryModal";

const formatDateTime = (input: string) => {
  if (!input) return 'N/A';
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return input;
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(date);
};

const getAssetIcon = (category: string) => {
  const c = category?.toLowerCase() || '';
  if (c.includes('laptop') || c.includes('macbook') || c.includes('electronics')) return Laptop;
  if (c.includes('mobile') || c.includes('phone') || c.includes('smartphone')) return Smartphone;
  if (c.includes('monitor') || c.includes('display')) return Monitor;
  return Briefcase;
};

const TABS = ['Daftar Aset', 'Penugasan'] as const;
type Tab = (typeof TABS)[number];

const InventoryTab: React.FC<{ loading: boolean; assets: any[] }> = ({ loading, assets }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'Semua' | 'Available' | 'Assigned' | 'Maintenance' | 'Retired'>('Semua');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [assignModal, setAssignModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [assignmentNote, setAssignmentNote] = useState('');
  const [assigningLoading, setAssigningLoading] = useState(false);
  const [returnModal, setReturnModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [returnNote, setReturnNote] = useState('');
  const [returningLoading, setReturningLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await api.get('/employees');
        let list = res?.data?.data?.data || res?.data?.data || res?.data || [];
        if (!Array.isArray(list)) list = [];
        setEmployees(list);
      } catch (error) {
        console.error('Failed to fetch employees:', error);
      }
    };
    fetchEmployees();
  }, []);

  const openAssignModal = (asset: any) => {
    setSelectedAsset(asset);
    setSelectedEmployee('');
    setAssignmentNote('');
    setAssignModal(true);
  };

  const closeAssignModal = () => {
    setAssignModal(false);
    setSelectedAsset(null);
    setSelectedEmployee('');
    setAssignmentNote('');
  };

  const handleAssign = async () => {
    if (!selectedAsset || !selectedEmployee) return;
    setAssigningLoading(true);
    try {
      await assetService.assignAsset(selectedAsset.id, {
        employee_id: selectedEmployee,
        assignment_note: assignmentNote,
      });
      closeAssignModal();
    } catch (error: any) {
      console.error('Failed to assign asset:', error);
      showToast(error?.response?.data?.message || error?.message || 'Gagal menugaskan aset', 'error');
    } finally {
      setAssigningLoading(false);
    }
  };

  const openReturnModal = (asset: any) => {
    const currentAssignment = asset.assignments?.find((a: any) => a.status === 'assigned');
    setSelectedAssignment(currentAssignment);
    setReturnNote('');
    setReturnModal(true);
  };

  const closeReturnModal = () => {
    setReturnModal(false);
    setSelectedAssignment(null);
    setReturnNote('');
  };

  const handleReturn = async () => {
    if (!selectedAssignment) return;
    setReturningLoading(true);
    try {
      await assetService.returnAsset(selectedAssignment.id, {
        return_note: returnNote,
        condition: 'good',
      });
      closeReturnModal();
    } catch (error: any) {
      console.error('Failed to return asset:', error);
      showToast(error?.response?.data?.message || error?.message || 'Gagal mengembalikan aset', 'error');
    } finally {
      setReturningLoading(false);
    }
  };

  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      const searchStr = searchQuery.toLowerCase();
      const nameMatch = asset.name?.toLowerCase().includes(searchStr);
      const codeMatch = asset.code?.toLowerCase().includes(searchStr);
      const serialMatch = asset.serial_number?.toLowerCase().includes(searchStr);
      const brandMatch = asset.brand?.toLowerCase().includes(searchStr);
      const textMatch = nameMatch || codeMatch || serialMatch || brandMatch;

      let statusMatch = true;
      if (activeTab === 'Available') statusMatch = asset.status?.toLowerCase() === 'available';
      else if (activeTab === 'Assigned') statusMatch = asset.status?.toLowerCase() === 'assigned';
      else if (activeTab === 'Maintenance') statusMatch = asset.status?.toLowerCase() === 'maintenance';
      else if (activeTab === 'Retired') statusMatch = asset.status?.toLowerCase() === 'retired';

      return textMatch && statusMatch;
    });
  }, [assets, searchQuery, activeTab]);

  const sortedAssets = useMemo(() => {
    return [...filteredAssets].sort((a, b) => {
      const dateA = new Date(a.purchase_date || 0).getTime();
      const dateB = new Date(b.purchase_date || 0).getTime();
      return dateB - dateA;
    });
  }, [filteredAssets]);

  const paginatedAssets = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedAssets.slice(startIndex, startIndex + pageSize);
  }, [sortedAssets, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedAssets.length / pageSize);

  const summaryCards = useMemo(() => [
    { label: 'Total Aset', subtitle: 'Seluruh aset perusahaan', value: String(assets.length), change: 'Data aset tersimpan', tone: 'blue' as const, icon: Package },
    { label: 'Hasil Filter', subtitle: 'Aset sesuai pencarian', value: String(sortedAssets.length), change: `${paginatedAssets.length} data per halaman`, tone: 'green' as const, icon: Search },
    { label: 'Tersedia', subtitle: 'Aset yang tersedia', value: String(assets.filter(a => a.status?.toLowerCase() === 'available').length), change: 'Siap digunakan', tone: 'orange' as const, icon: CheckCircle2 },
    { label: 'Digunakan', subtitle: 'Aset yang sedang digunakan', value: String(assets.filter(a => a.status?.toLowerCase() === 'assigned').length), change: 'Dalam penggunaan', tone: 'purple' as const, icon: User },
  ], [assets, sortedAssets.length, paginatedAssets.length]);

  const clearFilters = () => {
    setSearchQuery('');
    setActiveTab('Semua');
    setCurrentPage(1);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      await assetService.deleteAsset(deleteTarget.id);
      showToast('Aset berhasil dihapus', 'success');
      setDeleteTarget(null);
    } catch (error: any) {
      console.error('Failed to delete asset:', error);
      showToast(error?.response?.data?.message || error?.message || 'Gagal menghapus aset', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; class: string }> = {
      'available': { label: 'Tersedia', class: 'badge-soft--green' },
      'assigned': { label: 'Digunakan', class: 'badge-soft--blue' },
      'maintenance': { label: 'Maintenance', class: 'badge-soft--yellow' },
      'retired': { label: 'Retired', class: 'badge-soft--gray' },
    };
    const info = statusMap[status?.toLowerCase()] || { label: status, class: 'badge-soft--gray' };
    return <span className={`badge-soft ${info.class}`}>{info.label}</span>;
  };

  const getAssignedEmployee = (asset: any) => {
    const currentAssignment = asset.assignments?.find((a: any) => a.status === 'assigned');
    if (!currentAssignment) return null;
    return currentAssignment.employee?.user?.name || currentAssignment.employee?.full_name || '-';
  };

  return (
    <>
      <div className="employee-summary-wrapper">
        {summaryCards.map((card) => {
          const Icon = card.icon;
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
              <p className="employee-summary-trend">{card.change}</p>
            </div>
          );
        })}
      </div>

      <Card className="analytics-title-card">
        <div className="analytics-title-inner">
          <div className="analytics-icon">
            <Package size={24} />
          </div>
          <div>
            <h2 className="analytics-title">Daftar Aset</h2>
            <p className="analytics-subtitle">Kelola dan lihat semua aset perusahaan</p>
          </div>
        </div>
      </Card>

      <Card className="control-section-card">
        <div className="control-section-inner">
          <div className="elyra-tabs">
            {(['Semua', 'Available', 'Assigned', 'Maintenance', 'Retired'] as const).map((tab) => (
              <button key={tab} className={`elyra-tab ${activeTab === tab ? 'active' : ''}`} onClick={() => { setActiveTab(tab); setCurrentPage(1); }}>
                {tab}
              </button>
            ))}
          </div>
          <div className="control-actions">
            <div className="search-box">
              <div className="search-icon-inside"><Search size={18} /></div>
              <input type="text" placeholder="Cari aset..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} className="search-input-pill" />
            </div>
            <button className={`filter-btn-rounded ${showFilters ? 'active' : ''}`} onClick={() => setShowFilters(!showFilters)}>
              <Filter size={18} />
              <span>Filter</span>
            </button>
          </div>
        </div>
        {showFilters && (
          <div className="filter-dropdown">
            <div className="filter-row">
              {(searchQuery || activeTab !== 'Semua') && <button className="btn-clear-filter" onClick={clearFilters}>Hapus Filter</button>}
            </div>
          </div>
        )}
      </Card>

      <div className="table-section">
        <div className="wuw-table-area">
          {loading && <LoadingState message="Memuat aset..." />}
          {!loading && paginatedAssets.length === 0 && (
            <div style={{ padding: '5rem 0' }}>
              <EmptyState title="Pencarian Kosong" message="Tidak ada aset yang sesuai dengan kriteria Anda." actionLabel="Bersihkan Filter" onAction={clearFilters} />
            </div>
          )}
          {!loading && paginatedAssets.length > 0 && (
            <>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '350px' }}>Aset</th>
                      <th>Kode</th>
                      <th>Dipakai Oleh</th>
                      <th className="th-center">Status</th>
                      <th className="th-center" style={{ width: '150px' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedAssets.map((asset) => {
                      const IconComponent = getAssetIcon(asset.category);
                      const assignedTo = getAssignedEmployee(asset);
                      return (
                        <tr key={asset.id}>
                          <td>
                            <div className="cell-name">
                              <div className="cell-avatar"><IconComponent size={20} /></div>
                              <div className="cell-stacked">
                                <span className="cell-name-text">{asset.name}</span>
                                <span className="cell-stacked__sub">{asset.serial_number || 'No SN'}</span>
                              </div>
                            </div>
                          </td>
                          <td><span style={{ color: '#475569', fontWeight: 600 }}>{asset.code || '-'}</span></td>
                          <td>{assignedTo ? (
                            <div className="cell-stacked">
                              <span className="cell-stacked__main" style={{ fontSize: '0.85rem' }}>{assignedTo}</span>
                              <span className="cell-stacked__sub">Sedang dipakai</span>
                            </div>
                          ) : <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>-</span>}</td>
                          <td className="td-center">{getStatusBadge(asset.status)}</td>
                          <td className="td-center">
                            <div className="action-btn-group">
                              {asset.status?.toLowerCase() === 'available' && (
                                <button className="action-btn" style={{ background: '#dbeafe', color: '#2563eb' }} onClick={() => openAssignModal(asset)} title="Assign ke Karyawan">
                                  <ArrowDownToLine size={16} />
                                </button>
                              )}
                              {asset.status?.toLowerCase() === 'assigned' && (
                                <button className="action-btn" style={{ background: '#fef3c7', color: '#d97706' }} onClick={() => openReturnModal(asset)} title="Kembalikan Aset">
                                  <ArrowUpFromLine size={16} />
                                </button>
                              )}
                              <button className="action-btn action-btn-edit" onClick={() => navigate(`/inventory/assets/edit/${asset.id}`)} title="Edit">
                                <Pencil size={16} />
                              </button>
                              <button className="action-btn action-btn-delete" onClick={() => setDeleteTarget(asset)} title="Hapus">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="table-pagination">
                <div className="pagination-info">Menampilkan <strong>{paginatedAssets.length}</strong> dari <strong>{sortedAssets.length}</strong> aset</div>
                <div className="pagination-controls">
                  <button className="pagination-btn" onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>‹</button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button key={page} className={`pagination-btn ${currentPage === page ? 'active' : ''}`} onClick={() => setCurrentPage(page)}>{page}</button>
                  ))}
                  <button className="pagination-btn" onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}>›</button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {assignModal && selectedAsset && (
        <div className="modal-overlay" onClick={closeAssignModal}>
          <div className="modal-completion" onClick={(e) => e.stopPropagation()}>
            <div className="modal-completion-header">
              <div className="modal-completion-icon"><User size={24} /></div>
              <div>
                <h3 className="modal-completion-title">Assign Aset</h3>
                <p className="modal-completion-task">{selectedAsset.name} ({selectedAsset.code})</p>
              </div>
              <button className="modal-close-btn" onClick={closeAssignModal}><X size={20} /></button>
            </div>
            <div className="modal-completion-body">
              <label className="modal-completion-label">Pilih Karyawan</label>
              <select className="modal-completion-select" value={selectedEmployee} onChange={(e) => setSelectedEmployee(e.target.value)}>
                <option value="">-- Pilih Karyawan --</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>{emp.user?.name || emp.full_name || `Employee #${emp.id}`} - {emp.position || '-'}</option>
                ))}
              </select>
              <label className="modal-completion-label" style={{ marginTop: '1rem' }}>Catatan Assignment</label>
              <textarea className="modal-completion-textarea" placeholder="Catatan tambahan (opsional)..." value={assignmentNote} onChange={(e) => setAssignmentNote(e.target.value)} rows={3} />
            </div>
            <div className="modal-completion-footer">
              <button className="modal-btn-cancel" onClick={closeAssignModal}>Batal</button>
              <button className="modal-btn-confirm" onClick={handleAssign} disabled={assigningLoading || !selectedEmployee}>
                {assigningLoading ? <><RefreshCw size={16} className="animate-spin" /> Menyimpan...</> : <><ArrowDownToLine size={16} /> Assign Aset</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {returnModal && selectedAssignment && (
        <div className="modal-overlay" onClick={closeReturnModal}>
          <div className="modal-completion" onClick={(e) => e.stopPropagation()}>
            <div className="modal-completion-header">
              <div className="modal-completion-icon" style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', color: '#d97706' }}>
                <ArrowUpFromLine size={24} />
              </div>
              <div>
                <h3 className="modal-completion-title">Kembalikan Aset</h3>
                <p className="modal-completion-task">Dari: {selectedAssignment.employee?.user?.name || selectedAssignment.employee?.full_name || '-'}</p>
              </div>
              <button className="modal-close-btn" onClick={closeReturnModal}><X size={20} /></button>
            </div>
            <div className="modal-completion-body">
              <label className="modal-completion-label">Catatan Pengembalian</label>
              <textarea className="modal-completion-textarea" placeholder="Kondisi aset saat dikembalikan..." value={returnNote} onChange={(e) => setReturnNote(e.target.value)} rows={3} />
              <p className="modal-completion-hint">Opsional. Kosongkan jika tidak ada catatan.</p>
            </div>
            <div className="modal-completion-footer">
              <button className="modal-btn-cancel" onClick={closeReturnModal}>Batal</button>
              <button className="modal-btn-confirm" onClick={handleReturn} disabled={returningLoading} style={{ background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)', boxShadow: '0 4px 14px rgba(217, 119, 6, 0.3)' }}>
                {returningLoading ? <><RefreshCw size={16} className="animate-spin" /> Memproses...</> : <><ArrowUpFromLine size={16} /> Kembalikan</>}
              </button>
            </div>
          </div>
        </div>
      )}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Hapus Aset"
        message={`Aset "${String(deleteTarget?.name || 'ini')}" akan dihapus. Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus"
        cancelLabel="Batal"
        loading={deleting}
        onConfirm={() => void handleDelete()}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
};

const AssignmentsTab: React.FC<{ loading: boolean; assets: any[] }> = ({ loading, assets }) => {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'Semua' | 'Active' | 'Returned'>('Semua');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [returnTarget, setReturnTarget] = useState<{ id: string | number; name: string } | null>(null);
  const [returning, setReturning] = useState(false);
  const [historyModal, setHistoryModal] = useState<{ module: string; id: number | string } | null>(null);

  const fetchAssignments = async () => {
    try {
      const res = await assetService.getAssignments();
      let arr: any[] = [];
      if (res?.data?.data && Array.isArray(res.data.data)) arr = res.data.data;
      else if (res?.data && Array.isArray(res.data)) arr = res.data;
      else if (Array.isArray(res)) arr = res;
      setAssignments(arr);
    } catch (error: any) {
      console.error('Failed to fetch assignments:', error);
      showToast(error?.response?.data?.message || error?.message || 'Gagal memuat penugasan', 'error');
      setAssignments([]);
    }
  };

  useEffect(() => { fetchAssignments(); }, []);

  const filteredAssignments = useMemo(() => {
    return assignments.filter((assignment) => {
      const searchStr = searchQuery.toLowerCase();
      const assetName = (assignment.asset?.name || '').toLowerCase();
      const employeeName = (assignment.employee?.user?.name || assignment.employee?.full_name || assignment.employee?.name || '').toLowerCase();
      const assetCode = (assignment.asset?.code || '').toLowerCase();
      const textMatch = assetName.includes(searchStr) || employeeName.includes(searchStr) || assetCode.includes(searchStr);
      const isReturned = !!assignment.returned_at;
      let statusMatch = true;
      if (activeTab === 'Active') statusMatch = !isReturned;
      else if (activeTab === 'Returned') statusMatch = isReturned;
      return textMatch && statusMatch;
    });
  }, [assignments, searchQuery, activeTab]);

  const sortedAssignments = useMemo(() => {
    return [...filteredAssignments].sort((a, b) => {
      const dateA = new Date(a.assigned_at || a.assignment_date || a.created_at || 0).getTime();
      const dateB = new Date(b.assigned_at || b.assignment_date || b.created_at || 0).getTime();
      return dateB - dateA;
    });
  }, [filteredAssignments]);

  const paginatedAssignments = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedAssignments.slice(startIndex, startIndex + pageSize);
  }, [sortedAssignments, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedAssignments.length / pageSize);

  const summaryCards = useMemo(() => [
    { label: 'Total Penugasan', subtitle: 'Seluruh penugasan aset', value: String(assignments.length), change: 'Data penugasan', tone: 'blue' as const, icon: Handshake },
    { label: 'Hasil Filter', subtitle: 'Penugasan sesuai pencarian', value: String(sortedAssignments.length), change: `${paginatedAssignments.length} data per halaman`, tone: 'green' as const, icon: Search },
    { label: 'Aktif', subtitle: 'Penugasan yang sedang berlangsung', value: String(assignments.filter(a => !a.returned_at).length), change: 'Dalam penggunaan', tone: 'orange' as const, icon: CheckCircle },
    { label: 'Dikembalikan', subtitle: 'Penugasan yang sudah selesai', value: String(assignments.filter(a => !!a.returned_at).length), change: 'Sudah kembali', tone: 'purple' as const, icon: XCircle },
  ], [assignments, sortedAssignments.length, paginatedAssignments.length]);

  const clearFilters = () => {
    setSearchQuery('');
    setActiveTab('Semua');
    setCurrentPage(1);
  };

  const handleReturn = async (data: { return_note: string; returned_at: string; condition: string }) => {
    if (!returnTarget) return;
    setReturning(true);
    try {
      await assetService.returnAsset(returnTarget.id, data);
      setReturnTarget(null);
      fetchAssignments();
    } catch (error: any) {
      console.error('Failed to return asset:', error);
      showToast(error?.response?.data?.message || error?.message || 'Gagal mengembalikan aset', 'error');
    } finally {
      setReturning(false);
    }
  };

  const getStatusBadge = (assignment: any) => {
    if (assignment.status === 'approved') return <span className="badge-soft badge-soft--green">Disetujui</span>;
    if (assignment.status === 'rejected') return <span className="badge-soft badge-soft--red">Ditolak</span>;
    if (assignment.status === 'pending' || assignment.approval_flow_id) return <span className="badge-soft badge-soft--orange">Menunggu</span>;
    if (!!assignment.returned_at) return <span className="badge-soft badge-soft--gray">Dikembalikan</span>;
    return <span className="badge-soft badge-soft--green">Aktif</span>;
  };

  const handleApproveAssignment = async (assignment: any) => {
    if (!window.confirm('Setujui penugasan aset ini?')) return;
    try {
      await assetService.approveAssignment(assignment.id);
      fetchAssignments();
    } catch (error: any) {
      console.error('Failed to approve assignment:', error);
      showToast(error?.response?.data?.message || error?.message || 'Gagal menyetujui penugasan', 'error');
    }
  };

  const handleRejectAssignment = async (assignment: any) => {
    if (!window.confirm('Tolak penugasan aset ini?')) return;
    try {
      await assetService.rejectAssignment(assignment.id);
      fetchAssignments();
    } catch (error: any) {
      console.error('Failed to reject assignment:', error);
      showToast(error?.response?.data?.message || error?.message || 'Gagal menolak penugasan', 'error');
    }
  };

  return (
    <>
      <div className="assign-summary-wrapper">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="assign-summary-card">
              <div className="assign-summary-header">
                <div>
                  <p className="assign-summary-label">{card.label}</p>
                  <p className="assign-summary-subtitle">{card.subtitle}</p>
                </div>
                <div className={`assign-summary-icon-wrapper assign-icon-${card.tone}`}>
                  <Icon size={28} />
                </div>
              </div>
              <div className={`assign-summary-value assign-value-${card.tone}`}>{card.value}</div>
              <p className="assign-summary-trend">{card.change}</p>
            </div>
          );
        })}
      </div>

      <Card className="analytics-title-card">
        <div className="analytics-title-inner">
          <div className="analytics-icon">
            <Handshake size={24} />
          </div>
          <div>
            <h2 className="analytics-title">Daftar Penugasan</h2>
            <p className="analytics-subtitle">Kelola dan lihat semua penugasan aset</p>
          </div>
        </div>
      </Card>

      <Card className="control-section-card">
        <div className="control-section-inner">
          <div className="elyra-tabs">
            {(['Semua', 'Active', 'Returned'] as const).map((tab) => (
              <button key={tab} className={`elyra-tab ${activeTab === tab ? 'active' : ''}`} onClick={() => { setActiveTab(tab); setCurrentPage(1); }}>
                {tab === 'Active' ? 'Aktif' : tab === 'Returned' ? 'Dikembalikan' : tab}
              </button>
            ))}
          </div>
          <div className="control-actions">
            <div className="search-box">
              <div className="search-icon-inside"><Search size={18} /></div>
              <input type="text" placeholder="Cari penugasan..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} className="search-input-pill" />
            </div>
            <button className={`filter-btn-rounded ${showFilters ? 'active' : ''}`} onClick={() => setShowFilters(!showFilters)}>
              <Filter size={18} />
              <span>Filter</span>
            </button>
          </div>
        </div>
        {showFilters && (
          <div className="filter-dropdown">
            <div className="filter-row">
              {(searchQuery || activeTab !== 'Semua') && <button className="btn-clear-filter" onClick={clearFilters}>Hapus Filter</button>}
            </div>
          </div>
        )}
      </Card>

      <div className="table-section">
        <div className="wuw-table-area">
          {loading && <LoadingState message="Memuat penugasan..." />}
          {!loading && paginatedAssignments.length === 0 && (
            <div style={{ padding: '5rem 0' }}>
              <EmptyState title="Pencarian Kosong" message="Tidak ada penugasan yang sesuai dengan kriteria Anda." actionLabel="Bersihkan Filter" onAction={clearFilters} />
            </div>
          )}
          {!loading && paginatedAssignments.length > 0 && (
            <>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '400px' }}>Penugasan</th>
                      <th>Karyawan</th>
                      <th>Tanggal Pinjam</th>
                      <th>Tanggal Kembali</th>
                      <th className="th-center">Status</th>
                      <th className="th-center" style={{ width: '120px' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedAssignments.map((assignment) => {
                      const employeeName = assignment.employee?.user?.name || assignment.employee?.full_name || assignment.employee?.name || 'Unknown';
                      const assetName = assignment.asset?.name || 'Unknown Asset';
                      const assetCode = assignment.asset?.code || 'NO-CODE';
                      return (
                        <tr key={assignment.id}>
                          <td>
                            <div className="cell-name">
                              <div className="cell-avatar"><Box size={20} /></div>
                              <div className="cell-stacked">
                                <span className="cell-name-text">{assetName}</span>
                                <span className="cell-stacked__sub">{assetCode}</span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="cell-stacked">
                              <span className="cell-stacked__main">{employeeName}</span>
                              <span className="cell-stacked__sub">{assignment.employee?.user?.email || ''}</span>
                            </div>
                          </td>
                          <td>
                            <div className="cell-stacked">
                              <span className="cell-stacked__main" style={{ fontSize: '0.85rem' }}>{formatDateTime(assignment.assigned_at || assignment.assignment_date || assignment.created_at)}</span>
                              <span className="cell-stacked__sub">Tanggal pinjam</span>
                            </div>
                          </td>
                          <td>
                            <div className="cell-stacked">
                              <span className="cell-stacked__main" style={{ fontSize: '0.85rem' }}>{assignment.returned_at ? formatDateTime(assignment.returned_at) : '-'}</span>
                              <span className="cell-stacked__sub">Tanggal kembali</span>
                            </div>
                          </td>
                          <td className="td-center">{getStatusBadge(assignment)}</td>
                          <td className="td-center">
                            <div className="action-btn-group">
                              {assignment.approval_flow_id && assignment.status !== 'approved' && assignment.status !== 'rejected' && (
                                <>
                                  <button className="action-btn" style={{ color: '#10b981' }} onClick={() => handleApproveAssignment(assignment)} title="Setujui"><CheckCircle2 size={16} /></button>
                                  <button className="action-btn" style={{ color: '#ef4444' }} onClick={() => handleRejectAssignment(assignment)} title="Tolak"><X size={16} /></button>
                                </>
                              )}
                              {assignment.status === 'approved' && !assignment.returned_at && (
                                <button className="action-btn action-btn-return" onClick={() => setReturnTarget({ id: assignment.id, name: assignment.asset?.name || 'Asset' })} title="Proses Pengembalian">
                                  <CheckCircle size={16} />
                                </button>
                              )}
                              {assignment.approval_flow_id && (
                                <button className="action-btn" style={{ color: '#8b5cf6', background: '#f5f3ff' }} onClick={() => setHistoryModal({ module: 'asset_assignment', id: assignment.id })} title="Riwayat Approval"><History size={16} /></button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="table-pagination">
                <div className="pagination-info">Menampilkan <strong>{paginatedAssignments.length}</strong> dari <strong>{sortedAssignments.length}</strong> penugasan</div>
                <div className="pagination-controls">
                  <button className="pagination-btn" onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>‹</button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button key={page} className={`pagination-btn ${currentPage === page ? 'active' : ''}`} onClick={() => setCurrentPage(page)}>{page}</button>
                  ))}
                  <button className="pagination-btn" onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}>›</button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <AssignAssetModal isOpen={showAssignModal} onClose={() => setShowAssignModal(false)} onSave={async (formData: any) => {
        await assetService.assignAsset(formData.asset_id, {
          employee_id: formData.employee_id,
          assignment_note: formData.assignment_note,
          assigned_at: formData.assigned_at,
        });
        setShowAssignModal(false);
        fetchAssignments();
      }} assets={assets.filter(a => a.status?.toLowerCase() === 'available')} />

      {returnTarget && (
        <ReturnAssetModal isOpen={!!returnTarget} onClose={() => setReturnTarget(null)} onConfirm={handleReturn} assetName={returnTarget.name} loading={returning} />
      )}

      {historyModal && (
        <ApprovalHistoryModal
          isOpen={!!historyModal}
          onClose={() => setHistoryModal(null)}
          module={historyModal.module}
          moduleId={historyModal.id}
        />
      )}
    </>
  );
};

const AssetManagementPage: React.FC = () => {
  const [tab, setTab] = useState<Tab>('Daftar Aset');
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const response = await assetService.getAssets();
      let assetsArray: any[] = [];
      if (response?.data?.data && Array.isArray(response.data.data)) assetsArray = response.data.data;
      else if (response?.data && Array.isArray(response.data)) assetsArray = response.data;
      else if (Array.isArray(response)) assetsArray = response;
      setAssets(assetsArray);
    } catch (error: any) {
      console.error('Failed to fetch assets:', error);
      showToast(error?.response?.data?.message || error?.message || 'Gagal memuat aset', 'error');
      setAssets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAssets(); }, []);

  return (
    <div className="crud-page asset-page">
      <Card className="hero-card">
        <div className="hero-card-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <Package size={16} />
              <span>Inventaris Perusahaan</span>
            </div>
            <h1 className="hero-title">Aset & Properti</h1>
            <p className="hero-subtitle">
              Pantau distribusi, kondisi, dan status kepemilikan aset perusahaan secara terpusat.
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn-outline" onClick={() => { fetchAssets(); }} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Segarkan
            </button>
          </div>
        </div>
      </Card>

      <div className="elyra-tabs" style={{ marginBottom: '1.5rem' }}>
        {TABS.map((t) => (
          <button key={t} className={`elyra-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t === 'Daftar Aset' ? <><Package size={16} /> {t}</> : <><Handshake size={16} /> {t}</>}
          </button>
        ))}
      </div>

      {tab === 'Daftar Aset' && <InventoryTab loading={loading} assets={assets} />}
      {tab === 'Penugasan' && <AssignmentsTab loading={loading} assets={assets} />}
    </div>
  );
};

export default AssetManagementPage;
