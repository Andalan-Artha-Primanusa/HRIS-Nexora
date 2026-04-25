import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftRight, Plus, CheckCircle2, XCircle, RefreshCw, Calendar, ArrowRight, Search, ArrowLeftRightIcon } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { workforceService } from '@/features/workforce/api/workforce.service';
import '@/shared/styles/CrudPage.css';
import '@/pages/dashboard/overview/OverviewPage.css';
import '@/pages/payroll/PayrollShared.css';

const ShiftSwapsPage: React.FC = () => {
  const navigate = useNavigate();
  const [swaps, setSwaps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await workforceService.getShiftSwaps();
      const swapsArray = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
      setSwaps(swapsArray);
    } catch (err) {
      console.error(err);
      setSwaps([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const pendingSwaps = swaps.filter(s => s.status === 'pending');
  const approvedSwaps = swaps.filter(s => s.status === 'approved');
  const rejectedSwaps = swaps.filter(s => s.status === 'rejected');

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { class: string; label: string }> = {
      pending: { class: 'status-pending', label: 'Pending' },
      approved: { class: 'status-active', label: 'Approved' },
      rejected: { class: 'status-danger', label: 'Rejected' },
    };
    return statusMap[status?.toLowerCase()] || { class: 'status-default', label: status };
  };

  return (
    <div className="crud-page">
      <Card className="hero-card">
        <div className="hero-card-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <ArrowLeftRight size={16} />
              <span>Workforce</span>
            </div>
            <h1 className="hero-title">Tukar Shift</h1>
            <p className="hero-subtitle">
              Kelola permintaan penukaran jadwal kerja antar karyawan.
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn-outline" onClick={fetchData} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Segarkan
            </button>
            <button className="btn-primary" onClick={() => navigate('/workforce/shift-swaps/create')}>
              <Plus size={16} />
              Request Baru
            </button>
          </div>
        </div>
      </Card>

      <div className="leave-requests-wrapper">
        <div className="leave-summary-card">
          <div className="leave-summary-header">
            <div>
              <p className="leave-summary-label">Pending</p>
              <p className="leave-summary-subtitle">Menunggu persetujuan</p>
            </div>
            <div className="leave-summary-icon-wrapper leave-icon-orange">
              <ArrowLeftRight size={28} />
            </div>
          </div>
          <div className="leave-summary-value leave-value-orange">{pendingSwaps.length}</div>
          <p className="leave-summary-trend">Menunggu</p>
        </div>

        <div className="leave-summary-card">
          <div className="leave-summary-header">
            <div>
              <p className="leave-summary-label">Disetujui</p>
              <p className="leave-summary-subtitle">Disetujui hari ini</p>
            </div>
            <div className="leave-summary-icon-wrapper leave-icon-green">
              <CheckCircle2 size={28} />
            </div>
          </div>
          <div className="leave-summary-value leave-value-green">{approvedSwaps.length}</div>
          <p className="leave-summary-trend">Disetujui</p>
        </div>

        <div className="leave-summary-card">
          <div className="leave-summary-header">
            <div>
              <p className="leave-summary-label">Ditolak</p>
              <p className="leave-summary-subtitle">Ditolak</p>
            </div>
            <div className="leave-summary-icon-wrapper leave-icon-red">
              <XCircle size={28} />
            </div>
          </div>
          <div className="leave-summary-value leave-value-red">{rejectedSwaps.length}</div>
          <p className="leave-summary-trend">Ditolak</p>
        </div>

        <div className="leave-summary-card">
          <div className="leave-summary-header">
            <div>
              <p className="leave-summary-label">Total Tukar</p>
              <p className="leave-summary-subtitle">Semua penukaran</p>
            </div>
            <div className="leave-summary-icon-wrapper leave-icon-blue">
              <Calendar size={28} />
            </div>
          </div>
          <div className="leave-summary-value leave-value-blue">{swaps.length}</div>
          <p className="leave-summary-trend">Total Tukar</p>
        </div>
      </div>

      <div className="white-unified-wrapper">
        <div className="wuw-header">
          <div className="wuw-header-top">
            <div className="wuw-title-area">
              <h3>Riwayat Penukaran Shift</h3>
              <span className="wuw-count-badge">{swaps.length} Total</span>
            </div>
            <div className="search-box">
              <Search size={18} />
              <input type="text" placeholder="Search..." />
            </div>
          </div>
        </div>

        <div className="wuw-table-area">
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Requester</th>
                  <th style={{ textAlign: 'center' }}></th>
                  <th>Target</th>
                  <th>Tanggal & Shift</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem' }}>Loading...</td></tr>
                ) : swaps.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                      <ArrowLeftRight size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                      <p>Belum ada data penukaran.</p>
                    </td>
                  </tr>
                ) : swaps.map((swap) => {
                  const statusInfo = getStatusBadge(swap.status);
                  return (
                    <tr key={swap.id}>
                      <td>
                        <div className="cell-stacked">
                          <span className="cell-name-text">{swap.requester?.full_name || 'N/A'}</span>
                          <span className="cell-email">{swap.requester_shift_name}</span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <ArrowRight size={20} color="#94a3b8" />
                      </td>
                      <td>
                        <div className="cell-stacked">
                          <span className="cell-name-text">{swap.target?.full_name || 'N/A'}</span>
                          <span className="cell-email">{swap.target_shift_name}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Calendar size={16} color="#3b82f6" />
                          {swap.shift_date ? new Date(swap.shift_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' }) : '-'}
                        </div>
                        <div className="cell-email">{swap.shift_name}</div>
                      </td>
                      <td>
                        <span className={`status-badge ${statusInfo.class}`}>{statusInfo.label}</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="action-btn-group">
                          <Button variant="ghost" size="sm"><CheckCircle2 size={16} /></Button>
                          <Button variant="ghost" size="sm" danger><XCircle size={16} /></Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShiftSwapsPage;