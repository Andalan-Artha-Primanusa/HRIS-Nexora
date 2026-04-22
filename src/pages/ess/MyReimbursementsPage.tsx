import React, { useState, useEffect } from 'react';
import { Plus, RefreshCw, Filter } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { 
  getMyReimbursements, 
  createMyReimbursement, 
  updateReimbursement, 
  deleteReimbursement, 
  submitMyReimbursement,
  getReimbursementStatistics
} from '../../features/reimbursement/api/reimbursement.service';
import { ReimbursementTable } from '../../features/reimbursement/components/ReimbursementTable';
import { ReimbursementModal } from '../../features/reimbursement/components/ReimbursementModal';
import { ReimbursementDetailModal } from '../../features/reimbursement/components/ReimbursementDetailModal';
import { ReimbursementStats } from '../../features/reimbursement/components/ReimbursementStats';
import type { ReimbursementItem } from '../../features/reimbursement/types/reimbursement.types';
import '../../features/reimbursement/Reimbursement.css';

const MyReimbursementsPage: React.FC = () => {
  const [items, setItems] = useState<ReimbursementItem[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ReimbursementItem | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [reimbData, statsData] = await Promise.all([
        getMyReimbursements(filterStatus),
        getReimbursementStatistics()
      ]);
      setItems(reimbData.items);
      setStats(statsData.payload);
    } catch (error) {
      console.error('Failed to fetch reimbursements:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterStatus]);

  const handleOpenCreate = () => {
    setSelectedItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: ReimbursementItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleOpenDetail = (item: ReimbursementItem) => {
    setSelectedItem(item);
    setIsDetailOpen(true);
  };

  const handleSave = async (data: any) => {
    try {
      if (selectedItem) {
        await updateReimbursement(String(selectedItem.id), data);
      } else {
        await createMyReimbursement(data);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Failed to save reimbursement:', error);
    }
  };

  const handleDelete = async (item: ReimbursementItem) => {
    if (window.confirm('Are you sure you want to delete this draft?')) {
      try {
        await deleteReimbursement(String(item.id));
        fetchData();
      } catch (error) {
        console.error('Failed to delete reimbursement:', error);
      }
    }
  };

  const handleSubmit = async (item: ReimbursementItem) => {
    if (window.confirm('Submit this reimbursement for approval?')) {
      try {
        await submitMyReimbursement(String(item.id));
        fetchData();
      } catch (error) {
        console.error('Failed to submit reimbursement:', error);
      }
    }
  };

  return (
    <div className="reimbursement-container">
      <div className="reimb-header">
        <div className="reimb-title-section">
          <span className="reimb-badge reimb-badge-ess">ESS Module</span>
          <h1>My Reimbursements</h1>
          <p>Track and manage your expense claims.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="ghost" onClick={fetchData} disabled={loading}>
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </Button>
          <Button variant="primary" onClick={handleOpenCreate}>
            <Plus size={18} style={{ marginRight: '8px' }} />
            New Claim
          </Button>
        </div>
      </div>

      {stats && <ReimbursementStats stats={stats} />}

      <Card className="crud-card" glass style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Filter size={18} color="#64748b" />
            <select 
              className="form-control" 
              style={{ width: '200px', padding: '0.5rem' }}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="paid">Paid</option>
            </select>
          </div>
          <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
            Showing {items.length} records
          </span>
        </div>

        <ReimbursementTable 
          items={items} 
          onView={handleOpenDetail}
          onEdit={handleOpenEdit}
          onDelete={handleDelete}
          onSubmit={handleSubmit}
        />
      </Card>

      <ReimbursementModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={selectedItem}
      />

      <ReimbursementDetailModal 
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        item={selectedItem}
      />
    </div>
  );
};

export default MyReimbursementsPage;
