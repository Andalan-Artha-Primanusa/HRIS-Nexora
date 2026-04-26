import React, { useState, useEffect, useMemo } from 'react';
import { Plus, RefreshCw, Filter, Search, BarChart3, Wallet, Receipt } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { 
  getAllReimbursements, 
  createReimbursement, 
  updateReimbursement, 
  deleteReimbursement, 
  approveReimbursement,
  rejectReimbursement,
  markReimbursementAsPaid,
  getReimbursementStatistics
} from '../../features/reimbursement/api/reimbursement.service';
import { api } from '@/shared/api/httpClient';
import { ReimbursementTable } from '../../features/reimbursement/components/ReimbursementTable';
import { ReimbursementModal } from '../../features/reimbursement/components/ReimbursementModal';
import { ReimbursementDetailModal } from '../../features/reimbursement/components/ReimbursementDetailModal';
import { ReimbursementStats } from '../../features/reimbursement/components/ReimbursementStats';
import type { ReimbursementItem } from '../../features/reimbursement/types/reimbursement.types';
import '../../features/reimbursement/Reimbursement.css';
import '@/shared/styles/CrudPage.css';
import '@/pages/dashboard/overview/OverviewPage.css';
import '@/pages/payroll/PayrollShared.css';

const AdminReimbursementsPage: React.FC = () => {
  const [items, setItems] = useState<ReimbursementItem[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ReimbursementItem | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [reimbData, statsData, empRes] = await Promise.all([
        getAllReimbursements({ status: filterStatus }),
        getReimbursementStatistics(),
        api.get('/employees')
      ]);
      setItems(reimbData.items);
      setStats(statsData.payload);
      
      // Extract employee list for the create modal
      const empData = empRes.data?.data || empRes.data || [];
      setEmployees(Array.isArray(empData) ? empData : []);
    } catch (error) {
      console.error('Failed to fetch admin reimbursements:', error);
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
        await createReimbursement(data);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Failed to save reimbursement:', error);
    }
  };

  const handleDelete = async (item: ReimbursementItem) => {
    if (window.confirm('Are you sure you want to delete this reimbursement draft?')) {
      try {
        await deleteReimbursement(String(item.id));
        fetchData();
      } catch (error) {
        console.error('Failed to delete reimbursement:', error);
      }
    }
  };

  const handleApprove = async (id: string, note?: string) => {
    try {
      await approveReimbursement(id, { note });
      setIsDetailOpen(false);
      fetchData();
    } catch (error) {
      console.error('Failed to approve:', error);
    }
  };

  const handleReject = async (id: string, note: string) => {
    try {
      await rejectReimbursement(id, { note });
      setIsDetailOpen(false);
      fetchData();
    } catch (error) {
      console.error('Failed to reject:', error);
    }
  };

  const handleMarkPaid = async (id: string) => {
    try {
      await markReimbursementAsPaid(id);
      setIsDetailOpen(false);
      fetchData();
    } catch (error) {
      console.error('Failed to mark as paid:', error);
    }
  };

  const categoryData = useMemo(() => {
    const m = new Map<string, number>();
    items.forEach(item => {
      const cat = String(item.category || 'other');
      m.set(cat, (m.get(cat) || 0) + 1);
    });
    return Array.from(m.entries()).map(([name, value]) => ({ name, value }));
  }, [items]);

  const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  const filteredItems = useMemo(() => {
    return items.filter((item: any) => {
      const q = searchQuery.toLowerCase();
      const title = String(item.title || '').toLowerCase();
      const reason = String(item.reason || '').toLowerCase();
      const empName = String(item.employee?.full_name || item.employee_name || '').toLowerCase();
      
      const matchesSearch = title.includes(q) || reason.includes(q) || empName.includes(q);
      const matchesStatus = !filterStatus || item.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    });
  }, [items, searchQuery, filterStatus]);

  return (
    <div className="reimbursement-container">
      <Card className="hero-card">
        <div className="hero-card-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <Wallet size={16} />
              <span>Pusat Admin</span>
            </div>
            <h1 className="hero-title">Pengelolaan Imbalan</h1>
            <p className="hero-subtitle">
              Tinjau, setujui, dan kelola klaim imbalan di seluruh perusahaan.
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn-outline" onClick={fetchData} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Segarkan
            </button>
            <button className="btn-primary" onClick={handleOpenCreate}>
              <Plus size={16} />
              Entri Baru
            </button>
          </div>
        </div>
      </Card>

      {stats && <ReimbursementStats stats={stats} />}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '1.5rem', alignItems: 'start' }}>
        <Card className="crud-card" glass style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '300px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Search by title, name, or ID..." 
                  style={{ paddingLeft: '40px', width: '100%' }}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Filter size={18} color="#64748b" />
                <select 
                  className="form-control" 
                  style={{ width: '160px', padding: '0.5rem' }}
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
            </div>
          </div>

          <ReimbursementTable 
            items={filteredItems} 
            onView={handleOpenDetail}
            onEdit={handleOpenEdit}
            onDelete={handleDelete}
            isAdmin={true}
          />
        </Card>

        <Card glass style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <BarChart3 size={18} color="#2563eb" />
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#1e3a8a' }}>By Category</h3>
          </div>
          
          <div style={{ height: '300px', width: '100%', position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                    fontSize: '0.8rem'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ 
              position: 'absolute', 
              top: '50%', 
              left: '50%', 
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              pointerEvents: 'none'
            }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b' }}>{items.length}</div>
              <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>Claims</div>
            </div>
          </div>
          
          <div style={{ 
            marginTop: 'auto', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '0.5rem', 
            paddingTop: '1.25rem', 
            borderTop: '1px solid #f1f5f9',
            maxHeight: '200px',
            overflowY: 'auto',
            paddingRight: '5px'
          }}>
            {categoryData.map((item, i) => (
              <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: COLORS[i % COLORS.length] }}></div>
                  <span style={{ color: '#475569', fontWeight: 500, fontSize: '0.75rem' }}>{item.name}</span>
                </div>
                <span style={{ color: '#1e293b', fontWeight: 600, fontSize: '0.75rem' }}>{item.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <ReimbursementModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={selectedItem}
        employees={employees}
        isAdmin={true}
      />

      <ReimbursementDetailModal 
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        item={selectedItem}
        onApprove={handleApprove}
        onReject={handleReject}
        onMarkPaid={handleMarkPaid}
        isAdmin={true}
      />
    </div>
  );
};

export default AdminReimbursementsPage;
