import React, { useState, useEffect } from 'react';
import { GitBranch, Plus, RefreshCw, Workflow, Edit, Trash2, User, ToggleLeft, ToggleRight } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { organizationService } from '@/features/organization/api/organization.service';
import { ApprovalFlowModal } from '@/features/organization/components/ApprovalFlowModal';
import { getAllRoles } from '@/features/admin/api/admin.service';
import { showToast } from '@/shared/ui/toast';
import '@/shared/styles/CrudPage.css';
import '@/pages/dashboard/overview/OverviewPage.css';
import '@/pages/payroll/PayrollShared.css';
import './ApprovalFlowPage.css';

const ApprovalFlowPage: React.FC = () => {
  const [flows, setFlows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editFlow, setEditFlow] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [roles, setRoles] = useState<any[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await organizationService.getApprovalFlows();
      const rawFlows = Array.isArray(data) ? data : data.data || [];
      setFlows(rawFlows);
    } catch (err: any) {
      showToast(err.message || 'Gagal memuat data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await getAllRoles();
      setRoles(res.items || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
    fetchRoles();
  }, []);

  const handleSave = async (data: any) => {
    try {
      await organizationService.createApprovalFlow(data);
      showToast('Approval flow berhasil dibuat', 'success');
      fetchData();
    } catch (err: any) {
      showToast(err.message || 'Gagal membuat approval flow', 'error');
    }
  };

  const handleUpdate = async (data: any) => {
    if (!editFlow) return;
    try {
      await organizationService.updateApprovalFlow(editFlow.id, data);
      setEditFlow(null);
      showToast('Approval flow berhasil diperbarui', 'success');
      fetchData();
    } catch (err: any) {
      showToast(err.message || 'Gagal memperbarui approval flow', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      await organizationService.deleteApprovalFlow(deleteTarget.id);
      showToast('Approval flow berhasil dihapus', 'success');
      setDeleteTarget(null);
      fetchData();
    } catch (err: any) {
      showToast(err.message || 'Gagal menghapus approval flow', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const toggleActive = async (flow: any) => {
    try {
      await organizationService.updateApprovalFlow(flow.id, { ...flow, is_active: !flow.is_active });
      showToast(`Flow ${flow.is_active ? 'dinonaktifkan' : 'diaktifkan'}`, 'success');
      fetchData();
    } catch (err: any) {
      showToast(err.message || 'Gagal mengubah status', 'error');
    }
  };

  const openCreate = () => {
    setEditFlow(null);
    setIsModalOpen(true);
  };

  const openEdit = (flow: any) => {
    setEditFlow(flow);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditFlow(null);
  };

  const filteredFlows = flows.filter(flow => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || flow.name?.toLowerCase().includes(q) || flow.module?.toLowerCase().includes(q);
    const matchesModule = moduleFilter === 'all' || flow.module === moduleFilter;
    return matchesSearch && matchesModule;
  });

  const getRoleName = (roleId: number) => {
    const role = roles.find(r => r.id === roleId);
    return role?.display_name || role?.name || `Role #${roleId}`;
  };

  const getUserName = (user: any) => {
    if (!user) return null;
    return user.name || user.email || `User #${user.id}`;
  };

  const moduleOptions = [
    { value: 'all', label: 'All Modules' },
    { value: 'assignment_letter', label: 'Assignment Letters' },
    { value: 'leave', label: 'Leave Requests' },
    { value: 'reimbursement', label: 'Reimbursements' },
    { value: 'overtime', label: 'Overtime' },
    { value: 'promotion', label: 'Promotion Requests' },
    { value: 'training', label: 'Training Requests' },
    { value: 'document', label: 'Documents' },
    { value: 'asset_assignment', label: 'Asset Assignments' },
    { value: 'shift_swap', label: 'Shift Swaps' },
    { value: 'payroll', label: 'Payroll' },
    { value: 'kpi', label: 'KPI' },
    { value: 'benefit_assignment', label: 'Benefit Assignments' },
  ];

  return (
    <div className="crud-page">
      <Card className="hero-card">
        <div className="hero-card-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <Workflow size={16} />
              <span>System Configuration</span>
            </div>
            <h1 className="hero-title">Approval Flows</h1>
            <p className="hero-subtitle">
              Define multi-level approval workflows for organizational modules.
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn-outline" onClick={fetchData}>
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
            <button className="btn-primary" onClick={openCreate}>
              <Plus size={16} />
              New Flow
            </button>
          </div>
        </div>
      </Card>

      <div className="approval-filter-bar">
        <div className="approval-filter-group">
          <input
            type="text"
            placeholder="Search by name or module..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
            style={{ width: '260px' }}
          />
          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="form-input"
            style={{ width: '180px' }}
          >
            {moduleOptions.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="approval-empty-state">
          <p>Loading...</p>
        </div>
      ) : filteredFlows.length === 0 ? (
        <div className="approval-empty-state">
          <GitBranch size={48} style={{ opacity: 0.3 }} />
          <p>No approval flows found</p>
        </div>
      ) : (
        <div>
          <span className="approval-count">{filteredFlows.length} flows</span>

          {filteredFlows.map((flow) => (
            <div key={flow.id} className="approval-flow-card">
              <div className="approval-flow-header">
                <div className="approval-flow-info">
                  <span className="approval-flow-id">#{flow.id}</span>
                  <h4 className="approval-flow-name">{flow.name}</h4>
                  <span className="approval-flow-module">{flow.module?.replace(/_/g, ' ')}</span>
                </div>
                <span className={`approval-flow-badge ${flow.is_active ? 'active' : 'inactive'}`}>
                  {flow.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="approval-flow-body">
                {flow.steps && flow.steps.length > 0 && (
                  <>
                    <p className="approval-steps-title">Approval Steps</p>
                    {flow.steps.map((step: any, idx: number) => {
                      const assignedUser = step.user || step.user_id;
                      const userName = assignedUser && typeof assignedUser === 'object' ? getUserName(assignedUser) : null;
                      return (
                        <div key={idx} className="approval-step-row">
                          <div className="approval-step-indicator">
                            <div className="approval-step-dot">{idx + 1}</div>
                            {idx < flow.steps.length - 1 && <div className="approval-step-line" />}
                          </div>
                          <div className="approval-step-content">
                            <p className="approval-step-role">{getRoleName(step.role_id)}</p>
                            {userName && (
                              <p className="approval-step-user"><User size={12} /> {userName}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>

              <div className="approval-flow-actions">
                <button className="btn-outline" onClick={() => openEdit(flow)}>
                  <Edit size={14} /> Edit
                </button>
                <button className="btn-outline" style={{ color: '#ef4444', borderColor: '#fecaca' }} onClick={() => setDeleteTarget(flow)}>
                  <Trash2 size={14} /> Delete
                </button>
                <button className="btn-outline" onClick={() => toggleActive(flow)}>
                  {flow.is_active ? <ToggleLeft size={14} /> : <ToggleRight size={14} />}
                  {flow.is_active ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ApprovalFlowModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditFlow(null); }}
        onSave={editFlow ? handleUpdate : handleSave}
        editData={editFlow}
        existingFlows={flows}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Hapus Approval Flow"
        message={`Approval flow "${String(deleteTarget?.name || "ini")}" akan dihapus. Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus"
        cancelLabel="Batal"
        loading={deleting}
        onConfirm={() => void handleDelete()}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default ApprovalFlowPage;
