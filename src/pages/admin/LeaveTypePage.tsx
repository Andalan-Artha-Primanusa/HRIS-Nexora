import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Calendar,
  Edit,
  Trash2,
  RefreshCw,
  FileText,
  ShieldCheck,
  CalendarDays
} from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { api } from '@/shared/api/httpClient';
import '@/shared/styles/CrudPage.css';
import '@/pages/dashboard/overview/OverviewPage.css';
import '@/pages/payroll/PayrollShared.css';
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
    <div className="crud-page">
      <Card className="hero-card">
        <div className="hero-card-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <CalendarDays size={16} />
              <span>Master Data</span>
            </div>
            <h1 className="hero-title">Daftar Jenis Cuti</h1>
            <p className="hero-subtitle">
              Kelola kategori cuti utama (Tahunan, Sakit, dsb) untuk seluruh perusahaan.
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn-outline" onClick={fetchTypes} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Segarkan
            </button>
            <button className="btn-primary" onClick={() => window.location.href = '/leave/type/create'}>
              <Plus size={16} />
              Tambah Jenis Cuti
            </button>
          </div>
        </div>
      </Card>

      <div className="leave-requests-wrapper">
        <div className="leave-summary-card">
          <div className="leave-summary-header">
            <div>
              <p className="leave-summary-label">Total Jenis</p>
              <p className="leave-summary-subtitle">Semua kategori</p>
            </div>
            <div className="leave-summary-icon-wrapper leave-icon-blue">
              <Calendar size={28} />
            </div>
          </div>
          <div className="leave-summary-value leave-value-blue">{types.length}</div>
          <p className="leave-summary-trend">Jenis Cuti</p>
        </div>

        <div className="leave-summary-card">
          <div className="leave-summary-header">
            <div>
              <p className="leave-summary-label">Paid Leave</p>
              <p className="leave-summary-subtitle">Cuti berbayar</p>
            </div>
            <div className="leave-summary-icon-wrapper leave-icon-green">
              <ShieldCheck size={28} />
            </div>
          </div>
          <div className="leave-summary-value leave-value-green">{types.filter(t => t.is_paid).length}</div>
          <p className="leave-summary-trend">Paid</p>
        </div>

        <div className="leave-summary-card">
          <div className="leave-summary-header">
            <div>
              <p className="leave-summary-label">Unpaid Leave</p>
              <p className="leave-summary-subtitle">Cuti tidak berbayar</p>
            </div>
            <div className="leave-summary-icon-wrapper leave-icon-orange">
              <CalendarDays size={28} />
            </div>
          </div>
          <div className="leave-summary-value leave-value-orange">{types.filter(t => !t.is_paid).length}</div>
          <p className="leave-summary-trend">Unpaid</p>
        </div>
      </div>

      <div className="white-unified-wrapper">
        <div className="wuw-header">
          <div className="wuw-header-top">
            <div className="wuw-title-area">
              <h3>Daftar Jenis Cuti</h3>
            </div>
            <div className="search-box">
              <Search size={18} />
              <input 
                type="text" 
                placeholder="Cari berdasarkan nama atau kode..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="wuw-table-area">
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
                      <span style={{ 
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
        </div>
      </div>

      <div className="leave-requests-wrapper">
        <div className="leave-summary-card">
          <div className="leave-summary-header">
            <div>
              <p className="leave-summary-label">Auto-Renewal</p>
              <p className="leave-summary-subtitle">Otomatis diperpanjang</p>
            </div>
            <div className="leave-summary-icon-wrapper leave-icon-green">
              <ShieldCheck size={28} />
            </div>
          </div>
          <p className="leave-summary-trend" style={{ fontSize: '0.85rem', lineHeight: 1.5 }}>
            Saldo cuti otomatis direset dan diperbarui berdasarkan siklus kebijakan.
          </p>
        </div>

        <div className="leave-summary-card">
          <div className="leave-summary-header">
            <div>
              <p className="leave-summary-label">Prorated Logic</p>
              <p className="leave-summary-subtitle">Perhitungan proporsional</p>
            </div>
            <div className="leave-summary-icon-wrapper leave-icon-blue">
              <FileText size={28} />
            </div>
          </div>
          <p className="leave-summary-trend" style={{ fontSize: '0.85rem', lineHeight: 1.5 }}>
            Karyawan baru menerima jumlah cuti proporsional berdasarkan tanggal masuk.
          </p>
        </div>

        <div className="leave-summary-card">
          <div className="leave-summary-header">
            <div>
              <p className="leave-summary-label">Carryover Rules</p>
              <p className="leave-summary-subtitle">Aturan carryover</p>
            </div>
            <div className="leave-summary-icon-wrapper leave-icon-orange">
              <Calendar size={28} />
            </div>
          </div>
          <p className="leave-summary-trend" style={{ fontSize: '0.85rem', lineHeight: 1.5 }}>
            Sisa cuti dapat dibawa ke periode berikutnya sesuai batas kebijakan.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LeaveTypePage;
