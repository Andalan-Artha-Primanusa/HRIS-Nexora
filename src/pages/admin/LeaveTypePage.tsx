import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Calendar,
  Info,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  RefreshCw,
  FileText,
  Settings,
  ShieldCheck
} from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { api } from '@/shared/api/httpClient';
import './AdminLeavePages.css';

interface LeaveType {
  id: number;
  name: string;
  code: string;
  description: string;
  is_paid: boolean;
  is_active: boolean;
  created_at?: string;
}

const LeaveTypePage: React.FC = () => {
  const [types, setTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchTypes = async () => {
    setLoading(true);
    console.log('Fetching leave types from /leave-types...');
    try {
      const response = await api.get('/leave-types');
      console.log('Leave Types Response Raw:', response);
      
      let data = response.data;
      if (data && typeof data === 'object') {
        if (Array.isArray(data.data)) data = data.data;
        else if (data.data && Array.isArray(data.data.data)) data = data.data.data;
        else if (Array.isArray(data.items)) data = data.items;
        else if (data.status === 'success' && Array.isArray(data.data)) data = data.data;
      }
      
      setTypes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching leave types:', error);
      setTypes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTypes();
  }, []);

  const filteredTypes = types.filter(t => 
    t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="admin-leave-page">
      <div className="admin-leave-header">
        <div>
          <span className="policy-badge policy-badge-paid" style={{ marginBottom: '1rem', background: 'linear-gradient(135deg, #2563eb, #1e40af)', color: 'white', border: 'none' }}>
            <Settings size={14} /> Master Data
          </span>
          <h1>Daftar Jenis Cuti</h1>
          <p>Kelola kategori cuti utama (Tahunan, Sakit, dsb) untuk seluruh perusahaan.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
           <Button variant="outline" size="md" onClick={fetchTypes} disabled={loading}>
             <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
             Segarkan
           </Button>
           <Button variant="primary" size="md" onClick={() => window.location.href = '/leave/type/create'}>
             <Plus size={20} />
             Tambah Jenis Cuti
           </Button>
        </div>
      </div>

      <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input 
            type="text" 
            placeholder="Cari berdasarkan nama atau kode..." 
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 12px 12px 48px',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              background: 'white',
              fontSize: '0.95rem',
              outline: 'none',
              transition: 'all 0.2s'
            }}
          />
        </div>
      </div>

      <Card glass style={{ padding: '0', borderRadius: '24px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="leave-type-table">
            <thead>
              <tr>
                <th>Nama Cuti</th>
                <th>Kode</th>
                <th>Deskripsi</th>
                <th>Tipe Pembayaran</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '4rem' }}>
                    <RefreshCw size={32} className="animate-spin" color="#2563eb" />
                    <p style={{ marginTop: '1rem', color: '#64748b' }}>Memuat data...</p>
                  </td>
                </tr>
              ) : filteredTypes.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
                    Belum ada jenis cuti yang terdaftar.
                  </td>
                </tr>
              ) : filteredTypes.map((type) => (
                <tr key={type.id} className="leave-policy-row">
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ 
                        width: '40px', 
                        height: '40px', 
                        borderRadius: '12px', 
                        background: type.is_paid ? '#eff6ff' : '#fff1f2', 
                        color: type.is_paid ? '#2563eb' : '#e11d48',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Calendar size={20} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: '#1e293b' }}>{type.name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Terdaftar pada {type.created_at ? new Date(type.created_at).toLocaleDateString() : '-'}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="policy-code">{type.code}</span>
                  </td>
                  <td style={{ maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {type.description || '-'}
                  </td>
                  <td>
                    <span className={`policy-badge ${type.is_paid ? 'policy-badge-paid' : 'policy-badge-unpaid'}`}>
                      {type.is_paid ? 'Paid' : 'Unpaid'}
                    </span>
                  </td>
                  <td>
                    <span className={`status-pill ${type.is_active ? 'status-active' : 'status-inactive'}`} style={{ 
                      padding: '4px 12px', 
                      borderRadius: '20px', 
                      fontSize: '0.75rem', 
                      fontWeight: 700,
                      background: type.is_active ? '#dcfce7' : '#f1f5f9',
                      color: type.is_active ? '#16a34a' : '#64748b'
                    }}>
                      {type.is_active ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="action-btn-group">
                      <button 
                        className="action-btn action-btn-edit" 
                        onClick={() => window.location.href = `/leave/type/edit/${type.id}`}
                        title="Edit Jenis Cuti"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        className="action-btn action-btn-delete" 
                        onClick={() => {
                          if (window.confirm('Hapus jenis cuti ini?')) {
                            void api.delete(`/leave-types/${type.id}`).then(() => void fetchTypes());
                          }
                        }}
                        title="Hapus Jenis Cuti"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      
      <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
        <Card glass style={{ padding: '1.5rem', borderRadius: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
            <div style={{ padding: '8px', borderRadius: '10px', background: '#f0fdf4', color: '#16a34a' }}>
              <ShieldCheck size={20} />
            </div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Auto-Renewal</h3>
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>
            Leave balances are automatically reset and updated based on policy cycles.
          </p>
        </Card>
        
        <Card glass style={{ padding: '1.5rem', borderRadius: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
            <div style={{ padding: '8px', borderRadius: '10px', background: '#eff6ff', color: '#2563eb' }}>
              <FileText size={20} />
            </div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Prorated Logic</h3>
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>
            New employees receive prorated leave amounts based on their join date.
          </p>
        </Card>

        <Card glass style={{ padding: '1.5rem', borderRadius: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
            <div style={{ padding: '8px', borderRadius: '10px', background: '#fff7ed', color: '#ea580c' }}>
              <Calendar size={20} />
            </div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Carryover Rules</h3>
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>
            Unused leave can be carried over to the next period as per policy limits.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default LeaveTypePage;
