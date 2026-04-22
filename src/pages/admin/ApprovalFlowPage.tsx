import React, { useState, useEffect } from 'react';
import { GitBranch, Plus, RefreshCw, Trash2, Edit, Save, X, ChevronRight, User } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { organizationService } from '@/features/organization/api/organization.service';

const ApprovalFlowPage: React.FC = () => {
  const [flows, setFlows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await organizationService.getApprovalFlows();
      setFlows(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="crud-page">
      <div className="crud-header">
        <div>
          <span className="reimb-badge reimb-badge-admin">System Configuration</span>
          <h1>Approval Flows</h1>
          <p>Define multi-level approval workflows for Leave, Reimbursement, and Overtime.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="ghost" onClick={fetchData}>
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </Button>
          <Button variant="primary">
            <Plus size={18} style={{ marginRight: '8px' }} />
            Create New Flow
          </Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        {flows.length === 0 ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', background: 'white', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
             <GitBranch size={48} color="#94a3b8" style={{ marginBottom: '1rem', opacity: 0.3 }} />
             <p style={{ color: '#64748b' }}>No approval flows defined. Start by creating one for Leave or Reimbursement.</p>
          </div>
        ) : flows.map((flow) => (
          <Card key={flow.id} glass style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
               <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e3a8a' }}>{flow.name}</h3>
               <div style={{ display: 'flex', gap: '0.5rem' }}>
                 <Button variant="ghost" size="sm"><Edit size={16} /></Button>
                 <Button variant="ghost" size="sm" style={{ color: '#ef4444' }}><Trash2 size={16} /></Button>
               </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
               {flow.steps?.map((step: any, index: number) => (
                 <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ 
                      width: '32px', 
                      height: '32px', 
                      borderRadius: '50%', 
                      background: '#eff6ff', 
                      color: '#2563eb', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      border: '1px solid #dbeafe'
                    }}>
                      {index + 1}
                    </div>
                    <div style={{ flex: 1, padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <User size={14} color="#64748b" />
                          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{step.approver_role || 'Manager'}</span>
                       </div>
                       <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{step.action || 'Approval Required'}</span>
                    </div>
                    {index < flow.steps.length - 1 && (
                      <ChevronRight size={16} color="#cbd5e1" />
                    )}
                 </div>
               ))}
            </div>

            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Applies to: <strong>{flow.module}</strong></span>
               <span className="status-pill status-approved">Active</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ApprovalFlowPage;
