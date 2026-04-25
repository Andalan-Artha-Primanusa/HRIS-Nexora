import React, { useState, useEffect } from 'react';
import { Plus, RefreshCw, Filter, Wallet } from 'lucide-react';
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
import '@/pages/dashboard/overview/OverviewPage.css';
import '@/pages/payroll/PayrollShared.css';
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
      <Card className="hero-card">
        <div className="hero-card-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <Wallet size={16} />
              <span>Layanan Mandiri</span>
            </div>
            <h1 className="hero-title">Imbalan Saya</h1>
            <p className="hero-subtitle">
              Lacak dan kelola klaim pengeluaran Anda.
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn-outline" onClick={fetchData} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Segarkan
            </button>
            <button className="btn-primary" onClick={handleOpenCreate}>
              <Plus size={16} />
              Klaim Baru
            </button>
          </div>
        </div>
      </Card>

      <div className="white-unified-wrapper">
        <div className="wuw-header">
          <div className="wuw-header-top">
            <div className="wuw-title-area">
              <h3>Daftar Klaim</h3>
              <span className="wuw-count-badge">{items.length} klaim</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Filter size={18} color="#64748b" />
              <select 
                className="form-control" 
                style={{ width: '200px', padding: '0.5rem' }}
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">Semua Status</option>
                <option value="draft">Draft</option>
                <option value="submitted">Submitted</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          </div>
        </div>

        <ReimbursementTable 
          items={items} 
          onView={handleOpenDetail}
          onEdit={handleOpenEdit}
          onDelete={handleDelete}
          onSubmit={handleSubmit}
        />
      </div>

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
