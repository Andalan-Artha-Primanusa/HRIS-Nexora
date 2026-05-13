import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Plus, RefreshCw, Pencil, Trash2, CheckCircle, Clock, AlertCircle, X, Sparkles } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { LoadingState, ErrorState, EmptyState } from '@/shared/ui/DataStateDisplay';
import { taskService } from '@/features/tasks/api/task.service';
import { TaskModal } from '@/features/tasks/components/TaskModal';
import { showToast } from '@/shared/ui/toast';
import '@/shared/styles/CrudPage.css';
import '@/pages/dashboard/overview/OverviewPage.css';
import '@/pages/employee/EmployeesPage.css';

const TaskManagementPage: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [completingTask, setCompletingTask] = useState<any>(null);
  const [completionNotes, setCompletionNotes] = useState('');
  const [submittingCompletion, setSubmittingCompletion] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const params: Record<string, string> = {};
      if (searchText) params.search = searchText;
      if (selectedStatus) params.status = selectedStatus;
      if (selectedPriority) params.priority = selectedPriority;

      const response = await taskService.getTasks(params);
      let data: any[] = [];
      if (response?.data?.data?.data && Array.isArray(response.data.data.data)) {
        data = response.data.data.data;
      } else if (response?.data?.data && Array.isArray(response.data.data)) {
        data = response.data.data;
      } else if (response?.data && Array.isArray(response.data)) {
        data = response.data;
      } else if (Array.isArray(response)) {
        data = response;
      }
      setItems(data);
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.message || 'Gagal memuat data tugas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, selectedStatus, selectedPriority]);

  const handleSave = async (formData: any) => {
    if (editingTask) {
      await taskService.updateTask(editingTask.id, formData);
    } else {
      await taskService.createTask(formData);
    }
    fetchData();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      await taskService.deleteTask(deleteTarget.id);
      showToast('Tugas berhasil dihapus', 'success');
      setDeleteTarget(null);
      fetchData();
    } catch (error: any) {
      console.error(error);
      showToast(error?.response?.data?.message || error?.message || 'Gagal menghapus tugas', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleStatusChange = async (task: any, newStatus: string) => {
    await taskService.updateTask(task.id, { status: newStatus });
    fetchData();
  };

  const openCompletionModal = (task: any) => {
    setCompletingTask(task);
    setCompletionNotes('');
  };

  const closeCompletionModal = () => {
    setCompletingTask(null);
    setCompletionNotes('');
  };

  const handleCompleteTask = async () => {
    if (!completingTask) return;
    setSubmittingCompletion(true);
    try {
      await taskService.updateTask(completingTask.id, {
        status: 'completed',
        completion_notes: completionNotes || '',
      });
      closeCompletionModal();
      fetchData();
    } catch (error) {
      console.error(error);
    } finally {
      setSubmittingCompletion(false);
    }
  };

  const uniqueStatuses = useMemo(() => {
    return Array.from(new Set(items.map((i) => i.status).filter(Boolean))).sort();
  }, [items]);

  const uniquePriorities = useMemo(() => {
    return Array.from(new Set(items.map((i) => i.priority).filter(Boolean))).sort();
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const searchStr = searchText.toLowerCase();
      const matchesSearch =
        !searchText ||
        item.title?.toLowerCase().includes(searchStr) ||
        item.description?.toLowerCase().includes(searchStr) ||
        item.assigned_to?.name?.toLowerCase().includes(searchStr) ||
        item.assigned_to?.profile?.full_name?.toLowerCase().includes(searchStr);

      const matchesStatus = !selectedStatus || item.status === selectedStatus;
      const matchesPriority = !selectedPriority || item.priority === selectedPriority;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [items, searchText, selectedStatus, selectedPriority]);

  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      const priorityOrder: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
      const aPriority = priorityOrder[a.priority] ?? 4;
      const bPriority = priorityOrder[b.priority] ?? 4;
      if (aPriority !== bPriority) return aPriority - bPriority;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [filteredItems]);

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedItems.slice(startIndex, startIndex + pageSize);
  }, [sortedItems, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedItems.length / pageSize);

  const summaryCards = useMemo(
    () => [
      {
        label: 'Total Tugas',
        subtitle: 'Seluruh tugas',
        value: String(items.length),
        change: 'Data tugas tersimpan',
        tone: 'blue' as const,
        icon: Clock,
      },
      {
        label: 'Hasil Filter',
        subtitle: 'Tugas sesuai pencarian',
        value: String(sortedItems.length),
        change: `${paginatedItems.length} data per halaman`,
        tone: 'green' as const,
        icon: Search,
      },
      {
        label: 'Selesai',
        subtitle: 'Tugas yang diselesaikan',
        value: String(items.filter((i) => i.status === 'completed').length),
        change: 'Tuntas',
        tone: 'orange' as const,
        icon: CheckCircle,
      },
      {
        label: 'Dalam Proses',
        subtitle: 'Sedang dikerjakan',
        value: String(items.filter((i) => i.status === 'in_progress').length),
        change: 'Berjalan',
        tone: 'purple' as const,
        icon: AlertCircle,
      },
    ],
    [items, sortedItems.length, paginatedItems.length],
  );

  const clearFilters = () => {
    setSearchText('');
    setSelectedStatus('');
    setSelectedPriority('');
    setCurrentPage(1);
  };

  const getPriorityBadge = (priority: string) => {
    const map: Record<string, { label: string; class: string }> = {
      low: { label: 'Rendah', class: 'badge-soft--green' },
      medium: { label: 'Sedang', class: 'badge-soft--orange' },
      high: { label: 'Tinggi', class: 'badge-soft--red' },
      urgent: { label: 'Mendesak', class: 'badge-soft--red' },
    };
    const info = map[priority] || { label: priority, class: 'badge-soft--gray' };
    return (
      <span className={`badge-soft ${info.class}`}>
        {info.label}
      </span>
    );
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getInitial = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : 'T';
  };

  return (
    <div className="crud-page">
      {/* Header - Same style as EmployeesPage */}
      <Card className="hero-card">
        <div className="hero-card-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <Clock size={16} />
              <span>Manajemen Tugas</span>
            </div>
            <h1 className="hero-title">Task Management</h1>
            <p className="hero-subtitle">Buat, tugaskan, dan pantau progress tugas karyawan secara terpusat.</p>
          </div>
          <div className="hero-actions">
            <button className="btn-outline" onClick={fetchData} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Segarkan
            </button>
            <button className="btn-primary" onClick={() => { setEditingTask(null); setIsModalOpen(true); }}>
              <Plus size={16} />
              Buat Tugas
            </button>
          </div>
        </div>
      </Card>

      {/* Summary Cards */}
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

      {/* Analytics Title Card */}
      <Card className="analytics-title-card">
        <div className="analytics-title-inner">
          <div className="analytics-icon">
            <Clock size={24} />
          </div>
          <div>
            <h2 className="analytics-title">Daftar Tugas</h2>
            <p className="analytics-subtitle">Kelola dan lihat semua tugas</p>
          </div>
        </div>
      </Card>

      {/* Control Section */}
      <Card className="control-section-card">
        <div className="control-section-inner">
          {/* Tabs */}
          <div className="elyra-tabs">
            {[
              { value: '', label: 'Semua' },
              { value: 'pending', label: 'Menunggu' },
              { value: 'in_progress', label: 'Dikerjakan' },
              { value: 'completed', label: 'Selesai' },
              { value: 'cancelled', label: 'Dibatalkan' },
            ].map((tab) => (
              <button
                key={tab.value}
                className={`elyra-tab ${selectedStatus === tab.value ? 'active' : ''}`}
                onClick={() => setSelectedStatus(tab.value)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search & Filter */}
          <div className="control-actions">
            <div className="search-box">
              <div className="search-icon-inside"><Search size={18} /></div>
              <input
                type="text"
                placeholder="Cari tugas..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="search-input-pill"
              />
            </div>
            <button
              className={`filter-btn-rounded ${showFilters ? 'active' : ''}`}
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
              <div className="filter-group">
                <label>Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="filter-select-premium"
                >
                  <option value="">Semua Status</option>
                  {uniqueStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status === 'pending' ? 'Menunggu' : status === 'in_progress' ? 'Dikerjakan' : status === 'completed' ? 'Selesai' : status === 'cancelled' ? 'Dibatalkan' : status}
                    </option>
                  ))}
                </select>
              </div>
              <div className="filter-group">
                <label>Prioritas</label>
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="filter-select-premium"
                >
                  <option value="">Semua Prioritas</option>
                  {uniquePriorities.map((priority) => (
                    <option key={priority} value={priority}>
                      {priority === 'low' ? 'Rendah' : priority === 'medium' ? 'Sedang' : priority === 'high' ? 'Tinggi' : priority === 'urgent' ? 'Mendesak' : priority}
                    </option>
                  ))}
                </select>
              </div>
              {(searchText || selectedStatus || selectedPriority) && (
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
          {loading && <LoadingState message="Memuat tugas..." />}
          {!loading && errorMessage && (
            <ErrorState message="Koneksi Terputus" error={errorMessage} onRetry={fetchData} />
          )}

          {!loading && !errorMessage && paginatedItems.length === 0 && (
            <div style={{ padding: '5rem 0' }}>
              <EmptyState
                title="Pencarian Kosong"
                message="Kami tidak menemukan tugas yang sesuai dengan kriteria Anda."
                actionLabel="Bersihkan Filter"
                onAction={clearFilters}
              />
            </div>
          )}

          {!loading && !errorMessage && paginatedItems.length > 0 && (
            <>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '400px' }}>Tugas</th>
                      <th>Ditugaskan Ke</th>
                      <th>Prioritas</th>
                      <th>Status</th>
                      <th>Deadline</th>
                      <th className="th-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedItems.map((task) => (
                      <tr key={task.id}>
                        <td>
                          <div className="cell-name">
                            <div className="cell-avatar">
                              {getInitial(task.title)}
                            </div>
                            <div className="cell-stacked">
                              <span className="cell-name-text">{task.title}</span>
                              <span className="cell-stacked__sub">{task.description?.substring(0, 60) || 'No description'}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="cell-stacked">
                            <span className="cell-stacked__main" style={{ fontSize: '0.85rem' }}>
                              {task.assigned_to?.name || task.assigned_to?.profile?.full_name || '-'}
                            </span>
                            <span className="cell-stacked__sub">oleh {task.assigned_by?.name || '-'}</span>
                          </div>
                        </td>
                        <td>{getPriorityBadge(task.priority)}</td>
                        <td>
                          <span className={`badge-soft ${
                            task.status === 'pending' ? 'badge-soft--orange' :
                            task.status === 'in_progress' ? 'badge-soft--blue' :
                            task.status === 'completed' ? 'badge-soft--green' : 'badge-soft--red'
                          }`}>
                            {task.status === 'pending' ? 'Menunggu' :
                             task.status === 'in_progress' ? 'Dikerjakan' :
                             task.status === 'completed' ? 'Selesai' : 'Dibatalkan'}
                          </span>
                        </td>
                        <td>
                          <div className="cell-stacked">
                            <span className="cell-stacked__main" style={{ fontSize: '0.85rem' }}>{formatDate(task.due_date)}</span>
                            <span className="cell-stacked__sub">{task.completed_at ? 'Selesai: ' + formatDate(task.completed_at) : 'Deadline'}</span>
                          </div>
                        </td>
                        <td className="td-center">
                          <div className="action-btn-group">
                            {task.status === 'pending' && (
                              <button
                                className="action-btn"
                                style={{ background: '#fef3c7', color: '#b45309' }}
                                onClick={() => handleStatusChange(task, 'in_progress')}
                                title="Mulai Dikerjakan"
                              >
                                <Clock size={16} />
                              </button>
                            )}
                            {(task.status === 'in_progress' || task.status === 'pending') && (
                              <button
                                className="action-btn"
                                style={{ background: '#d1fae5', color: '#059669' }}
                                onClick={() => openCompletionModal(task)}
                                title="Tandai Selesai"
                              >
                                <CheckCircle size={16} />
                              </button>
                            )}
                            <button
                              className="action-btn action-btn-edit"
                              onClick={() => { setEditingTask(task); setIsModalOpen(true); }}
                              title="Edit"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              className="action-btn action-btn-delete"
                              onClick={() => setDeleteTarget(task)}
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
                  Menampilkan <strong>{paginatedItems.length}</strong> dari <strong>{sortedItems.length}</strong> tugas
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

      <TaskModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingTask(null); }} onSave={handleSave} initialData={editingTask} />

      {/* Completion Modal Overlay */}
      {completingTask && (
        <div className="modal-overlay" onClick={closeCompletionModal}>
          <div className="modal-completion" onClick={(e) => e.stopPropagation()}>
            <div className="modal-completion-header">
              <div className="modal-completion-icon">
                <Sparkles size={24} />
              </div>
              <div>
                <h3 className="modal-completion-title">Tandai Tugas Selesai</h3>
                <p className="modal-completion-task">{completingTask.title}</p>
              </div>
              <button className="modal-close-btn" onClick={closeCompletionModal}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-completion-body">
              <label className="modal-completion-label">Catatan Penyelesaian</label>
              <textarea
                className="modal-completion-textarea"
                placeholder="Tulis catatan singkat tentang hasil pengerjaan tugas ini..."
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                rows={4}
              />
              <p className="modal-completion-hint">Opsional. Anda bisa mengosongkan jika tidak ada catatan.</p>
            </div>
            <div className="modal-completion-footer">
              <button className="modal-btn-cancel" onClick={closeCompletionModal}>Batal</button>
              <button className="modal-btn-confirm" onClick={handleCompleteTask} disabled={submittingCompletion}>
                {submittingCompletion ? (
                  <><RefreshCw size={16} className="animate-spin" /> Menyimpan...</>
                ) : (
                  <><CheckCircle size={16} /> Tandai Selesai</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Hapus Tugas"
        message={`Tugas "${String(deleteTarget?.title || "ini")}" akan dihapus. Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus"
        cancelLabel="Batal"
        loading={deleting}
        onConfirm={() => void handleDelete()}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default TaskManagementPage;
