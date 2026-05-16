import React, { useState, useEffect, useMemo } from 'react';
import { Search, RefreshCw, Clock, CheckCircle, AlertCircle, Flag } from 'lucide-react';
import { Modal } from '@/shared/ui/Modal';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { LoadingState, ErrorState, EmptyState } from '@/shared/ui/DataStateDisplay';
import { taskService } from '@/features/tasks/api/task.service';
import { parsePaginatedResponse } from '@/shared/api/pagination';
import '@/shared/styles/CrudPage.css';
import '@/pages/dashboard/overview/OverviewPage.css';
import '@/pages/employee/EmployeesPage.css';

const MyTasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('Semua');
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [completingTask, setCompletingTask] = useState<any>(null);
  const [completionNotes, setCompletionNotes] = useState('');
  const [submittingCompletion, setSubmittingCompletion] = useState(false);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const response = await taskService.getMyTasks({ page: currentPage, per_page: pageSize });
      const payload = response?.data?.data ?? response?.data ?? response;
      const taskPayload = payload && typeof payload === 'object' && 'tasks' in payload
        ? (payload as Record<string, unknown>).tasks
        : payload;
      const parsed = parsePaginatedResponse<Record<string, unknown>>(taskPayload);
      setTasks(parsed.items);
      setTotalPages(parsed.totalPages);
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.message || 'Gagal memuat tugas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, activeTab]);

  const handleStartTask = async (taskId: string | number) => {
    await taskService.updateTask(taskId, { status: 'in_progress' });
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

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const searchStr = searchText.toLowerCase();
      const matchesSearch =
        !searchText ||
        task.title?.toLowerCase().includes(searchStr) ||
        task.description?.toLowerCase().includes(searchStr);

      let tabMatch = true;
      if (activeTab === 'Menunggu') tabMatch = task.status === 'pending';
      else if (activeTab === 'Dikerjakan') tabMatch = task.status === 'in_progress';
      else if (activeTab === 'Selesai') tabMatch = task.status === 'completed';

      return matchesSearch && tabMatch;
    });
  }, [tasks, searchText, activeTab]);

  const sortedTasks = useMemo(() => {
    const priorityOrder: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
    return [...filteredTasks].sort((a, b) => {
      const aP = priorityOrder[a.priority] ?? 4;
      const bP = priorityOrder[b.priority] ?? 4;
      if (aP !== bP) return aP - bP;
      if (a.status === 'completed' && b.status !== 'completed') return 1;
      if (a.status !== 'completed' && b.status === 'completed') return -1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [filteredTasks]);

  const paginatedTasks = sortedTasks;
  const summaryCards = useMemo(
    () => [
      {
        label: 'Total Tugas',
        subtitle: 'Seluruh tugas Anda',
        value: String(tasks.length),
        change: 'Data tugas tersimpan',
        tone: 'blue' as const,
        icon: Clock,
      },
      {
        label: 'Menunggu',
        subtitle: 'Belum dimulai',
        value: String(tasks.filter((t) => t.status === 'pending').length),
        change: 'Perlu ditindak',
        tone: 'orange' as const,
        icon: AlertCircle,
      },
      {
        label: 'Dikerjakan',
        subtitle: 'Sedang berjalan',
        value: String(tasks.filter((t) => t.status === 'in_progress').length),
        change: 'Sedang proses',
        tone: 'purple' as const,
        icon: Flag,
      },
      {
        label: 'Selesai',
        subtitle: 'Tugas selesai',
        value: String(tasks.filter((t) => t.status === 'completed').length),
        change: 'Tuntas',
        tone: 'green' as const,
        icon: CheckCircle,
      },
    ],
    [tasks],
  );

  const clearFilters = () => {
    setSearchText('');
    setActiveTab('Semua');
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; class: string }> = {
      pending: { label: 'Menunggu', class: 'badge-soft--orange' },
      in_progress: { label: 'Dikerjakan', class: 'badge-soft--blue' },
      completed: { label: 'Selesai', class: 'badge-soft--green' },
      cancelled: { label: 'Dibatalkan', class: 'badge-soft--red' },
    };
    const info = map[status] || { label: status, class: 'badge-soft--gray' };
    return <span className={`badge-soft ${info.class}`}>{info.label}</span>;
  };

  const getPriorityBadge = (priority: string) => {
    const map: Record<string, { label: string; class: string }> = {
      low: { label: 'Rendah', class: 'badge-soft--green' },
      medium: { label: 'Sedang', class: 'badge-soft--orange' },
      high: { label: 'Tinggi', class: 'badge-soft--red' },
      urgent: { label: 'Mendesak', class: 'badge-soft--red' },
    };
    const info = map[priority] || { label: priority, class: 'badge-soft--gray' };
    return <span className={`badge-soft ${info.class}`}>{info.label}</span>;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const isOverdue = (task: any) => {
    if (!task.due_date || task.status === 'completed' || task.status === 'cancelled') return false;
    return new Date(task.due_date) < new Date();
  };

  return (
    <div className="crud-page">
      <Card className="hero-card">
        <div className="hero-card-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <Clock size={16} />
              <span>Tugas Saya</span>
            </div>
            <h1 className="hero-title">My Tasks</h1>
            <p className="hero-subtitle">Lihat dan kelola tugas yang ditugaskan kepada Anda.</p>
          </div>
          <div className="hero-actions">
            <button className="btn-outline" onClick={fetchData} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Segarkan
            </button>
          </div>
        </div>
      </Card>

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
            <Clock size={24} />
          </div>
          <div>
            <h2 className="analytics-title">Daftar Tugas Saya</h2>
            <p className="analytics-subtitle">Semua tugas yang Anda terima</p>
          </div>
        </div>
      </Card>

      <Card className="control-section-card">
        <div className="control-section-inner">
          <div className="elyra-tabs">
            {['Semua', 'Menunggu', 'Dikerjakan', 'Selesai'].map((tab) => (
              <button
                key={tab}
                className={`elyra-tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
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
                placeholder="Cari tugas..."
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
          {loading && <LoadingState message="Memuat tugas..." />}
          {!loading && errorMessage && <ErrorState message="Koneksi Terputus" error={errorMessage} onRetry={fetchData} />}

          {!loading && !errorMessage && sortedTasks.length === 0 && (
            <div style={{ padding: '5rem 0' }}>
              <EmptyState title="Tidak Ada Tugas" message="Anda belum memiliki tugas." actionLabel="Bersihkan Filter" onAction={clearFilters} />
            </div>
          )}

          {!loading && !errorMessage && sortedTasks.length > 0 && (
            <>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: '350px' }}>Tugas</th>
                    <th>Prioritas</th>
                    <th>Status</th>
                    <th>Deadline</th>
                    <th>Diberi oleh</th>
                    <th className="th-center" style={{ width: '120px' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedTasks.map((task) => (
                    <tr key={task.id} style={isOverdue(task) ? { background: '#fef2f2' } : undefined}>
                      <td>
                        <div className="cell-name">
                          <div className="cell-avatar" style={{ background: '#f1f5f9', color: '#64748b' }}>
                            {task.title ? task.title.charAt(0).toUpperCase() : 'T'}
                          </div>
                          <div className="cell-stacked">
                            <span className="cell-name-text">{task.title}</span>
                            <span className="cell-stacked__sub">
                              {task.description?.substring(0, 80)}{task.description?.length > 80 ? '...' : ''}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>{getPriorityBadge(task.priority)}</td>
                      <td>{getStatusBadge(task.status)}</td>
                      <td>
                        <div className="cell-stacked">
                          <span className="cell-stacked__main" style={{ fontSize: '0.85rem', color: isOverdue(task) ? '#dc2626' : undefined }}>
                            {formatDate(task.due_date)}
                          </span>
                          {isOverdue(task) && <span className="cell-stacked__sub" style={{ color: '#dc2626' }}>Terlambat!</span>}
                        </div>
                      </td>
                      <td>
                        <div className="cell-name">
                          <img
                            src={task.assigned_by?.profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(task.assigned_by?.name || 'U')}&color=7F9CF5&background=EBF4FF`}
                            alt=""
                            className="cell-avatar"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(task.assigned_by?.name || 'U')}&color=7F9CF5&background=EBF4FF`;
                            }}
                          />
                          <span style={{ color: '#64748b', fontWeight: 500 }}>
                            {task.assigned_by?.name || '-'}
                          </span>
                        </div>
                      </td>
                      <td className="td-center">
                        <div className="action-btn-group">
                          {task.status === 'pending' && (
                            <button
                              className="action-btn"
                              style={{ background: '#dbeafe', color: '#2563eb' }}
                              onClick={() => handleStartTask(task.id)}
                              title="Mulai Dikerjakan"
                            >
                              <Clock size={16} />
                            </button>
                          )}
                          {(task.status === 'in_progress' || task.status === 'pending') && (
                            <button
                              className="action-btn"
                              style={{ background: '#dcfce7', color: '#16a34a' }}
                              onClick={() => openCompletionModal(task)}
                              title="Tandai Selesai"
                            >
                              <CheckCircle size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="table-pagination">
                <div className="pagination-info">
                  Halaman <strong>{currentPage}</strong> dari <strong>{totalPages}</strong>
                </div>
                <div className="pagination-controls">
                  <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}>
                    Sebelumnya
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button key={page} className={`pagination-page-btn ${currentPage === page ? 'active' : ''}`} onClick={() => setCurrentPage(page)}>{page}</button>
                  ))}
                  <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}>
                    Selanjutnya
                  </Button>
                </div>
              </div>
            )}
          </>
          )}
        </div>
      </div>

      <Modal
        isOpen={!!completingTask}
        onClose={closeCompletionModal}
        title="Tandai Tugas Selesai"
        size="md"
        footer={
          <>
            <button className="modal-btn-cancel" onClick={closeCompletionModal}>Batal</button>
            <button className="modal-btn-confirm" onClick={handleCompleteTask} disabled={submittingCompletion}>
              {submittingCompletion ? (
                <><RefreshCw size={16} className="animate-spin" /> Menyimpan...</>
              ) : (
                <><CheckCircle size={16} /> Tandai Selesai</>
              )}
            </button>
          </>
        }
      >
        <p className="modal-completion-task" style={{ marginBottom: '1rem' }}>{completingTask?.title}</p>
        <label className="modal-completion-label">Catatan Penyelesaian</label>
        <textarea
          className="modal-completion-textarea"
          placeholder="Tulis catatan singkat tentang hasil pengerjaan tugas ini..."
          value={completionNotes}
          onChange={(e) => setCompletionNotes(e.target.value)}
          rows={4}
        />
        <p className="modal-completion-hint">Opsional. Anda bisa mengosongkan jika tidak ada catatan.</p>
      </Modal>
    </div>
  );
};

export default MyTasksPage;
