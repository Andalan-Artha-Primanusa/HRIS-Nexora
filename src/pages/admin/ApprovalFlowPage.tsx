import React, { useState, useEffect } from 'react';
import { GitBranch, Plus, RefreshCw, Trash2, Edit, ChevronRight, User, Search } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { organizationService } from '@/features/organization/api/organization.service';
import { ApprovalFlowModal } from '@/features/organization/components/ApprovalFlowModal';
import '@/shared/styles/CrudPage.css';

const ApprovalFlowPage: React.FC = () => {
  const [flows, setFlows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [moduleFilter, setModuleFilter] = useState('all');

  const parseSteps = (steps: any) => {
    if (typeof steps === 'string') {
      try {
        return JSON.parse(steps);
      } catch (e) {
        return [];
      }
    }
    return Array.isArray(steps) ? steps : [];
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await organizationService.getApprovalFlows();
      const rawFlows = Array.isArray(data) ? data : data.data || [];
      const processedFlows = rawFlows.map((f: any) => ({
        ...f,
        steps: parseSteps(f.steps)
      }));
      setFlows(processedFlows);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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

  return (
    <div className="crud-page">
      <div className="crud-header">
        <div>
          <span className="reimb-badge reimb-badge-admin">System Configuration</span>
          <h1>Approval Flows</h1>
          <p>Define multi-level approval workflows for organizational modules.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input 
              type="text" 
              placeholder="Search flows..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ 
                padding: '10px 16px 10px 40px', borderRadius: '12px', border: '1px solid #e2e8f0', 
                fontSize: '0.9rem', width: '240px', outline: 'none', background: 'white' 
              }}
            />
            <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px' }} />
          </div>
          <select 
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            style={{ padding: '10px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.9rem', outline: 'none', background: 'white' }}
          >
            <option value="all">All Modules</option>
            <option value="assignment_letter">Assignment Letters</option>
            <option value="leave">Leave Requests</option>
            <option value="reimbursement">Reimbursements</option>
            <option value="overtime">Overtime</option>
          </select>
          <div style={{ width: '1px', height: '24px', background: '#e2e8f0', margin: '0 4px' }}></div>
          <Button variant="ghost" onClick={fetchData}>
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </Button>
          <Button variant="primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} style={{ marginRight: '8px' }} />
            New Flow
          </Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '2rem', marginTop: '2.5rem' }}>
        {filteredFlows.length === 0 && !loading ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '6rem', background: 'rgba(255,255,255,0.4)', borderRadius: '32px', border: '2px dashed #cbd5e1', backdropFilter: 'blur(10px)' }}>
             <div style={{ padding: '24px', background: '#f8fafc', borderRadius: '50%', width: 'fit-content', margin: '0 auto 1.5rem' }}>
                <GitBranch size={48} color="#94a3b8" style={{ opacity: 0.5 }} />
             </div>
             <h3 style={{ color: '#1e293b', fontSize: '1.25rem', fontWeight: 700 }}>No approval flows found</h3>
             <p style={{ color: '#64748b', maxWidth: '400px', margin: '0.5rem auto 2rem' }}>Try adjusting your filters or search query.</p>
             <Button variant="primary" onClick={() => { setSearchQuery(''); setModuleFilter('all'); }}>Clear Filters</Button>
          </div>
        ) : filteredFlows.map((flow) => (
          <Card key={flow.id} glass style={{ padding: '0', borderRadius: '28px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.6)', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02)' }}>
            <div style={{ padding: '1.75rem', background: 'linear-gradient(to bottom right, rgba(255,255,255,0.8), rgba(255,255,255,0.4))' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                 <div>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#1e293b', letterSpacing: '-0.02em' }}>{flow.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                       <span style={{ 
                         padding: '4px 10px', background: '#e0e7ff', color: '#4338ca', borderRadius: '8px', 
                         fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' 
                       }}>
                         {flow.module?.replace('_', ' ')}
                       </span>
                       <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>ID: #{flow.id}</span>
                    </div>
                 </div>
                 <div style={{ display: 'flex', gap: '8px' }}>
                   <Button variant="ghost" size="sm" style={{ width: '36px', height: '36px', padding: 0, borderRadius: '10px' }}><Edit size={16} /></Button>
                   <Button variant="ghost" size="sm" style={{ width: '36px', height: '36px', padding: 0, borderRadius: '10px', color: '#ef4444', background: '#fef2f2' }}><Trash2 size={16} /></Button>
                 </div>
              </div>

              <div style={{ position: 'relative', paddingLeft: '12px' }}>
                 {/* Vertical Connector Line */}
                 <div style={{ position: 'absolute', left: '23px', top: '20px', bottom: '20px', width: '2px', background: 'linear-gradient(to bottom, #6366f1, #e2e8f0)', opacity: 0.3 }}></div>

                 <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {flow.steps?.map((step: any, index: number) => (
                      <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', position: 'relative', zIndex: 1 }}>
                         <div style={{ 
                           width: '24px', height: '24px', borderRadius: '50%', 
                           background: '#6366f1', color: 'white', display: 'flex', 
                           alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800,
                           boxShadow: '0 0 0 4px rgba(99, 102, 241, 0.1)'
                         }}>
                           {index + 1}
                         </div>
                         <div style={{ 
                           flex: 1, padding: '0.85rem 1.25rem', background: 'white', 
                           borderRadius: '16px', border: '1px solid #f1f5f9', 
                           display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                           boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                         }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                               <div style={{ padding: '8px', background: '#f8fafc', borderRadius: '10px' }}>
                                  <User size={14} color="#6366f1" />
                               </div>
                               <div>
                                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>
                                    {typeof step.role === 'object' && step.role !== null
                                      ? (step.role.display_name || step.role.name || `Role ${step.role_id}`)
                                      : `Role ${step.role_id}`}
                                  </div>
                                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Level {index + 1} Approver</div>
                               </div>
                            </div>
                            <ChevronRight size={14} color="#cbd5e1" />
                         </div>
                      </div>
                    ))}
                 </div>
              </div>

              <div style={{ marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(226,232,240,0.5)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Active Workflow</span>
                 </div>
                 <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Last updated: {flow.updated_at?.split('T')[0] || 'Recently'}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <ApprovalFlowModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSave} 
      />
    </div>
  );
};

export default ApprovalFlowPage;
