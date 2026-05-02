import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Plus, RefreshCw, Pencil, Trash2, CheckCircle, Clock, AlertCircle, XCircle, Eye } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { LoadingState, ErrorState, EmptyState } from '@/shared/ui/DataStateDisplay';
import { taskService } from '@/features/tasks/api/task.service';
import { TaskModal } from '@/features/tasks/components/TaskModal';
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
      if (response?.data?.data && Array.isArray(response.data.data)) {
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

  const handleSave = async (formData: any) => {
    if (editingTask) {
      await taskService.updateTask(editingTask.id, formData);
    } else {
      await taskService.createTask(formData);
    }
    fetchData();
  };

  const handleDelete = async (id: string | number) => {
    if (!window.confirm('Hapus tugas ini?')) return;
    try {
      await taskService.deleteTask(id);
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleStatusChange = async (task: any, newStatus: string) => {
    const updates: any = { status: newStatus };
    if (newStatus === 'completed') {
      updates.completion_notes = prompt('Catatan penyelesaian (opsional):') || '';
    }
    await taskService.updateTask(task.id, updates);
    fetchData();
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const searchStr = searchText.toLowerCase();
      const matchesSearch =
        !searchText ||
        item.title?.toLowerCase().includes(searchStr) ||
        item.description?.toLowerCase().includes(searchStr) ||
        item.assigned_to?.user?.name?.toLowerCase().includes(searchStr) ||
        item.assigned_to?.full_name?.toLowerCase().includes(searchStr);

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

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; class: string }> = {
      pending: { label: 'Menunggu', class: 'badge-soft--yellow' },
      in_progress: { label: 'Dikerjakan', class: 'badge-soft--blue' },
      completed: { label: 'Selesai', class: 'badge-soft--green' },
      cancelled: { label: 'Dibatalkan', class: 'badge-soft--gray' },
    };
    const info = map[status] || { label: status, class: 'badge-soft--gray' };
    return <span className={`badge-soft ${info.class}`}>{info.label}</span>;
  };

  const getPriorityBadge = (priority: string) => {
    const map: Record<string, { label: string; class: string }> = {
      low: { label: 'Rendah', class: 'badge-soft--green' },
      medium: { label: 'Sedang', class: 'badge-soft--yellow' },
      high: { label: 'Tinggi', class: 'badge-soft--orange' },
      urgent: { label: 'Mendesak', class: 'badge-soft--red' },
    };
    const info = map[priority] || { label: priority, class: 'badge-soft--gray' };
    return <span className={`badge-soft ${info.class}`}>{info.label}</span>;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="crud-page">
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

      <div className="overview-summary-wrapper">
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
            <Clock size={24} />
          </div>
          <div>
            <h2 className="analytics-title">Daftar Tugas</h2>
            <p className="analytics-subtitle">Kelola semua tugas yang ditugaskan ke karyawan</p>
          </div>
        </div>
      </Card>

      <Card className="control-section-card">
        <div className="control-section-inner">
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
                onClick={() => { setSelectedStatus(tab.value); setCurrentPage(1); }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="control-actions">
            <div className="search-box">
              <div className="search-icon-inside"><Search size={18} /></div>
              <input
                type="text"
                placeholder="Cari tugas..."
                value={searchText}
                onChange={(e) => { setSearchText(e.target.value); setCurrentPage(1); }}
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

        {showFilters && (
          <div className="filter-dropdown">
            <div className="filter-row">
              <div className="filter-item">
                <label>Prioritas</label>
                <select value={selectedPriority} onChange={(e) => { setSelectedPriority(e.target.value); setCurrentPage(1); }}>
                  <option value="">Semua</option>
                  <option value="low">Rendah</option>
                  <option value="medium">Sedang</option>
                  <option value="high">Tinggi</option>
                  <option value="urgent">Mendesak</option>
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

      <div className="table-section">
        <div className="wuw-table-area">
          {loading && <LoadingState message="Memuat tugas..." />}
          {errorMessage && !loading && <ErrorState message={errorMessage} onRetry={fetchData} />}
          {!loading && !errorMessage && paginatedItems.length === 0 && (
            <div style={{ padding: '5rem 0' }}>
              <EmptyState title="Tidak Ada Tugas" message="Belum ada tugas yang dibuat." actionLabel="Buat Tugas" onAction={() => setIsModalOpen(true)} />
            </div>
          )}
          {!loading && !errorMessage && paginatedItems.length > 0 && (
            <>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '300px' }}>Tugas</th>
                      <th>Ditugaskan Ke</th>
                      <th>Prioritas</th>
                      <th>Status</th>
                      <th>Deadline</th>
                      <th className="th-center" style={{ width: '180px' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedItems.map((task) => (
                      <tr key={task.id}>
                        <td>
                          <div className="cell-stacked">
                            <span className="cell-stacked__main">{task.title}</span>
                            <span className="cell-stacked__sub">{task.description?.substring(0, 60)}{task.description?.length > 60 ? '...' : ''}</span>
                          </div>
                        </td>
        <td>
          <div className="cell-stacked">
            <span className="cell-stacked__main">
              {task.assigned_to?.name || task.assigned_to?.profile?.full_name || '-'}
            </span>
            <span className="cell-stacked__sub">oleh {task.assigned_by?.name || '-'}</span>
          </div>
        </td>
                        <td>{getPriorityBadge(task.priority)}</td>
                        <td>{getStatusBadge(task.status)}</td>
                        <td>
                          <div className="cell-stacked">
                            <span className="cell-stacked__main" style={{ fontSize: '0.85rem' }}>{formatDate(task.due_date)}</span>
                            {task.completed_at && <span className="cell-stacked__sub">Selesai: {formatDate(task.completed_at)}</span>}
                          </div>
                        </td>
                        <td className="td-center">
                          <div className="action-btn-group">
                            {task.status === 'pending' && (
                              <button
                                className="action-btn"
                                style={{ background: '#dbeafe', color: '#2563eb' }}
                                onClick={() => handleStatusChange(task, 'in_progress')}
                                title="Mulai Dikerjakan"
                              >
                                <Clock size={16} />
                              </button>
                            )}
                            {(task.status === 'in_progress' || task.status === 'pending') && (
                              <button
                                className="action-btn"
                                style={{ background: '#dcfce7', color: '#16a34a' }}
                                onClick={() => handleStatusChange(task, 'completed')}
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
                              onClick={() => handleDelete(task.id)}
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
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((page) => (
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
    </div>
  );
};

export default TaskManagementPage;
