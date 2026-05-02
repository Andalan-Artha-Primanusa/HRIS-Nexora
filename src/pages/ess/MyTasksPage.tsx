import React, { useState, useEffect, useMemo } from 'react';
import { RefreshCw, Clock, CheckCircle, AlertCircle, XCircle, FileText, Flag } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { LoadingState, ErrorState, EmptyState } from '@/shared/ui/DataStateDisplay';
import { taskService } from '@/features/tasks/api/task.service';
import '@/shared/styles/CrudPage.css';
import '@/pages/dashboard/overview/OverviewPage.css';

const MyTasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({ total: 0, pending: 0, in_progress: 0, completed: 0, cancelled: 0 });
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  const fetchData = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const response = await taskService.getMyTasks();
      const data = response?.data || response;
      setTasks(data?.tasks || []);
      setSummary(data?.summary || {});
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.message || 'Gagal memuat tugas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusChange = async (taskId: string | number, newStatus: string) => {
    const updates: any = { status: newStatus };
    if (newStatus === 'completed') {
      const notes = prompt('Catatan penyelesaian (opsional):');
      updates.completion_notes = notes || '';
    }
    await taskService.updateTask(taskId, updates);
    fetchData();
  };

  const filteredTasks = useMemo(() => {
    if (activeTab === 'all') return tasks;
    return tasks.filter((t) => t.status === activeTab);
  }, [tasks, activeTab]);

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
    return (
      <span className={`badge-soft ${info.class}`}>
        <Flag size={12} style={{ marginRight: '4px' }} />
        {info.label}
      </span>
    );
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

      <div className="overview-summary-wrapper">
        {[
          { label: 'Total Tugas', value: summary.total, tone: 'blue', icon: FileText },
          { label: 'Menunggu', value: summary.pending, tone: 'yellow', icon: Clock },
          { label: 'Dikerjakan', value: summary.in_progress, tone: 'purple', icon: AlertCircle },
          { label: 'Selesai', value: summary.completed, tone: 'green', icon: CheckCircle },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="employee-summary-card">
              <div className="employee-summary-header">
                <div>
                  <p className="employee-summary-label">{card.label}</p>
                </div>
                <div className={`employee-summary-icon-wrapper employee-icon-${card.tone}`}>
                  <Icon size={28} />
                </div>
              </div>
              <div className={`employee-summary-value employee-value-${card.tone}`}>{card.value}</div>
            </div>
          );
        })}
      </div>

      <Card className="analytics-title-card">
        <div className="analytics-title-inner">
          <div className="analytics-icon">
            <FileText size={24} />
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
            {[
              { value: 'all', label: 'Semua' },
              { value: 'pending', label: 'Menunggu' },
              { value: 'in_progress', label: 'Dikerjakan' },
              { value: 'completed', label: 'Selesai' },
            ].map((tab) => (
              <button
                key={tab.value}
                className={`elyra-tab ${activeTab === tab.value ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.value)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <div className="table-section">
        <div className="wuw-table-area">
          {loading && <LoadingState message="Memuat tugas..." />}
          {errorMessage && !loading && <ErrorState message={errorMessage} onRetry={fetchData} />}
          {!loading && !errorMessage && sortedTasks.length === 0 && (
            <div style={{ padding: '5rem 0' }}>
              <EmptyState title="Tidak Ada Tugas" message="Anda belum memiliki tugas." />
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
                      <th className="th-center" style={{ width: '150px' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedTasks.map((task) => (
                      <tr key={task.id} style={isOverdue(task) ? { background: '#fef2f2' } : undefined}>
                        <td>
                          <div className="cell-stacked">
                            <span className="cell-stacked__main">{task.title}</span>
                            <span className="cell-stacked__sub">
                              {task.description?.substring(0, 80)}{task.description?.length > 80 ? '...' : ''}
                            </span>
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
                          <span style={{ color: '#64748b', fontWeight: 500 }}>
                            {task.assigned_by?.user?.name || task.assigned_by?.name || '-'}
                          </span>
                        </td>
                        <td className="td-center">
                          <div className="action-btn-group">
                            {task.status === 'pending' && (
                              <button
                                className="action-btn"
                                style={{ background: '#dbeafe', color: '#2563eb' }}
                                onClick={() => handleStatusChange(task.id, 'in_progress')}
                                title="Mulai Dikerjakan"
                              >
                                <Clock size={16} />
                              </button>
                            )}
                            {(task.status === 'in_progress' || task.status === 'pending') && (
                              <button
                                className="action-btn"
                                style={{ background: '#dcfce7', color: '#16a34a' }}
                                onClick={() => handleStatusChange(task.id, 'completed')}
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyTasksPage;
