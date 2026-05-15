import React, { useEffect, useMemo, useState } from 'react';
import {
  Plus,
  Search,
  Calendar,
  Edit,
  Trash2,
  RefreshCw,
  ShieldCheck,
  CalendarDays
} from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { useAuthStore } from '@/app/store/auth.store';
import { RBACUtils } from '@/shared/hooks/rbac';
import { LoadingState, ErrorState, EmptyState } from '@/shared/ui/DataStateDisplay';
import { api } from '@/shared/api/httpClient';
import { showToast } from '@/shared/ui/toast';
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
  const user = useAuthStore((state) => state.user);
  const canAccess = RBACUtils.hasPermission(user, 'leave.view');
  if (!canAccess) {
    return (
      <div className="crud-page"><Card className="hero-card"><div className="hero-card-inner"><div className="hero-content"><div className="hero-badge"><ShieldCheck size={16} /><span>Admin Center</span></div><h1 className="hero-title">Akses Ditolak</h1><p className="hero-subtitle">Anda tidak memiliki izin untuk mengakses halaman ini.</p></div></div></Card></div>
    );
  }
  const [types, setTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Search & Filter
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState<'Semua' | 'Active' | 'Inactive'>('Semua');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  const fetchTypes = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const response = await api.get('/leave-types');
      
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
      setErrorMessage('Gagal memuat jenis cuti');
      setTypes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTypes();
  }, []);

  // Filter & Sort & Paginate
  const filteredTypes = useMemo(() => {
    return types.filter((type) => {
      const searchStr = searchText.toLowerCase();
      const nameMatch = type.name?.toLowerCase().includes(searchStr);
      const codeMatch = type.code?.toLowerCase().includes(searchStr);
      const textMatch = nameMatch || codeMatch;

      let statusMatch = true;
      if (activeTab === 'Active') statusMatch = type.is_active === true;
      else if (activeTab === 'Inactive') statusMatch = type.is_active === false;

      return textMatch && statusMatch;
    });
  }, [types, searchText, activeTab]);

  const sortedTypes = useMemo(() => {
    return [...filteredTypes].sort((a, b) => {
      const nameA = a.name?.toLowerCase() || '';
      const nameB = b.name?.toLowerCase() || '';
      return nameA.localeCompare(nameB);
    });
  }, [filteredTypes]);

  const paginatedTypes = sortedTypes;

  const [totalPages, setTotalPages] = useState(1);

  const clearFilters = () => {
    setSearchText('');
    setActiveTab('Semua');
    setCurrentPage(1);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, activeTab]);

  const paidCount = useMemo(() => types.filter((t) => t.is_paid).length, [types]);
  const activeCount = useMemo(() => types.filter((t) => t.is_active).length, [types]);
  const totalTypes = types.length;

  const summaryCards = useMemo(
    () => [
      {
        label: 'Total Jenis',
        subtitle: 'Semua kategori',
        value: String(totalTypes),
        change: 'Data tersimpan di sistem',
        tone: 'blue' as const,
        icon: Calendar,
      },
      {
        label: 'Hasil Filter',
        subtitle: 'Jenis sesuai pencarian',
        value: String(sortedTypes.length),
        change: `${paginatedTypes.length} data per halaman`,
        tone: 'green' as const,
        icon: Search,
      },
      {
        label: 'Cuti Berbayar',
        subtitle: 'Cuti berbayar',
        value: String(paidCount),
        change: 'Berbayar',
        tone: 'orange' as const,
        icon: ShieldCheck,
      },
      {
        label: 'Jenis Aktif',
        subtitle: 'Jenis aktif',
        value: String(activeCount),
        change: 'Siap digunakan',
        tone: 'purple' as const,
        icon: CalendarDays,
      },
    ],
    [totalTypes, paidCount, activeCount, sortedTypes.length, paginatedTypes.length]
  );

  return (
    <div className="crud-page">
      {/* Header */}
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
            <button className="btn-primary" onClick={() => (window.location.href = '/leave/type/create')}>
              <Plus size={16} />
              Tambah Jenis Cuti
            </button>
          </div>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="employee-summary-wrapper">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="employee-summary-card">
              <div className="employee-summary-header">
                <div>
                  <p className="employee-summary-label">{card.label}</p>
                  <p className="employee-summary-subtitle">{card.subtitle}</p>
                </div>
                <div className={`employee-summary-icon-wrapper employee-icon-${card.tone}`}>
                  <Icon size={28} />
                </div>
              </div>
              <div className={`employee-summary-value employee-value-${card.tone}`}>{card.value}</div>
              <p className="employee-summary-trend">{card.change}</p>
            </div>
          );
        })}
      </div>

      {/* Analytics Title Card */}
      <Card className="analytics-title-card">
        <div className="analytics-title-inner">
          <div className="analytics-icon">
            <Calendar size={24} />
          </div>
          <div>
            <h2 className="analytics-title">Daftar Jenis Cuti</h2>
            <p className="analytics-subtitle">Kelola dan lihat semua jenis cuti</p>
          </div>
        </div>
      </Card>

      {/* Control Section */}
      <Card className="control-section-card">
        <div className="control-section-inner">
          {/* Tabs */}
          <div className="elyra-tabs">
            {(['Semua', 'Active', 'Inactive'] as const).map((tab) => (
              <button key={tab} className={`elyra-tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                {tab === 'Active' ? 'Aktif' : tab === 'Inactive' ? 'Tidak Aktif' : tab}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="control-actions">
            <div className="search-box">
              <div className="search-icon-inside"><Search size={18} /></div>
              <input
                type="text"
                placeholder="Cari berdasarkan nama atau kode..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="search-input-pill"
              />
            </div>
            {(searchText || activeTab !== 'Semua') && (
              <button className="btn-clear-filter" onClick={clearFilters}>
                Hapus Filter
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Table Section */}
      <div className="table-section">
        <div className="wuw-table-area">
          {loading && <LoadingState message="Memuat jenis cuti..." />}
          {!loading && errorMessage && <ErrorState message="Koneksi Terputus" error={errorMessage} onRetry={fetchTypes} />}

          {!loading && !errorMessage && paginatedTypes.length === 0 && (
            <div style={{ padding: '5rem 0' }}>
              <EmptyState
                title="Pencarian Kosong"
                message="Kami tidak menemukan jenis cuti yang sesuai dengan kriteria Anda."
                actionLabel="Bersihkan Filter"
                onAction={clearFilters}
              />
            </div>
          )}

          {!loading && !errorMessage && paginatedTypes.length > 0 && (
            <>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Jenis Cuti</th>
                      <th>Kode</th>
                      <th>Deskripsi</th>
                      <th>Tipe Pembayaran</th>
                      <th>Status</th>
                      <th className="th-center" style={{ width: '120px' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedTypes.map((type) => (
                      <tr key={type.id}>
                        <td>
                          <div className="cell-name">
                            <div className="cell-avatar" style={{ background: type.is_paid ? '#eff6ff' : '#fff1f2', color: type.is_paid ? '#2563eb' : '#e11d48' }}>
                              <Calendar size={18} />
                            </div>
                            <div className="cell-stacked">
                              <span className="cell-name-text">{type.name}</span>
                              <span className="cell-stacked__sub">Terdaftar pada {type.created_at ? new Date(type.created_at).toLocaleDateString() : '-'}</span>
                            </div>
                          </div>
                        </td>
                        <td><span className="badge-soft badge-soft--blue">{type.code}</span></td>
                        <td style={{ maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {type.description || '-'}
                        </td>
                        <td>
                          <span className={`badge-soft ${type.is_paid ? 'badge-soft--green' : 'badge-soft--red'}`}>
                            {type.is_paid ? 'BERBAYAR' : 'TIDAK BERBAYAR'}
                          </span>
                        </td>
                        <td className="td-center">
                          <span className={`badge-soft badge-soft--${type.is_active ? 'green' : 'red'}`}>
                            {type.is_active ? 'AKTIF' : 'TIDAK AKTIF'}
                          </span>
                        </td>
                        <td className="td-center">
                          <div className="action-btn-group">
                            <button
                              className="action-btn action-btn-edit"
                              onClick={() => (window.location.href = `/leave/type/edit/${type.id}`)}
                              title="Edit"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              className="action-btn action-btn-delete"
                              onClick={async () => {
                                try {
                                  await api.delete(`/leave-types/${type.id}`);
                                  void fetchTypes();
                                  showToast('Jenis cuti berhasil dihapus', 'success');
                                } catch (err: any) {
                                  showToast(err?.response?.data?.message || 'Gagal menghapus jenis cuti', 'error');
                                }
                              }}
                              title="Hapus"
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

              {/* Pagination */}
              <div className="table-pagination">
                <div className="pagination-info">
                  Menampilkan <strong>{paginatedTypes.length}</strong> dari <strong>{sortedTypes.length}</strong> jenis cuti
                </div>
                <div className="pagination-controls">
                  <button
                    className="pagination-btn"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    ‹
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    className="pagination-btn"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    ›
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaveTypePage;
