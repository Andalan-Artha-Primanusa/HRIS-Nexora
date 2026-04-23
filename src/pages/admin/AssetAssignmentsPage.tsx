import React, { useState, useEffect } from 'react';
import { Plus, RefreshCw, User, Calendar, MapPin, Box, FileText } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { assetService } from '@/features/assets/api/asset.service';
import { AssignAssetModal } from '@/features/assets/components/AssignAssetModal';
import { ReturnAssetModal } from '@/features/assets/components/ReturnAssetModal';
import '@/shared/styles/CrudPage.css';

const AssetAssignmentsPage: React.FC = () => {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [returnTarget, setReturnTarget] = useState<{ id: string | number; name: string } | null>(null);
  const [returning, setReturning] = useState(false);

  const extract = (res: any): any[] => {
    if (Array.isArray(res)) return res;
    if (res && typeof res === 'object') {
      if (Array.isArray(res.data)) return res.data;
      if (Array.isArray(res.items)) return res.items;
      if (res.data && typeof res.data === 'object') {
        if (Array.isArray(res.data.items)) return res.data.items;
        if (Array.isArray(res.data.data)) return res.data.data;
      }
    }
    return [];
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [assignmentsRes, assetsRes] = await Promise.all([
        assetService.getAssignments(),
        assetService.getAssets(),
      ]);
      setAssignments(extract(assignmentsRes));
      setAssets(extract(assetsRes));
    } catch (err) {
      console.error(err);
      setAssignments([]);
      setAssets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAssign = async (formData: any) => {
    await assetService.assignAsset(formData.asset_id, {
      employee_id: formData.employee_id,
      assignment_note: formData.assignment_note,
      assigned_at: formData.assigned_at,
    });
    fetchData();
  };

  const handleReturn = async (data: { return_note: string; returned_at: string; condition: string }) => {
    if (!returnTarget) return;
    setReturning(true);
    try {
      await assetService.returnAsset(returnTarget.id, data);
      setReturnTarget(null);
      fetchData();
    } catch (err) {
      console.error('Failed to return asset', err);
    } finally {
      setReturning(false);
    }
  };

  return (
    <div className="crud-page">
      <div className="crud-header" style={{ marginBottom: '2.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="reimb-badge reimb-badge-admin" style={{ margin: 0 }}>Inventory</span>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>•</span>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>{assignments.length} Active Assignments</span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#1e293b', marginBottom: '0.5rem' }}>Asset Assignments</h1>
          <p style={{ color: '#64748b', fontSize: '1rem' }}>Track and manage all company property checked out to employees.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.85rem' }}>
          <Button variant="ghost" onClick={fetchData} style={{ padding: '12px', borderRadius: '12px' }}>
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </Button>
          <Button
            variant="primary"
            onClick={() => setIsAssignModalOpen(true)}
            style={{ padding: '0 20px', height: '48px', borderRadius: '12px', fontWeight: 600, boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)' }}
          >
            <Plus size={20} style={{ marginRight: '8px' }} />
            Create Assignment
          </Button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem', color: '#64748b' }}>
          <RefreshCw size={40} className="animate-spin" style={{ marginBottom: '1rem', opacity: 0.4 }} />
          <p>Loading assignments...</p>
        </div>
      ) : assignments.length === 0 ? (
        <Card glass style={{ textAlign: 'center', padding: '5rem' }}>
          <Box size={48} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
          <h3 style={{ color: '#475569' }}>No active assignments</h3>
          <p style={{ color: '#94a3b8' }}>Create an assignment to start tracking company property.</p>
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
          {assignments.map((assignment) => {
            const isReturned = !!assignment.returned_at;
            return (
              <Card key={assignment.id} glass style={{ padding: '0', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(226,232,240,0.5)' }}>
                <div style={{ padding: '1.75rem' }}>
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', gap: '14px' }}>
                      <div style={{ padding: '12px', background: 'linear-gradient(135deg, #f5f3ff, #ede9fe)', borderRadius: '14px', color: '#8b5cf6' }}>
                        <Box size={22} />
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>
                          {assignment.asset?.name || 'Unknown Asset'}
                        </h3>
                        <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
                          S/N: {assignment.asset?.serial_number || 'N/A'}
                        </div>
                      </div>
                    </div>
                    <span style={{
                      padding: '6px 14px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700,
                      textTransform: 'uppercase', letterSpacing: '0.02em',
                      background: isReturned ? '#dcfce7' : '#fef3c7',
                      color: isReturned ? '#16a34a' : '#d97706'
                    }}>
                      {isReturned ? 'Returned' : 'Active'}
                    </span>
                  </div>

                  {/* Details */}
                  <div style={{ background: 'rgba(248,250,252,0.6)', borderRadius: '16px', padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.875rem' }}>
                      <User size={15} color="#94a3b8" />
                      <span style={{ color: '#64748b', minWidth: '80px' }}>Assignee</span>
                      <span style={{ fontWeight: 600, color: '#1e293b' }}>
                        {assignment.employee?.user?.name || assignment.employee?.full_name || assignment.employee?.name || 'Unknown'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.875rem' }}>
                      <Calendar size={15} color="#94a3b8" />
                      <span style={{ color: '#64748b', minWidth: '80px' }}>Assigned</span>
                      <span style={{ fontWeight: 600, color: '#1e293b' }}>
                        {assignment.assigned_at || assignment.assignment_date || assignment.created_at?.split('T')[0] || 'N/A'}
                      </span>
                    </div>
                    {assignment.location && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.875rem' }}>
                        <MapPin size={15} color="#94a3b8" />
                        <span style={{ color: '#64748b', minWidth: '80px' }}>Location</span>
                        <span style={{ fontWeight: 600, color: '#1e293b' }}>{assignment.location?.name || 'N/A'}</span>
                      </div>
                    )}
                    {assignment.assignment_note && (
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.875rem' }}>
                        <FileText size={15} color="#94a3b8" style={{ marginTop: '2px' }} />
                        <span style={{ color: '#64748b', minWidth: '80px' }}>Note</span>
                        <span style={{ color: '#475569', fontStyle: 'italic', flex: 1 }}>{assignment.assignment_note}</span>
                      </div>
                    )}
                  </div>

                  {/* Action */}
                  {!isReturned && (
                    <Button
                      variant="outline"
                      style={{ width: '100%', height: '44px', borderRadius: '12px', fontWeight: 600 }}
                      onClick={() => setReturnTarget({ id: assignment.id, name: assignment.asset?.name || 'Asset' })}
                    >
                      Process Return
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <AssignAssetModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onSave={handleAssign}
        assets={assets.filter(a => a.status?.toLowerCase() === 'available')}
      />

      <ReturnAssetModal
        isOpen={!!returnTarget}
        onClose={() => setReturnTarget(null)}
        onConfirm={handleReturn}
        assetName={returnTarget?.name}
        loading={returning}
      />
    </div>
  );
};

export default AssetAssignmentsPage;
