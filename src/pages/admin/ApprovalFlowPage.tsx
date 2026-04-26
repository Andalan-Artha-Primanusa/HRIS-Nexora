import React, { useState, useEffect } from 'react';
import { GitBranch, Plus, RefreshCw, Workflow, User } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { organizationService } from '@/features/organization/api/organization.service';
import { ApprovalFlowModal } from '@/features/organization/components/ApprovalFlowModal';
import { getAllRoles } from '@/features/admin/api/admin.service';
import '@/shared/styles/CrudPage.css';
import '@/pages/dashboard/overview/OverviewPage.css';
import '@/pages/payroll/PayrollShared.css';

const ApprovalFlowPage: React.FC = () => {
  const [flows, setFlows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [roles, setRoles] = useState<any[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await organizationService.getApprovalFlows();
      const rawFlows = Array.isArray(data) ? data : data.data || [];
      setFlows(rawFlows);
    } catch (err) {
      console.error(err);
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
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredFlows = flows.filter(flow => {
    const matchesSearch = flow.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesModule = moduleFilter === 'all' || flow.module === moduleFilter;
    return matchesSearch && matchesModule;
  });

  const getRoleName = (roleId: number) => {
    const role = roles.find(r => r.id === roleId);
    return role?.display_name || role?.name || `Role #${roleId}`;
  };

  const renderSteps = (steps: any[]) => {
    if (!steps || steps.length === 0) {
      return <span style={{ color: '#94a3b8', fontSize: '13px' }}>No steps</span>;
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {steps.map((step, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            {/* Dot + Line connector */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '32px', flexShrink: 0 }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#eff6ff',
                border: '2px solid #bfdbfe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1,
              }}>
                <User size={14} color="#1d4ed8" />
              </div>
              {idx < steps.length - 1 && (
                <div style={{
                  width: '2px',
                  flex: 1,
                  minHeight: '20px',
                  background: '#bfdbfe',
                  margin: '2px 0',
                }} />
              )}
            </div>

            {/* Step content card */}
            <div style={{
              background: '#f8faff',
              border: '0.5px solid #bfdbfe',
              borderRadius: '10px',
              padding: '10px 16px',
              flex: 1,
              marginBottom: idx < steps.length - 1 ? '12px' : 0,
            }}>
              <p style={{ fontSize: '11px', color: '#3b82f6', fontWeight: 600, margin: '0 0 2px 0' }}>
                Step {idx + 1}
              </p>
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#1e40af', margin: 0 }}>
                {getRoleName(step.role_id)}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="crud-page">
      {/* ===== HERO CARD (tidak diubah) ===== */}
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
            <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
              <Plus size={16} />
              New Flow
            </button>
          </div>
        </div>
      </Card>

      {/* ===== FILTER BAR ===== */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '16px 20px',
        border: '0.5px solid #e2e8f0',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <h3 style={{ fontSize: '13px', fontWeight: 500, color: '#1e293b', margin: 0 }}>Filters</h3>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            placeholder="Search flows..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="form-input"
          >
            <option value="all">All Modules</option>
            <option value="assignment_letter">Assignment Letters</option>
            <option value="leave">Leave Requests</option>
            <option value="reimbursement">Reimbursements</option>
            <option value="overtime">Overtime</option>
          </select>
        </div>
      </div>

      {/* ===== CONTENT AREA ===== */}
      {loading ? (
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '40px',
          border: '0.5px solid #e2e8f0',
          textAlign: 'center',
          color: '#94a3b8',
        }}>
          <p>Loading...</p>
        </div>
      ) : filteredFlows.length === 0 ? (
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '40px',
          border: '0.5px solid #e2e8f0',
          textAlign: 'center',
          color: '#94a3b8',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
        }}>
          <GitBranch size={48} style={{ opacity: 0.3 }} />
          <p>No approval flows found</p>
        </div>
      ) : (
        <div>
          {/* Count badge */}
          <div style={{ marginBottom: '12px', paddingLeft: '4px' }}>
            <span style={{
              display: 'inline-block',
              background: '#eff6ff',
              color: '#1d4ed8',
              fontSize: '12px',
              fontWeight: 500,
              padding: '3px 10px',
              borderRadius: '20px',
            }}>
              {filteredFlows.length} flows
            </span>
          </div>

          {/* Flow cards */}
          {filteredFlows.map((flow) => (
            <div
              key={flow.id}
              style={{
                background: 'white',
                borderRadius: '16px',
                padding: '20px 24px',
                border: '0.5px solid #e2e8f0',
                marginBottom: '14px',
              }}
            >
              {/* Card header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '20px',
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>#{flow.id}</span>
                  <h4 style={{ fontSize: '15px', fontWeight: 500, color: '#1e293b', margin: 0 }}>
                    {flow.name}
                  </h4>
                  <span style={{
                    display: 'inline-block',
                    background: '#eff6ff',
                    color: '#1d4ed8',
                    fontSize: '11px',
                    fontWeight: 500,
                    padding: '2px 8px',
                    borderRadius: '6px',
                    width: 'fit-content',
                  }}>
                    {flow.module}
                  </span>
                </div>
                <span style={{
                  fontSize: '12px',
                  fontWeight: 500,
                  padding: '4px 12px',
                  borderRadius: '20px',
                  background: flow.is_active ? '#dcfce7' : '#f1f5f9',
                  color: flow.is_active ? '#166534' : '#64748b',
                }}>
                  {flow.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Steps section */}
              <p style={{
                fontSize: '11px',
                fontWeight: 500,
                color: '#94a3b8',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                marginBottom: '14px',
                margin: '0 0 14px 0',
              }}>
                Approval Steps
              </p>
              {renderSteps(flow.steps)}
            </div>
          ))}
        </div>
      )}

      <ApprovalFlowModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
};

export default ApprovalFlowPage;